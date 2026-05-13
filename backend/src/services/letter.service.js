import { prisma } from "../config/prisma.js";

async function ensureVaultBelongsToUser(userId, vaultId) {
  const vault = await prisma.vault.findFirst({
    where: {
      id: vaultId,
      userId,
    },
  });

  if (!vault) {
    const error = new Error("Private garden not found");
    error.statusCode = 404;
    throw error;
  }

  return vault;
}

export async function createLetter(userId, vaultId, data) {
  await ensureVaultBelongsToUser(userId, vaultId);

  return prisma.letter.create({
    data: {
      title: data.title || null,
      recipientName: data.recipientName || null,
      senderName: data.senderName || null,
      isAnonymous: data.isAnonymous || false,
      content: data.content,
      styleConfig: data.styleConfig || null,
      isOpenOnce: data.isOpenOnce || false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      vaultId,
    },
  });
}

export async function getLettersByVault(userId, vaultId) {
  await ensureVaultBelongsToUser(userId, vaultId);

  return prisma.letter.findMany({
    where: { vaultId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLetterById(userId, vaultId, letterId) {
  await ensureVaultBelongsToUser(userId, vaultId);

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      vaultId,
    },
  });

  if (!letter) {
    const error = new Error("Letter not found");
    error.statusCode = 404;
    throw error;
  }

  return letter;
}

export async function updateLetter(userId, vaultId, letterId, data) {
  await getLetterById(userId, vaultId, letterId);

  return prisma.letter.update({
    where: { id: letterId },
    data: {
      ...(data.title !== undefined && { title: data.title || null }),
      ...(data.recipientName !== undefined && {
        recipientName: data.recipientName || null,
      }),
      ...(data.senderName !== undefined && {
        senderName: data.senderName || null,
      }),
      ...(data.isAnonymous !== undefined && {
        isAnonymous: data.isAnonymous,
      }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.styleConfig !== undefined && {
        styleConfig: data.styleConfig || null,
      }),
      ...(data.isOpenOnce !== undefined && {
        isOpenOnce: data.isOpenOnce,
      }),
      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }),
    },
  });
}

export async function deleteLetter(userId, vaultId, letterId) {
  await getLetterById(userId, vaultId, letterId);

  await prisma.letter.delete({
    where: { id: letterId },
  });

  return {
    message: "Letter deleted successfully",
  };
}