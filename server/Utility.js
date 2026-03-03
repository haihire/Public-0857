import { GetSockets_Name } from "./EmitManager.js";
import { returnList, Scan_data, set_end_game } from "./SQL.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
// import geoip from "geoip-lite";

import xlsx from "xlsx";
import { GetRoom, getRRoom } from "./Manager.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/* Port RoomNumber Mapping */
// 1) Load the workbook and first sheet
const workbook = xlsx.readFile(path.resolve(__dirname, "table-Port.xlsx"));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 2) Parse rows
const rows = xlsx.utils.sheet_to_json(sheet);
// rows ≃ [ { maxim: 'MB2227-8001', okura: 'MB523-8051', ... }, … ]

// 3) Build maps
export const portToRoom = new Map();
export const roomToPort = new Map();

for (const row of rows) {
  for (const [roomName, combo] of Object.entries(row)) {
    // combo is like 'MB2227-8001'
    const [roomId, port] = combo.split("-");
    portToRoom.set(port, roomId);
    roomToPort.set(roomId, port);
  }
}

// 4) Demo lookups
// console.log(`Port 8001 → room ${portToRoom.get("8001")}`);
// console.log(`Room MB523 → port ${roomToPort.get("MB523")}`);
/* */
// 타이머 입장 및 퇴장
const pads = new Map();
export function getPad(RoomID) {
  return pads.get(RoomID);
}
export function setPad(RoomID, socket) {
  return pads.set(RoomID, socket);
}
export function deletePad(RoomID) {
  return pads.delete(RoomID);
}
export function isExistPad(RoomID) {
  return pads.has(RoomID);
}
export function showPad() {
  return pads;
}
/* FOR CONTROL */
const ctrls = new Map();
export function getCtrl(RoomID) {
  return ctrls.get(RoomID);
}
export function setCtrl(RoomID, socket) {
  return ctrls.set(RoomID, socket);
}
export function deleteCtrl(RoomID) {
  return ctrls.delete(RoomID);
}
export function isExistCtrl(RoomID) {
  return ctrls.has(RoomID);
}
export function showCtrl() {
  return ctrls;
}
/* */
// 접속 유저 담는 부분
const userList = new Map();
export async function getUser() {
  return userList;
}
export async function addUser(sUserID) {
  userList.set(sUserID, true);
}
export async function isUserExists(sUserID) {
  return userList.has(sUserID);
}
export async function removeUser(sUserID) {
  return userList.delete(sUserID);
}
export async function initUser() {
  return userList.clear();
}
//차단 ip
export function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress ||
    null
  );
}
const ALLOWED_PAD_IPS = [
  "182.230.90.39", //내 로컬
  //맥심
  "115.146.186.150",
  "124.6.137.118",
  //오쿠라
  "58.69.1.130",
  "203.177.106.2",
  //한카지노
  "115.146.212.138",
  "203.177.89.186",
  //누스타
  "122.3.1.250",
  "103.44.235.162",
];
//특정 ip 외 차단 패드
export function blockWhiteIP2(req, res, next) {
  const clientIP = getClientIP(req);

  if (ALLOWED_PAD_IPS.includes(clientIP)) return next();
  else {
    return res
      .status(403)
      .sendFile(path.join(__dirname, "./errorPage/index.html"));
  }
}
//필리핀 차단
// export function blockPhilippines(req, res, next) {
//   const clientIP = getClientIP(req);

//   if (!clientIP) return next(); // IP 확인 불가 시 통과

//   const geo = geoip.lookup(clientIP);

//   if (geo && geo.country === "PH") {
//     console.log(`Blocked Philippine IP: ${clientIP}`);
//     return res
//       .status(403)
//       .sendFile(path.join(__dirname, "./errorPage/index.html"));
//   }

//   next();
// }
const roomIdleTimers = new Map();
const DEFAULT_IDLE_MS = 180000;
export function StartPlaying(RoomID) {
  GetRoom(RoomID).Playing = true;
  const tictok = roomIdleTimers.get(RoomID);
  if (tictok) {
    clearTimeout(tictok);
  }
  const timer = setTimeout(() => {
    GetRoom(RoomID).stopPlaying();
  }, DEFAULT_IDLE_MS);
  roomIdleTimers.set(RoomID, timer);
}
//sql error
export function SQL_handleUncaughtException(SD) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const filePath = path.join(__dirname, "error_log.txt");
  const logData = `
	-------------------------
	Timestamp: ${new Date().toISOString()}
	Error in Function: ${SD.f_name}
	SQL Query:
	${SD.sql}
	
	Parameters:
	${JSON.stringify(SD.params, null, 2)}
	
	Data Context:
	${JSON.stringify(SD.data, null, 2)}
	
	Error Stack:
	${SD.error.stack}
	
	-------------------------
	`;

  fs.appendFile(filePath, logData, (err) => {
    if (err) {
      console.error("Failed to write to file:", err);
    } else {
      console.log("Error logged to file SD", SD);
      console.log("Error logged to file err", err);
    }
  });
}

export function findBettingByUser(userID) {
  const bettingsMap = getRRoom().bettings; // Map<string, BettingObject[]>
  for (const [, bettings] of bettingsMap) {
    const found = bettings.find((b) => b.sUserID === userID);
    if (found) return found;
  }
  return undefined;
}

//server error
export function handleUncaughtException(err) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const filePath = path.join(__dirname, "error_log.txt");
  const logData = `${new Date().toISOString()} - ${err.stack || err}\n`;

  fs.appendFile(filePath, logData, (err) => {
    if (err) {
      console.error("Failed to write to file:", err);
    } else {
      console.log(logData);
    }
  });
}

/**
 *
 */
const list = ["414C4C"];
export function countryList(data) {
  list.push(data);
}
export function returnCountryList() {
  return list;
}
///////////////////////////////////////////
export function winnerCalc(pCard, bCard) {
  let winner = "";
  let pair = "";
  let Pscore = 0;
  let Bscore = 0;

  for (let i = 0; i < pCard.length; i++) {
    const numbering = pCard[i].split("")[1];

    switch (numbering) {
      case "1":
        Pscore += 1;
        break;
      case "2":
        Pscore += 2;
        break;
      case "3":
        Pscore += 3;
        break;
      case "4":
        Pscore += 4;
        break;
      case "5":
        Pscore += 5;
        break;
      case "6":
        Pscore += 6;
        break;
      case "7":
        Pscore += 7;
        break;
      case "8":
        Pscore += 8;
        break;
      case "9":
        Pscore += 9;
        break;
      case "a":
        Pscore += 0;
        break;
      case "b":
        Pscore += 0;
        break;
      case "c":
        Pscore += 0;
        break;
      case "d":
        Pscore += 0;
        break;
    }
  }

  for (let i = 0; i < bCard.length; i++) {
    const numbering = bCard[i].split("")[1];

    switch (numbering) {
      case "1":
        Bscore += 1;
        break;
      case "2":
        Bscore += 2;
        break;
      case "3":
        Bscore += 3;
        break;
      case "4":
        Bscore += 4;
        break;
      case "5":
        Bscore += 5;
        break;
      case "6":
        Bscore += 6;
        break;
      case "7":
        Bscore += 7;
        break;
      case "8":
        Bscore += 8;
        break;
      case "9":
        Bscore += 9;
        break;
      case "a":
        Bscore += 0;
        break;
      case "b":
        Bscore += 0;
        break;
      case "c":
        Bscore += 0;
        break;
      case "d":
        Bscore += 0;
        break;
    }
  }

  Pscore = Pscore % 10;
  Bscore = Bscore % 10;
  if (Pscore === Bscore) {
    winner = "tie";
  } else if (Pscore > Bscore) {
    winner = "player";
  } else if (Pscore < Bscore) {
    winner = "banker";
  }
  let Ppair = [];
  let Bpair = [];
  for (let i = 0; i < 2; i++) {
    const pc = pCard[i] ?? "";
    const bc = bCard[i] ?? "";
    Ppair.push(pc[1] ?? null);
    Bpair.push(bc[1] ?? null);
  }
  const parts = [];
  if (Ppair[0] === Ppair[1]) parts.push("Player_Pair");
  if (Bpair[0] === Bpair[1]) parts.push("Banker_Pair");
  pair = parts.join(",");

  return { winner: winner, pair: pair };
}
//serialData
export function converText(data) {
  let text = "";

  let playerPart = "";
  let bankerPart = "";

  for (let i = 0; i < 3; i++) {
    if (data.pCard[i]) {
      switch (data.pCard[i].split("")[0]) {
        case "b": //스페이드
          playerPart += "d";
          break;
        case "9": //다이아
          playerPart += "a";
          break;
        case "a": //클로버
          playerPart += "b";
          break;
        case "c": //하트
          playerPart += "c";
          break;
      }
      switch (data.pCard[i].split("")[1]) {
        case "1":
          playerPart += "e";
          break;
        case "2":
          playerPart += "f";
          break;
        case "3":
          playerPart += "g";
          break;
        case "4":
          playerPart += "h";
          break;
        case "5":
          playerPart += "i";
          break;
        case "6":
          playerPart += "j";
          break;
        case "7":
          playerPart += "k";
          break;
        case "8":
          playerPart += "l";
          break;
        case "9":
          playerPart += "m";
          break;
        case "a":
          playerPart += "n";
          break;
        case "b":
          playerPart += "o";
          break;
        case "c":
          playerPart += "p";
          break;
        case "d":
          playerPart += "q";
          break;
      }
    } else {
      playerPart += "zz";
    }
  }
  for (let i = 0; i < 3; i++) {
    if (data.bCard[i]) {
      switch (data.bCard[i].split("")[0]) {
        case "b":
          bankerPart += "d";
          break;
        case "9":
          bankerPart += "a";
          break;
        case "a":
          bankerPart += "b";
          break;
        case "c":
          bankerPart += "c";
          break;
      }
      switch (data.bCard[i].split("")[1]) {
        case "1":
          bankerPart += "e";
          break;
        case "2":
          bankerPart += "f";
          break;
        case "3":
          bankerPart += "g";
          break;
        case "4":
          bankerPart += "h";
          break;
        case "5":
          bankerPart += "i";
          break;
        case "6":
          bankerPart += "j";
          break;
        case "7":
          bankerPart += "k";
          break;
        case "8":
          bankerPart += "l";
          break;
        case "9":
          bankerPart += "m";
          break;
        case "a":
          bankerPart += "n";
          break;
        case "b":
          bankerPart += "o";
          break;
        case "c":
          bankerPart += "p";
          break;
        case "d":
          bankerPart += "q";
          break;
      }
    } else {
      bankerPart += "zz";
    }
  }
  text = playerPart + bankerPart;

  switch (data.winner) {
    case "player":
      text += "2";
      break;
    case "banker":
      text += "1";
      break;
    case "tie":
      text += "3";
      break;
  }
  switch (data.pair) {
    case "Player_Pair":
      text += "5";
      break;
    case "Banker_Pair":
      text += "4";
      break;
    case "Player_Pair,Banker_Pair":
      text += "45";
      break;
    default:
      text += "";
      break;
  }

  return text;
}

/**
 * AutoResult Card Setting
 */
let PrepareCard = [];
export function initCard() {
  PrepareCard = [];
  for (let shape = 1; shape <= 4; shape++) {
    for (let numbers = 1; numbers <= 13; numbers++) {
      PrepareCard.push({ shape: shape, number: numbers });
    }
  }
  return PrepareCard;
}
export function drawCards(cardList, numCards) {
  let selectedCards = [];
  for (let i = 0; i < numCards; i++) {
    const randomIndex = Math.floor(Math.random() * cardList.length);
    selectedCards.push(cardList.splice(randomIndex, 1)[0]);
  }
  return selectedCards;
}
///////////////////////////////////////////
const outPlayers = new Map();
export function outset(id) {
  outPlayers.set(id, true);
}
export function outhas(id) {
  return outPlayers.has(id);
}
export function outdel(id) {
  outPlayers.delete(id);
}
/**
 * Baccarat Result Calculation Inputted Text
 */
function CalcRange(card) {
  const shapeMap = {
    1: "a", // Diamond
    2: "b", // Club
    3: "c", // Heart
    4: "d", // Spade
  };

  const numberMap = {
    1: "e",
    2: "f",
    3: "g",
    4: "h",
    5: "i",
    6: "j",
    7: "k",
    8: "l",
    9: "m",
    10: "n",
    11: "o",
    12: "p",
    13: "q",
  };

  // 값이 숫자면 -> map[key] 리턴
  // 값이 문자면 -> map에서 해당 문자에 해당하는 key를 찾아 숫자로 변환 리턴
  function convert(map, input) {
    // input이 숫자라면
    if (typeof input === "number") {
      return map[input];
    }
    // input이 문자라면
    else if (typeof input === "string") {
      // map 객체의 key-value 쌍을 순회하면서
      // value가 input과 같은 key를 찾아서 반환
      for (const [key, value] of Object.entries(map)) {
        if (value === input) {
          // key는 문자열이므로 숫자로 변환해서 리턴
          return Number(key);
        }
      }
    }
    // 둘 다 해당하지 않는다면 (에러 처리)
    // throw new Error(`Invalid input: ${input}`);
  }

  if (card.shape && card.number) {
    return convert(shapeMap, card.shape) + convert(numberMap, card.number);
  } else {
    return {
      // card.shape가 숫자든 문자든 convert로 매핑
      shape: convert(shapeMap, card.shape),
      number: convert(numberMap, card.number),
    };
  }
}
function isPair(arr) {
  return arr[0] === arr[1];
}
// Main function to calculate the result
export function winCalc(player, banker) {
  let OriginText = "";

  let pPart = "";
  let bPart = "";
  const pPair = [];
  const bPair = [];
  let pPoint = 0;
  let bPoint = 0;
  // Build player part
  for (let i = 0; i < player.length; i++) {
    pPart += CalcRange(player[i]);
    if (i < 2) {
      pPair.push(player[i].number);
    }
    pPoint += player[i].number > 10 ? 10 : player[i].number;
  }
  if (pPart.length === 4) {
    pPart += "zz";
  }

  // Build banker part
  for (let i = 0; i < banker.length; i++) {
    bPart += CalcRange(banker[i]);
    if (i < 2) {
      bPair.push(banker[i].number);
    }
    bPoint += banker[i].number > 10 ? 10 : banker[i].number;
  }
  if (bPart.length === 4) {
    bPart += "zz";
  }

  OriginText += pPart + bPart;

  // Calculate player and banker points
  const playerPoints = pPoint % 10;
  const bankerPoints = bPoint % 10;

  let result = [];

  // Determine who wins
  if (playerPoints > bankerPoints) {
    OriginText += 2;
    result.push("Player");
  } else if (playerPoints < bankerPoints) {
    OriginText += 1;
    result.push("Banker");
  } else {
    OriginText += 3;
    result.push("Tie");
  }

  // Check for player pair
  const isPlayerPair = isPair(pPair);
  if (isPlayerPair) {
    OriginText += 5;
    result.push("Player_Pair");
  }
  // Check for banker pair
  const isBankerPair = isPair(bPair);
  if (isBankerPair) {
    OriginText += 4;
    result.push("Banker_Pair");
  }

  return { OriginText: OriginText, result: result };
}
export function setCard(data, RoomID, who, isSerial) {
  let Num = "";
  let Shape = "";
  let AllCard = [];
  let Sum = 0;
  let Origin = "";

  let SerialCount = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === "z") continue;

    if (i % 2 === 0) {
      Shape = CalcRange({ shape: data[i] }).shape;
      Origin = data[i];
    }
    if (i % 2 !== 0) {
      Num = CalcRange({ number: data[i] }).number;
      Sum += parseInt(Num) >= 10 ? 10 : parseInt(Num);
      AllCard.push({ Num: Num, Shape: Shape });
      Origin += data[i];

      const body = {
        table: RoomID,
        shape: Shape,
        number: Num,
        who: who,
        Origin: Origin,
      };

      if (isSerial) {
        body.Origin = isSerial[SerialCount];
      }

      Scan_data(body, "good");
      SerialCount += 1;
    }
  }
  return {
    AllCard: AllCard,
    Sum: Sum % 10,
  };
}
export function setWin(data) {
  let AllWin = [];
  let Win = "";
  for (let i = 0; i < data.length; i++) {
    switch (data[i]) {
      case "1":
        Win = "Banker";
        break;
      case "2":
        Win = "Player";
        break;
      case "3":
        Win = "Tie";
        break;
      case "4":
        Win = "Banker_Pair";
        break;
      case "5":
        Win = "Player_Pair";
        break;
    }
    if (Win !== "") AllWin.push(Win);
  }
  return AllWin;
}
///////////////////////////////////////////
/**
 * Baccarat Result Calculation Each Card
 */
export function isWhoTurn(count) {
  if (count % 2 == 0) {
    return "Banker";
  } else {
    return "Player";
  }
}
export function convertReceiveToSerial(shape, number) {
  let returnText =
    CalcRange({ shape: shape }).shape + CalcRange({ number: number }).number;
  return returnText;
}
/**
 * Each Scan result processing
 */
export function WhenCal(Num, arrays) {
  for (let index = 0; index < arrays.length; index++) {
    if (Num == arrays[index]) {
      return true;
    }
  }
  return false;
}
///////////////////////////////////////////

//랜덤 최소 ~ 최대
export function RandomFunction(Min, Max) {
  if (Min == undefined) {
    Max = 100;
    Min = 0;
  } else if (Max == undefined) {
    Max = Min;
    Min = 0;
  }
  return Math.floor(Math.random() * (++Max - Min) + Min);
}

export function card_range(data) {
  let scan_card = "";
  if (data == undefined) {
    scan_card = "";
  } else {
    switch (data.Shape) {
      case 1:
        scan_card += "◆";
        break;
      case 2:
        scan_card += "♣";
        break;
      case 3:
        scan_card += "♥";
        break;
      case 4:
        scan_card += "♠";
        break;
      default:
        scan_card = "";
        break;
    }
    if (scan_card !== "") scan_card += Number(data.Num);
  }
  return scan_card;
}
/**
 * @Auto Playing Control
 */
let Autos = [];
export function isAutos(sUserID) {
  if (Autos.some((el) => el == sUserID)) {
    return false;
  } else {
    Autos.push(sUserID);
    return true;
  }
}
export function delAutos(sUserID) {
  Autos = Autos.filter((el) => el != sUserID);
}
export function AutosFunction() {
  return Autos;
}
export function groupAndSum(data) {
  return data.reduce((acc, current) => {
    let found = acc.find((item) => item.name === current.name);
    if (found) {
      found.money += Number(current.money);
    } else {
      acc.push({ name: current.name, money: Number(current.money) });
    }
    return acc;
  }, []);
}
///////////////////////////////////////////

export function GetIdEmit(sUserID, SendName, data) {
  try {
    GetSockets_Name(sUserID).emit(SendName, data);
  } catch (error) {
    if (SendName === "KeepBetting" || "RefreshUserMoney") {
      return;
    }
    console.log(
      "sUserID",
      sUserID,
      "SendName",
      SendName,
      " error data",
      data,
      "error",
      error,
    );
    set_end_game({ sUserID: sUserID });
  }
}
export function csl(name, data = null) {
  if (!ExceptName.some((el) => el == name)) {
    const now = new Date();
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const formattedDate = `${year} ${hours}:${minutes}:${seconds}`;
    // if (data) {
    // 	if (typeof (data) === 'object')
    // 		console.log('Baccarat ' + name + ':' + circularSafeJsonStringify(data) + ' ' + formattedDate);
    // 	else
    // 		console.log('Baccarat ' + name + ':' + data + ' ' + formattedDate);
    // }
    // else {
    // 	console.log('Baccarat ' + name + ' ' + formattedDate);
    // }
  }
}
const ExceptName = [
  // 'RefreshUserMoney',
  // 'S_sql sp_balance_change',
  // 'S_sql updateRoomList',
  // 'S_sql Bet',
  // 'statusLobby',
  // 'Cut',
  // 'S_sql enterLobby',
  // 'S_sql ScanOn',
  // 'R_Timer',
  // 'S_sql isToken',
  // 'S_sql statusUpdate',
  // 'S_sql UPDATE tb_baccarat_money_move_log',
  // 'UDPATE sResult',
  // 'Rmoney',
  // 'S_sql UDPATE sResult',
  // 'S_sql Scan_data',
  // 'S_sql BetCallBack',
  // 'S_sql tb_baccarat_money_move_log',
  // 'S_sql SQL_addAuto',
  // 'S_sql sp_auto_connect',
  // 'S_sql lobbyItemSet',
  // 'S_sql sp_get_user_playing_status',
  // "S_sql game_notice",
  // "S_sql token_check",
  // "S_sql Dealer_dual_check",
  // "S_sql DealerLogin",
  // "S_sql support_log",
  // "S_sql Select_Room",
  // "S_sql UpdatebResult",
  // "S_sql tb_total_game_betting_log",
  // "S_sql sp_baccarat_sum_log",
  // "S_sql ListReturnCut",
  // "S_sql tb_transaction",
  // "S_sql tb_baccarat_betting_log",
  // "S_sql tb_baccarat_progress_log",
  // "S_sql Cutcard_log",
];
function circularSafeJsonStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
}
//난수 생성 crypto API
export function generateSecureRandomHex() {
  const buffer = crypto.randomBytes(4);
  return buffer.toString("hex");
}
