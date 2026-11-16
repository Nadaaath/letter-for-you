# Letter4You frontend CI/CD - first iteration

Files:
- `buildspec.yml`: Node 22, npm ci for frontend/backend, backend syntax checks, React production build, publish artifact.
- `infra/cicd-template.yaml`: CodeConnections source from `feature/aws-serverless-dynamodb`, CodeBuild build, manual approval, S3/CloudFront deploy, IAM roles and logs.

The initial pipeline is **manual-trigger only** (`DetectChanges: 'false'`) and includes **manual approval** before deployment. AWS CodePipeline typically executes once on creation; it will stop at approval, not modify the website without approval.

This CI/CD milestone deploys the **React frontend only**. The existing API Gateway/Lambda/DynamoDB stacks are unchanged. Extend backend deployment via SAM in a later milestone, with a separate scoped CloudFormation execution role.

## Install into Git repo

Extract zip at repository root, preserving `buildspec.yml` and `infra/cicd-template.yaml`, then commit/push the two files to `feature/aws-serverless-dynamodb`.

## CloudShell - resolve inputs

```bash
cd ~/letter4you-src
git pull --ff-only
aws codeconnections list-connections --region eu-north-1 --query 'Connections[].[ConnectionName,ConnectionStatus,ConnectionArn]' --output table

CONNECTION_ARN=$(aws codeconnections list-connections --region eu-north-1 --query "Connections[?ConnectionName=='letter4you-github' && ConnectionStatus=='AVAILABLE'].ConnectionArn | [0]" --output text)

BUCKET=$(aws cloudformation describe-stacks --stack-name letter4you-dev-web --region eu-north-1 --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue | [0]' --output text)

DIST_ID=$(aws cloudformation describe-stacks --stack-name letter4you-dev-web --region eu-north-1 --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue | [0]' --output text)

printf 'Connection: %s\nBucket: %s\nCloudFront ID: %s\n' "$CONNECTION_ARN" "$BUCKET" "$DIST_ID"

aws cloudformation validate-template --template-body file://infra/cicd-template.yaml --region eu-north-1
```

If `CONNECTION_ARN` says None, check the connection name and status in the table and select the intended AVAILABLE GitHub connection.

## Preview stack without executing

```bash
aws cloudformation deploy \
  --template-file infra/cicd-template.yaml \
  --stack-name letter4you-dev-cicd \
  --region eu-north-1 \
  --parameter-overrides "ConnectionArn=$CONNECTION_ARN" "WebsiteBucketName=$BUCKET" "CloudFrontDistributionId=$DIST_ID" \
  --capabilities CAPABILITY_IAM \
  --no-execute-changeset
```

Review CloudFormation change set. It should **add** 9 resources: artifact bucket, 2 log groups, 3 roles, 2 CodeBuild projects and a CodePipeline. No modifications to the existing website/backend stacks.

## First execution

After executing the reviewed change set and `CREATE_COMPLETE`, open CodePipeline's `letter4you-dev-cicd-pipeline`, inspect Source and Build logs. If Build succeeds, approve the manual step to publish to S3 and invalidate CloudFront. If it fails, investigate CodeBuild logs and do not approve.

For further manual runs:

```bash
aws codepipeline start-pipeline-execution --name letter4you-dev-cicd-pipeline --region eu-north-1
```

Do not approve deployment until the Build stage is green.

## Cost and security

The pipeline is V1, triggers are off by default, artifact S3 files expire after 14 days, CloudWatch logs after 7 days, and CodeBuild runs on small instances. AWS services have usage-based costs. BuildRole only accesses its build artifacts; DeployRole only accesses the website bucket and intended CloudFront distribution. Never add PATs or secret values to buildspec/template files.
