import express from "express";
import rateLimit from "express-rate-limit";
import { requireGardenOwner } from "../middleware/garden.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createVaultSchema, updateVaultSchema, unlockVaultSchema } from "../validators/vault.validator.js";
import { createLetterSchema } from "../validators/letter.validator.js";
import {
  addLetter, create, generateCode, getById, getLetter, listLetters,
  remove, removeLetter, unlock, update,
} from "../controllers/vault.controller.js";

const router = express.Router();

// Unlock is public but aggressively rate-limited to deter code guessing.
const unlockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try later." },
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many gardens created. Please try again later.",
  },
});

router.post("/", createLimiter, validate(createVaultSchema), create);router.post("/unlock", unlockLimiter, validate(unlockVaultSchema), unlock);

// Every modification/read of the CREATOR view requires the management token.
router.use("/:vaultId", requireGardenOwner);
router.get("/:vaultId", getById);
router.put("/:vaultId", validate(updateVaultSchema), update);
router.delete("/:vaultId", remove);
router.post("/:vaultId/generate-code", generateCode);
router.post("/:vaultId/letters", validate(createLetterSchema), addLetter);
router.get("/:vaultId/letters", listLetters);
router.get("/:vaultId/letters/:letterId", getLetter);
// Sealed letters intentionally have NO update endpoint.
router.delete("/:vaultId/letters/:letterId", removeLetter);

export default router;
