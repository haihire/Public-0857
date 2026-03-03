import { GetRoom } from "./Manager.js";
import { csl, getPad } from "./Utility.js";
var io = null;
var Sockets_Name = {};

//소켓 리스트 추가
export function SetIO(_IO) {
  if (io == null) io = _IO;
}
//소켓(이름) 리스트 추가
export function SetSockets_Name(_Name, _Socket) {
  if (Sockets_Name[_Name] != _Socket) {
    Sockets_Name[_Name] = _Socket;
  }
}
//소켓(이름) 리스트 찾기
export function GetSockets_Name(_Name) {
  return Sockets_Name[_Name];
}
//소켓(이름) 리스트 제거
export function RemoveSockets_Name(_Name) {
  delete Sockets_Name[_Name];
}
const padSendSocketName = [
  "timer",
  // "change_betting",
  "enterSingleLobby",
  "Single",
  "Game_Start",
  "Game_Wait",
  "resultWinner",
];
// 전송
export function Emit(Who, _SocketName, RoomID, _Dictionary = null) {
  const Rooms = GetRoom(RoomID);
  if (!Rooms) {
    console.error(`Room not found: ${RoomID}`);
    return;
  }

  const emitToSocket = (userID) => {
    const socket = GetSockets_Name(userID);
    if (socket) socket.emit(_SocketName, _Dictionary);
  };

  if (Who == "Dealer") {
    emitToSocket(Rooms.DealerID);
  } else if (Who == "Player") {
    Rooms.players.forEach((player) => {
      emitToSocket(player.sUserID);
    });
  } else if (Who == "All") {
    Rooms.players.forEach((player) => {
      emitToSocket(player.sUserID);
    });
    emitToSocket(Rooms.DealerID);
  }
  if (padSendSocketName.includes(_SocketName)) {
    const padSocket = getPad(RoomID);
    if (padSocket) {
      padSocket.emit(_SocketName, _Dictionary);
    }
  }
  // Log only for specific events
  if (_SocketName !== "change_betting" && _SocketName !== "timer") {
    csl("EM SocketName", _SocketName);
  }
}
