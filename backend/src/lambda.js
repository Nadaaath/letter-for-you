
import serverless from "serverless-http";
import app from "./app.js";
import { ensureRecipientCodeHmacKey } from "./config/recipient-code-secret.js";

const expressHandler = serverless(app);

export const handler = async (event, context) => {
  // API Gateway HTTP API may include its named stage
  // in the request path, e.g. /dev/health.
  const stage = event.requestContext?.stage;

  if (
    event.version === "2.0" &&
    stage &&
    stage !== "$default" &&
    typeof event.rawPath === "string"
  ) {
    const prefix = `/${stage}`;

    if (
      event.rawPath === prefix ||
      event.rawPath.startsWith(`${prefix}/`)
    ) {
      event = {
        ...event,
        rawPath: event.rawPath.slice(prefix.length) || "/",
      };
    }
  }

  // Fetch the HMAC secret only for application routes, cached per warm Lambda.
  // Health checks stay available even if Parameter Store has a problem.
  const path = event.rawPath ?? "";
  if (path === "/api/vaults" || path.startsWith("/api/vaults/")) {
    await ensureRecipientCodeHmacKey();
  }
  return expressHandler(event, context);
};
// CI/CD deployment verification
