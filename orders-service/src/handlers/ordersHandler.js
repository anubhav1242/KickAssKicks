const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDB = DynamoDBDocumentClient.from(client);

const ORDERS_TABLE = process.env.ORDERS_TABLE;

exports.handler = async (event) => {
  console.log("Incoming Event:", JSON.stringify(event, null, 2));

  const { fieldName } = event.info;
  const args = event.arguments;

  try {
    switch (fieldName) {
      case "createOrder":
        return await createOrder(args);
      case "getOrder":
        return await getOrder(args.orderId);
      case "listOrders":
        return await listOrders(args.userId);
      case "deleteOrder":
        return await deleteOrder(args.orderId);
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
    throw new Error(err.message);
  }
};

// Create Order
async function createOrder({ userId, items, total }) {
  const orderId = `${Date.now()}`;
  const order = {
    orderId,
    userId,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: ORDERS_TABLE,
    Item: order,
  };

  await dynamoDB.send(new PutCommand(params));
  console.log("Order Created:", order);
  return order;
}

// Get Order
async function getOrder(orderId) {
  const params = {
    TableName: ORDERS_TABLE,
    Key: { orderId },
  };

  const result = await dynamoDB.send(new GetCommand(params));
  console.log("Order Details:", result.Item);
  return result.Item;
}

// List Orders
async function listOrders(userId) {
  const params = {
    TableName: ORDERS_TABLE,
    IndexName: "UserIdIndex", // Ensure a GSI is created for userId
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  const result = await dynamoDB.send(new QueryCommand(params));
  console.log("Orders for User:", result.Items);
  return result.Items;
}

// Delete Order
async function deleteOrder(orderId) {
  const params = {
    TableName: ORDERS_TABLE,
    Key: { orderId },
  };

  await dynamoDB.send(new DeleteCommand(params));
  console.log(`Order ${orderId} deleted successfully`);
  return `Order ${orderId} deleted successfully`;
}

if (require.main === module) {
    const fs = require("fs");
    const path = require("path");
  
    // Load the test event
    const testEvent = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../tests/test-event.json"), "utf8")
    );
  
    // Call the handler with the test event
    exports.handler(testEvent)
      .then((response) => {
        console.log("Lambda Response:", JSON.stringify(response, null, 2));
      })
      .catch((err) => {
        console.error("Lambda Error:", err);
      });
  }