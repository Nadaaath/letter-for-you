# Letter4You — Technical Documentation

This directory describes the **implemented AWS serverless version of Letter4You**. It is not a task list. The root [README](../README.md) tells the migration story and shows the application; these documents explain how the system works, how it was deployed, and how to operate it.

| Document | What you'll find |
| --- | --- |
| [Architecture](architecture.md) | Runtime diagram, request routing, AWS service responsibilities, infrastructure boundaries |
| [Data model and API](data-and-api.md) | DynamoDB table keys, access model, transactions, idempotency, routes, deletion behavior |
| [CI/CD and release process](cicd.md) | Exact backend/frontend stages, buildspecs, permissions, deployment controls, known pipeline constraint |
| [Infrastructure and deployment](infrastructure.md) | CloudFormation stacks, parameters, verification commands, resource ownership, deployment caveats |
| [Security and observability](security-and-observability.md) | Threat model, token handling, IAM, throttling, CloudWatch, budget, retention and known gaps |
| [Operations and troubleshooting](operations.md) | Health checks, diagnostics, change-set failures, safe recovery procedures |

## Scope and provenance

- **Source of truth for code and IaC:** `main` branch of [`Nadaaath/letter-for-you`](https://github.com/Nadaaath/letter-for-you), reviewed November 19, 2026.
- **AWS region:** `eu-north-1` (Stockholm), except global edge resources such as CloudFront.
- **Environment:** `dev`. The current implementation should **not** be described as a production-hardened system.
- **Console-managed resources:** frontend CodePipeline, CloudWatch dashboard/alarms and API Gateway access logging were configured interactively; their live settings must be verified in AWS rather than inferred from the repository.
- **Security:** never copy management links, access codes, secret parameter values, user letters, or private tokens into screenshots or public documentation.

## Contributing changes

For an application behavior change, update [data-and-api.md](data-and-api.md) if relevant; for pipeline stage changes, update [cicd.md](cicd.md). For resource changes, update [architecture.md](architecture.md), [infrastructure.md](infrastructure.md), and the corresponding `infra/*.yaml` file. Keep the documentation focused on **deployed/implemented behavior**, and label any recommendation as a recommendation.
