import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const client = new SSMClient({});
let pending;

// In development use the local env secret. In Lambda load SecureString
// from Parameter Store and cache its plaintext only in process memory.
export async function ensureRecipientCodeHmacKey() {
  const existing = process.env.RECIPIENT_CODE_HMAC_KEY;
  if (existing) {
    if (!/^[a-f0-9]{64}$/i.test(existing)) {
      throw new Error("Invalid recipient code HMAC key configuration");
    }
    return;
  }
  const name = process.env.RECIPIENT_CODE_HMAC_PARAMETER;
  if (!name) throw new Error("Recipient code HMAC parameter is not configured");
  if (!pending) {
    pending = (async () => {
      const output = await client.send(new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      }));
      const value = output.Parameter?.Value;
      if (!/^[a-f0-9]{64}$/i.test(value ?? "")) {
        throw new Error("Invalid recipient code HMAC parameter value");
      }
      process.env.RECIPIENT_CODE_HMAC_KEY = value;
    })().catch(error => {
      pending = undefined; // failed fetch can be retried on next invocation
      throw error;
    });
  }
  await pending;
}
