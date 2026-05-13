import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createLetterSchema,
  updateLetterSchema,
  unlockLetterSchema,
} from "../validators/letter.validator.js";

import {
  create,
  list,
  getById,
  update,
  remove,
  generateCode,
  unlock,
} from "../controllers/letter.controller.js";

const router = express.Router();

router.post("/unlock", validate(unlockLetterSchema), unlock);

router.use(requireAuth);

router.post("/", validate(createLetterSchema), create);
router.get("/", list);
router.get("/:id", getById);
router.put("/:id", validate(updateLetterSchema), update);
router.delete("/:id", remove);
router.post("/:id/generate-code", generateCode);

export default router;