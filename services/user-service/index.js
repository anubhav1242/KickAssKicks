const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const { username, email, password } = body;

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
        TableName: process.env.DYNAMODB_TABLE || 'Users',
        Item: {
            userId: uuidv4(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        },
    };

    try {
        await dynamo.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({ message:'User created successfully', userId: params.Item.userId }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Could not create user' }),
        };
    }
};