import * as Socket from "./socket-io.ts";
export {Socket};



    //
    //
    // const [tokenPos, setTokenPos] = useState([
    //     { id: 0, xPos: 0, yPos: 0 }, // player 1
    //     { id: 1, xPos: 0, yPos: 0 }, // player 2
    //     { id: 2, xPos: 0, yPos: 0 }, // player 3
    //     { id: 3, xPos: 0, yPos: 0 }, // player 4
    // ]);
    //
    // const [playerDetails, setPlayerDetails] = useState([]);
    //
    // const [playerMe, setPlayerMe] = useState({
    //     playerName: "",
    //     id: Math.floor(Math.random() * 10000),
    //     room: "",
    // });
    //
    // const [currentTurn, setCurrentTurn] = useState(0);
    // const [trailCurrentTile, setTrailCurrentTile] = useState(0);
    // const [optionDetails, setOptionDetails] = useState({
    //     buy: false,
    //     sell: true,
    //     endTurn: false,
    // });
    // const [currentTile, setCurrentTile] = useState();
    //
    // const [display, setDisplay] = useState({
    //     playerForm: true,
    // });
    //
    // const [formTab, setFormTab] = useState("create");
    //
    // console.log("playerMe ==> ", playerMe);
    //
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         console.log("Logs every minute");
    //     }, 5000);
    //
    //     return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    // }, []);
    //
    // useEffect(() => {
    //     setCurrentTile(
    //         <div className="current-tile">
    //             <span>TrailCurrentTile - {trailCurrentTile}</span>
    //             <div
    //     style={{
    //         transform: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(
    //             trailCurrentTile
    //         )
    //             ? ""
    //             : [11, 12, 13, 14, 15, 16, 17, 18, 19].includes(trailCurrentTile)
    //                 ? "rotate(-90deg)"
    //                 : [20, 21, 22, 23, 24, 25, 26, 27, 28, 29].includes(
    //                     trailCurrentTile
    //                 )
    //                     ? "rotate(180deg)"
    //                     : "rotate(90deg)",
    //             width: "200px",
    //     }}
    // >
    //     <img
    //         src={
    //         assetsList[trailCurrentTile]
    //             ? assetsList[trailCurrentTile].src
    //             : ""
    //     }
    //     width="100%"
    //     height="100%"
    //     alt={assetsList[trailCurrentTile]}
    //     />
    //     </div>
    //     </div>
    // );
    // }, [trailCurrentTile, currentTurn]);
    //
    // const handleTokenPos = async (playerNumber, diceVal) => {
    //     const limits = { top: -480, bottom: 350, right: 10, left: -820 };
    //
    //     // this wierd-looking function is to move the player token step-by-step to the destination
    //     for (
    //         let i = playerDetails[playerNumber].pos + 1;
    //         i <= playerDetails[playerNumber].pos + diceVal;
    //         i++
    //     ) {
    //         await new Promise((resolve) => {
    //             setTimeout(() => {
    //                 let playerTokenPosition = tokenPos[playerNumber];
    //
    //                 let tempTokenPos = [...tokenPos];
    //                 tempTokenPos[playerNumber] = playerTokenPosition;
    //                 setTokenPos(tempTokenPos);
    //
    //                 setTrailCurrentTile(i % 40);
    //
    //                 resolve();
    //             }, 300);
    //         });
    //     }
    //
    //     // Update the current player's new position
    //     let temp = playerDetails;
    //     temp[playerNumber].pos = (temp[playerNumber].pos + diceVal) % 40;
    //     setPlayerDetails(temp);
    //
    //     // Display options like buy, upgrade properties, bla bla
    //     displayOptions(playerNumber);
    //
    //     // switch to next player, if the current player clicks 'End turn'
    //     if (optionDetails.endTurn) {
    //         nextPlayerTurn();
    //     }
    // };
    //
    // const displayOptions = (playerNumber) => {
    //     if (
    //         assetsList[playerDetails[playerNumber].pos].type == "asset" &&
    //         !assetsList[playerDetails[playerNumber].pos].ownedBy
    //     )
    //         setOptionDetails({ ...optionDetails, buy: true });
    // };
    //
    // const rollDice = (playerNumber) => {
    //     const diceVal = Math.floor(Math.random() * 12) + 1;
    //     handleTokenPos(playerNumber, diceVal);
    //
    //     // socket.emit("diceRollNumber", {
    //     //   diceVal: diceVal,
    //     //   playerNumber: playerNumber,
    //     // });
    // };
    //
    // const nextPlayerTurn = () => {
    //     // setCurrentTurn((currentTurn + 1) % playerDetails.length);
    //     console.log("nextPlayerTurn--->", {
    //         currentTurn: currentTurn,
    //         roomId: playerMe.room,
    //     });
    //     socket.emit("nextTurn", {
    //         currentTurn: currentTurn,
    //         roomId: playerMe.room,
    //     });
    // };
    //
    // console.log("playerDetails --> ", playerDetails);
    //
    // const buyAsset = (playerNumber) => {
    //     assetsList[playerDetails[playerNumber].pos].ownedBy = playerNumber;
    //
    //     const tempPlayerDetails = [...playerDetails];
    //     tempPlayerDetails[playerNumber].money -=
    //         assetsList[playerDetails[playerNumber].pos].cost;
    //     tempPlayerDetails[playerNumber].assets.push(
    //         playerDetails[playerNumber].pos
    //     );
    //     console.log("tempPlayerDetails-->", tempPlayerDetails);
    //     setPlayerDetails(tempPlayerDetails);
    //
    //     setOptionDetails({ ...optionDetails, buy: false });
    // };
    //
    // // Socket.io------------------------
    // const createRoom = () => {
    //     socket.emit("createRoom", {
    //         playerName: playerMe.playerName,
    //         playerId: playerMe.playerName,
    //         playerMe,
    //     });
    //     setDisplay({ ...display, playerForm: false });
    // };
    //
    // const joinRoom = () => {
    //     socket.emit("joinRoom", {
    //         playerName: playerMe.playerName,
    //         playerId: playerMe.playerName,
    //         roomId: playerMe.room,
    //     });
    //     setDisplay({ ...display, playerForm: false });
    // };
    //
    // // const div = <span style={{color: 'red'}}>ASE</span>
    //
    // useEffect(() => {
    //     // Create Room
    //     socket.on("createRoomStatus", (data) => {
    //         toast.success("Room " + data.roomId + " created!");
    //         setPlayerMe({
    //             ...playerMe,
    //             playerNumber: data.playerNumber,
    //             room: data.roomId,
    //         });
    //         setPlayerDetails(data.updPlayerDetails);
    //     });
    //
    //     // Join Room
    //     socket.on("joinRoomStatus", (data) => {
    //         toast.success(`Joined ${data.roomId}!`);
    //         setPlayerMe({
    //             ...playerMe,
    //             playerNumber: data.playerNumber,
    //             room: data.roomId,
    //         });
    //         setPlayerDetails(data.updPlayerDetails);
    //     });
    //
    //     // rejoin
    //     socket.on("rejoinRoomStatus", (data) => {
    //         toast.success(`Rejoined ${data.roomId}!`);
    //         setPlayerMe({
    //             ...playerMe,
    //             playerNumber: data.playerNumber,
    //             room: data.roomId,
    //         });
    //         setPlayerDetails(data.updPlayerDetails);
    //     });
    //     // When a user joins a room -> other players
    //     socket.on("aNewPlayerHasJoined", (data) => {
    //         toast.success(`${data.newPlayerName} has joined your game!`);
    //         // setPlayerMe({ ...playerMe, playerNumber: data.playerNumber });
    //         setPlayerDetails(data.updPlayerDetails);
    //     });
    //
    //     // next turn reply function to all players
    //     socket.on("nextTurnReply", (data) => {
    //         console.log("data.updPlayerDetails", data.updPlayerDetails);
    //         setCurrentTurn(data.currentTurn);
    //         setPlayerDetails(data.updPlayerDetails);
    //     });
    //
    //     // get current Tile function to other players
    //     // socket.on("diceRollBroadcast", (data) => {
    //     //   setCurrentTurn(data.currentTurn);
    //     //   setPlayerDetails(data.updPlayerDetails);
    //     // });
    // }, [socket]);
    // // ----------------------
    //
    //
    //
