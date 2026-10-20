import crypto from "crypto";
import { prisma } from "../config/prisma.js";

export function digestManagementToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requireGardenOwner(req, res, next) {
  try {
    const token = req.get("x-garden-key") || "";
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(401).json({ message: "A private garden management key is required" });
    }

    const vault = await prisma.vault.findUnique({
      where: { id: req.params.vaultId },
      select: { ownerTokenHash: true },
    });

    if (!vault?.ownerTokenHash) {
      return res.status(404).json({ message: "Garden not found or not yet migrated" });
    }

    const expected = Buffer.from(vault.ownerTokenHash, "hex");
    const provided = Buffer.from(digestManagementToken(token), "hex");
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      return res.status(403).json({ message: "Invalid garden management key" });
    }

    next();
  } catch (error) {
    next(error);
  }
}
