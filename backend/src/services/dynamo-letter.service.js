import { randomUUID } from "node:crypto";
import { createLetterRecord, getLetterRecord, deleteLetterRecord } from "../repositories/letter.repository.js";
import { listGardenLetters } from "../repositories/garden.repository.js";
import { assertGardenOwnerDynamo } from "./dynamo-vault.service.js";

function toDTO({ gardenId, letterId, ...data }) {
  return { ...data, id: letterId, vaultId: gardenId };
}
function notFound() {
  const error = new Error("Letter not found");
  error.statusCode = 404;
  return error;
}
export async function createLetterDynamo(gardenId, token, data) {
  await assertGardenOwnerDynamo(gardenId, token);
  const letter = {
    gardenId, letterId: data.requestId || randomUUID(),
    title: data.title ?? null, recipientName: data.recipientName ?? null,
    senderName: data.senderName ?? null, isAnonymous: data.isAnonymous ?? false,
    content: data.content, styleConfig: data.styleConfig ?? null,
    expiresAt: data.expiresAt ?? null,
    createdAt: new Date().toISOString(),
  };
  try {
    await createLetterRecord(letter);
  } catch (error) {
    if (data.requestId && error.name === "TransactionCanceledException") {
      const existing = await getLetterRecord(gardenId, letter.letterId);
      if (existing && [
        "title", "recipientName", "senderName", "isAnonymous",
        "content", "styleConfig", "expiresAt",
      ].every(k => JSON.stringify(existing[k] ?? null) === JSON.stringify(letter[k] ?? null))) {
        return toDTO(existing);
      }
    }
    throw error;
  }
  return toDTO(letter);
}
export async function listLettersDynamo(gardenId, token) {
  await assertGardenOwnerDynamo(gardenId, token);
  return (await listGardenLetters(gardenId)).map(toDTO)
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
}
export async function getLetterDynamo(gardenId, letterId, token) {
  await assertGardenOwnerDynamo(gardenId, token);
  const letter = await getLetterRecord(gardenId, letterId);
  if (!letter) throw notFound();
  return toDTO(letter);
}
export async function deleteLetterDynamo(gardenId, letterId, token) {
  await assertGardenOwnerDynamo(gardenId, token);
  try {
    await deleteLetterRecord(gardenId, letterId);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") throw notFound();
    throw error;
  }
  return { message: "Letter deleted" };
}
