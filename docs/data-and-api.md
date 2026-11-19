# DynamoDB Data Model and HTTP API

## Storage design

The migration replaced Prisma and PostgreSQL models with three on-demand DynamoDB tables. The CloudFormation definitions are in [`infra/template.yaml`](../infra/template.yaml); the corresponding access code lives in `backend/src/repositories/` and `backend/src/services/`.

| Table | DynamoDB key | Purpose |
| --- | --- | --- |
| `letter4you-dev-gardens` | Partition key `gardenId` (String) | Garden metadata, owner token hash, recipient code digest, lifecycle status |
| `letter4you-dev-letters` | Partition key `gardenId` + sort key `letterId` (Strings) | Letters belonging to a garden, including optional styling and expiry metadata |
| `letter4you-dev-recipient-codes` | Partition key `codeDigest` (String) | Lookup from a keyed digest of a recipient code to `gardenId` |

All three use `PAY_PER_REQUEST` billing and have `DeletionPolicy: Retain` / `UpdateReplacePolicy: Retain` in the repository template. **Retain is not a backup**; deployed settings and PITR must be inspected separately.

### Simplified stored items

```jsonc
// Garden (illustrative; values are synthetic)
{
  "gardenId": "<UUID>",
  "name": "Private garden",
  "description": null,
  "ownerTokenHash": "<SHA-256 hex>",
  "codeDigest": "<HMAC-SHA256 hex>",
  "status": "ACTIVE",
  "hasAccessCode": true,
  "createdAt": "<ISO-8601>",
  "updatedAt": "<ISO-8601>"
}
```

```jsonc
// Letter (illustrative)
{
  "gardenId": "<UUID>",
  "letterId": "<UUID>",
  "title": "Hello",
  "content": "Sample content",
  "recipientName": "Friend",
  "senderName": null,
  "isAnonymous": true,
  "styleConfig": { "theme": { "id": "rose" } },
  "expiresAt": null,
  "createdAt": "<ISO-8601>"
}
```

These are examples, not copies of real user records.

## Accountless authorization

Garden owners receive a random **32-byte management token** (64 hexadecimal characters) at garden creation. The backend stores only its SHA-256 digest in the Gardens table. The frontend stores the token in browser `localStorage`; an exportable management link places the token in a URL fragment (`#manage=...`), which the UI imports and then clears from the address bar. All management API requests send it in the `x-garden-key` header. Whoever holds this token can manage or delete that garden: protect management links as secrets.

Recipients receive a different code (e.g., a word prefix plus random hex characters). The backend normalizes it and computes an **HMAC-SHA256 digest**, using a SecureString secret fetched from SSM Parameter Store. The Recipient Codes table maps that digest to a garden ID. Recipients can unlock/read, **not** manage. The backend hides `senderName` on anonymous letters in the recipient view.

## Consistency and idempotency

- **Create garden:** a `TransactWriteCommand` creates the garden and recipient-code index record together with conditional `Put` expressions. Partial creation is not intended.
- **Create letter:** a transaction checks that the garden remains `ACTIVE` and writes the letter conditionally.
- **Repeated create:** the frontend sends `idempotency-key`; the backend uses that identifier as the letter ID, and, on a transaction conflict, reads the existing record to compare the submitted payload. A truly identical retry returns the original letter. This is checked in the deployed API smoke test.
- **Read letters:** `QueryCommand` uses `gardenId` to list one garden's letters; pagination is handled in the repository. The response sorts by creation timestamp.
- **Delete garden:** status changes to `DELETING`, letters are removed in chunks (with retry logic for unprocessed writes), the recipient code record is removed, and then the garden is removed. A second request with the management token can resume a partially completed deletion.

**Limitation:** the deletion flow is synchronous inside a Lambda configured with a **10-second timeout**. Large gardens may need an asynchronous cleanup worker later. Recipient-visible expiration uses the stored `expiresAt` field as an application filter; it does **not** imply DynamoDB TTL cleanup or automatic deletion of old records.

## Public API routes

HTTP API stage: `/dev`; application router mounts the `/api/vaults` prefix. These are the routes defined in [`infra/api-template.yaml`](../infra/api-template.yaml) and [`backend/src/routes/vault.routes.js`](../backend/src/routes/vault.routes.js).

| Method | Path (after `/dev`) | Purpose | Owner token required? |
| --- | --- | --- | --- |
| GET | `/health` | Lambda/API health | No |
| GET | `/health/db` | DynamoDB connectivity probe (development only) | No |
| POST | `/api/vaults` | Create garden and receive credentials | No |
| POST | `/api/vaults/unlock` | Resolve a recipient access code | No |
| GET | `/api/vaults/{vaultId}` | View owner's garden | Yes |
| PUT | `/api/vaults/{vaultId}` | Edit garden metadata | Yes |
| DELETE | `/api/vaults/{vaultId}` | Delete garden + letters | Yes |
| POST | `/api/vaults/{vaultId}/letters` | Add letter | Yes |
| GET | `/api/vaults/{vaultId}/letters` | List owner's letters | Yes |
| GET | `/api/vaults/{vaultId}/letters/{letterId}` | View letter as owner | Yes |
| DELETE | `/api/vaults/{vaultId}/letters/{letterId}` | Delete letter | Yes |

Typical response codes include `200` for reads/deletions, `201` for creates, `400` for malformed inputs, `403` for unauthorized management access, `404` for invalid recipient codes/missing letters, `409` for conditional-write conflicts, and `429` when throttling applies. The code's error handlers determine the precise response for each failure; the table is not a promise that every route produces every status.

## Synthetic HTTP examples

```bash
API_BASE_URL="https://<api-id>.execute-api.eu-north-1.amazonaws.com/dev"
curl -s "$API_BASE_URL/health"

# The response contains sensitive managementToken and accessCode: do not publish it.
curl -s -X POST "$API_BASE_URL/api/vaults" \
  -H 'content-type: application/json' \
  -d '{"name":"Demo garden","description":"Synthetic test"}'
```

Do not paste production management tokens or recipient codes into shell history, issues, or screenshots. For safe automated request examples, see [`backend/scripts/smoke-cloud-api.mjs`](../backend/scripts/smoke-cloud-api.mjs).
