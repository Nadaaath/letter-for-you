import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createVaultSchema,
  updateVaultSchema,
  unlockVaultSchema,
} from "../validators/vault.validator.js";
import {
  createLetterSchema,
  updateLetterSchema,
} from "../validators/letter.validator.js";

import {
  addLetter,
  create,
  editLetter,
  generateCode,
  getById,
  getLetter,
  list,
  listLetters,
  remove,
  removeLetter,
  unlock,
  update,
} from "../controllers/vault.controller.js";

const router = express.Router();

router.post("/unlock", validate(unlockVaultSchema), unlock);

router.use(requireAuth);

router.post("/", validate(createVaultSchema), create);
router.get("/", list);

router.get("/:vaultId", getById);
router.put("/:vaultId", validate(updateVaultSchema), update);
router.delete("/:vaultId", remove);

router.post("/:vaultId/generate-code", generateCode);

router.post("/:vaultId/letters", validate(createLetterSchema), addLetter);
router.get("/:vaultId/letters", listLetters);
router.get("/:vaultId/letters/:letterId", getLetter);
router.put(
  "/:vaultId/letters/:letterId",
  validate(updateLetterSchema),
  editLetter
);
router.delete("/:vaultId/letters/:letterId", removeLetter);

export default router;