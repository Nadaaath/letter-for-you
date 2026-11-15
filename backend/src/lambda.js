
import serverless from "serverless-http";
import app from "./app.js";

// Adapt API Gateway HTTP requests to Express.
// Lambda does not need to start an HTTP server.
export const handler = serverless(app);
