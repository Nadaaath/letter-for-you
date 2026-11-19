# Security, Monitoring and Cost Controls

## Security model

Letter4You deliberately does **not** use Cognito or traditional user accounts in its current architecture. It uses two distinct capabilities: (1) a random management token authorizing garden/letter modification and deletion; and (2) a separate recipient code allowing read-only access. These are not interchangeable. The details of token generation, hashing and code lookups are in [Data model and API](data-and-api.md).

### Implemented controls

| Layer | Implemented behavior | Source |
| --- | --- | --- |
| Frontend objects | Private S3 + CloudFront Origin Access Control; not a public S3 website bucket | `infra/frontend-template.yaml` |
| HTTPS | Viewer traffic enters via CloudFront; API Gateway origin uses HTTPS | `infra/frontend-template.yaml` |
| API request cache | CloudFront `/api/*` cache disabled; application routes set `Cache-Control: no-store` | CloudFront and Express config |
| Lambda → DynamoDB | IAM actions limited to named Gardens, Letters, Recipient Codes tables | `infra/api-template.yaml` |
| Lambda → SSM | Lambda can read the configured recipient-code HMAC parameter | `infra/api-template.yaml` |
| Inputs | Zod schema validation and restrictive request body size | `backend/src/validators`, `backend/src/app.js` |
| Owner authentication | 64-character token accepted via `x-garden-key`; SHA-256 digest stored in table; constant-time digest comparison | `dynamo-vault.service.js` |
| Recipient code lookup | HMAC digest with stable secret in SSM SecureString | `recipient-code-secret.js` |
| Request throttling | HTTP API rate 2/sec, burst 5 in template; Express process-local limiters are supplemental only | `infra/api-template.yaml`, `vault.routes.js` |
| Lambda compute limits | 256 MB memory and 10-second timeout in template | `infra/api-template.yaml` |

### Boundaries and risks

- **Possession of management link = owner access.** The frontend stores tokens in `localStorage`; browser compromise or XSS may expose them. Secret URLs should not be included in logs, screenshots or analytics.
- **Anonymous recipient access** is read-only, not private authentication with user accounts. Access code guessing and sharing are part of the threat model.
- **Public diagnostics:** `/health/db` verifies the database connection. It should be restricted/removed before production exposure.
- **CORS:** the Express API declares a `FRONTEND_URL` origin (default local Vite URL), while CloudFront same-origin `/api/*` access reduces cross-origin needs. Check effective deployed behavior if the frontend domain changes.
- **Expiration:** `expiresAt` filters the recipient response; it is not automatic DynamoDB TTL removal.
- **Backups:** Retain is not PITR and no backup policy is defined in the inspected table template.
- **Reserved concurrency:** it was suggested during the development process, but is **not present** in the current SAM template. Confirm live Lambda configuration before documenting a concurrency cap as enabled.

## CloudWatch configuration

### What was configured through Console

- Dashboard: `letter4you-dev-overview` (Lambda invocations/duration, API Gateway traffic/errors, DynamoDB reads).
- Alarm: `letter4you-dev-api-5xx-alarm` (5xx alarm configured in Console; verify current threshold and SNS email confirmation).
- HTTP API stage `dev` access logs: enabled with destination `/aws/apigateway/letter4you-dev-access`, with a seven-day log-group retention setting during setup.
- Lambda log group: `/aws/lambda/letter4you-dev-api-backend` with `RetentionInDays: 3` defined in SAM template.

Console screenshots established that a log stream was created for HTTP API access logs. CloudWatch Logs Insights analysis is **optional**; it was not required for closing out this project. Keep sensitive application request/response bodies and tokens out of access logs.

### Interpreting metrics

- **Lambda `Errors`** measures failed Lambda invocations, not every HTTP 500 that Express returns. Monitor API Gateway **5xx** as well.
- **API Gateway 4xx** can include expected authorization/validation responses. A burst of 4xx is not by itself proof of an outage.
- **DynamoDB `ConsumedReadCapacityUnits`** is consumption, not a count of users or letters.
- **CloudWatch dashboards, alarms, log storage and log queries** may incur charges subject to usage and free-tier thresholds.

## Account cost controls

An AWS Budgets entry named `letter4you-cost-guard` with a **$1 budget** was visible in the account's Cost Management console. It is an **account budget/notification**, not necessarily a Letter4You-only service budget or a hard spend limit. Confirm the alert thresholds and email subscription before relying on notifications. The application's low request volume and DynamoDB on-demand billing reduce idle compute, but do not eliminate AWS charges.

## Suggested hardening before a real public release

These are **not claimed as already implemented**: confirm backup/recovery objectives (PITR), protect or remove public DB health probe, verify budget notifications, review XSS/content sanitization, verify CI/CD branch triggers and safe change-set concurrency, restrict and monitor abusive traffic, test access-code recovery/rotation policies, and establish a dependable failure/rollback procedure.
