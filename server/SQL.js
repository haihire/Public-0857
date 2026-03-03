import { Emit, GetSockets_Name, SetSockets_Name } from "./EmitManager.js";
import {
  CreateRoom,
  GetRoom,
  getRoomList,
  getURoom,
  getRRoom,
} from "./Manager.js";
import mysql from "mysql2/promise";
import {
  AutosFunction,
  card_range,
  csl,
  delAutos,
  generateSecureRandomHex,
  GetIdEmit,
  isAutos,
  isUserExists,
  getUser,
  addUser,
  removeUser,
  SQL_handleUncaughtException,
  initUser,
  getClientIP,
  getPad,
  isExistPad,
} from "./Utility.js";

import { SevUrl } from "./SevUrl.js";
// import axios from "axios";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // in ms
const MaxCount = 240;
let SendData;
const config = {
  host: SevUrl().sql_host,
  user: SevUrl().sql_user,
  port: 3306,
  password: SevUrl().sql_password,
  database: "baccarat",
  connectionLimit: 50,
  connectTimeout: 10000, // 10 seconds
  waitForConnections: true,
  multipleStatements: true,
  keepAliveInitialDelay: 10000,
};

const con = mysql.createPool(config);

async function corng(sql, f_name, params, data = null, socket = null) {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    let connection;
    try {
      connection = await con.getConnection();
      const [results] = await connection.query(sql, params);

      csl("S_sql " + f_name, data);
      await handleResult(f_name, results, data, socket);
      return;
    } catch (error) {
      retryCount++;
      SQL_handleUncaughtException({
        sql: sql,
        f_name: f_name,
        params,
        params,
        data: data,
        socket: socket,
        error: error,
      });
      if (retryCount >= MAX_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // 대기 후 재시도
    } finally {
      if (connection) connection.release();
    }
  }
}
export async function insertLimit(data) {
  const sql = `INSERT INTO tb_baccarat_limit_list(room_seq,room_id,agency_id,currency) VALUES(?,?,"master","USD");
  INSERT INTO tb_baccarat_limit_list(room_seq,room_id,agency_id,currency) VALUES(?,?,"master","KRW");
  INSERT INTO tb_baccarat_limit_list(room_seq,room_id,agency_id,currency) VALUES(?,?,"master","CNY");
  INSERT INTO tb_baccarat_limit_list(room_seq,room_id,agency_id,currency) VALUES(?,?,"master","JPY");
  `;
  const params = [
    data.id,
    data.room_id,
    data.id,
    data.room_id,
    data.id,
    data.room_id,
    data.id,
    data.room_id,
  ];
  await corng(sql, "insertLimit", params, data, null);
}
async function handleResult(f_name, result, data, socket) {
  csl("S_sql " + f_name, data);
  if (f_name == "DBinit") {
    await initUser();
    BringRoom();
  } else if (f_name == "BringRoom") {
    // console.log("res", result.length);
    // for (let i = 0; i < result.length; i++) {
    //   const r = result[i];
    //   await insertLimit({ id: r.id, room_id: r.room_id });
    // }
    // return;
    BringLimit(result);
  } else if (f_name == "BringLimit") {
    CreateRoom(data, result);
  } else if (f_name == "game_notice") {
    GetRoom(data).MainNotice = result[0].msg;
  } else if (f_name == "SQL_addAuto") {
    if (result.length != 0) {
      let Count = 0;

      for (const key of result) {
        if (isAutos(key.mb_id)) {
          SendData = {
            ip: "auto",
            RoomID: data.RoomID,
            bApiUser: 0,
            token: "auto",
            sUserID: key.mb_id,
            name: key.mb_name,
            sUserCode: key.mb_userCode,

            Betting: new Map([
              ["Player_Pair", { money: 0, rate: 12 }],
              ["Player", { money: 0, rate: 2 }],
              ["Tie", { money: 0, rate: 9 }],
              ["Banker", { money: 0, rate: 1.95 }],
              ["Banker_Pair", { money: 0, rate: 12 }],
            ]),
            total: 0,
          };
          sp_auto_connect(SendData);
          GetRoom(SendData.RoomID).AutoConnect(SendData, key.mb_money);
        } else {
          Count += 1;
        }
      }

      if (Count !== 0) {
        SendData = {
          RoomID: data.RoomID,
          nAutoPlayerSettingCnt: Count,
        };
        await SQL_addAuto(SendData);
      }
    }
  }
  //player
  else if (f_name == "isToken") {
    if (!result[0]) {
      socket.emit("ErrorDisconnect", { msg: "Token is not Exist" });
      return;
    }

    if (result[0].mb_userLv !== 6) {
      socket.emit("ErrorDisconnect", {
        msg: "UserLv is not 6",
        lang: result[0].mb_langType,
      });
      return;
    }

    SendData = {
      ip: data.ip,
      token: data.token,
      type: data.type,
      MorP: data.MorP,
      sSite: data.sSite,
      RoomCount: data.RoomCount,
      sUserID: result[0].mb_id,
      sUserCode: result[0].mb_userCode,
      langType: result[0].mb_langType,
      currencyType: result[0].mb_currencyType,
      name: result[0].mb_name,
      gm: result[0].mb_gm,
      money: result[0].mb_money,
      bApiUser: result[0].mb_bApiUser,
    };
    sp_get_user_playing_status(SendData, socket);
  } else if (f_name == "sp_get_user_playing_status") {
    if (
      result[0][0].nPlayingStatus != 0 ||
      GetSockets_Name(result[0].sUserID)
    ) {
      SendData = {
        msg: "Duplicate_Login",
        lang: data.langType,
      };
      socket.emit("ErrorDisconnect", SendData);
    } else {
      if (data.type == "d") {
        SendData = {
          ip: data.ip + data.MorP,
          sUserID: data.sUserID,
          sUserCode: data.sUserCode,
          TN: "0",
          sDescriptions: "LobbyIn",
        };
        tb_login_log(SendData);
        socket.emit("not_dual_game", {
          sUserID: SendData.sUserID,
          sUserCode: SendData.sUserCode,
        });
      }
    }
  } else if (f_name == "isLimit") {
    if (!result[0]) {
      SendData = {
        ip: data.ip,
        sUserID: data.sUserID,
        sUserCode: "01",
        sSite: data.sSite,
        currencyType: data.currencyType,
        bApiUser: data.bApiUser,
        substitute: true,
      };
      isLimit(SendData, socket);
      return;
    }
    SendData = {
      ip: data.ip,
      sUserID: data.sUserID,
      sUserCode: data.sUserCode,
      TN: "0",
      sDescriptions: "LobbyIn",
    };
    tb_login_log(SendData);
    SendData = {
      sUserID: data.sUserID,
      ip: data.ip,
      sUserCode: data.sUserCode,
    };
    set_start_game(SendData);
    SendData = {
      LimitInfo: result,
      sSite: data.sSite,
      substitute: data.substitute ? true : false,
    };
  } else if (f_name == "Select_Room") {
    // const roomData = result[0][0];
    const RoomID = result[0].room_id;
    GetRoom(RoomID).changeBetTime({
      nBettingTime: result[0].nBettingTime,
      nWinnerShowTime: result[0].nWinnerShowTime,

      active: result[0].active,

      nAutoPlayerSettingCnt: result[0].nAutoPlayerSettingCnt,
    });

    if (socket == null)
      Emit("Dealer", "Select_Room", RoomID, {
        room: GetRoom(RoomID),
        ObjectToJson: GetRoom(RoomID).getRoomData(),
      });
    else
      socket.emit("Select_Room", {
        room: GetRoom(RoomID),
        ObjectToJson: GetRoom(RoomID).getRoomData(),
      });
  } else if (f_name == "support_log") {
    const r_room = result.slice(-MaxCount);

    if (socket == null)
      Emit("Dealer", "support_log", "baccarat-" + data, r_room);
    else socket.emit("support_log", r_room);
  }
  //dealer
  else if (f_name === "token_check") {
    const tokenExists = result[0];
    const userLevel = tokenExists ? result[0].mb_userLv : null;
    const room = GetRoom(data.RoomID);
    const dealerExists = room && room.DealerID !== "";

    if (!tokenExists) {
      // Token does not exist
      return socket.emit("ErrorDisconnect", "Token is not Exist");
    }

    if (!room) {
      // Room does not exist
      return socket.emit("ErrorDisconnect", "Room does not exist");
    }

    if (dealerExists) {
      // Dealer already in the room
      return socket.emit("ErrorDisconnect", "Dealer already in room");
    }

    if (userLevel !== 200) {
      return socket.emit(
        "ErrorDisconnect",
        `User level is incorrect, should be 200`,
      );
    }

    if (userLevel === 200) {
      SendData = {
        sUserID: result[0].mb_id,
        RoomID: data.RoomID,
      };
      Dealer_dual_check(SendData, socket);
    }
  } else if (f_name == "Dealer_dual_check") {
    let isId = false;
    for (const item of result) {
      if (item.sDealerID === data.sUserID) {
        isId = true;
      }
      if (
        item.room_id === data.RoomID &&
        (item.bDealerLogin === 1 || item.sDealerID !== "")
      ) {
        isId = true;
      }
    }

    if (isId) {
      socket.emit("dual_game");
    } else {
      socket.emit("not_dual_game", data);
    }
  } else if (f_name == "DealerLogin") {
    if (result[0]) {
      if (!socket.rooms[data.RoomID]) socket.join(data.RoomID);
      SendData = {
        sUserID: result[0].mb_id,
        name: result[0].mb_name,
        RoomData: GetRoom(data.RoomID),
      };
      socket.emit("Dealer_Login", SendData);
      let Dealerdata = {
        token: socket.sUserID,
        sUserID: result[0].mb_id,
        name: result[0].mb_name,
        RoomID: data.RoomID,
        ip: data.ip,
      };
      socket.emit("invasion", GetRoom(data.RoomID).DealerConnect(Dealerdata));
      Select_Room(data, socket);
      DealerUpdateOnOff({
        onoff: 1,
        sUserID: Dealerdata.sUserID,
        RoomID: data.RoomID,
      });
      Emit("All", "d_change", data.RoomID, { DealerName: Dealerdata.name });
      support_log(data.RoomID.slice(9), socket);
    }
  } else if (f_name == "RoomActiveOnOff") {
    if (data.onoff === 0) {
      //입장해있는 유저 강퇴
      Emit("Player", "ActiveOff", data.RoomID, { RoomID: data.RoomID });
    }
    SendData = {
      RoomID: data.RoomID,
      status: data.onoff === 0 ? "Close" : "Open",
      sSite: GetRoom(data.RoomID).sSite,
      Playing: GetRoom(data.RoomID).Playing,
    };
    statusUpdate(SendData);
  } else if (f_name == "change_game") {
    GetSockets_Name(data.sUserID).emit("MovedRoom");
  } else if (f_name == "statusUpdate") {
    SendData = {
      type: "statusLobby",
      Playing: data.Playing,
      status: data.status,
      RoomID: data.RoomID,
      idx: Number(data.RoomID.slice(9)),
      sSite: data.sSite,
    };
    returnList(SendData);
  } else if (f_name == "returnList") {
    const type = data.type;

    if (result.length !== 0) {
      for (const key of result) {
        if (type === "Single") {
          SendData = {
            sUserID: key.sUserID,
            nTableNumber: data.nTableNumber,
            type: type,
            sSite: data.sSite,
            RoomID: data.RoomID,
          };
          enterSingleLobby(SendData);
        } else if (type === "statusLobby") {
          GetRoom(data.RoomID).status = data.status;
          GetIdEmit(key.sUserID, type, data);
        } else if (type === "notifyNotice") {
          GetIdEmit(key.sUserID, type, data);
        } else if (type === "ListUpdate") {
          // const delUser = isUser(key.sUserID);
          // if (!delUser) {
          //   set_end_game({ sUserID: key.sUserID });
          // }
        } else {
          GetIdEmit(key.sUserID, type, data);
        }
      }
    }
    if (isExistPad(data.RoomID) && type === "Single") {
      SendData = {
        sUserID: GetRoom(data.RoomID).RoomNumber,
        nTableNumber: data.RoomID.slice(9),
        type: type,
        sSite: data.sSite,
        RoomID: data.RoomID,
      };
      enterSingleLobby(SendData, getPad(data.RoomID));
    }
  } else if (f_name == "updateRoomList") {
    Emit("All", "change_betting", data.RoomID, {
      CBMap: Object.fromEntries(
        Array.from(data.CBMap, ([key, value]) => [
          key,
          {
            users: Object.fromEntries(value.users),
            total: value.total,
          },
        ]),
      ),
      RoomID: data.RoomID,
    });
  } else if (f_name == "tb_baccarat_progress_log") {
    support_log(data.nTableNumber);
    SendData = {
      nTableNumber: data.nTableNumber,
      type: "Single",
      sSite: data.sSite,
      RoomID: data.RoomID,
    };
    returnList(SendData);
  } else if (f_name == "enterSingleLobby") {
    const sUserID = data.sUserID;
    const s_room = GetRoom("baccarat-" + data.nTableNumber);
    const r_room = result.slice(-MaxCount);
    SendData = {
      idx: data.nTableNumber,
      result: r_room,
      s_room: s_room,
      sSite: data.sSite,
      RoomID: data.RoomID,
    };
    if (socket) {
      socket.emit("enterSingleLobby", SendData);
    } else {
      GetIdEmit(sUserID, "enterSingleLobby", SendData);
    }
  } else if (f_name == "UpdateShoeGameNumber") {
    if (result[0]) {
      const RoomID = data.RoomID;
      const ShoeGameNumber = result[0].cnt;
      const sShoeNumber = result[0].sShoeNumber;

      if (ShoeGameNumber === 0 && !sShoeNumber) {
        await DuplicateShoe({
          ShoeNumber: Math.floor(1_000_000 + Math.random() * 9_000_000),
          RoomID: RoomID,
        });
      } else {
        GetRoom(RoomID).ShoeNumber = sShoeNumber;
        GetRoom(RoomID).ShoeGameNumber = ShoeGameNumber + 1;
      }
    }
  } else if (f_name == "RefreshUserMoney") {
    if (result[0]) {
      const sUserID = data.sUserID;
      const Money = result[0].mb_money;
      GetIdEmit(sUserID, "RefreshUserMoney", Money);
    }
  } else if (f_name == "Cutcard_log") {
    support_log(data.nTableNumber);
  } else if (f_name == "betLog") {
    SendData = {
      result: result,
      date: data.date,
    };
    socket.emit("betLog", SendData);
  } else if (f_name == "delAuto") {
    if (result.length !== 0) {
      for (const key of result) {
        delAutos(key.sUserID);
        sp_auto_disconnect({ sUserID: key.sUserID });
        const RoomID = data.RoomID;
        SendData = {
          type: "auto",
          sUserID: key.sUserID,
          move: false,
        };
        GetRoom(RoomID).DisConnect(SendData);
      }
    }
  } else if (f_name == "Ploadmoney") {
    const ClientData = {
      ip: data.ip,
      RoomID: data.RoomID,
      sUserID: result[0].mb_id,
      token: result[0].mb_token,
      name: result[0].mb_name,
      sUserCode: result[0].mb_userCode,
      bApiUser: result[0].mb_bApiUser,

      Betting: new Map([
        ["Player_Pair", { money: 0, rate: 12 }],
        ["Player", { money: 0, rate: 2 }],
        ["Tie", { money: 0, rate: 9 }],
        ["Banker", { money: 0, rate: 1.95 }],
        ["Banker_Pair", { money: 0, rate: 12 }],
      ]),
      total: 0,
    };
    GetRoom(data.RoomID).connectPlayer(ClientData, result[0].mb_money);
  } else if (f_name == "sp_balance_change") {
    if (data.ip !== "auto")
      GetIdEmit(data.sUserID, "RefreshUserMoney", result[0][0].mb_money);
  } else if (f_name == "tb_transaction") {
    // axios
    //   .post(`https://api-callback.${SevUrl().CallBack}.com/game`, {
    //     logNumber: data.sLogNumber,
    //   })
    //   .catch((error) => {
    //     csl("tb_transaction Post err msg: ", error);
    //   });
  } else if (f_name == "Scan_data") {
    // GetRoom(data.table).ScanData(data);
  }
  // Player Require Code
  // else if (f_name == "Lobby_search_user") {
  //   if (
  //     !result[0] ||
  //     result[0].mb_userLv !== 6 ||
  //     !result[0].bet_limit_seq ||
  //     isUserExists(result[0].mb_id)
  //   ) {
  //     socket.emit("LoginFail", { msg: "error" });
  //   } else {
  //     SendData = {
  //       ip: data.ip,
  //       sUserID: result[0].mb_id,
  //       pw: result[0].mb_pass,
  //       sUserCode: result[0].mb_userCode,
  //       name: result[0].mb_name,
  //       langType: result[0].mb_langType,
  //       currencyType: result[0].mb_currencyType,
  //       money: result[0].mb_money,
  //       token: result[0].mb_token,
  //       bet_min: result[0].bet_min,
  //       bet_max: result[0].bet_max,
  //       tie_min: result[0].tie_min,
  //       tie_max: result[0].tie_max,
  //       pair_min: result[0].pair_min,
  //       pair_max: result[0].pair_max,
  //       multiBet: result[0].mb_multiBet,
  //     };
  //     try {
  //       await set_end_game({ sUserID: result[0].mb_id }).then(() => {
  //         socket.emit("LobbySuccess", SendData);
  //       });
  //     } catch (error) {
  //       console.error("Error in getLock.lockAndExecute:", error);
  //       socket.emit("LoginFail", { msg: "Error in getLock" });
  //     }
  //   }
  // }
  //Login
  else if (f_name == "Login_search_user") {
    if (!result[0]) {
      socket.emit("ERROR", {
        title: "LoginFail",
        msg: "getPlz",
        location: f_name,
      });
      return;
    } else {
      const exists = await isUserExists(result[0].mb_id);
      if (result[0].mb_userLv !== 6 || !result[0].bet_limit_seq || exists) {
        socket.emit("ERROR", {
          title: "LoginFail",
          msg: "getPlz",
          exists: exists,
          location: f_name,
        });
      } else {
        SendData = {
          ip: data.ip,
          sUserID: result[0].mb_id,
          pass: result[0].mb_pass,
          sUserCode: result[0].mb_userCode,
          name: result[0].mb_name,
          langType: result[0].mb_langType,
          currencyType: result[0].mb_currencyType,
          money: result[0].mb_money,
          bet_min: result[0].bet_min,
          bet_max: result[0].bet_max,
          tie_min: result[0].tie_min,
          tie_max: result[0].tie_max,
          pair_min: result[0].pair_min,
          pair_max: result[0].pair_max,
          multiBet: result[0].mb_multiBet,
          chipList: result[0].mb_chipList,
        };
        try {
          await set_end_game({ sUserID: result[0].mb_id }).then(async () => {
            await CheckUserList(SendData, socket);
          });
        } catch (error) {
          socket.emit("ERROR", {
            title: "LoginFail",
            msg: "Error in getLock",
            location: f_name,
          });
        }
      }
    }
  } else if (f_name == "CheckUserList") {
    if (!result[0]) {
      let newToken = generateSecureRandomHex();
      SendData = {
        ip: data.ip,
        token: newToken,
        sUserID: data.sUserID,
        sUserCode: data.sUserCode,
        name: data.name,
        langType: data.langType,
        currencyType: data.currencyType,
        TN: "0",
        sDescriptions: "LobbyIn",
        money: data.money,
        pass: data.pass,
        bet_min: data.bet_min,
        bet_max: data.bet_max,
        tie_min: data.tie_min,
        tie_max: data.tie_max,
        pair_min: data.pair_min,
        pair_max: data.pair_max,
        multiBet: data.multiBet,
        chipList: data.chipList,
      };

      await change_token(SendData, socket).then(() => {
        socket.emit("LoginSuccess", SendData);
      });
    } else {
      // console.log("LoginFail CheckUserList", result);
      socket.emit("ERROR", {
        title: "LoginFail",
        msg: "Already List",
        location: f_name,
      });
    }
  } else if (f_name == "set_start_game") {
    await addUser(data.sUserID);
  } else if (f_name == "tb_login_log") {
    if (socket && data.sDescriptions !== "LogOut") {
      socket.emit("LobbyEnterSuccess");
    }
  } else if (f_name == "AbatarFill") {
    let s_room = getRoomList();

    const tableProgressMap = new Map();
    result.forEach((table) => {
      const { nTableNumber, progressLogs } = table;
      const parsedLogs = JSON.parse(progressLogs);

      // Sort by `dRegDate` in descending order to get the latest logs first
      parsedLogs.sort((a, b) => new Date(b.dRegDate) - new Date(a.dRegDate));

      // Limit to the latest MaxCount logs and then reverse to get ascending order
      const latestLogs = parsedLogs.slice(0, MaxCount).reverse();

      tableProgressMap.set(nTableNumber, latestLogs);
    });

    // Prepare room result using the progress logs map
    const r_room = s_room.map((el) => {
      const tableNumber = el.id;
      return tableProgressMap.get(tableNumber) || [];
    });

    if (socket) {
      socket.emit("AbatarFill", {
        r_room: r_room,
        s_room: s_room,
      });
    }
  } else if (f_name == "EnterRoom") {
    if (socket) {
      let BetData = getRRoom().selPlayer(data.sUserID, data.RoomID);
      if (BetData) {
        BetData = Object.fromEntries(BetData.Betting);
      }
      const room = GetRoom(data.RoomID);
      if (data.move) {
        socket.emit("MoveRoomSuccess", {
          BetData: BetData,
          money: getURoom().selPlayer(data.sUserID).money,
          CBMap: room.getRoomData().CBMap,
          PADMap: room.getRoomPADData().PADMap,
          s_room: room,
        });
      } else {
        socket.emit("EnterRoomSuccess", {
          BetData: BetData,
          CBMap: room.getRoomData().CBMap,
          PADMap: room.getRoomPADData().PADMap,
          s_room: room,
        });
      }
    }
  } else if (f_name == "ExitRoom") {
    if (socket) socket.emit("ExitRoomSuccess");
  } else if (f_name === "userListUpdate") {
    if (result[0]) {
      const dbIDs = result.map((row) => row.sUserID);
      const inUsers = await getUser();
      inUsers().forEach(async (_, id) => {
        if (!dbIDs.includes(id)) {
          await removeUser(id);
        }
      });

      setTimeout(() => {
        userListUpdate();
      }, 10000);
    }
  } else if (f_name === "DuplicateShoe") {
    if (!result[0]) {
      GetRoom(data.RoomID).ShoeNumber = data.ShoeNumber;
      GetRoom(data.RoomID).ShoeGameNumber = 0;
    } else {
      DuplicateShoe(data);
    }
  } else if (f_name === "RefreshUInfo") {
    socket.emit("RefreshUInfo", result[0]);
  } else if (f_name === "chipList") {
    socket.emit("rev_chipList", { chipList: data.chipList });
  }
  //FOR PAD
  else if (f_name === "adminCheck") {
    socket.emit("rev_adminCheck");
    return;
    if (!result[0]) {
      socket.emit("Fail_adminCheck");
    } else {
      socket.emit("rev_adminCheck");
    }
  } else if (f_name === "show_room") {
    const room = GetRoom(data.RoomID);
    if (!room) {
      socket.emit("ErrorDisconnect", { msg: "Room not found" });
      return;
    }
    if (typeof room.getRoomPADData === "function") {
      socket.emit("rev_show_room", {
        r_room: result,
        s_room: room,
        PADMap: room.getRoomPADData().PADMap ?? null,
      });
    }
  } else if (f_name === "Search_Shoes") {
    socket.emit("rev_Search_Shoes", result);
  } else if (f_name === "betLogPlz") {
    socket.emit("rev_betLogPlz", result);
  } else if (f_name === "PadUserLogin") {
    if (result[0]) {
      GetRoom(data.RoomID).PadUserLogin({
        RoomID: data.RoomID,
        sUserID: result[0].mb_id,
        sUserCode: result[0].mb_userCode,
        name: result[0].mb_name,
        bApiUser: result[0].mb_bApiUser,
        money: parseFloat(result[0].mb_money),
        ip: "admin",
      });
    }
  } else if (f_name === "PadUserGet") {
    if (result[0]) {
      GetRoom(data.RoomID).padSet({
        RoomID: data.RoomID,
        sUserID: result[0].mb_id,
        sUserCode: result[0].mb_userCode,
        name: result[0].mb_name,
        bApiUser: result[0].mb_bApiUser,
        money: parseFloat(result[0].mb_money),
        ip: "admin",
      });
    }
  } else if (f_name === "adminCheck_ctrl") {
    /* FOR Control */
    if (!result[0]) {
      socket.emit("Fail_adminCheck_ctrl");
    } else {
      socket.emit("rev_adminCheck_ctrl");
    }
  } else if (f_name === "deleteResult_ctrl") {
    SendData = {
      nTableNumber: data.RoomID.slice(9),
      type: "Single",
      sSite: data.sSite,
      RoomID: data.RoomID,
    };
    returnList(SendData);
  }
}

export async function sp_auto_disconnect(data) {
  const sql = `CALL sp_auto_disconnect(?)`;
  const params = [data.sUserID];
  await corng(sql, "sp_auto_disconnect", params, data);
}
export async function betLog(data, socket) {
  const sql = `SELECT * FROM tb_baccarat_money_move_log
    WHERE sUserID = ? AND sType='result' AND DATE(dRegDate) BETWEEN ? AND ?;`;
  const params = [data.sUserID, data.startDate, data.endDate];
  await corng(sql, "betLog", params, data, socket);
}
export async function first_change_game(data) {
  const sql = `UPDATE tb_baccarat_game_user_list 
    SET nRoomNo=?, dEnteringTime = NOW(), bPlay = 1 
    WHERE sUserID=?;`;
  const params = [data.RoomID.slice(9), data.sUserID];
  await corng(sql, "first_change_game", params, data);
}
export async function change_game(data) {
  const sql = `UPDATE tb_baccarat_game_user_list 
    SET nRoomNo=?, dEnteringTime = NOW() , bPlay = 1
    WHERE sUserID=?;`;
  const params = [data.RoomID.slice(9), data.sUserID];
  await corng(sql, "change_game", params, data);
}
export async function returnList(data) {
  const sql = `select * from tb_baccarat_game_user_list WHERE sUserID NOT LIKE ?;`;
  const params = ["baccarat-Auto%"];
  await corng(sql, "returnList", params, data, null);
}
export async function langTypeChange(data) {
  const sql = `UPDATE holdem.member SET mb_langType=? WHERE mb_id=?;`;
  const params = [data.langType, data.sUserID];
  await corng(sql, "langTypeChange", params, null, null);
}
export async function statusUpdate(data) {
  const updateSql = `UPDATE tb_baccarat_room_list SET status=? WHERE room_id=?;`;
  const params = [data.status, data.RoomID];
  await corng(updateSql, "statusUpdate", params, data, null);
}
export async function enterSingleLobby(data, socket = null) {
  const nTableNumber = Number(data.nTableNumber);

  const sql = `SELECT 
  sShoeNumber,sShoeGameNumber,sSite,
    sBanker_1_Card, sBanker_2_Card, sBanker_3_Card, sBanker_Score,
    sPlayer_1_Card, sPlayer_2_Card, sPlayer_3_Card, sPlayer_Score,
    sBanker_Score, 
    sPlayer_Score, 
    sWinner, 
    sPair
    FROM tb_baccarat_progress_log
    WHERE nTableNumber = ?
        AND dRegDate > (
            SELECT MAX(dRegDate)
            FROM tb_baccarat_cutcard_log
            WHERE nTableNumber = ?
        )
    ORDER BY dRegDate ASC`;
  const params = [nTableNumber, nTableNumber, MaxCount];
  await corng(
    sql,
    "enterSingleLobby",
    params,
    {
      RoomID: data.RoomID,
      nTableNumber: nTableNumber,
      sUserID: data.sUserID,
      sSite: data.sSite,
    },
    socket,
  );
}
export async function UpdateShoeGameNumber(data, socket) {
  const nTableNumber = Number(data.RoomID.slice(9));

  const sql = `
  SELECT sShoeNumber, COUNT(*) AS cnt, MIN(dRegDate) AS firstRegDate
    FROM tb_baccarat_progress_log
      WHERE nTableNumber = ?
        AND dRegDate > (
          SELECT MAX(dRegDate)
            FROM tb_baccarat_cutcard_log
              WHERE nTableNumber = ?)
    GROUP BY sShoeNumber
    ORDER BY firstRegDate ASC;`;
  const params = [nTableNumber, nTableNumber];
  await corng(sql, "UpdateShoeGameNumber", params, data, socket);
}
export async function RefreshUserMoney(data, socket) {
  const sql = `SELECT mb_money FROM holdem.member WHERE mb_id = ?`;
  const params = [data.sUserID];
  await corng(sql, "RefreshUserMoney", params, data, socket);
}
export async function sp_dealer_tip_log(data) {
  const sql = `CALL holdem.sp_dealer_tip_log(?,?,?,?);`;
  const params = [data.nTableNumber, data.sDealerID, data.sUserID, data.nTips];
  await corng(sql, "sp_dealer_tip_log", params);
}
export async function Cutcard_log(data) {
  const sql = `INSERT INTO tb_baccarat_cutcard_log(nTableNumber,dRegDate) VALUES(?,NOW());`;
  const params = [data.nTableNumber];
  await corng(sql, "Cutcard_log", params, data, null);
}
export async function game_notice(RoomID) {
  const sql = `SELECT * FROM holdem.tb_game_notice WHERE room_id=?;`;
  const params = [-1];
  await corng(sql, "game_notice", params, RoomID);
}

export async function AvatarLobby(data, socket) {
  const sql = `SELECT * FROM holdem.member WHERE mb_token=?;`;
  const params = [data.token];
  await corng(sql, "AvatarLobby", params, data, socket);
}
export async function RoomActiveOnOff(data) {
  const sql = `UPDATE tb_baccarat_room_list SET active = ? WHERE room_id=?;`;
  const params = [data.onoff, data.RoomID];
  await corng(sql, "RoomActiveOnOff", params, data);
}
export async function delAuto(data) {
  const sql = `SELECT * 
    FROM tb_baccarat_game_user_list
    WHERE nRoomNo = ?
    AND sUserID LIKE 'baccarat-Auto%'
    LIMIT ?;`;
  const params = [data.RoomID.slice(9), data.nAutoPlayerSettingCnt];
  await corng(sql, "delAuto", params, data);
}
export async function tb_baccarat_progress_log(data) {
  const sql = `insert into tb_baccarat_progress_log
    (
        sLogNumber, nTableNumber,
        sBanker_1_Card, sBanker_2_Card, sBanker_3_Card, sBanker_Score,
        sPlayer_1_Card, sPlayer_2_Card, sPlayer_3_Card, sPlayer_Score,
        sWinner, sPair, sStatus, sDeviceOrginalText,
        sRecodingFilePath, sRecodingLog,
        dRegDate,sShoeNumber,sShoeGameNumber,sSite
    )values
    (
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        now(),?,?,?
    );`;
  const params = [
    data.sLogNumber,
    data.nTableNumber,
    data.B1Card,
    data.B2Card,
    data.B3Card,
    data.BScore,
    data.P1Card,
    data.P2Card,
    data.P3Card,
    data.PScore,
    data.win,
    data.pair,
    data.sStatus,
    data.sDeviceOrginalText,
    data.sRecodingFilePath,
    data.sRecodingLog,
    data.sShoeNumber,
    data.sShoeGameNumber,
    data.sSite,
  ];
  await corng(sql, "tb_baccarat_progress_log", params, data);
}
export async function updateRoomList(data) {
  const sql = `UPDATE tb_baccarat_room_list SET
    nPlayerCount=?,nBankerCount=?,nTieCount=?,
    nPPCount=?,nBPCount=?,
    nPlayerMoney=?,nBankerMoney=?,nTieMoney=?,
    nPPMoney=?,nBPMoney=?
    WHERE room_id=?;
    `;
  const params = [
    data.nPlayerCount,
    data.nBankerCount,
    data.nTieCount,
    data.nPPCount,
    data.nBPCount,
    data.nPlayerMoney,
    data.nBankerMoney,
    data.nTieMoney,
    data.nPPMoney,
    data.nBPMoney,
    data.RoomID,
  ];
  await corng(sql, "updateRoomList", params, data);
}
export async function tb_transaction(data) {
  const sql = `INSERT INTO api_service.tb_transaction 
    (
        sTransactionKey, sType, sUserID, sUserCode, sGameName, sLogNumber, sScoreNumber, 
        sCardResult, sResult, sBettingPos, nBettingMoney, nTableNumber, nBeforeBalance, nBalance, 
        nHoldemBalance, nAmount, bGameServerCallback, bAgentServerCallback, nAgentServerRetryCount, 
        sStatus, sAgentServerCallbackURL, dRegDate
    ) VALUES (
        ?, ?, ?, ?, 'baccarat', ?, ?,
        ?, ?, ?, ?, ?, ?, ?, 
        0, ?, 0, 0, 0,
        'ready', '', now()
    );`;

  const params = [
    data.sTransactionKey,
    data.sType,
    data.sUserID,
    data.sUserCode,
    data.sLogNumber,
    data.sScoreNumber,
    data.sCardResult,
    data.sResult,
    data.sBettingPos,
    data.nBettingMoney,
    data.nTableNumber,
    data.nBeforeBalance,
    data.nEndMoney,
    data.nWinnerMoney,
  ];
  await corng(sql, "tb_transaction", params, data);
}
export async function tb_baccarat_money_move_log(data, type1) {
  const sql = `INSERT INTO baccarat.tb_baccarat_money_move_log
    (
        sLogNumber, sRoomNumber, nTableNumber, sType, sUserID,
        sUserCode, sScoreNumber, nStartMoney, nBettingMoney,
        nEndMoney, nWinnerMoney, sBettingPos, sCardResult,
        mb_ip, sResult, sTransactionKey, dRegDate,sShoeNumber,sShoeGameNumber,sSite
    ) VALUES
    (
        ?,?,?,?,?,
        ?,?,?,?,
        ?,?,?,?,
        ?,?,?,now(),?,?,?
    );`;
  const params = [
    data.sLogNumber,
    data.sRoomNumber,
    data.nTableNumber,
    type1,
    data.sUserID,
    data.sUserCode,
    data.sScoreNumber,
    data.nStartMoney,
    data.nBettingMoney,
    data.nEndMoney,
    data.nWinnerMoney,
    data.sBettingPos,
    data.sCardResult,
    data.ip,
    data.sResult,
    data.sTransactionKey,
    data.sShoeNumber,
    data.sShoeGameNumber,
    data.sSite,
  ];
  await corng(sql, "tb_baccarat_money_move_log", params);
}
export async function UpdatebResult(data) {
  const sql = `UPDATE baccarat.tb_baccarat_money_move_log
    SET sResult = CASE
        WHEN FIND_IN_SET(sBettingPos, ?) > 0 THEN 'Win'
        WHEN FIND_IN_SET('Tie', ?) > 0 
             AND sBettingPos <> 'Tie'
             AND sBettingPos NOT LIKE '%Pair%' THEN 'Tie'
        ELSE 'Lose'
    END,
        sScoreNumber = ?,
        sCardResult = ?
    WHERE sLogNumber = ?
    AND sType = 'bet';`;
  const params = [
    data.win,
    data.win,
    data.sScoreNumber,
    data.win,
    data.sLogNumber,
  ];
  await corng(sql, "UpdatebResult", params, data);
}
export async function DuplicateShoe(data) {
  const sql = `select sShoeNumber from tb_baccarat_progress_log where sShoeNumber=?;`;
  const params = [data.ShoeNumber];
  await corng(sql, "DuplicateShoe", params, data);
}
export async function UpdateApibResult(data) {
  const sql = `UPDATE api_service.tb_transaction
    SET sResult = CASE
        WHEN FIND_IN_SET(sBettingPos, ?) > 0 THEN 'Win'
        WHEN FIND_IN_SET('Tie', ?) > 0 
             AND sBettingPos <> 'Tie'
             AND sBettingPos NOT LIKE '%Pair%' THEN 'Tie'
        ELSE 'Lose'
    END,
        sScoreNumber = ?,
        sCardResult = ?
    WHERE sLogNumber = ?
    AND sType = 'bet';`;
  const params = [
    data.win,
    data.win,
    data.sScoreNumber,
    data.win,
    data.sLogNumber,
  ];
  await corng(sql, "UpdateApibResult", params, data);
}
export async function sp_baccarat_sum_log(data) {
  const sql = `CALL sp_baccarat_sum_log(?,?,?,?,?,?)`;
  const params = [
    data.sUserID,
    data.sLogNumber,
    data.sResult,
    data.nBettingMoney,
    data.nWinnerMoney,
    data.nTableNumber,
  ];
  await corng(sql, "sp_baccarat_sum_log", params);
}

export async function Scan_data(data, find) {
  let scan_data = card_range({ Shape: data.shape, Num: data.number });
  const sql = `insert into tb_baccarat_scan_card_log
    (
        sLogNumber, table1, 
        net_room_id,  state_comment,
        s_scan_data, originData, sPos,
        state_type, dRegDate
    ) values
    (
        ?, ?, 
        ?, ?, 
        ?, ?, ?,
        1, now()
    );`;
  const params = [
    GetRoom(data.table).getLogNum(),
    data.table.slice(9),
    `baccarat-${data.table.slice(9)}`,
    find,
    scan_data,
    data.Origin,
    data.who,
  ];
  await corng(sql, "Scan_data", params);
}

export async function ScanOn(data, bool) {
  const sql = `UPDATE tb_baccarat_room_list SET bBarcodeDeviceConnect = ? where room_id=?`;
  const params = [bool, data];
  await corng(sql, "ScanOn", params);
}
export async function set_end_game(data) {
  const sql = `CALL sp_set_end_game(?);`;
  const params = [data.sUserID];
  await corng(sql, "set_end_game", params, data);
}
export async function LobbyInUser(data) {
  const sql = `UPDATE baccarat.tb_baccarat_game_user_list SET nRoomNo = 0, bPlay = 0 WHERE sUserID=?;`;
  const params = [data.sUserID];
  await corng(sql, "LobbyInUser", params);
}
export async function sp_balance_change(data) {
  if (!data) {
    return;
  }
  const sql = `CALL sp_balance_change(?,?);`;
  const params = [data.sUserID, data.BetMoney * -1];
  await corng(sql, "sp_balance_change", params, data);
}
async function DBinit() {
  const sql = `CALL sp_DBinit();`;
  await corng(sql, "DBinit", []);
}
async function BringRoom() {
  const sql = `SELECT * FROM tb_baccarat_room_list;`;
  await corng(sql, "BringRoom", []);
}
async function BringLimit(RoomData) {
  const sql = `SELECT * FROM tb_baccarat_limit_list;`;
  await corng(sql, "BringLimit", [], RoomData);
}
export async function SQL_addAuto(data) {
  let excludedMbIds = "";
  const params = [];

  const autoIds = AutosFunction();
  if (autoIds.length > 0) {
    excludedMbIds = `AND mb_id NOT IN (${autoIds.map(() => "?").join(",")})`;
    params.push(...autoIds); // Add all IDs to params
  }

  const sql = `
    SELECT * 
    FROM holdem.member 
    WHERE mb_gm = 9
    AND mb_money > 0
    ${excludedMbIds}
    AND mb_id NOT IN (SELECT sUserID FROM tb_baccarat_game_user_list)
    LIMIT ?;`;

  // Add the limit (nAutoPlayerSettingCnt) to params
  params.push(data.nAutoPlayerSettingCnt);

  // Call the await corng function with the SQL query, function name, and parameters
  await corng(sql, "SQL_addAuto", params, data);
}
export async function sp_auto_connect(data) {
  const sql = `CALL sp_auto_connect(?,?,?,?)`;
  const params = [data.sUserID, data.ip, data.sUserCode, data.RoomID.slice(9)];
  await corng(sql, "sp_auto_connect", params, data);
}
//Player
export async function isToken(data, socket) {
  const sql = `SELECT * FROM holdem.member WHERE mb_token=?`;
  const params = [data.token];
  await corng(sql, "isToken", params, data, socket);
}
export async function sp_get_user_playing_status(data, socket) {
  const sql = `CALL holdem.sp_get_user_playing_status(?);`;
  const params = [data.sUserID];
  await corng(sql, "sp_get_user_playing_status", params, data, socket);
}
export async function isLimit(data, socket) {
  const sSite = data.sSite;
  const currency = data.currencyType;

  let sub_sql = "";
  let params = [agency_id, currency];
  if (sSite !== "414C4C") {
    sub_sql = "WHERE r.sSite = ?";
    params.unshift(sSite);
  }
  const sql = `SELECT r.*, l.*
    FROM baccarat.tb_baccarat_room_list AS r
    INNER JOIN baccarat.tb_baccarat_limit_list AS l
    ON r.room_id = l.room_id
    ${sub_sql}
    
    AND l.currency = ?;`;

  await corng(sql, "isLimit", params, data, socket);
}

export async function Ploadmoney(data, socket) {
  const sql = `SELECT * from holdem.member where mb_id=?;`;
  const params = [data.sUserID];
  await corng(sql, "Ploadmoney", params, data, socket);
}

export async function Select_Room(data, socket = null) {
  let sql = `select * from tb_baccarat_room_list where room_id=?;`;
  const params = [data.RoomID];
  await corng(sql, "Select_Room", params, data, socket);
}
async function Login_date(data) {
  const sql = `UPDATE holdem.member SET mb_lastLoginDate = now() WHERE mb_id=?;`;
  const params = [data.sUserID];
  await corng(sql, "Login_date", params);
}
async function support_log(data, socket = null) {
  const sql = `
    SELECT 
    sPlayer_1_Card,
    sPlayer_2_Card,
    sPlayer_3_Card,
    sBanker_1_Card,
    sBanker_2_Card,
    sBanker_3_Card,
    sBanker_Score, 
    sPlayer_Score, 
    sWinner, 
    sPair
    FROM tb_baccarat_progress_log
    WHERE nTableNumber = ?
        AND dRegDate > (
            SELECT MAX(dRegDate)
            FROM tb_baccarat_cutcard_log 
            WHERE nTableNumber = ?
        )
    ORDER BY dRegDate ASC;`;
  const params = [data, data, MaxCount];
  await corng(sql, "support_log", params, data, socket);
}
//dealer
export async function token_check(data, socket) {
  const sql = `select * from holdem.member where mb_token=?;`;
  const params = [data.token];
  await corng(sql, "token_check", params, data, socket);
}
export async function Dealer_dual_check(data, socket) {
  const sql = `select room_id,bDealerLogin,sDealerID from tb_baccarat_room_list;`;
  await corng(sql, "Dealer_dual_check", [], data, socket);
}
export async function DealerLogin(data, socket) {
  const sql = `SELECT mb_id from holdem.member where mb_id=?;`;
  const params = [data.sUserID];
  await corng(sql, "DealerLogin", params, data, socket);
}
export async function DealerUpdateOnOff(data) {
  const sDealerID = data.sUserID ? data.sUserID : "";
  const sql = `UPDATE tb_baccarat_room_list SET bDealerLogin=?, sDealerID=? where room_id=?;`;
  const params = [data.onoff, sDealerID, data.RoomID];
  await corng(sql, "DealerUpdateOnOff", params, data);
}
//Login
export async function LimitCheck(data, socket) {
  const sql = `Call sp_get_user_betting_limit(?);`;
  const params = [data.id];
  await corng(sql, "LimitCheck", params, data, socket);
}
export async function Login_search_user(data, socket) {
  const sql = `SELECT * FROM holdem.member AS m
              LEFT JOIN
              baccarat.tb_baccarat_user_bet_limit AS b 
              ON m.bet_limit_seq = b.seq
              WHERE m.mb_id   = ? AND m.mb_pass = ? ;`;
  const params = [data.id, data.pw];
  await corng(sql, "Login_search_user", params, data, socket);
}
// export async function Lobby_search_user(data, socket) {
//   const sql = `SELECT * FROM holdem.member AS m
//               LEFT JOIN
//               baccarat.tb_baccarat_user_bet_limit AS b
//               ON m.bet_limit_seq = b.seq
//               WHERE m.mb_id   = ? AND m.mb_pass = ?`;
//   const params = [data.id, data.pw];
//   await corng(sql, "Lobby_search_user", params, data, socket);
// }
export async function CheckUserList(data, socket) {
  const sql = `Select * FROM tb_baccarat_game_user_list WHERE sUserID=?`;
  const params = [data.sUserID];
  await corng(sql, "CheckUserList", params, data, socket);
}
async function change_token(data, socket) {
  const sql = `UPDATE holdem.member SET mb_token=? WHERE mb_id=?;`;
  const params = [data.token, data.sUserID];
  corng(sql, "change_token", params, data, socket);
}
export async function set_start_game(data, socket) {
  const sql = `CALL sp_set_start_game(?,?,?)`;
  const params = [data.sUserID, data.ip, data.sUserCode];
  await corng(sql, "set_start_game", params, data, socket);
}
export async function tb_login_log(data, socket = null) {
  const sql = `insert into tb_login_log
    (
        mb_id, sUserIP, sTableNumber, sDescriptions,
        dRegDate
    ) values
    (
        ?, ?, ?, ?,
        now()
    );`;
  const params = [data.sUserID, data.ip, "0", data.sDescriptions];
  await corng(sql, "tb_login_log", params, data, socket);
}
export async function show_room(data, socket) {
  const nTableNumber = Number(data.RoomID.slice(9));
  const sql = `SELECT 
  sShoeNumber,sShoeGameNumber,sSite,
    sBanker_1_Card, sBanker_2_Card, sBanker_3_Card, sBanker_Score,
    sPlayer_1_Card, sPlayer_2_Card, sPlayer_3_Card, sPlayer_Score,
    sBanker_Score, 
    sPlayer_Score, 
    sWinner, 
    sPair
    FROM tb_baccarat_progress_log
    WHERE nTableNumber = ?
        AND dRegDate > (
            SELECT MAX(dRegDate)
            FROM tb_baccarat_cutcard_log
            WHERE nTableNumber = ?
        )
    ORDER BY dRegDate ASC;`;
  const params = [nTableNumber, nTableNumber];
  await corng(sql, "show_room", params, data, socket);
}
export async function AbatarFill(data, socket = null) {
  //supportlog 넣어주기
  let ids = getRoomList().map((el) => el.id);

  const sql = `
        WITH latest_cut AS (
            SELECT nTableNumber, MAX(dRegDate) AS latestCutDate
            FROM tb_baccarat_cutcard_log
            WHERE nTableNumber IN (${ids.map(() => "?").join(", ")})
            GROUP BY nTableNumber
        )
        SELECT p.nTableNumber, 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'sSite',      p.sSite,
                    'sShoeGameNumber',      p.sShoeGameNumber,
                    'sShoeNumber',      p.sShoeNumber,
                    'sBanker_1_Card',    p.sBanker_1_Card,
                    'sBanker_2_Card',    p.sBanker_2_Card,
                    'sBanker_3_Card',    p.sBanker_3_Card,
                    'sBanker_Score',     p.sBanker_Score,
                    'sPlayer_1_Card',    p.sPlayer_1_Card,
                    'sPlayer_2_Card',    p.sPlayer_2_Card,
                    'sPlayer_3_Card',    p.sPlayer_3_Card,
                    'sPlayer_Score',     p.sPlayer_Score,
                    'sWinner', sWinner,
                    'sPair', sPair,
                    'dRegDate', p.dRegDate
                )
            ) AS progressLogs
        FROM tb_baccarat_progress_log p
        LEFT JOIN latest_cut lc ON p.nTableNumber = lc.nTableNumber
        WHERE p.nTableNumber IN (${ids.map(() => "?").join(", ")})
        AND (p.dRegDate > COALESCE(lc.latestCutDate, 0))
        GROUP BY p.nTableNumber
        ORDER BY p.nTableNumber ASC;
    `;

  const params = [...ids, ...ids];
  await corng(sql, "AbatarFill", params, data, socket);
}
export async function EnterRoom(data, socket) {
  const sql = `UPDATE tb_baccarat_game_user_list 
    SET nRoomNo=?, dEnteringTime = NOW() , bPlay = 1
    WHERE sUserID=?;`;
  const params = [data.RoomID.slice(9), data.sUserID];
  await corng(sql, "EnterRoom", params, data, socket);
}
export async function ExitRoom(data, socket) {
  const sql = `UPDATE tb_baccarat_game_user_list 
    SET nRoomNo=0, dEnteringTime = NOW() , bPlay = 1
    WHERE sUserID=?;`;
  const params = [data.sUserID];
  await corng(sql, "ExitRoom", params, data, socket);
}
export async function userListUpdate(data) {
  const sql = `Select sUserID FROM baccarat.tb_baccarat_game_user_list;`;
  const params = [];
  await corng(sql, "userListUpdate", params, data);
}

/* FOR PAD */
export async function adminCheck(data, socket) {
  const sql = `select * from tb_baccarat_pad_user_list where sIP=? and sPassword=?;`;
  const params = [data.sIP, data.sPassword];
  await corng(sql, "adminCheck", params, data, socket);
}
export async function Search_Shoes(data, socket) {
  const sql = `SELECT DISTINCT sShoeNumber FROM tb_baccarat_progress_log WHERE nTableNumber=?  AND dRegDate >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY dRegDate DESC;`;
  const params = [data.RoomID.slice(9)];
  await corng(sql, "Search_Shoes", params, data, socket);
}
export async function betLogPlz(data, socket) {
  const sql = `SELECT * FROM tb_baccarat_money_move_log WHERE sShoeNumber=? AND sUserCode LIKE '001002001%' AND sType='result';`;
  const params = [data.sShoeNumber, data.sRoomNumber];
  await corng(sql, "betLogPlz", params, data, socket);
}
export async function PadUserLogin(data, socket = null) {
  const sql = `SELECT * FROM holdem.member WHERE mb_id=?`;
  const params = [data.id];
  await corng(sql, "PadUserLogin", params, data, socket);
}
export async function PadUserGet(data, socket = null) {
  const sql = `SELECT * FROM holdem.member WHERE mb_id=?`;
  const params = [data.id];
  await corng(sql, "PadUserGet", params, data, socket);
}
/* */
/* FOR Control */
export async function adminCheck_ctrl(data, socket) {
  const sql = `select * from tb_baccarat_pad_user_list where sIP=? and sPassword=?;`;
  const params = [data.sIP, data.sPassword];
  await corng(sql, "adminCheck_ctrl", params, data, socket);
}
export async function deleteResult_ctrl(data) {
  const sql = `DELETE FROM tb_baccarat_progress_log WHERE nTableNumber = ? 
  ORDER BY seq DESC
  LIMIT 1`;
  const params = [data.RoomID.slice(9)];
  await corng(sql, "deleteResult_ctrl", params, data);
}
/* */
export async function deleteResult(data) {
  const sql = `DELETE FROM tb_baccarat_progress_log WHERE nTableNumber = ? 
  ORDER BY seq DESC
  LIMIT 1`;
  const params = [data.RoomID.slice(9)];
  await corng(sql, "deleteResult", params, data);
}
export async function PrivateUpdate(data) {
  const sRoomType = data.add ? "private" : "";
  const sql = `update tb_baccarat_room_list set sRoomType=?
  WHERE room_id = ? `;
  const params = [sRoomType, data.RoomID];
  await corng(sql, "PrivateUpdate", params, data);
}
export async function LimitUpdate(data, socket) {
  const sql = `update tb_baccarat_limit_list set ${data.where}=?
  WHERE room_id = ? AND currency = "KRW" `;
  const params = [data.money, data.RoomID];
  await corng(sql, "LimitUpdate", params, data, socket);
}

export async function RefreshUInfo(data, socket) {
  const sql = `SELECT * FROM holdem.member AS m
              LEFT JOIN
              baccarat.tb_baccarat_user_bet_limit AS b 
              ON m.bet_limit_seq = b.seq
              WHERE m.mb_id   = ?;`;
  const params = [data.sUserID];
  await corng(sql, "RefreshUInfo", params, data, socket);
}
export async function chipList(data, socket) {
  const sql = `UPDATE holdem.member set mb_chipList = ? where mb_id = ?;`;
  const params = [data.chipList, data.sUserID];
  await corng(sql, "chipList", params, data, socket);
}
/* FOR ERROR */
export async function buffer(data) {
  const sql = `INSERT INTO tb_buffer_log(type,data,sShoeNumber,sShoeGameNumber,dRegDate) VALUES(?,?,?,?,NOW());`;
  const params = [
    data.type,
    data.buffer,
    data.sShoeNumber,
    data.sShoeGameNumber,
  ];
  await corng(sql, "buffer", params, data, null);
}
DBinit();
