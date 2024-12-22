import {client, nestedStringify, nestedParse} from './redis.js';

export const displayEntireDB = async () => {
    const keys = await client.keys('*');
    const allData = {};

    for (const key of keys) {
        const type = await client.type(key);
        if (type === 'hash') {
            allData[key] = await client.hGetAll(key);
        } else if (type === 'string') {
            allData[key] = await client.get(key);
        } else if (type === 'list') {
            allData[key] = await client.lRange(key, 0, -1);
        } else if (type === 'set') {
            allData[key] = await client.sMembers(key);
        } else if (type === 'zset') {
            allData[key] = await client.zRange(key, 0, -1);
        }
    }

    console.log(allData);
}

export const clearRedisDatabase = async () => {
    try {
        await client.flushDb();
        console.log('Redis database cleared.');
    } catch (err) {
        console.error('Error clearing Redis database:', err);
    }
}

export const writeRoomData = async (room_id, room_data) => {
    try {
        await client.hSet(`current_rooms:${room_id}`, nestedStringify(room_data));
    } catch (err) {
        console.error('Error clearing Redis database:', err);
    }
};

export const readRoomData = async (room_id) => {
    try {
        const room_data = await client.hGetAll(`current_rooms:${room_id}`);
        return nestedParse(room_data);
    } catch (err) {
        console.error('Error reading Redis database:', err);
    }
};

export const roomExists = async (room_id) => {
    const exists = await client.exists(`current_rooms:${room_id}`);
    return exists;
};

export const roomFull = async (room_id) => {
    const roomData = await client.hGetAll(`current_rooms:${room_id}`);
    return roomData && roomData.player_count >= roomData.max_capacity;
};

export const playerExists = async (room_id, player_name) => {
    const playerData = nestedParse(await client.hGetAll(`current_rooms:${room_id}`))?.players;
    return !!playerData?.[player_name];
};



// // SET and GET Example
// await client.set('simpleKey', 'This is a simple value');
// const simpleValue = await client.get('simpleKey');
// console.log('simpleKey:', simpleValue); // Output: "This is a simple value"
//
// // HSET and HGET Example
// await client.hSet('game:1001', 'score', '350');
// const gameScore = await client.hGet('game:1001', 'score');
// console.log('Game Score:', gameScore); // Output: "350"
//
// // HSET and HGETALL Example (Multiple Fields)
// await client.hSet('game:1001', {
//     player: 'Alice',
//     level: '5',
//     score: '350',
// });
// const gameData = await client.hGetAll('game:1001');
// console.log('Game Data:', gameData);
// /*
// Output:
// {
//   player: 'Alice',
//   level: '5',
//   score: '350'
// }
// */

export const clearRedisCache = async () => await client.flushDb()