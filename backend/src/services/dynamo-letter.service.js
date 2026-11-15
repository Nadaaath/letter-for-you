
import { randomUUID } from "node:crypto";

import {
  createLetterRecord,
  getLetterRecord,
} from "../repositories/letter.repository.js";

import {
  listGardenLetters,
} from "../repositories/garden.repository.js";

import {
  assertGardenOwnerDynamo,
} from "./dynamo-vault.service.js";

function toLetterDTO(record) {
  const { gardenId, letterId, ...data } = record;

  return {
    ...data,
    id: letterId,
    vaultId: gardenId,
  };
}

export async function createLetterDynamo(
  gardenId,
  managementToken,
  data
) {
  await assertGardenOwnerDynamo(
    gardenId,
    managementToken
  );

  const letter = {
    gardenId,
    letterId: randomUUID(),
    title: data.title ?? null,
    recipientName: data.recipientName ?? null,
    senderName: data.senderName ?? null,
    isAnonymous: data.isAnonymous ?? false,
    content: data.content,
    styleConfig: data.styleConfig ?? null,
    expiresAt: data.expiresAt ?? null,
    createdAt: new Date().toISOString(),
  };

  await createLetterRecord(letter);

  return toLetterDTO(letter);
}

export async function listLettersDynamo(
  gardenId,
  managementToken
) {
  await assertGardenOwnerDynamo(
    gardenId,
    managementToken
  );

  const letters = await listGardenLetters(gardenId);

  return letters
    .map(toLetterDTO)
    .sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(
        String(a.createdAt ?? "")
      )
    );
}

export async function getLetterDynamo(
  gardenId,
  letterId,
  managementToken
) {
  await assertGardenOwnerDynamo(
    gardenId,
    managementToken
  );

  const letter = await getLetterRecord(
    gardenId,
    letterId
  );

  if (!letter) {
    const error = new Error("Letter not found");
    error.statusCode = 404;
    throw error;
  }

  return toLetterDTO(letter);
}
