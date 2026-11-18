# Letter4You — Finalization checklist

## 1. Repository cleanup

Items confirmed by repository inspection (feature branch):

- Remove `backend/tests/dynamo-integration.test.mjs` **if** no one uses DynamoDB Local anymore. The active `npm test` command only runs `validators.unit.test.mjs`.
- Remove `frontend/README.md` (default Vite boilerplate); root `README.md` replaces it.
- Remove `BACKEND-CI-CD-SETUP.md` and `CI-CD-SETUP.md` (both describe superseded first iterations, including the wrong number of backend stages).
- Keep `backend-buildspec.yml`, `backend-smoke-buildspec.yml`, `buildspec.yml`, and `infra/backend-cicd-template.yaml` — the deployed CI/CD depends on these.
- Keep `infra/template.yaml`, `infra/api-template.yaml`, and `infra/frontend-template.yaml` — the current infrastructure is defined here.
- `infra/cicd-template.yaml` represents a *different* proposed frontend IaC pipeline, not the console-created one. Consider archiving or removing it once verified unused to avoid accidentally creating a duplicate pipeline.
- Old `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, and `*.dockerignore` files may be removed if no one needs the old container-based implementation. These are optional cleanup, not a blocker.
- `infra/app-template.yaml` and `infra/smoke/` define an experimental Lambda smoke stack. **Check whether it still exists in AWS before removing its IaC or deleting the resources.**

## 2. Read-only AWS inventory

Run in CloudShell, region `eu-north-1`:

```bash
aws cloudformation list-stacks \
  --region eu-north-1 \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
  --query "StackSummaries[?starts_with(StackName, 'letter4you')].[StackName,StackStatus]" \
  --output table

aws codepipeline list-pipelines \
  --region eu-north-1 \
  --query "pipelines[?contains(name, 'letter4you')].name" \
  --output table

aws lambda list-functions \
  --region eu-north-1 \
  --query "Functions[?contains(FunctionName, 'letter4you')].[FunctionName,Runtime]" \
  --output table
```

Expected to keep:

- `letter4you-dev-db` — DynamoDB, **do not delete**.
- `letter4you-dev-api` — production-like development API, **do not delete**.
- `letter4you-dev-web` — public frontend, **do not delete**.
- `letter4you-dev-backend-cicd` — backend deployment pipeline and service role, **do not delete**.
- The existing Console frontend pipeline `letter4you-console-lab` — keep if it is your chosen active frontend deployment path.

Candidate for removal **only after verification**: an old experimental `letter4you-dev-app` smoke Lambda stack. Its function may appear as `letter4you-dev-app-smoke` in CloudWatch. Confirm it is not referenced by any live pipeline or required integration before deleting.

**Warning:** A CloudFormation stack may be linked to a service execution role created by another stack. Deleting CI/CD roles can impair later API stack updates. CloudFormation `Retain` preserves physical DynamoDB tables when relevant, but retained tables can continue to incur charges.

## 3. Confirm protection and operations

- CloudFormation → `letter4you-dev-db` → Template: verify the deployed version of all three tables uses `DeletionPolicy: Retain`.
- CloudWatch dashboard `letter4you-dev-overview`: saved and usable.
- CloudWatch API alarm `letter4you-dev-api-5xx-alarm`: configured; SNS subscription confirmed if email delivery is desired.
- API Gateway dev-stage access logs: enabled, in `/aws/apigateway/letter4you-dev-access` (7-day retention).
- AWS Budgets: existing `letter4you-cost-guard` ($1), verify notifications; do not create a duplicate budget.
- Confirm the last backend pipeline execution as a whole succeeded, not only per-stage last statuses.
- Check the frontend pipeline's recent deploy and website URL after the latest change.

## 4. Release

1. Commit the documentation and selected repository cleanup on `feature/aws-serverless-dynamodb`.
2. Run `npm test --prefix backend` and `npm run build --prefix frontend` locally or let CodeBuild validate the corresponding commits.
3. Open GitHub pull request `feature/aws-serverless-dynamodb` → `main` and review the migration from PostgreSQL/Prisma to DynamoDB/Serverless.
4. Merge the PR once checks and review are complete.
5. Update **backend** CloudFormation pipeline parameter `Branch` to `main` using a reviewed change set. It currently defaults to the feature branch.
6. Update the **frontend** Console pipeline's GitHub source branch and V2 trigger filters (if configured) to `main`.
7. Trigger/inspect one execution from the `main` commit, review approval gates, then verify website and smoke test.
8. Only after both pipelines work from `main`, consider deleting the old feature branch.

## 5. Done criteria

- Website is accessible and basic app flows work.
- Backend pipeline succeeds through Verify on a main-branch deployment.
- Frontend deployment works from main and current assets are served.
- No unused experimental AWS resources or obsolete setup docs remain unexplained.
- README accurately reflects deployed architecture, pipeline ownership and known limitations.
- Cost alert remains active; avoid leaving extra services running merely as demonstrations.
