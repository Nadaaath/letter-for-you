import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",

  ...(endpoint && {
    endpoint,
    credentials: {
  accessKeyId: "localtest",
  secretAccessKey: "localtest123",
},
  }),
});

export const db = DynamoDBDocumentClient.from(client);