import { prisma } from "../config/prisma.js";
import {
  compareAccessCode,
  generateAccessCode,
  hashAccessCode,
  normalizeCode,
} from "./code.service.js";

export async function createVault(userId, data) {
  return prisma.vault.create({
    data: {
      name: data.name,
      description: data.description || null,
      userId,
    },
    include: {
      _count: {
        select: {
          letters: true,
        },
      },
    },
  });
}

export async function getUserVaults(userId) {
  return prisma.vault.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          letters: true,
        },
      },
    },
  });
}

export async function getUserVaultById(userId, vaultId) {
  const vault = await prisma.vault.findFirst({
    where: {
      id: vaultId,
      userId,
    },
    include: {
      letters: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          letters: true,
        },
      },
    },
  });

  if (!vault) {
    const error = new Error("Private garden not found");
    error.statusCode = 404;
    throw error;
  }

  return vault;
}

export async function updateVault(userId, vaultId, data) {
  await getUserVaultById(userId, vaultId);

  return prisma.vault.update({
    where: { id: vaultId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
    },
    include: {
      _count: {
        select: {
          letters: true,
        },
      },
    },
  });
}

export async function deleteVault(userId, vaultId) {
  await getUserVaultById(userId, vaultId);

  await prisma.vault.delete({
    where: { id: vaultId },
  });

  return {
    message: "Private garden deleted successfully",
  };
}

export async function generateCodeForVault(userId, vaultId) {
  await getUserVaultById(userId, vaultId);

  const plainCode = generateAccessCode();
  const codeHash = await hashAccessCode(plainCode);

  const vault = await prisma.vault.update({
    where: { id: vaultId },
    data: {
      accessCodeHash: codeHash,
      hasAccessCode: true,
    },
    include: {
      _count: {
        select: {
          letters: true,
        },
      },
    },
  });

  return {
    vault,
    accessCode: plainCode,
  };
}

export async function unlockVaultByCode(code) {
  const normalizedCode = normalizeCode(code);

  const vaults = await prisma.vault.findMany({
    where: {
      hasAccessCode: true,
      accessCodeHash: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      letters: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  let matchedVault = null;

  for (const vault of vaults) {
    const isMatch = await compareAccessCode(
      normalizedCode,
      vault.accessCodeHash
    );

    if (isMatch) {
      matchedVault = vault;
      break;
    }
  }

  if (!matchedVault) {
    const error = new Error("Invalid access code");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();

  const visibleLetters = [];

  for (const letter of matchedVault.letters) {
    if (letter.expiresAt && letter.expiresAt < now) {
      continue;
    }

    if (letter.isOpenOnce && letter.openedAt) {
      continue;
    }

    visibleLetters.push(letter);
  }

  return {
    id: matchedVault.id,
    name: matchedVault.name,
    description: matchedVault.description,
    from: matchedVault.user.name,
    letters: visibleLetters.map((letter) => ({
      id: letter.id,
      title: letter.title,
      recipientName: letter.recipientName,
      senderName: letter.isAnonymous ? null : letter.senderName,
      isAnonymous: letter.isAnonymous,
      content: letter.content,
      styleConfig: letter.styleConfig,
      isOpenOnce: letter.isOpenOnce,
      openedAt: letter.openedAt,
      expiresAt: letter.expiresAt,
      createdAt: letter.createdAt,
    })),
  };
}