# Letter4You backend pipeline (Infrastructure as Code)

This deploys **one new CodePipeline** with a CodeBuild SAM packaging project and scoped IAM roles. It **does not create a second Lambda, API Gateway or DynamoDB database**. Its deployment target is the existing `letter4you-dev-api` stack.

Stages:

1. GitHub (source, manual-trigger only initially)
2. CodeBuild (Node 22 syntax checks + SAM validate/build/package)
3. CloudFormation (prepare a change set for `letter4you-dev-api`)
4. Manual approval (review the change set in CloudFormation)
5. CloudFormation (execute exactly the approved change set)

The initial pipeline uses CodePipeline V1 and no automatic push trigger. Once tested, we can enable an appropriate backend-only trigger. Because this uses a CloudFormation service role, **do not delete this role/CI stack while it is still associated with the application stack** without first planning a replacement service role.

## Files to copy into the Git repo

- `backend-buildspec.yml` → repository root
- `infra/backend-cicd-template.yaml` → `infra/`
- `BACKEND-CI-CD-SETUP.md` → repository root

## Check prerequisites in AWS CloudShell

```bash
cd ~/letter4you-src
git pull --ff-only
aws cloudformation describe-stacks --stack-name letter4you-dev-api --region eu-north-1 --query 'Stacks[0].StackStatus' --output text
aws codeconnections list-connections --region eu-north-1 --query 'Connections[].[ConnectionName,ConnectionStatus,ConnectionArn]' --output table
```

Do not run this if the backend stack is not healthy or the GitHub connection is not AVAILABLE.

## Resolve stack inputs (CloudShell)

```bash
CONNECTION_ARN=$(aws codeconnections list-connections --region eu-north-1 --query "Connections[?ConnectionName=='letter4you-github' && ConnectionStatus=='AVAILABLE'].ConnectionArn | [0]" --output text)
API_ID=$(aws cloudformation describe-stack-resource --stack-name letter4you-dev-api --logical-resource-id BackendHttpApi --region eu-north-1 --query 'StackResourceDetail.PhysicalResourceId' --output text)
printf 'Connection: %s\nAPI: %s\n' "$CONNECTION_ARN" "$API_ID"
```

## Preview only (does NOT create CI resources)

```bash
aws cloudformation validate-template --template-body file://infra/backend-cicd-template.yaml --region eu-north-1
aws cloudformation deploy \
  --template-file infra/backend-cicd-template.yaml \
  --stack-name letter4you-dev-backend-cicd \
  --region eu-north-1 \
  --parameter-overrides "ConnectionArn=$CONNECTION_ARN" "ExistingApiId=$API_ID" \
  --capabilities CAPABILITY_IAM \
  --no-execute-changeset
```

In CloudFormation open `letter4you-dev-backend-cicd` -> Change sets and review. The preview should only **add** IAM roles, CodeBuild, CodePipeline, a bucket and a log group. The `letter4you-dev-api` stack is not part of this initial deployment.

After explicit review, execute this CI stack change set in the Console. New CodePipeline usually starts its first execution at creation; this pipeline **cannot update the backend until the manual approval**. Look in CloudFormation for the **target** stack's new change set (`letter4you-backend-cicd`) and inspect it before approving.

## After approval and deployment

Verify `letter4you-dev-api` is UPDATE_COMPLETE and run the existing cloud smoke test from CloudShell:

```bash
cd ~/letter4you-src
API_ID=$(aws cloudformation describe-stack-resource --stack-name letter4you-dev-api --logical-resource-id BackendHttpApi --region eu-north-1 --query 'StackResourceDetail.PhysicalResourceId' --output text)
API_BASE_URL="https://${API_ID}.execute-api.eu-north-1.amazonaws.com/dev" node backend/scripts/smoke-cloud-api.mjs
```

## Safety / costs / limitations

- Changesets should be checked for replacement, deletion, IAM policy changes, and DynamoDB changes before approval.
- The Lambda code package and the pipeline output artifacts go into a new private S3 bucket; the bucket has 90-day lifecycle expiration. Builds and executions incur usage charges.
- This is an intentionally limited IAM role tailored to the current API stack. Adding new Lambda resources, API integrations or AWS services later may require extending it, not giving it AdministratorAccess.
- The backend test suite relies on local DynamoDB and is **not** run in this CodeBuild build. Only syntax and SAM template checks run predeployment. The smoke test verifies application behavior **after** deployment.
- This first version intentionally has no GitHub push trigger, no cross-account resources and no automatic approval.
- Deleting the CI stack later requires checking the existing API stack's CloudFormation service-role association and emptying the CI artifact bucket (which may contain deployment packages needed for rollback). Do not delete the existing backend/frontend/data stacks.
