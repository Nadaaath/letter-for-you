
import {
  DynamoDBClient,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export async function handler() {
  const tableName = process.env.GARDENS_TABLE_NAME;

  if (!tableName) {
    throw new Error("GARDENS_TABLE_NAME is missing");
  }

  // Use a deliberately nonexistent test key.
  // This is a read-only database operation.
  const response = await client.send(
    new GetItemCommand({
      TableName: tableName,
      Key: {
        gardenId: {
          S: "__letter4you_smoke_test__",
        },
      },
      ConsistentRead: true,
    })
  );

  console.log("DynamoDB GetItem request completed");

  return {
    status: "ok",
    databaseConnection: "successful",
    itemFound: Boolean(response.Item),
  };
}
