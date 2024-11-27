const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "ProductsTable";

exports.handler = async (event) => {
  const { fieldName } = event.info;
  const args = event.arguments;

  try {
    switch (fieldName) {
      case "getProduct":
        return await getProduct(args.id);
      case "listProducts":
        return await listProducts();
      case "createProduct":
        return await createProduct(args);
      case "updateProduct":
        return await updateProduct(args);
      case "deleteProduct":
        return await deleteProduct(args.id);
      default:
        throw new Error("Unknown fieldName");
    }
  } catch (err) {
    return { error: err.message };
  }
};

async function getProduct(id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
}

async function listProducts() {
  const params = { TableName: TABLE_NAME };
  const result = await dynamoDB.scan(params).promise();
  return result.Items;
}

async function createProduct(args) {
  const newProduct = { id: `${Date.now()}`, ...args };
  const params = {
    TableName: TABLE_NAME,
    Item: newProduct
  };
  await dynamoDB.put(params).promise();
  return newProduct;
}

async function updateProduct(args) {
  const { id, ...updates } = args;
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `set ${Object.keys(updates).map(
      (key, i) => `#${key} = :value${i}`
    ).join(", ")}`,
    ExpressionAttributeNames: Object.keys(updates).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    ),
    ExpressionAttributeValues: Object.values(updates).reduce(
      (acc, value, i) => ({ ...acc, [`:value${i}`]: value }),
      {}
    ),
    ReturnValues: "ALL_NEW"
  };
  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
}

async function deleteProduct(id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  await dynamoDB.delete(params).promise();
  return `Product ${id} deleted successfully`;
}