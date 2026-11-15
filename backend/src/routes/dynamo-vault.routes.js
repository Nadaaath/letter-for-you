
import { Router } from "express";

import { validate } from "../middleware/validate.middleware.js";

import {
  createVaultSchema,
} from "../validators/vault.validator.js";

import {
  createLetterSchema,
} from "../validators/letter.validator.js";

import {
  createVaultDynamo,
  getManagedVaultDynamo,
} from "../services/dynamo-vault.service.js";

import {
  createLetterDynamo,
  listLettersDynamo,
  getLetterDynamo,
} from "../services/dynamo-letter.service.js";

const router = Router();

// Never cache private garden or letter responses.
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

function handleDynamoError(res, error) {
  if (error.message === "Access denied") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  if (error.statusCode === 404) {
    return res.status(404).json({
      message: "Letter not found",
    });
  }

  // A conditional check can reject a write if the
  // garden is inactive or the item already exists.
  if (
    error.name === "TransactionCanceledException" &&
    error.CancellationReasons?.some(
      (reason) => reason.Code === "ConditionalCheckFailed"
    )
  ) {
    return res.status(409).json({
      message: "Letter could not be created in this garden",
    });
  }

  console.error("DynamoDB operation failed:", error.name);

  return res.status(500).json({
    message: "Database operation failed",
  });
}

// POST /api/dynamo/vaults
router.post(
  "/",
  validate(createVaultSchema),
  async (req, res) => {
    try {
      const result = await createVaultDynamo(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleDynamoError(res, error);
    }
  }
);

// GET /api/dynamo/vaults/:vaultId
router.get("/:vaultId", async (req, res) => {
  try {
    const vault = await getManagedVaultDynamo(
      req.params.vaultId,
      req.get("x-garden-key") ?? ""
    );

    return res.json({ vault });
  } catch (error) {
    return handleDynamoError(res, error);
  }
});

// POST /api/dynamo/vaults/:vaultId/letters
router.post(
  "/:vaultId/letters",
  validate(createLetterSchema),
  async (req, res) => {
    try {
      const letter = await createLetterDynamo(
        req.params.vaultId,
        req.get("x-garden-key") ?? "",
        req.body
      );

      return res.status(201).json({ letter });
    } catch (error) {
      return handleDynamoError(res, error);
    }
  }
);

// GET /api/dynamo/vaults/:vaultId/letters
router.get("/:vaultId/letters", async (req, res) => {
  try {
    const letters = await listLettersDynamo(
      req.params.vaultId,
      req.get("x-garden-key") ?? ""
    );

    return res.json({ letters });
  } catch (error) {
    return handleDynamoError(res, error);
  }
});

// GET /api/dynamo/vaults/:vaultId/letters/:letterId
router.get(
  "/:vaultId/letters/:letterId",
  async (req, res) => {
    try {
      const letter = await getLetterDynamo(
        req.params.vaultId,
        req.params.letterId,
        req.get("x-garden-key") ?? ""
      );

      return res.json({ letter });
    } catch (error) {
      return handleDynamoError(res, error);
    }
  }
);

export default router;
