# Operations and Troubleshooting

This runbook is for the existing **development** environment in `eu-north-1`. Commands below are read-only unless clearly marked otherwise.

## Start with a health check

Use the API's CloudFormation output for the current URL:

```bash
aws cloudformation describe-stacks \
  --stack-name letter4you-dev-api --region eu-north-1 \
  --query 'Stacks[0].Outputs' --output table
```

The `ApiHealthUrl` endpoint returns a basic application status. `ApiDatabaseHealthUrl` verifies a DynamoDB read; both are **public development diagnostics**. The browser-facing website URL comes from `letter4you-dev-web` → `WebsiteUrl`. Testing `/health` alone does not establish that garden/letter CRUD works.

## Read-only inventory

```bash
aws cloudformation describe-stacks --stack-name letter4you-dev-db \
  --region eu-north-1 --query 'Stacks[0].StackStatus' --output text

aws cloudformation describe-stacks --stack-name letter4you-dev-api \
  --region eu-north-1 --query 'Stacks[0].StackStatus' --output text

aws codepipeline list-pipeline-executions \
  --pipeline-name letter4you-dev-backend-cicd-pipeline \
  --region eu-north-1 --max-results 10 \
  --query 'pipelineExecutionSummaries[].[pipelineExecutionId,status,startTime]' \
  --output table
```

For debugging Lambda exceptions, open **CloudWatch → Log groups → `/aws/lambda/letter4you-dev-api-backend`**. For HTTP request/status records, inspect **`/aws/apigateway/letter4you-dev-access`**. Use timestamps and `requestId` to correlate an incident where possible; the current access-log format may not include Lambda's exact request identifier.

## Known pipeline issue: `ChangeSetNotFound`

**Symptom:** CodePipeline Source/Build/PrepareChangeSet/Approve succeed, but the Deploy action reports `ChangeSet [letter4you-backend-cicd] does not exist`.

**What it means:** the named CloudFormation change set is no longer available at execution time. This was observed after approving a pipeline execution triggered during README documentation updates. Another run replacing the same fixed-name change set is a plausible cause, but diagnose with execution history and CloudFormation events rather than assuming it.

**Safe response:**

1. **Don't repeatedly retry Deploy or approve additional overlapping executions.** A retry cannot execute a nonexistent change set.
2. Inspect CodePipeline execution history for overlapping or superseded executions and compare source revisions.
3. Check the target stack `letter4you-dev-api` → Change sets; note which change sets exist and their `ExecutionStatus`.
4. Confirm the target stack is healthy and your deployed API still works.
5. When no conflicting executions remain, run a deliberate new pipeline execution against the intended commit. Review its **new** change set before approval. A docs-only commit might yield no meaningful Lambda change; do not modify application code arbitrarily just to get green status.
6. For a future pipeline hardening iteration, address fixed-name collisions and unnecessary docs-only triggers. Do not claim this issue is fully fixed until proven.

Read-only diagnostics:

```bash
aws cloudformation list-change-sets --stack-name letter4you-dev-api \
  --region eu-north-1 \
  --query 'Summaries[].[ChangeSetName,Status,ExecutionStatus]' --output table
```

## Other frequent failure modes

| Symptom | What to check first |
| --- | --- |
| Build passes, Verify fails | Open the **Verify** CodeBuild run (not packaging Build); inspect `PASS` or assertion failures from `smoke-cloud-api.mjs` |
| 403 on garden management | `x-garden-key` token missing/invalid; management link not imported on that browser |
| Unlock returns 404 | Recipient code mistyped, no code lookup match, or garden no longer active |
| Frontend loads but API calls fail | CloudFront `/api/*` origin, stage `/dev` path, Lambda/API Gateway health, browser network tab |
| Frontend serves old assets | Confirm S3 deployment target and CloudFront cache invalidation/versioning in **live frontend pipeline** |
| CodeBuild cannot update stack | Review scoped IAM execution-role permissions and relevant CloudFormation stack events |
| API access logs absent | Check dev-stage logging enabled, log group ARN exists in `eu-north-1`, destination permissions, and test with a new request |
| DynamoDB transaction conflict | Inspect conditional state and repeated idempotency key; do not blindly rewrite data |

## Safe synthetic smoke test

The repository provides [`backend/scripts/smoke-cloud-api.mjs`](../backend/scripts/smoke-cloud-api.mjs). The backend Verify CodeBuild action runs it with an injected `API_BASE_URL`; it creates a synthetic garden and letter **in the existing dev tables** and attempts cleanup. Manually running it can also write data; use only against the known development API, never a user-populated production system. A failed cleanup may require investigation with the printed synthetic garden ID.

## Deployment and rollback boundaries

Backend releases are controlled by CloudFormation change sets and approvals. This does **not** imply automated rollback on smoke-test failure: if Verify fails after Deploy succeeded, the Lambda update has already occurred. The operator must assess the error and plan a safe CloudFormation rollback/redeployment using an earlier known-good revision. Preserve artifact buckets and roles required for recovery. Do not delete the backend pipeline stack before understanding the target stack's CloudFormation execution role association.

## Cost and cleanup safety

Keep the existing $1 `letter4you-cost-guard` budget; do not create duplicates. Avoid enabling expensive traces, perpetual queries, extra environments, or provisioned concurrency solely for screenshots. The old experimental smoke Lambda may be unnecessary, but check whether it exists and whether any pipeline still depends on it before deleting its stack. **Never delete the DynamoDB/API/web stacks as part of repository cleanup.**
