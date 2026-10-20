import { prisma } from "../config/prisma.js";

// All routes that call these methods must use requireGardenOwner middleware.
export async function createLetter(vaultId, data) {
  return prisma.letter.create({
    data: {
      title: data.title || null,
      recipientName: data.recipientName || null,
      senderName: data.senderName || null,
      isAnonymous: data.isAnonymous || false,
      content: data.content,
      styleConfig: data.styleConfig || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      vaultId,
    },
  });
}

export function getLettersByVault(vaultId) {
  return prisma.letter.findMany({ where: { vaultId }, orderBy: { createdAt: "desc" } });
}

export async function getLetterById(vaultId, letterId) {
  const letter = await prisma.letter.findFirst({ where: { id: letterId, vaultId } });
  if (!letter) {
    const error = new Error("Letter not found");
    error.statusCode = 404;
    throw error;
  }
  return letter;
}

export async function deleteLetter(vaultId, letterId) {
  const result = await prisma.letter.deleteMany({ where: { id: letterId, vaultId } });
  if (!result.count) {
    const error = new Error("Letter not found");
    error.statusCode = 404;
    throw error;
  }
  return { message: "Letter deleted" };
}
