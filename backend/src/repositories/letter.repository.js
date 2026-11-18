import {
  BatchWriteCommand, DeleteCommand, GetCommand, TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../config/dynamodb.js";
import { tables } from "../config/tables.js";
import { listGardenLetters } from "./garden.repository.js";

export async function createLetterRecord(letter) {
  await db.send(new TransactWriteCommand({
    TransactItems: [
      { ConditionCheck: {
        TableName: tables.gardens,
        Key: { gardenId: letter.gardenId },
        ConditionExpression: "#status = :active",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":active": "ACTIVE" },
      }},
      { Put: {
        TableName: tables.letters, Item: letter,
        ConditionExpression: "attribute_not_exists(gardenId)",
      }},
    ],
  }));
  return letter;
}

export async function getLetterRecord(gardenId, letterId) {
  const result = await db.send(new GetCommand({
    TableName: tables.letters, Key: { gardenId, letterId },
    ConsistentRead: true,
  }));
  return result.Item ?? null;
}

export async function deleteLetterRecord(gardenId, letterId) {
  const result = await db.send(new DeleteCommand({
    TableName: tables.letters,
    Key: { gardenId, letterId },
    ConditionExpression: "attribute_exists(gardenId)",
    ReturnValues: "ALL_OLD",
  }));
  return result.Attributes;
}

// Call only after marking the garden DELETING (prevents new inserts).
// Suitable for small gardens; use an async cleanup worker for large datasets.
export async function deleteAllGardenLetters(gardenId) {
  const letters = await listGardenLetters(gardenId);
  for (let i = 0; i < letters.length; i += 25) {
    let pending = letters.slice(i, i + 25).map(({ letterId }) => ({
      DeleteRequest: { Key: { gardenId, letterId } },
    }));
    for (let attempt = 0; pending.length > 0; attempt++) {
      if (attempt >= 8) throw new Error("DynamoDB cleanup did not finish");
      const result = await db.send(new BatchWriteCommand({
        RequestItems: { [tables.letters]: pending },
      }));
      pending = result.UnprocessedItems?.[tables.letters] ?? [];
      if (pending.length) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000, 40 * 2 ** attempt)));
      }
    }
  }
}
