const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "https://x6yjll-3000.csb.app",
        origin: "*",
        methods: ["GET", "POST"],
    },
});

interface RoomData {
    room_id: number;
    pop_count: number;
    player_number: number;
    // player_id: string;
    name: string;
    pop_cap?: number;
    [key:string] : any;
}

let currentRooms: {[room_id: number] : RoomData} = {};

const isRoomEmpty = (room_id:number) => {
    return currentRooms[room_id].pop_count === 0; 
}

const isRoomFull = (room_id:number) => {
    return currentRooms[room_id].pop_count === currentRooms[room_id].pop_cap; 
}

io.on("connection", (socket: any) => {
    // Create a new room ==================================================
    socket.on("createRoom", (data: any) => {
        const randomRoomId:number = Math.floor(Math.random() * 10000);
        
        currentRooms[randomRoomId] = {
            room_id: randomRoomId,
            pop_count: currentRooms[randomRoomId].pop_count + 1,
            player_number: 1,
            ...data
        };

        console.log("currentRooms ==>", currentRooms, data);

        // Creating and Joining this room
        socket.join(randomRoomId);

        // Reply to joiner
        socket.emit("createRoomStatus", currentRooms[randomRoomId]);
    });
    // ====================================================================
    
    
    // socket.on("joinRoom", (data) => {console.log("connStatus", data);}, 5000);

    // Joining a room
    // socket.on("joinRoom", (data) => {
    //     // data = {roomId: String, playerName: String, playerId: String}
    //     console.log("joinRoom", data);
    //     const roomIdAvailable = Object.keys(currentRooms).includes(data.roomId);
    //     const roomSize = currentRooms[data.roomId]?.players?.length;
    //     const roomNotFull = roomSize < 4;
    //
    //     const playerIdExists = currentRooms[data.roomId]?.players
    //         .map((player) => {
    //             return player.playerId;
    //         })
    //         .indexOf(data.playerName);
    //     console.log("playerIdExists", playerIdExists);
    //     if (roomIdAvailable) {
    //         if (roomNotFull) {
    //             console.log("player already in room");
    //             if (playerIdExists >= 0) {
    //                 // Joining this room
    //                 socket.join(data.roomId);
    //                 // Reply to joiner
    //                 socket.emit("rejoinRoomStatus", {
    //                     updPlayerDetails: currentRooms[data.roomId].players,
    //                     playerNumber: currentRooms[data.roomId].players.playerNumber,
    //                     roomId: data.roomId,
    //                     msg: "rejoined",
    //                 });
    //             } else {
    //                 // Update player details
    //                 currentRooms[data.roomId].players.push({
    //                     playerNumber: roomSize,
    //                     playerId: data.playerId,
    //                     name: data.playerName,
    //                     pos: 0,
    //                     money: 1500,
    //                     assets: [],
    //                 });
    //                 // Joining this room
    //                 socket.join(data.roomId);
    //                 // Reply to joiner
    //                 socket.emit("joinRoomStatus", {
    //                     updPlayerDetails: currentRooms[data.roomId].players,
    //                     playerNumber: roomSize,
    //                     roomId: data.roomId,
    //                     msg: "joined",
    //                 });
    //                 // Broadcast to roomId
    //                 socket.broadcast.emit("aNewPlayerHasJoined", {
    //                     updPlayerDetails: currentRooms[data.roomId].players,
    //                     newPlayerName: data.playerName,
    //                     msg: "joined",
    //                 });
    //             }
    //         } else {
    //             // Room is full
    //             // Disconnect from socket
    //             socket.disconnect(true);
    //             // Reply to joiner
    //             socket.emit("joinRoomStatus", {
    //                 msg: "full",
    //             });
    //         }
    //         console.log(
    //             "Players ==> ",
    //             currentRooms[data.roomId]?.players.map((player) => player.playerId)
    //         );
    //     } else {
    //         console.log("Room Id does not exist");
    //     }
    // });

    //   // sending to sender-client only
    // socket.emit('message', "this is a test");

    // // sending to all clients, include sender
    // io.emit('message', "this is a test");

    // // sending to all clients except sender
    // socket.broadcast.emit('message', "this is a test");

    // // sending to all clients in 'game' room(channel) except sender
    // socket.broadcast.to('game').emit('message', 'nice game');

    // // sending to all clients in 'game' room(channel), include sender
    // io.in('game').emit('message', 'cool game');

    // // sending to sender client, only if they are in 'game' room(channel)
    // socket.to('game').emit('message', 'enjoy the game');

    // // sending to all clients in namespace 'myNamespace', include sender
    // io.of('myNamespace').emit('message', 'gg');

    // // sending to individual socketid
    // socket.broadcast.to(socketid).emit('message', 'for your eyes only');

    // // list socketid
    // for (var socketid in io.sockets.sockets) {}
    //  OR
    // Object.keys(io.sockets.sockets).forEach((socketid) => {});

    // Next turn
    // socket.on("nextTurn", (data) => {
    //     const roomSize = currentRooms[data.roomId]?.players?.length;
    //     console.log("data.roomId", data.roomId);
    //     // get current Turn from frontend, add by 1
    //     // currentRooms[data.roomId]["currentTurn"] = (data.currentTurn + 1) % roomSize;
    //
    //     // io.in(data.roomId).emit('nextTurnReply', {
    //     //   updPlayerDetails: currentRooms[data.roomId]?.players,
    //     //   currentTurn : (data.currentTurn + 1) % roomSize
    //     // });
    //
    //     console.log("nextTurn- data-->", data);
    //
    //     // Broadcast to everyone in the room, including the sender
    //
    //     // io.in(data.roomid).emit('nextTurnReply', {
    //     //   updPlayerDetails: currentRooms[data.roomId]?.players,
    //     //   currentTurn : (data.currentTurn + 1) % roomSize
    //     // });
    //
    //     socket.emit("nextTurnReply", {
    //         updPlayerDetails: currentRooms[data.roomId]?.players,
    //         currentTurn: (data.currentTurn + 1) % roomSize,
    //     });
    //
    //     socket.broadcast.emit("nextTurnReply", {
    //         updPlayerDetails: currentRooms[data.roomId]?.players,
    //         currentTurn: (data.currentTurn + 1) % roomSize,
    //     });
    //
    //     // socket.broadcast("nextTurnReply", {
    //     //   updPlayerDetails: currentRooms[data.roomId]?.players,
    //     //   currentTurn : (data.currentTurn + 1) % roomSize
    //     // });
    // });
});

// Update player position on dice rolling

// Update player details on actions{buy, sell, }

server.listen(4000, () => {
    console.log("Server is running on port 4000");
});
