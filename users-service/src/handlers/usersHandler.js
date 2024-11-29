const {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminGetUserCommand,
    AdminDeleteUserCommand,
  } = require("@aws-sdk/client-cognito-identity-provider");
  require("dotenv").config();
  
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });
  
  const USER_POOL_ID = process.env.USER_POOL_ID;
  
  exports.handler = async (event) => {
    console.log("Incoming Event:", JSON.stringify(event, null, 2));
  
    const { fieldName } = event.info;
    const args = event.arguments;
  
    try {
      switch (fieldName) {
        case "createUser":
          return await createUser(args);
        case "getUser":
          return await getUser(args.username);
        case "deleteUser":
          return await deleteUser(args.username);
        default:
          throw new Error(`Unknown field: ${fieldName}`);
      }
    } catch (err) {
      console.error("Error:", err);
      throw new Error(err.message);
    }
  };
  
  // Create a new user in Cognito
  async function createUser({ username, email, password }) {
    const command = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: [{ Name: "email", Value: email }],
      TemporaryPassword: password,
    });
  
    const result = await client.send(command);
    console.log("User Created:", result);
    return { username, email };
  }
  
  // Get user details
  async function getUser(username) {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });
  
    const result = await client.send(command);
    console.log("User Details:", result);
    return {
      username: result.Username,
      email: result.UserAttributes.find((attr) => attr.Name === "email").Value,
    };
  }
  
  // Delete a user
  async function deleteUser(username) {
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });
  
    await client.send(command);
    console.log(`User ${username} deleted successfully`);
    return `User ${username} deleted successfully`;
  }


  // For local testing
  
  // if (require.main === module) {
  //   const fs = require("fs");
  //   const path = require("path");
  
  //   // Load test event
  //   const testEvent = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../tests/test-event.json"), "utf8"));
  
  //   // Execute handler with test event
  //   exports.handler(testEvent)
  //     .then((response) => {
  //       console.log("Lambda Response:", JSON.stringify(response, null, 2));
  //     })
  //     .catch((err) => {
  //       console.error("Error:", err);
  //     });
  // }