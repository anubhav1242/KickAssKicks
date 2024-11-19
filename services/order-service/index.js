const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB Document Client
const dynamo = new AWS.DynamoDB.DocumentClient();

// Initialize SNS
const sns = new AWS.SNS();

exports.handler = async (event) => {
    // Parse the incoming event body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error('Invalid JSON:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' }),
        };
    }

    const { userId, products, totalAmount } = body;

    // Basic validation
    if (!userId || !products || !Array.isArray(products) || products.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing or invalid order details' }),
        };
    }

    // Create a new order item
    const orderId = uuidv4();
    const createdAt = new Date().toISOString();
    const orderItem = {
        orderId,
        userId,
        products, // Array of { productId, variantId, quantity, price }
        totalAmount,
        status: 'PLACED',
        createdAt,
    };

    // Parameters for DynamoDB put operation
    const params = {
        TableName: process.env.DYNAMODB_TABLE || 'Orders',
        Item: orderItem,
    };

    try {
        // Save the order to DynamoDB
        await dynamo.put(params).promise();
        console.log('Order saved:', orderItem);

        // Publish an order event to SNS for further processing
        const snsParams = {
            Message: JSON.stringify(orderItem),
            TopicArn: process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:888577019432:OrderEvents', // Ensure this environment variable is set
        };

        await sns.publish(snsParams).promise();
        console.log('Order event published to SNS');

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Order placed successfully', orderId }),
        };
    } catch (error) {
        console.error('Error placing order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not place order' }),
        };
    }
};
