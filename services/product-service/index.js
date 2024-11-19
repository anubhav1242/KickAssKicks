const AWS = require('aws-sdk');
const { v4:uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const { name, brand, description, variants, images, category } = body;

    const params = {
        TableName: process.env.DYNAMODB_TABLE || 'Products',
        Item: {
            productId: uuidv4(),
            name,
            brand,
            description,
            variants, // Array of { size, color, price, inventoryCount }
            images, // Array of image URLs
            category,
            createdAt: new Date().toISOString(),
        },
    };

    try{
        await dynamo.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Product created successfully', productId: params.Item.productId }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not create product' }),
        };
    }
};