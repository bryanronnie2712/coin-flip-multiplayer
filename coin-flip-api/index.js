const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require('uuid'); // Install uuid package
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


let currentRooms = {};

const generateRandomRoomId = () => Math.floor(Math.random() * 10000);
const roomExists = (room_id) => !!currentRooms?.[room_id];
const roomFull = (room_id) => currentRooms?.[room_id]?.player_count >= currentRooms?.[room_id]?.max_capacity;
const playerExists = (room_id, player_name) => !!currentRooms?.[room_id]?.players?.[player_name];

const whichLowestPlayerNumberAvailable = (room_id) => {
    const room_details = currentRooms?.[room_id];
    const max_capacity = room_details?.max_capacity;
    const occupied_player_numbers = new Set(Object.values(room_details?.players || []).map(p => p?.player_number));

    const possible_slots = []
    for (let i = 0; i < max_capacity; i++) {
        if (!occupied_player_numbers.has(i)) {
            possible_slots.push(i)
        }
    }

    return Math.min(...possible_slots);
}

// const updateScore = (room_id, player_name, turn_score) => {
//   if (!roomExists(room_id)) {
//     console.warn(`Room(${room_id}) doesn't exist!`)
//   }
//   else if (!playerExists(room_id, player_name)) {
//     console.warn(`Player(${player_name}) doesn't exist!`)
//   }
//   else {
//     let temp_player_details = currentRooms[room_id].players[player_name];
//     temp_player_details["score_array"] = temp_player_details?.score_array?.push(turn_score);
//     temp_player_details["total"] = temp_player_details?.total + turn_score;
//
//     currentRooms[room_id].players[player_name] = temp_player_details;
//   }
// }


io.on("connection", (socket) => {
    // Join a room =======================================

    socket.on("create-room", (data) => {
        const room_id = data.room_id;
        const player_name = data.player_name;
        const max_capacity = data.max_capacity;

        if (!data.room_id || !data.player_name || typeof data.max_capacity !== "number") {
            socket.emit("error-creating-room", { msg: "Invalid data provided" });
            return;
        }
        else if (roomExists(room_id)) {
            socket.emit("error-creating-room", { msg: "Room exists with this id", room_data: currentRooms?.[room_id],});
            return;
        } else {
            socket.join(room_id);

            currentRooms[room_id] = {
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

            socket.emit("room-created", {room_data: currentRooms[room_id], msg: "created",});
            return;
        }
    })


    // Join a room =======================================
    socket.on("join-room", (data) => {
        const room_id = data.room_id;
        const player_name = data.player_name;

        console.log("roomFull(room_id)m", roomFull(room_id));

        if (!data.room_id || !data.player_name) {
            socket.emit("error-joining-room", { msg: "Invalid data provided" });
            return;
        }
        else if (!roomExists(room_id)) {
            socket.emit("error-joining-room", { msg: "No room with this id",});
            return;
        } else if (playerExists(room_id, player_name)) {
            socket.emit("error-joining-room", { msg: "Player exists with this id", room_data: currentRooms?.[room_id],});
            return;
        } else if (roomFull(room_id)) {
            socket.emit("error-joining-room", { msg: "Room Full", room_data: currentRooms?.[room_id],});
            return;
        } else {
            socket.join(room_id);

            let new_player_data = {
                player_number: whichLowestPlayerNumberAvailable(room_id),
                player_name: player_name,
                score_array: [],
                total: 0
            }

            currentRooms[room_id].player_count += 1;
            currentRooms[room_id].players[player_name] = new_player_data;

            socket.emit("room-joined", {room_data: currentRooms?.[room_id], msg: "joined",});
            socket.broadcast.emit("a-new-player-has-joined", {room_data: currentRooms?.[room_id], newPlayerName: player_name, msg: "A new player joined",});
            return;
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
    socket.on("roll-dice", (data) => {
        const room_id = data.room_id;
        const player_name = data.player_name;
        const rolled_number = Math.floor(Math.random() * 6) + 1;
        const score_array = currentRooms[room_id]?.players[player_name]?.score_array + [rolled_number];
        const total = currentRooms[room_id]?.players[player_name]?.total + rolled_number;

        currentRooms[room_id].players[player_name].score_array = score_array;
        currentRooms[room_id].players[player_name].total = total;

        socket.emit("dice-rolled", {
            room_data: currentRooms,
        });
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
