const AWS = require("aws-sdk");

const appsync = new AWS.AppSync({ region: "us-east-1" });

const attachResolver = async (typeName, fieldName) => {
  const apiId = "d3py5q6qdfdrzkpapzh7kmq7rm";

  const params = {
    apiId,
    typeName,
    fieldName,
    dataSourceName: "ProductsLambdaDataSource",
    requestMappingTemplate: `
      {
        "version": "2018-05-29",
        "operation": "Invoke",
        "payload": $util.toJson($context.arguments)
      }
    `,
    responseMappingTemplate: "$util.toJson($context.result)"
  };

  try {
    const data = await appsync.createResolver(params).promise();
    console.log(`Resolver for ${fieldName} created:`, data);
  } catch (err) {
    console.error(`Error creating resolver for ${fieldName}:`, err.message);
  }
};

// Attach resolvers for each field
(async () => {
  await attachResolver("Query", "getProduct");
  await attachResolver("Query", "listProducts");
  await attachResolver("Mutation", "createProduct");
  await attachResolver("Mutation", "updateProduct");
  await attachResolver("Mutation", "deleteProduct");
})();