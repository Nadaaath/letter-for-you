import {
  PutCommand,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../config/dynamodb.js";

const GARDENS_TABLE = "Gardens";
const LETTERS_TABLE = "Letters";

// Store a new garden
export async function createGardenRecord(garden) {
  await db.send(
    new PutCommand({
      TableName: GARDENS_TABLE,
      Item: garden,
      ConditionExpression: "attribute_not_exists(gardenId)",
    })
  );

  return garden;
}

// Retrieve a garden by its ID
export async function getGardenById(gardenId) {
  const result = await db.send(
    new GetCommand({
      TableName: GARDENS_TABLE,
      Key: { gardenId },
      ConsistentRead: true,
    })
  );

  return result.Item ?? null;
}

// Retrieve letters belonging to a garden
export async function listGardenLetters(gardenId) {
  const letters = [];
  let lastKey;

  do {
    const result = await db.send(
      new QueryCommand({
        TableName: LETTERS_TABLE,
        KeyConditionExpression: "gardenId = :id",
        ExpressionAttributeValues: {
          ":id": gardenId,
        },
        ConsistentRead: true,
        ExclusiveStartKey: lastKey,
      })
    );

    letters.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return letters;
}

export async function createGardenWithCodeRecord(garden, codeDigest) {
  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: "Gardens",
            Item: garden,
            ConditionExpression: "attribute_not_exists(gardenId)",
          },
        },
        {
          Put: {
            TableName: "RecipientCodes",
            Item: {
              codeDigest,
              gardenId: garden.gardenId,
            },
            ConditionExpression: "attribute_not_exists(codeDigest)",
          },
        },
      ],
    })
  );
}