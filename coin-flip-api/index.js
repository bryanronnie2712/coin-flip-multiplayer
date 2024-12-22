import * as Redis from "./src/redis/redis-actions.js"
import express from "express";
import * as http from "node:http";
import { Server } from "socket.io";
const app = express();
import cors from "cors";
import { v4 } from "uuid";
const generateUniqueRoomId = () => uuidv4();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "https://x6yjll-3000.csb.app",
        origin: "*",
        methods: ["GET", "POST"],
    },
});


await Redis.displayEntireDB();
await Redis.clearRedisDatabase();

export const roomFull = (room_data) => room_data?.player_count >= room_data?.max_capacity;
export const playerExists = (player_data, player_name) => !!player_data?.[player_name];
export const roomExists = (room_data) => !!(room_data?.room_id);


const whichLowestPlayerNumberAvailable = (room_data) => {
    const players = room_data.players;
    const playerNumbers = new Set(Object.values(players).map(player => player.player_number) || []);

    for (let i = 0; i < room_data.max_capacity; i++) {
        if (!playerNumbers.has(i)) {
            return i;
        }
    }
    // If all player numbers are taken, return -1 or handle the error as needed
    return -1;
}

io.on("connection", (socket) => {
    // Join a room =======================================

    socket.on("create-room", async (data) => {
        const room_id = data.room_id;
        const player_name = data.player_name;
        const max_capacity = data.max_capacity;

        if (!data.room_id || !data.player_name || !data.max_capacity) {
            socket.emit("error-creating-room", { msg: "Invalid data provided" });
        }
        else {
            const room_data = await Redis.readRoomData(room_id);
            if (roomExists(room_data)) {
                socket.emit("error-creating-room", { msg: "Room exists with this id" });
            }
            else {
                socket.join(room_id);

                const temp_room_data = {
                    room_id: room_id,
                    player_count: 1,
                    max_capacity: max_capacity,
                    players: {
                        [player_name]: {
                            player_number: 0,
                            player_name: player_name,
                            score_array: [],
                            total: 0
                        }
                    }
                }

                await Redis.writeRoomData(room_id, temp_room_data).then(() => {
                    socket.emit("room-created", { room_data: temp_room_data, msg: "created", });
                });
            }
        }
    })


    // Join a room =======================================
    socket.on("join-room", async (data) => {
        const room_id = data.room_id;
        const player_name = data.player_name;

        if (!data.room_id || !data.player_name) {
            socket.emit("error-joining-room", { msg: "Invalid data provided" });
        }
        else {
            const room_data = await Redis.readRoomData(room_id);
            const player_data = room_data.players;
            if (!roomExists(room_data)) {
                socket.emit("error-joining-room", { msg: "No room with this id" });
            }
            //  This is flawed logic, add rejoin at some point
            else if (playerExists(player_data, player_name)) {
                socket.emit("error-joining-room", { msg: "Player exists with this id" });
            }
            else if (roomFull(room_data)) {
                socket.emit("error-joining-room", { msg: "Room Full" });
            }
            else {
                socket.join(room_id);

                let new_player_data = {
                    player_number: whichLowestPlayerNumberAvailable(room_data),
                    player_name: player_name,
                    score_array: [],
                    total: 0
                }

                try {
                    room_data.player_count += 1;
                    room_data.players[player_name] = new_player_data;

                    await Redis.writeRoomData(room_id, room_data);

                    socket.emit("room-joined", { room_data: room_data, msg: "joined" });
                    socket.broadcast.emit("a-new-player-has-joined", { room_data: room_data, newPlayerName: player_name, msg: "A new player joined" });
                }
                catch (err) {
                    console.error('Error joining room:', err);
                    socket.emit("error-joining-room", { msg: "Error joining room" });
                }
            }
        }
    })

    // Live connection status =============================
    // socket.on("connection-status", (data) => {
    //       try{
    //           socket.emit("connection-status-reply", {connection_status: "connected"})
    //       }
    //       catch(e){
    //           console.log("e", e);
    //       }
    //   },
    //   5000
    // );

    // Roll Dice =======================================
    socket.on("roll-dice", async (data) => {
        const room_id = data?.room_id;
        const player_name = data?.player_name;

        if (!room_id || !player_name) {
            socket.emit("error-joining-room", { msg: "Invalid data provided" });
        }
        else {
            const room_data = await Redis.readRoomData(room_id);
            const rolled_number = Math.floor(Math.random() * 6) + 1;
            const player_data = room_data.players;

            if (!roomExists(room_data)) {
                socket.emit("error-rolling-dice", { msg: "No room with this id" });
            }
            else if (!playerExists(player_data, player_name)) {
                socket.emit("error-rolling-dice", { msg: "No Player exists with this id" });
            }
            else {
                try {
                    player_data[player_name].score_array.push(rolled_number);
                    player_data[player_name].total += rolled_number;

                    room_data.players = player_data;
                    await Redis.writeRoomData(room_id, room_data);

                    console.log("rollroom_data", room_data);

                    socket.emit("dice-rolled", {
                        room_data: room_data,
                    });
                }
                catch (err) {
                    console.error('Error rolling dice:', err);
                    socket.emit("error-rolling-dice", { msg: "Error rolling dice" });
                }
            }
        }













    })

    // // Handle Disconnection =============================
    // socket.on("disconnect", (data) => {
    //     const room_id = [...socket.rooms][1]; // Get the room ID the player joined
    //     if (room_id && currentRooms[room_id]) {
    //         const player_name = Object.keys(currentRooms[room_id].players).find(
    //             (p) => currentRooms[room_id].players[p].socket_id === socket.id
    //         );
    //         if (player_name) {
    //             delete currentRooms[room_id].players[player_name];
    //             currentRooms[room_id].player_count -= 1;
    //
    //             if (currentRooms[room_id].player_count === 0) {
    //                 delete currentRooms[room_id]; // Delete the room if empty
    //             }
    //         }
    //     }
    // });


















    // socket.on("joinRoom", (data) => {
    //   // data = {room_id: String, playerName: String, playerId: String}
    //   console.log("joinRoom", data);
    //   const roomIdAvailable = Object.keys(currentRooms).includes(data.room_id);
    //   const roomSize = currentRooms[data.room_id]?.players?.length;
    //   const roomNotFull = roomSize < 4;
    //
    //   const playerIdExists = currentRooms[data.room_id]?.players
    //     .map((player) => {
    //       return player.playerId;
    //     })
    //     .indexOf(data.playerName);
    //   console.log("playerIdExists", playerIdExists);
    //   if (roomIdAvailable) {
    //     if (roomNotFull) {
    //       console.log("player already in room");
    //       if (playerIdExists >= 0) {
    //         // Joining this room
    //         socket.join(data.room_id);
    //         // Reply to joiner
    //         socket.emit("rejoinRoomStatus", {
    //           updPlayerDetails: currentRooms[data.room_id].players,
    //           playerNumber: currentRooms[data.room_id].players.playerNumber,
    //           room_id: data.room_id,
    //           msg: "rejoined",
    //         });
    //       } else {
    //         // Update player details
    //         currentRooms[data.room_id].players.push({
    //           playerNumber: roomSize,
    //           playerId: data.playerId,
    //           name: data.playerName,
    //           pos: 0,
    //           money: 1500,
    //           assets: [],
    //         });
    //         // Joining this room
    //         socket.join(data.room_id);
    //         // Reply to joiner
    //         socket.emit("joinRoomStatus", {
    //           updPlayerDetails: currentRooms[data.room_id].players,
    //           playerNumber: roomSize,
    //           room_id: data.room_id,
    //           msg: "joined",
    //         });
    //         // Broadcast to room_id
    //         socket.broadcast.emit("aNewPlayerHasJoined", {
    //           updPlayerDetails: currentRooms[data.room_id].players,
    //           newPlayerName: data.playerName,
    //           msg: "joined",
    //         });
    //       }
    //     } else {
    //       // Room is full
    //       // Disconnect from socket
    //       socket.disconnect(true);
    //       // Reply to joiner
    //       socket.emit("joinRoomStatus", {
    //         msg: "full",
    //       });
    //     }
    //     console.log(
    //       "Players ==> ",
    //       currentRooms[data.room_id]?.players.map((player) => player.playerId)
    //     );
    //   } else {
    //     console.log("Room Id does not exist");
    //   }
    // });
    //
    //   // sending to sender-client only
    // socket.emit('message', "this is a test");
    //
    // // sending to all clients, include sender
    // io.emit('message', "this is a test");
    //
    // // sending to all clients except sender
    // socket.broadcast.emit('message', "this is a test");
    //
    // // sending to all clients in 'game' room(channel) except sender
    // socket.broadcast.to('game').emit('message', 'nice game');
    //
    // // sending to all clients in 'game' room(channel), include sender
    // io.in('game').emit('message', 'cool game');
    //
    // // sending to sender client, only if they are in 'game' room(channel)
    // socket.to('game').emit('message', 'enjoy the game');
    //
    // // sending to all clients in namespace 'myNamespace', include sender
    // io.of('myNamespace').emit('message', 'gg');
    //
    // // sending to individual socketid
    // socket.broadcast.to(socketid).emit('message', 'for your eyes only');
    //
    // // list socketid
    // for (var socketid in io.sockets.sockets) {}
    //  OR
    // Object.keys(io.sockets.sockets).forEach((socketid) => {});
    //
    // Next turn
    // socket.on("nextTurn", (data) => {
    //   const roomSize = currentRooms[data.room_id]?.players?.length;
    //   console.log("data.room_id", data.room_id);
    //   // get current Turn from frontend, add by 1
    //   // currentRooms[data.room_id]["currentTurn"] = (data.currentTurn + 1) % roomSize;
    //
    //   // io.in(data.room_id).emit('nextTurnReply', {
    //   //   updPlayerDetails: currentRooms[data.room_id]?.players,
    //   //   currentTurn : (data.currentTurn + 1) % roomSize
    //   // });
    //
    //   console.log("nextTurn- data-->", data);
    //
    //   // Broadcast to everyone in the room, including the sender
    //
    //   // io.in(data.roomid).emit('nextTurnReply', {
    //   //   updPlayerDetails: currentRooms[data.room_id]?.players,
    //   //   currentTurn : (data.currentTurn + 1) % roomSize
    //   // });
    //
    //   socket.emit("nextTurnReply", {
    //     updPlayerDetails: currentRooms[data.room_id]?.players,
    //     currentTurn: (data.currentTurn + 1) % roomSize,
    //   });
    //
    //   socket.broadcast.emit("nextTurnReply", {
    //     updPlayerDetails: currentRooms[data.room_id]?.players,
    //     currentTurn: (data.currentTurn + 1) % roomSize,
    //   });
    //
    //   // socket.broadcast("nextTurnReply", {
    //   //   updPlayerDetails: currentRooms[data.room_id]?.players,
    //   //   currentTurn : (data.currentTurn + 1) % roomSize
    //   // });
    // });
});

// Update player position on dice rolling

// Update player details on actions{buy, sell, }

server.listen(4000, () => {
    console.log("Server is running on port 4000");
});
