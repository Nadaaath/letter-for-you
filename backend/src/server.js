import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`Letter For You API running on port http://localhost:${env.port}`);
});