const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB({ region: "us-east-1" }); // Change region as necessary

const params = {
  TableName: "ProductsTable",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" } // Partition Key
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" } // String type
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamoDB.createTable(params, (err, data) => {
  if (err) {
    console.error("Error creating table:", err.message);
  } else {
    console.log("DynamoDB Table created:", data.TableDescription.TableName);
  }
});