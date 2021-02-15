require('dotenv').config();

import {execGraphql} from "./stripe-graphql";

const DEFAULT_ORIGIN = 'https://www.foodforgood.org.hk';

exports.handler = async (event, context) => {
    let corsOrigin = DEFAULT_ORIGIN; // default value

    const inputOrigin = event.headers.origin;
    const method = event.httpMethod;

    const pattern = new RegExp(process.env.CORS_ORIGIN, 'igm');
    if (pattern.test(inputOrigin)) {
        corsOrigin = inputOrigin;
    }

    let params = event.body;

    const headers = {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": "POST,OPTIONS"
    };

    if (method != "POST" || !params) {
        return {
            statusCode: 200,
            headers: headers
        };
    }

    try {
        const query = JSON.parse(event.body).query;
        if (query) {
            params = query;
        }
    }
    catch (ignored) {
    }

    const reply = await execGraphql(params);

    // @ts-ignore
    const status = reply.error ? 500 : 200;
    const response = {
        statusCode: status,
        headers: headers,
        body: JSON.stringify(reply),
    };

    return response;
};
