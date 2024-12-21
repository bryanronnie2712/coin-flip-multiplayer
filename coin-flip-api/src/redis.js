import { createClient } from 'redis';
import {configDotenv} from "dotenv";

configDotenv();

const client = createClient({
    username: process.env.REDIS_DB_USERNAME,
    password: process.env.REDIS_DB_PASSWORD,
    socket: {
        host: process.env.REDIS_DB_HOST,
        port: process.env.REDIS_DB_PORT,
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');

console.log(result)  // >>> bar