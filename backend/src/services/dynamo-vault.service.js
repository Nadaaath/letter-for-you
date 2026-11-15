import { randomUUID, createHash, createHmac, timingSafeEqual } from "node:crypto";
import { generateAccessCode, generateManagementToken, normalizeCode } from "./code.service.js";
import {
  createGardenWithCodeRecord, getGardenById, listGardenLetters, getCodeRecord,
  updateGardenRecord, markGardenDeleting, deleteCodeRecord, deleteGardenRecord,
} from "../repositories/garden.repository.js";
import { deleteAllGardenLetters } from "../repositories/letter.repository.js";

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
function digestToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function digestRecipientCode(code) {
  const key = process.env.RECIPIENT_CODE_HMAC_KEY;
  if (!/^[a-f0-9]{64}$/i.test(key ?? "")) {
    throw new Error("RECIPIENT_CODE_HMAC_KEY must be a stable 32-byte hex key");
  }
  return createHmac("sha256", Buffer.from(key, "hex"))
    .update(normalizeCode(code)).digest("hex");
}
function letterDTO({ gardenId, letterId, ...rest }, forReader = false) {
  return {
    ...rest, id: letterId, vaultId: gardenId,
    ...(forReader && rest.isAnonymous ? { senderName: null } : {}),
  };
}
function sortedLetters(items, forReader = false) {
  return items.map(item => letterDTO(item, forReader))
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
}
async function ownerDTO(garden) {
  const letters = sortedLetters(await listGardenLetters(garden.gardenId));
  return {
    id: garden.gardenId, name: garden.name, description: garden.description,
    createdAt: garden.createdAt, updatedAt: garden.updatedAt,
    hasAccessCode: garden.hasAccessCode,
    letters, _count: { letters: letters.length },
  };
}

export async function createVaultDynamo(data) {
  const gardenId = randomUUID();
  const managementToken = generateManagementToken();
  const accessCode = generateAccessCode();
  const codeDigest = digestRecipientCode(accessCode);
  const now = new Date().toISOString();
  const garden = {
    gardenId, name: data.name, description: data.description ?? null,
    ownerTokenHash: digestToken(managementToken), codeDigest,
    status: "ACTIVE", hasAccessCode: true,
    createdAt: now, updatedAt: now,
  };
  await createGardenWithCodeRecord(garden, codeDigest);
  return {
    vault: {
      id: gardenId, name: garden.name, description: garden.description,
      createdAt: now, updatedAt: now,
      hasAccessCode: true, letters: [], _count: { letters: 0 },
    },
    managementToken, accessCode,
  };
}

// Allow DELETING only when resuming a failed delete operation.
export async function assertGardenOwnerDynamo(gardenId, token, { allowDeleting = false } = {}) {
  if (!/^[a-f0-9]{64}$/.test(token ?? "")) throw httpError("Access denied", 403);
  const garden = await getGardenById(gardenId);
  if (!garden ||
      (garden.status !== "ACTIVE" && !(allowDeleting && garden.status === "DELETING")) ||
      !/^[a-f0-9]{64}$/.test(garden.ownerTokenHash ?? "")) {
    throw httpError("Access denied", 403);
  }
  const received = Buffer.from(digestToken(token), "hex");
  const expected = Buffer.from(garden.ownerTokenHash, "hex");
  if (!timingSafeEqual(received, expected)) throw httpError("Access denied", 403);
  return garden;
}

export async function getManagedVaultDynamo(gardenId, token) {
  return ownerDTO(await assertGardenOwnerDynamo(gardenId, token));
}
export async function updateVaultDynamo(gardenId, token, data) {
  const garden = await assertGardenOwnerDynamo(gardenId, token);
  const updated = await updateGardenRecord(gardenId, garden.ownerTokenHash, data);
  return ownerDTO(updated);
}
export async function deleteVaultDynamo(gardenId, token) {
  const garden = await assertGardenOwnerDynamo(gardenId, token, { allowDeleting: true });
  if (garden.status === "ACTIVE") {
    await markGardenDeleting(gardenId, garden.ownerTokenHash);
  }
  await deleteAllGardenLetters(gardenId);
  await deleteCodeRecord(garden.codeDigest);
  await deleteGardenRecord(gardenId, garden.ownerTokenHash);
  return { message: "Private garden deleted" };
}
export async function unlockVaultDynamo(code) {
  const digest = digestRecipientCode(code);
  const found = await getCodeRecord(digest);
  if (!found) throw httpError("Invalid access code", 404);
  const garden = await getGardenById(found.gardenId);
  if (garden?.status !== "ACTIVE" || garden.codeDigest !== digest) {
    throw httpError("Invalid access code", 404);
  }
  const now = new Date().toISOString();
  return {
    id: garden.gardenId, name: garden.name, description: garden.description,
    letters: sortedLetters(
      (await listGardenLetters(garden.gardenId))
        .filter(letter => !letter.expiresAt || letter.expiresAt > now), true
    ),
  };
}
