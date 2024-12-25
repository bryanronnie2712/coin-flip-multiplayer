import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import styled from "styled-components";
const { VITE_ENV, VITE_PRODUCTION_URL, VITE_DEVELOPMENT_URL } = import.meta.env

console.log(VITE_ENV, VITE_PRODUCTION_URL, VITE_DEVELOPMENT_URL)

const API_URL = VITE_ENV === "PROD" ? VITE_PRODUCTION_URL : VITE_DEVELOPMENT_URL;
const socket = io(API_URL);

enum skt {
    // REQ
    createRoom = "create-room",
    joinRoom = "join-room",
    rollDice = "roll-dice",
    connnectionStatus = "connection-status",

    // ACK
    roomCreated = "room-created",
    roomJoined = "room-joined",
    error = "error",
    errorCreatingRoom = "error-creating-room",
    errorRollingDice = "error-rolling-dice",
    errorJoiningRoom = "error-joining-room",
    diceRolled = "dice-rolled",
    aNewPlayerHasJoined = "a-new-player-has-joined",
    // connectionStatusRepl = "connection-status-reply",
    playerDisconnected = "playerDisconnected"
}


const App: React.FC = () => {
    const [roomInput, setInputRoom] = useState({ roomId: "", playerName: "" });
    // const [output, setOutput] = useState(null);
    const [playerData, setPlayerData] = useState<any[]>();
    const [roomData, setRoomData] = useState<any>();
    const [connectionStatus, setConnectionStatus] = useState<any>();

    const createRoom = () => {
        socket.emit(skt.createRoom, { room_id: roomInput.roomId, player_name: roomInput.playerName, max_capacity: 4 });
    };

    const joinRoom = () => {
        socket.emit(skt.joinRoom, { room_id: roomInput.roomId, player_name: roomInput.playerName });
    };

    const rollDice = () => {
        socket.emit(skt.rollDice, { room_id: roomInput.roomId, player_name: roomInput.playerName });
    }


    useEffect(() => {
        socket.on(skt.roomCreated, (data) => {
            setRoomData(data?.room_data);
            setPlayerData(Object.values(data?.room_data?.players).map((player) => player).sort((a: any, b: any) => a.player_number - b.player_number));
            setConnectionStatus(data?.connection_status);
            console.log(skt.roomCreated, data)
        });
        socket.on(skt.roomJoined, (data) => {
            setRoomData(data?.room_data);
            setConnectionStatus(data?.connection_status);
            setPlayerData(Object.values(data?.room_data?.players).map((player) => player).sort((a: any, b: any) => a.player_number - b.player_number));
            console.log(skt.roomJoined, data)
        });
        socket.on(skt.aNewPlayerHasJoined, (data) => {
            setRoomData(data?.room_data);
            setPlayerData(Object.values(data?.room_data?.players).map((player) => player).sort((a: any, b: any) => a.player_number - b.player_number));
            setConnectionStatus(data?.connection_status);
            console.log(skt.aNewPlayerHasJoined, data)
        });
        socket.on(skt.error, (errMsg) => console.log(errMsg));
        socket.on(skt.errorCreatingRoom, (errMsg) => console.log(errMsg));
        socket.on(skt.errorJoiningRoom, (errMsg) => console.log(errMsg));
        socket.on(skt.diceRolled, (data) => {
            setRoomData(data?.room_data);
            setPlayerData(Object.values(data?.room_data?.players).map((player) => player).sort((a: any, b: any) => a.player_number - b.player_number));
            console.log(skt.diceRolled, data)
        });
        socket.on(skt.errorRollingDice, (errMsg) => console.log(errMsg));

        socket.on("playerDisconnected", (data) => {
            console.log("playerDisconnected", { ...connectionStatus, ...data });
            setConnectionStatus({ ...data });
        });

        return () => {
            socket.off(skt.roomJoined);
            socket.off(skt.roomCreated);
            socket.off(skt.error);
            socket.off(skt.errorCreatingRoom);
            socket.off(skt.errorJoiningRoom);
            socket.off(skt.diceRolled);
            socket.off(skt.aNewPlayerHasJoined);
            socket.off(skt.errorRollingDice);
            socket.off(skt.playerDisconnected);
        };
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>

            <h1>Multiplayer Coin Toss Game</h1>

            <div style={{ display: "flex", alignItems: "center",justifyContent:"space-between", marginBottom: 20 }}>
                <input
                    type="text"
                    value={roomInput.roomId}
                    onChange={(e) => setInputRoom({ ...roomInput, roomId: e.target.value })}
                    placeholder="Enter room name"
                />

                <input
                    type="text"
                    value={roomInput.playerName}
                    onChange={(e) => setInputRoom({ ...roomInput, playerName: e.target.value })}
                    placeholder="Enter player name"
                />

                <button onClick={createRoom}>Create Room</button>
                <button onClick={joinRoom}>Join Room</button>
                {<button onClick={rollDice}>Roll Dice</button>}
            </div>

            <TableStyle className="table1">
                <thead>
                    <tr>
                        <th>Room ID</th>
                        <th>Player Name</th>
                        <th>Max Capacity</th>
                        <th>Player Number</th>
                        <th>Score Array</th>
                        <th>Total</th>
                        <th>Connection Status</th>
                    </tr>
                </thead>
                <tbody>
                    {playerData?.map((player, index) => (
                        <tr key={index}>
                            <td>{roomData?.room_id}</td>
                            <td>{player?.player_name}</td>
                            <td>{roomData?.max_capacity}</td>
                            <td>{player?.player_number}</td>
                            <td>{player?.score_array}</td>
                            <td>{player?.total}</td>
                            <td> <div style={{ display: 'flex', alignItems: "center", paddingLeft: 10 }}><ConnectionStatus $status={connectionStatus?.[player?.player_name]?.status} />{String(connectionStatus?.[player?.player_name]?.status)?.[0].toUpperCase() + String(connectionStatus?.[player?.player_name]?.status).substring(1)}</div></td>
                        </tr>
                    ))}
                </tbody>
            </TableStyle>

        </div>
    );
};

const ConnectionStatus = styled.div<{ $status: string }>`
    width: 15px;
    height: 15px;
    filter: drop-shadow(1px 0px 1px white);
    border-radius: 50%;
    margin-right: 10px;
    background-color: ${({ $status }) => $status === "connected" ? "green" : "red"};
`;

const TableStyle = styled.table`
    border: 1px solid #fdfffd;
    border-collapse: collapse;
    padding: 10px;
    margin: 30px 0;

    th, td {
        border: 1px solid #fdfffd;
        padding: 10px;
    }
`

export default App;