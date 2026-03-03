import Room from "./Room.js";
import RRoom from "./RRoom.js";
import SerialScannerServer from "./SerialScanner.js";
import { SevUrl } from "./SevUrl.js";
import { PadUserLogin, UpdateShoeGameNumber, userListUpdate } from "./SQL.js";
import URoom from "./URoom.js";
import { countryList, roomToPort, StartPlaying } from "./Utility.js";

const RoomList = new Map();
const RoomNumertoID = new Map();
// 1. Create multiple rooms
export async function CreateRoom(rooms, limits) {
  // console.log("rooms", rooms);

  const noticePromises = [];
  const autoPlayerPromises = [];
  for (const roomData of rooms) {
    // console.log("roomData", roomData);

    const room = new Room(roomData);
    room.limitSet(limits.filter((limit) => limit.room_id === roomData.room_id));
    RoomList.set(roomData.room_id, room);
    RoomNumertoID.set(roomData.sRoomNumber.trim(), roomData.room_id);

    const server = new SerialScannerServer({
      RoomID: roomData.room_id,
      RoomNumber: roomData.sRoomNumber.trim(),
    });
    room.serialScanner = server;
    server.ws_listen(
      Number(roomToPort.get(roomData.sRoomNumber.trim())),
      roomData.sRoomNumber,
    );

    room.Ready();
    PadUserLogin({ id: roomData.sRoomNumber.trim(), RoomID: roomData.room_id });
    try {
      noticePromises.push(room.notifyNotice());
    } catch (error) {
      console.error(
        `Error updating notices for room ${roomData.room_id}:`,
        error,
      );
    }

    countryList(roomData.sSite);

    if (roomData.nAutoPlayerSettingCnt > 0) {
      autoPlayerPromises.push(room.R_addAuto(roomData.nAutoPlayerSettingCnt));
    }
    room.sLogNumber = "B" + new Date().getTime();
    await UpdateShoeGameNumber({ RoomID: roomData.room_id });

    if (SevUrl().allowUrl !== "services") {
      room.Start();
    } else {
      room.GamePossible = true;
    }

    StartPlaying(roomData.room_id);
  }
  await Promise.all(noticePromises);
  await Promise.all(autoPlayerPromises);

  userListUpdate();
}
// 2. Get a specific room
export function GetRoom(roomId) {
  return findRoomById(roomId);
}

// 3. Get the entire room list
export function getRoomList() {
  return Array.from(RoomList.values());
}

// Get room by ID with validation
function findRoomById(roomId) {
  return RoomList.get(roomId) || null;
}

const RRooms = new RRoom();
export function getRRoom() {
  return RRooms;
}
const Urooms = new URoom();
export function getURoom() {
  return Urooms;
}
