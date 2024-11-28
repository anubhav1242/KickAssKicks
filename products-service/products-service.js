const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "ProductsTable";

exports.handler = async (event) => {
  console.log("Incoming Event:", JSON.stringify(event, null, 2));
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
        console.error(`Unknown fieldName: ${fieldName}`);
        throw new Error(`Unknown fieldName: ${fieldName}`);
    }
  } catch (err) {
    console.error("Error:", err);
    return { error: err.message };
  }
};

async function getProduct(id) {
  console.log(`Fetching product with ID: ${id}`);
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    console.log(`Product fetched successfully:`, result.Item);
    return result.Item;
  } catch (err) {
    console.error(`Error fetching product with ID ${id}:`, err);
    throw new Error("Failed to fetch product");
  }
}

async function listProducts() {
  console.log("Listing all products...");
  const params = { TableName: TABLE_NAME };

  try {
    const result = await dynamoDB.scan(params).promise();
    console.log(`Products listed successfully:`, result.Items);
    return result.Items;
  } catch (err) {
    console.error("Error listing products:", err);
    throw new Error("Failed to list products");
  }
}

async function createProduct(args) {
  if (!args.name || !args.price || args.stock === undefined) {
    throw new Error("Missing required fields: name, price, or stock");
  }

  const newProduct = {
    id: `${Date.now()}`, // Generate a unique ID
    name: args.name,
    description: args.description,
    price: args.price,
    stock: args.stock,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: newProduct,
  };

  try {
    await dynamoDB.put(params).promise();
    console.log("Product created successfully:", JSON.stringify(newProduct));
    return newProduct; // Return the full product object
  } catch (err) {
    console.error("Error creating product:", err);
    throw new Error("Failed to create product");
  }
}

async function updateProduct(args) {
  const { id, ...updates } = args;

  if (!id) {
    throw new Error("Product ID is required for update");
  }

  const updateExpression = `set ${Object.keys(updates)
    .map((key, i) => `#${key} = :value${i}`)
    .join(", ")}`;

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: Object.keys(updates).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    ),
    ExpressionAttributeValues: Object.keys(updates).reduce(
      (acc, key, i) => ({ ...acc, [`:value${i}`]: updates[key] }),
      {}
    ),
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDB.update(params).promise();
    console.log(`Product updated successfully:`, result.Attributes);
    return result.Attributes;
  } catch (err) {
    console.error("Error updating product:", err);
    throw new Error("Failed to update product");
  }
}

async function deleteProduct(id) {
  console.log(`Deleting product with ID: ${id}`);
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  try {
    await dynamoDB.delete(params).promise();
    console.log(`Product deleted successfully: ${id}`);
    return `Product ${id} deleted successfully`;
  } catch (err) {
    console.error(`Error deleting product with ID ${id}:`, err);
    throw new Error("Failed to delete product");
  }
}