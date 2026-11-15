
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../config/dynamodb.js";

// Local development defaults.
// AWS Lambda will receive the real table names
// through environment variables.
const GARDENS_TABLE =
  process.env.GARDENS_TABLE_NAME || "Gardens";

const LETTERS_TABLE =
  process.env.LETTERS_TABLE_NAME || "Letters";

const RECIPIENT_CODES_TABLE =
  process.env.RECIPIENT_CODES_TABLE_NAME || "RecipientCodes";

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

export async function createGardenWithCodeRecord(
  garden,
  codeDigest
) {
  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: GARDENS_TABLE,
            Item: garden,
            ConditionExpression:
              "attribute_not_exists(gardenId)",
          },
        },
        {
          Put: {
            TableName: RECIPIENT_CODES_TABLE,
            Item: {
              codeDigest,
              gardenId: garden.gardenId,
            },
            ConditionExpression:
              "attribute_not_exists(codeDigest)",
          },
        },
      ],
    })
  );
}
