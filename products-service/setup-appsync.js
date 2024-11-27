const AWS = require("aws-sdk");

const appsync = new AWS.AppSync({ region: "us-east-1" });

const createDataSource = async () => {
  const apiId = "d3py5q6qdfdrzkpapzh7kmq7rm"; // Replace with your AppSync API ID
  const lambdaArn = "arn:aws:lambda:us-east-1:888577019432:function:ProductsServiceLambda";

  const params = {
    apiId,
    name: "ProductsLambdaDataSource",
    type: "AWS_LAMBDA",
    lambdaConfig: {
      lambdaFunctionArn: lambdaArn
    },
    serviceRoleArn: "arn:aws:iam::888577019432:role/KicksExecutionRole" // AppSync Role
  };

  try {
    const data = await appsync.createDataSource(params).promise();
    console.log("Data Source Created:", data);
  } catch (err) {
    console.error("Error creating data source:", err.message);
  }
};

createDataSource();