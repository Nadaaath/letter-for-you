import {
  DeleteCommand, GetCommand, QueryCommand, TransactWriteCommand, UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../config/dynamodb.js";
import { tables } from "../config/tables.js";

export async function createGardenWithCodeRecord(garden, codeDigest) {
  await db.send(new TransactWriteCommand({
    TransactItems: [
      { Put: {
        TableName: tables.gardens, Item: garden,
        ConditionExpression: "attribute_not_exists(gardenId)",
      }},
      { Put: {
        TableName: tables.codes,
        Item: { codeDigest, gardenId: garden.gardenId },
        ConditionExpression: "attribute_not_exists(codeDigest)",
      }},
    ],
  }));
}

export async function getGardenById(gardenId) {
  const result = await db.send(new GetCommand({
    TableName: tables.gardens, Key: { gardenId }, ConsistentRead: true,
  }));
  return result.Item ?? null;
}

export async function getCodeRecord(codeDigest) {
  const result = await db.send(new GetCommand({
    TableName: tables.codes, Key: { codeDigest }, ConsistentRead: true,
  }));
  return result.Item ?? null;
}

export async function listGardenLetters(gardenId) {
  const letters = [];
  let lastKey;
  do {
    const result = await db.send(new QueryCommand({
      TableName: tables.letters,
      KeyConditionExpression: "gardenId = :gardenId",
      ExpressionAttributeValues: { ":gardenId": gardenId },
      ConsistentRead: true,
      ExclusiveStartKey: lastKey,
    }));
    letters.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return letters;
}

export async function updateGardenRecord(gardenId, ownerTokenHash, changes) {
  const updates = ["updatedAt = :now"];
  const values = {
    ":now": new Date().toISOString(),
    ":active": "ACTIVE", ":owner": ownerTokenHash,
  };
  const names = { "#status": "status" };
  if (changes.name !== undefined) {
    updates.push("#name = :name");
    names["#name"] = "name";
    values[":name"] = changes.name;
  }
  if (changes.description !== undefined) {
    updates.push("#description = :description");
    names["#description"] = "description";
    values[":description"] = changes.description ?? null;
  }
  const result = await db.send(new UpdateCommand({
    TableName: tables.gardens, Key: { gardenId },
    UpdateExpression: "SET " + updates.join(", "),
    ConditionExpression: "#status = :active AND ownerTokenHash = :owner",
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: "ALL_NEW",
  }));
  return result.Attributes;
}

export async function markGardenDeleting(gardenId, ownerTokenHash) {
  await db.send(new UpdateCommand({
    TableName: tables.gardens, Key: { gardenId },
    UpdateExpression: "SET #status = :deleting, updatedAt = :now",
    ConditionExpression: "#status = :active AND ownerTokenHash = :owner",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":active": "ACTIVE", ":deleting": "DELETING",
      ":owner": ownerTokenHash, ":now": new Date().toISOString(),
    },
  }));
}

export async function deleteCodeRecord(codeDigest) {
  if (codeDigest) {
    await db.send(new DeleteCommand({
      TableName: tables.codes, Key: { codeDigest },
    }));
  }
}
export async function deleteGardenRecord(gardenId, ownerTokenHash) {
  await db.send(new DeleteCommand({
    TableName: tables.gardens, Key: { gardenId },
    ConditionExpression: "#status = :deleting AND ownerTokenHash = :owner",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":deleting": "DELETING", ":owner": ownerTokenHash,
    },
  }));
}
