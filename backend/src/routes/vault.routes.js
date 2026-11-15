import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate.middleware.js";
import { createVaultSchema, updateVaultSchema, unlockVaultSchema } from "../validators/vault.validator.js";
import { createLetterSchema } from "../validators/letter.validator.js";
import {
  createVaultDynamo, getManagedVaultDynamo, updateVaultDynamo,
  deleteVaultDynamo, unlockVaultDynamo,
} from "../services/dynamo-vault.service.js";
import {
  createLetterDynamo, listLettersDynamo, getLetterDynamo, deleteLetterDynamo,
} from "../services/dynamo-letter.service.js";

const router = Router();
router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
// These per-process limiters are not sufficient for public AWS Lambda traffic.
// API Gateway throttling and a public-API cost guard are required for deployment.
const unlockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10,
  message: { message: "Too many attempts. Please try later." },
});
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 5,
  message: { message: "Too many gardens created. Please try later." },
});
function handleError(res, error) {
  if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
  if (error.name === "ConditionalCheckFailedException" ||
      error.name === "TransactionCanceledException") {
    return res.status(409).json({ message: "Conflict: resource changed during this request" });
  }
  console.error("DynamoDB request failed:", error.name);
  return res.status(500).json({ message: "Could not complete request" });
}
function asyncRoute(fn) {
  return async (req, res) => {
    try { await fn(req, res); } catch (error) { handleError(res, error); }
  };
}
const ownerKey = req => req.get("x-garden-key") ?? "";
router.post("/", createLimiter, validate(createVaultSchema), asyncRoute(async (req, res) => {
  res.status(201).json(await createVaultDynamo(req.body));
}));
router.post("/unlock", unlockLimiter, validate(unlockVaultSchema), asyncRoute(async (req, res) => {
  res.json({ vault: await unlockVaultDynamo(req.body.code) });
}));
router.get("/:vaultId", asyncRoute(async (req, res) => {
  res.json({ vault: await getManagedVaultDynamo(req.params.vaultId, ownerKey(req)) });
}));
router.put("/:vaultId", validate(updateVaultSchema), asyncRoute(async (req, res) => {
  res.json({ vault: await updateVaultDynamo(req.params.vaultId, ownerKey(req), req.body) });
}));
router.delete("/:vaultId", asyncRoute(async (req, res) => {
  res.json(await deleteVaultDynamo(req.params.vaultId, ownerKey(req)));
}));
router.post("/:vaultId/letters", validate(createLetterSchema), asyncRoute(async (req, res) => {
  const requestId = req.get("idempotency-key");
  if (requestId && !/^[a-f0-9-]{36}$/i.test(requestId)) {
    return res.status(400).json({ message: "Invalid request ID" });
  }
  res.status(201).json({ letter: await createLetterDynamo(
    req.params.vaultId, ownerKey(req), { ...req.body, requestId: requestId || undefined }
  ) });
}));
router.get("/:vaultId/letters", asyncRoute(async (req, res) => {
  res.json({ letters: await listLettersDynamo(req.params.vaultId, ownerKey(req)) });
}));
router.get("/:vaultId/letters/:letterId", asyncRoute(async (req, res) => {
  res.json({ letter: await getLetterDynamo(
    req.params.vaultId, req.params.letterId, ownerKey(req)
  ) });
}));
router.delete("/:vaultId/letters/:letterId", asyncRoute(async (req, res) => {
  res.json(await deleteLetterDynamo(req.params.vaultId, req.params.letterId, ownerKey(req)));
}));
export default router;
