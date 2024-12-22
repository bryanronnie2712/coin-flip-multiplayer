import { createClient } from 'redis';
import { configDotenv } from "dotenv";

configDotenv();

export const client = createClient({
    username: process.env.REDIS_DB_USERNAME,
    password: process.env.REDIS_DB_PASSWORD,
    socket: {
        host: process.env.REDIS_DB_HOST,
        port: process.env.REDIS_DB_PORT,
    }
});

export const nestedStringify = (obj) => {
    const result = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = JSON.stringify(obj[key]);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

export const nestedParse = (obj) => {
    const result = {};
    for (const key in obj) {
        try {
            result[key] = JSON.parse(obj[key]);
        } catch (e) {
            result[key] = obj[key];
        }
    }
    return result;
}

client.on('error', err => console.log('Redis Client Error', err));
await client.connect();