import {
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import {
  generateAccessCode,
  generateManagementToken,
  normalizeCode,
} from "./code.service.js";

import {
  createGardenWithCodeRecord,
  getGardenById,
  listGardenLetters,
} from "../repositories/garden.repository.js";
export async function createVaultDynamo(data) {
  const hmacKey = process.env.RECIPIENT_CODE_HMAC_KEY;

  if (!/^[a-f0-9]{64}$/i.test(hmacKey ?? "")) {
    throw new Error("A 32-byte recipient-code HMAC key is required");
  }

  const gardenId = randomUUID();
  const managementToken = generateManagementToken();
  const accessCode = generateAccessCode();
  const now = new Date().toISOString();

  const ownerTokenHash = createHash("sha256")
    .update(managementToken)
    .digest("hex");

  const codeDigest = createHmac(
    "sha256",
    Buffer.from(hmacKey, "hex")
  )
    .update(normalizeCode(accessCode))
    .digest("hex");

  const garden = {
    gardenId,
    name: data.name,
    description: data.description ?? null,
    ownerTokenHash,
    hasAccessCode: true,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };

  await createGardenWithCodeRecord(garden, codeDigest);

  return {
    vault: {
      id: gardenId,
      name: garden.name,
      description: garden.description,
      createdAt: now,
      updatedAt: now,
      hasAccessCode: true,
      letters: [],
      _count: { letters: 0 },
    },
    managementToken,
    accessCode,
  };
}
export async function getManagedVaultDynamo(
  gardenId,
  managementToken
) {
  // 1. Validate token format
  if (!/^[a-f0-9]{64}$/.test(managementToken ?? "")) {
    throw new Error("Access denied");
  }

  // 2. Retrieve garden metadata
  const garden = await getGardenById(gardenId);

  if (
    garden?.status !== "ACTIVE" ||
    !/^[a-f0-9]{64}$/.test(garden.ownerTokenHash ?? "")
  ) {
    throw new Error("Access denied");
  }

  // 3. Hash the supplied token
  const receivedHash = createHash("sha256")
    .update(managementToken)
    .digest();

  const expectedHash = Buffer.from(
    garden.ownerTokenHash,
    "hex"
  );

  // 4. Compare both hashes safely
  if (!timingSafeEqual(receivedHash, expectedHash)) {
    throw new Error("Access denied");
  }

  // 5. Retrieve the garden's letters
  const letters = await listGardenLetters(gardenId);

  // 6. Return only the information the frontend needs
  return {
    id: garden.gardenId,
    name: garden.name,
    description: garden.description,
    createdAt: garden.createdAt,
    updatedAt: garden.updatedAt,
    hasAccessCode: garden.hasAccessCode,
    letters: letters.map(({ gardenId, letterId, ...rest }) => ({
      ...rest,
      id: letterId,
      vaultId: gardenId,
    })),
    _count: {
      letters: letters.length,
    },
  };
}