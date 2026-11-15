import { Router } from "express";

import { validate } from "../middleware/validate.middleware.js";
import { createVaultSchema } from "../validators/vault.validator.js";

import {
  createVaultDynamo,
  getManagedVaultDynamo,
} from "../services/dynamo-vault.service.js";

const router = Router();

// POST /api/dynamo/vaults
// Create a garden in DynamoDB.
router.post("/", validate(createVaultSchema), async (req, res) => {
  try {
    const result = await createVaultDynamo(req.body);

    res.set("Cache-Control", "no-store");

    return res.status(201).json(result);
  } catch (error) {
    console.error("DynamoDB garden creation failed:", error);

    return res.status(500).json({
      message: "Could not create garden",
    });
  }
});

// GET /api/dynamo/vaults/:vaultId
// Retrieve a garden only with its valid management token.
router.get("/:vaultId", async (req, res) => {
  try {
    const managementToken = req.get("x-garden-key") ?? "";

    const vault = await getManagedVaultDynamo(
      req.params.vaultId,
      managementToken
    );

    res.set("Cache-Control", "no-store");

    return res.status(200).json({ vault });
  } catch (error) {
    if (error.message === "Access denied") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    console.error("DynamoDB garden retrieval failed:", error);

    return res.status(500).json({
      message: "Could not retrieve garden",
    });
  }
});

export default router;