
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
    throw new Error(
      "A 32-byte recipient-code HMAC key is required"
    );
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

  await createGardenWithCodeRecord(
    garden,
    codeDigest
  );

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

// Reusable authorization for every owner-only operation.
export async function assertGardenOwnerDynamo(
  gardenId,
  managementToken
) {
  if (!/^[a-f0-9]{64}$/.test(managementToken ?? "")) {
    throw new Error("Access denied");
  }

  const garden = await getGardenById(gardenId);

  if (
    garden?.status !== "ACTIVE" ||
    !/^[a-f0-9]{64}$/.test(garden.ownerTokenHash ?? "")
  ) {
    throw new Error("Access denied");
  }

  const receivedHash = createHash("sha256")
    .update(managementToken)
    .digest();

  const expectedHash = Buffer.from(
    garden.ownerTokenHash,
    "hex"
  );

  if (!timingSafeEqual(receivedHash, expectedHash)) {
    throw new Error("Access denied");
  }

  return garden;
}

export async function getManagedVaultDynamo(
  gardenId,
  managementToken
) {
  const garden = await assertGardenOwnerDynamo(
    gardenId,
    managementToken
  );

  const letters = await listGardenLetters(gardenId);

  const formattedLetters = letters
    .map(({ gardenId, letterId, ...rest }) => ({
      ...rest,
      id: letterId,
      vaultId: gardenId,
    }))
    .sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(
        String(a.createdAt ?? "")
      )
    );

  return {
    id: garden.gardenId,
    name: garden.name,
    description: garden.description,
    createdAt: garden.createdAt,
    updatedAt: garden.updatedAt,
    hasAccessCode: garden.hasAccessCode,
    letters: formattedLetters,
    _count: {
      letters: formattedLetters.length,
    },
  };
}
