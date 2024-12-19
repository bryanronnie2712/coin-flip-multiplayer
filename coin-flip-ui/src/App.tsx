import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

enum skt {
  // REQ
  createRoom = "create-room",
  joinRoom = "join-room",

  // ACK
  roomCreated = "room-created",
  roomJoined = "room-joined",
  error = "error",
  errorCreatingRoom = "error-creating-room",
  errorJoiningRoom = "error-joining-room",
}


const App: React.FC = () => {
  const [roomInput, setInputRoom] = useState("");
  // const [currentRoom, setCurrentRoom] = useState("");
  // const [tossResult, setTossResult] = useState<string | null>(null);
  // const [error, setError] = useState("");

  // socket.on("toss-result", (result) => {
  //   setTossResult(result);
  // });
  
  const createRoom = () => {
    socket.emit(skt.createRoom, {room_id: roomInput, player_name: "Bryan", max_capacity: 4});
  };

  const joinRoom = () => {
    socket.emit(skt.joinRoom, {room_id: roomInput, player_name: "Alan"});
  };

  useEffect(() => {
    socket.on(skt.roomCreated, (data) => console.log(data));
    socket.on(skt.roomJoined, (data) => console.log(data));
    socket.on(skt.error, (errMsg) => console.log(errMsg));
    socket.on(skt.errorCreatingRoom, (errMsg) => console.log(errMsg));
    socket.on(skt.errorJoiningRoom, (errMsg) => console.log(errMsg));
    

    return () => {
      socket.off(skt.roomJoined);
      socket.off(skt.roomCreated);
      socket.off(skt.error);
      socket.off(skt.errorCreatingRoom);
      socket.off(skt.errorJoiningRoom);
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>

      <h1>Multiplayer Coin Toss Game</h1>

      <input
        type="text"
        value={roomInput}
        onChange={(e) => setInputRoom(e.target.value)}
        placeholder="Enter room name"
      />

      <button onClick={createRoom}>Create Room</button>
      <button onClick={joinRoom}>Join Room</button>


      {/* {error && <p style={{ color: "red" }}>{error}</p>} */}

      {/* {currentRoom && (
        <>
          <h2>Room: {currentRoom}</h2>
          <button onClick={tossCoin}>Toss Coin</button>
        </>
      )} */}

      {/* {tossResult && <h3>Result: {tossResult}</h3>} */}
    </div>
  );
};

export default App;







