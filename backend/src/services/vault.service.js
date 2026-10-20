import { prisma } from "../config/prisma.js";
import { digestManagementToken } from "../middleware/garden.middleware.js";
import {
  compareAccessCode,
  generateAccessCode,
  generateManagementToken,
  hashAccessCode,
  normalizeCode,
} from "./code.service.js";

const managedSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  hasAccessCode: true,
  letters: { orderBy: { createdAt: "desc" } },
  _count: { select: { letters: true } },
};

export async function createVault(data) {
  const managementToken = generateManagementToken();
  const vault = await prisma.vault.create({
    data: {
      name: data.name,
      description: data.description || null,
      ownerTokenHash: digestManagementToken(managementToken),
    },
    select: managedSelect,
  });
  return { vault, managementToken };
}

// Call only AFTER requireGardenOwner middleware has authorized the request.
export async function getManagedVault(vaultId) {
  const vault = await prisma.vault.findUnique({
    where: { id: vaultId },
    select: managedSelect,
  });
  if (!vault) {
    const error = new Error("Private garden not found");
    error.statusCode = 404;
    throw error;
  }
  return vault;
}

export async function updateVault(vaultId, data) {
  return prisma.vault.update({
    where: { id: vaultId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description || null }),
    },
    select: managedSelect,
  });
}

export async function deleteVault(vaultId) {
  await prisma.vault.delete({ where: { id: vaultId } });
  return { message: "Private garden deleted" };
}

export async function generateCodeForVault(vaultId) {
  const accessCode = generateAccessCode();
  const accessCodeHash = await hashAccessCode(accessCode);
  await prisma.vault.update({
    where: { id: vaultId },
    data: { accessCodeHash, hasAccessCode: true },
  });
  return { vault: await getManagedVault(vaultId), accessCode };
}

export async function unlockVaultByCode(code) {
  const normalized = normalizeCode(code);
  // This preserves old bcrypt-based codes. It does NOT scale well; replace with
  // indexed keyed lookups before high-traffic production deployment.
  const vaults = await prisma.vault.findMany({
    where: { hasAccessCode: true, accessCodeHash: { not: null } },
    select: {
      id: true,
      name: true,
      description: true,
      accessCodeHash: true,
      user: { select: { name: true } },
      letters: { orderBy: { createdAt: "desc" } },
    },
  });

  let matched = null;
  for (const vault of vaults) {
    if (await compareAccessCode(normalized, vault.accessCodeHash)) {
      matched = vault;
      break;
    }
  }
  if (!matched) {
    const error = new Error("Invalid access code");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  return {
    id: matched.id,
    name: matched.name,
    description: matched.description,
    from: matched.user?.name || null,
    letters: matched.letters.filter((letter) => !letter.expiresAt || letter.expiresAt >= now)
      .map((letter) => ({
        id: letter.id,
        title: letter.title,
        recipientName: letter.recipientName,
        senderName: letter.isAnonymous ? null : letter.senderName,
        isAnonymous: letter.isAnonymous,
        content: letter.content,
        styleConfig: letter.styleConfig,
        expiresAt: letter.expiresAt,
        createdAt: letter.createdAt,
      })),
  };
}
