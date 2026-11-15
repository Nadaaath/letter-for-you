
import {
  GetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../config/dynamodb.js";

const GARDENS_TABLE =
  process.env.GARDENS_TABLE_NAME || "Gardens";

const LETTERS_TABLE =
  process.env.LETTERS_TABLE_NAME || "Letters";

// Atomically check the garden and insert the letter.
export async function createLetterRecord(letter) {
  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          ConditionCheck: {
            TableName: GARDENS_TABLE,
            Key: { gardenId: letter.gardenId },
            ConditionExpression: "#status = :active",
            ExpressionAttributeNames: {
              "#status": "status",
            },
            ExpressionAttributeValues: {
              ":active": "ACTIVE",
            },
          },
        },
        {
          Put: {
            TableName: LETTERS_TABLE,
            Item: letter,
            ConditionExpression:
              "attribute_not_exists(gardenId)",
          },
        },
      ],
    })
  );

  return letter;
}

// Retrieve one letter using its complete primary key.
export async function getLetterRecord(
  gardenId,
  letterId
) {
  const result = await db.send(
    new GetCommand({
      TableName: LETTERS_TABLE,
      Key: { gardenId, letterId },
      ConsistentRead: true,
    })
  );

  return result.Item ?? null;
}
