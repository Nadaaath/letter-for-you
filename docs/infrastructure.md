# Infrastructure as Code and Deployment

## Project layout

```text
letter-for-you/
├── backend/
│   ├── src/             # Express, Lambda handler, DynamoDB repositories/services
│   ├── tests/           # Node unit tests
│   └── scripts/         # Real AWS API smoke test
├── frontend/
│   ├── src/             # React routes and components
│   └── public/          # Static assets
├── infra/
│   ├── template.yaml              # DynamoDB tables
│   ├── api-template.yaml          # Lambda + API Gateway HTTP API
│   ├── frontend-template.yaml     # S3/CloudFront/OAC/rewrite
│   ├── backend-cicd-template.yaml # CodePipeline/CodeBuild/IAM
│   ├── app-template.yaml          # Historical experimental smoke Lambda
│   └── smoke/                     # Historical smoke Lambda source
├── backend-buildspec.yml
├── backend-smoke-buildspec.yml
└── buildspec.yml
```

Infrastructure is **not one monolithic stack**. Separate stacks allow data, API, frontend, and delivery automation to evolve with different lifecycles. The frontend CodePipeline was built directly through the AWS Console and is not reproducible from the templates above without exporting/recreating that definition.

## Stack responsibilities and defaults

| Stack | Key resources | Notes |
| --- | --- | --- |
| `letter4you-dev-db` | Gardens, Letters, Recipient Codes DynamoDB tables | PAY_PER_REQUEST; Retain policies in repository |
| `letter4you-dev-api` | `letter4you-dev-api-backend` Lambda, `dev` HTTP API, Lambda logs and IAM role | Node.js 22, 256 MB, timeout 10 seconds; API Gateway rate limit 2 req/s, burst 5 in SAM template |
| `letter4you-dev-web` | Private S3 bucket, CloudFront OAC/distribution, SPA rewrite function | CloudFront has separate static and `/api/*` origins |
| `letter4you-dev-backend-cicd` | CodePipeline, CodeBuild, artifact S3, build logs and IAM execution roles | Manages updates to existing backend stack; not a second API |

The experimental `infra/app-template.yaml` and `infra/smoke/` are retained in Git history/current tree. Do not treat their resources as required by the current production-like application. Verify whether the corresponding experimental stack exists before deleting anything in AWS.

## Outputs and read-only inventory

Run AWS CLI from an authenticated terminal (CloudShell is convenient), region `eu-north-1`:

```bash
aws cloudformation list-stacks --region eu-north-1 \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
  --query 'StackSummaries[?starts_with(StackName, `letter4you`)].[StackName,StackStatus]' \
  --output table

aws cloudformation describe-stacks --stack-name letter4you-dev-web \
  --region eu-north-1 --query 'Stacks[0].Outputs' --output table

aws cloudformation describe-stacks --stack-name letter4you-dev-api \
  --region eu-north-1 --query 'Stacks[0].Outputs' --output table
```

Use `WebsiteUrl` and `CloudFrontDistributionId` from the website outputs rather than guessing URLs or distribution IDs. For the backend, query `ApiHealthUrl`, `BackendFunctionName`, and `ApiDatabaseHealthUrl`.

## Backend deployment sequence

1. A code push triggers the backend pipeline's configured source branch.
2. CodeBuild executes the repository's unit tests, validates the SAM template, builds and packages Lambda code into its artifact S3 bucket.
3. CodePipeline creates/replaces a CloudFormation change set for the **existing** `letter4you-dev-api` stack.
4. The engineer examines resource actions and replacement flags, then approves the specific execution.
5. CloudFormation updates Lambda/API infrastructure. A CodeBuild verification step calls the deployed API.

**Never blindly execute or approve a change set with `Delete` or `Replacement: True` for application data.** An empty change set can occur for a docs-only commit; it is not proof that build/tests failed.

## Resource retention and data safety

`infra/template.yaml` contains both `DeletionPolicy: Retain` and `UpdateReplacePolicy: Retain` for each DynamoDB table. This avoids some accidental **CloudFormation-mediated** data removal. It does not prevent direct `DeleteTable`, mistaken writes, or data corruption; it can also leave tables behind (and billing continues) if their stack is deleted. Always verify the *deployed stack template* matches the repository and consider DynamoDB PITR/backups if real letters need durable recovery.

## Frontend deployment details

The React app is built by Vite into `frontend/dist`; CodePipeline delivers that artifact to the existing private S3 website bucket. CloudFront serves `/` and static files; a CloudFront Function rewrites React Router-style extensionless routes to `/index.html`. `/api/*` requests use API Gateway as the origin with API caching disabled.

**Cache behavior matters:** a successful S3 upload does not guarantee every CloudFront edge immediately serves a modified `index.html`. Confirm the live pipeline invalidation/versioning behavior before making claims about instant asset updates.

## Developer validation

```bash
npm ci --prefix backend
npm test --prefix backend
npm ci --prefix frontend
npm run build --prefix frontend
# Optional; not currently an enforced frontend CI gate:
npm run lint --prefix frontend
```

Node.js 22 is the project's Lambda runtime. Local frontend builds do not require AWS access. Live smoke tests require the dev API URL and cause temporary writes to the **dev** DynamoDB tables.
