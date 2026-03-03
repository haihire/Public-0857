//useful tools
import {
  SetIO,
  SetSockets_Name,
  RemoveSockets_Name,
  GetSockets_Name,
} from "./EmitManager.js";
import {
  set_end_game,
  token_check,
  DealerUpdateOnOff,
  Ploadmoney,
  tb_login_log,
  DealerLogin,
  first_change_game,
  returnList,
  Login_search_user,
  AbatarFill,
  set_start_game,
  // Lobby_search_user,
  RefreshUInfo,
  betLog,
  adminCheck,
  Search_Shoes,
  betLogPlz,
  show_room,
  chipList,
  adminCheck_ctrl,
  deleteResult_ctrl,
} from "./SQL.js";
import { GetRoom, getRoomList, getRRoom, getURoom } from "./Manager.js";
import {
  // blockPhilippines,
  blockWhiteIP2,
  csl,
  deleteCtrl,
  deletePad,
  findBettingByUser,
  GetIdEmit,
  handleUncaughtException,
  isExistCtrl,
  isExistPad,
  outdel,
  outset,
  removeUser,
  setCtrl,
  setPad,
  showCtrl,
} from "./Utility.js";
import { SevUrl } from "./SevUrl.js";
//server
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import vhost from "vhost";
import { getLock } from "./Lockmanager.js";
import ScannerServers from "./ReceiveScanner.js";

const port = process.env.PORT || SevUrl().server_port;

const allowedOrigins = [
  SevUrl().url,
  SevUrl().vShotMain,
  SevUrl().vShotDealer,
  SevUrl().vShotPad,
  SevUrl().vShotPad_ctrl,

  "http://localhost:7456",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  "http://localhost:4455",
];
// 허가
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests with no origin (e.g. mobile apps, curl requests)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      // return callback(new Error(msg), false);
      return callback(console.log(msg), false);
    }
    return callback(null, true);
  },
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const app = express();
const IntoPage = express();
//에러처리
process.on("uncaughtException", handleUncaughtException);
//스캐너
const ScannerServer = new ScannerServers();
ScannerServer.ws_listen(app, SevUrl().scanner_port);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000, // 클라이언트의 응답이 없으면 60초 후에 연결을 종료
  pingInterval: 25000, // 서버가 클라이언트로 ping을 보내는 간격, 기본값은 25초
});
//페이지 설정
const main = express();
const dealer = express();
const pad = express();
const ctrl = express();
// block
// main.use(blockPhilippines);
// dealer.use(blockPhilippines);
// pad.use(blockWhiteIP2);
// 폴더참조
dealer.use(express.static(path.join(__dirname, "dealer")));
main.use(express.static(path.join(__dirname, "main")));
pad.use(express.static(path.join(__dirname, "pad")));
ctrl.use(express.static(path.join(__dirname, "ctrl")));

IntoPage.use(vhost(SevUrl().vShotDealer, dealer));
IntoPage.use(vhost(SevUrl().vShotMain, main));
IntoPage.use(vhost(SevUrl().vShotPad, pad));
IntoPage.use(vhost(SevUrl().vShotPad_ctrl, ctrl));

dealer.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dealer", "index.html"));
});
main.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "main", "index.html"));
});
pad.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "pad", "index.html"));
});
ctrl.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "ctrl", "index.html"));
});
//보안
app.use(helmet());
app.use(express.json());

IntoPage.use(cors(corsOptions));
IntoPage.use(express.static(path.join(__dirname))); //,(req,res)=>
IntoPage.use(bodyParser.json()); // parse application/json
IntoPage.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

//api
IntoPage.post("/Limit-endpoint", (req, res) => {
  const nRoomNo = req.body.nRoomNo;
  const data = req.body.data;
  console.log("Limit-endpoint", data);

  if (nRoomNo && data) {
    GetRoom("baccarat-" + nRoomNo).changeLimit(data);
    res.send("Success");
  } else {
    res.send("Fail");
  }
});
IntoPage.post("/restas-endpoint", (req, res) => {
  const sUserID = req.body.sUserID;
  const nRoomNo = req.body.nRoomNo;
  if (sUserID && nRoomNo) {
    GetIdEmit(sUserID, "ErrorDisconnect", { msg: "You were kicked out" });
    res.send("Success");
  } else res.send("Failed");
});
IntoPage.post("/Notice-endpoint", (req, res) => {
  console.log("Notice", req.body);
  const nRoomNo = req.body.nRoomNo;
  const msg = req.body.msg;
  const displayTime = req.body.displayTime;
  if (msg) {
    if (nRoomNo === -1) {
      // -1== 전체 고정 메세지 변경
      returnList({
        msg: msg,
        type: "notifyNotice",
        sub_type: "All_Room_Main",
      });
      getRoomList().forEach((el) => {
        el.MainNotice = msg;
      });
    } else if (displayTime && nRoomNo >= 1) {
      // 1>= 단일 메세지 잠깐 변경
      returnList({
        msg: msg,
        type: "notifyNotice",
        displayTime: displayTime,
        sub_type: "One_Room_Sub",
        RoomID: "baccarat-" + nRoomNo,
      });
    } else if (displayTime && nRoomNo == 0) {
      returnList({
        // 0 == 전체 메세지 잠깐 변경
        msg: msg,
        type: "notifyNotice",
        displayTime: displayTime,
        sub_type: "All_Room_Sub",
      });
    }
    res.send("Success");
    return;
  } else {
    res.send("Fail");
  }
});
IntoPage.post("/UserLimit-endpoint", (req, res) => {
  // console.log("UserLimit", req.body);
  const sUserID = req.body.sUserID;
  const data = req.body.data;
  const userSocket = GetSockets_Name(sUserID);
  if (userSocket) {
    userSocket.emit("userLimit", data);
  }
  res.send("Success");
});
IntoPage.post("/TableLimit-endpoint", (req, res) => {
  // console.log('TableLimit',req.body);
  const RoomID = req.body.nRoomNo;
  const data = req.body.data;
  const room = GetRoom(RoomID);
  if (room) {
    room.changeLimit(data);
  }
  res.send("Success");
});
IntoPage.post("/UserMoney-endpoint", async (req, res) => {
  // console.log('UserMoney',req.body);
  const sUserID = req.body.sUserID;
  const money = Number(req.body.data.money);
  const U = getURoom();
  if (U.selPlayer(sUserID)) {
    await getLock()
      .lockAndExecute(sUserID, async () => {
        U.selPlayer(sUserID).money = money;
      })
      .then((el) => {
        GetIdEmit(sUserID, "RefreshUserMoney", money);
      });
  } else {
    GetIdEmit(sUserID, "RefreshUserMoney", money);
  }
  res.send("Success");
});
//Game Control
IntoPage.post("/resultWinner", async (req, res) => {
  const data = req.body;
  console.log("resultWinner", data);
  try {
    GetRoom(data.RoomID).resultWinner(data, false, true);
    res.send("Success");
  } catch (e) {
    console.error("Error in resultWinner endpoint:", e);
    res.status(500).send("Fail");
  }
});
IntoPage.post("/Shuffle", async (req, res) => {
  console.log("Shuffle");
  const data = req.body;
  try {
    GetRoom(data.RoomID).Shuffle();
    res.send("Success");
  } catch (e) {
    console.error("Error in Shuffle endpoint:", e);
    res.status(500).send("Fail");
  }
});
IntoPage.post("/Start", async (req, res) => {
  console.log("Start");
  const data = req.body;

  const room = GetRoom(data.RoomID);
  if (room && room.serialScanner) {
    room.serialScanner.AllowScanner = false;
    res.send("Scanner stopped");
  } else {
    res.status(404).send("Room or scanner not found");
  }
});
/////////////////////////////
IntoPage.listen(SevUrl().express_port);

server.listen(port, () => {
  console.log("Baccarat SERVER IS RUNNING" + port);
});

io.on("connection", (socket) => {
  csl("s_User Connected", socket.id);

  SetIO(io);
  // SetSockets(socket.id, socket);

  const context = {
    ip: socket.handshake.headers["x-forwarded-for"] || "localhost",
    Private_Name: null,
    token: null,
    RoomID: null,
    Type: null,
    SendData: null,
    RoomCount: 0,
    MorP: null,
  };

  /* For Pad */
  const isPad = { is: false, RoomID: null };
  socket.on("send_adminCheck", async function (data) {
    await adminCheck(data, socket);
  });
  socket.on("send_show_list", function () {
    socket.emit("rev_show_list", getRoomList());
  });
  socket.on("send_re_show_list", function (data) {
    deletePad(data.RoomID);
    isPad.is = false;
    isPad.RoomID = null;
    socket.emit("rev_re_show_list", getRoomList());
  });
  socket.on("send_show_room", function (data) {
    if (isExistPad(data.RoomID)) {
      return socket.emit("EnterFail");
    }
    isPad.is = true;
    isPad.RoomID = data.RoomID;
    setPad(data.RoomID, socket);

    show_room(data, socket);
  });
  socket.on("Search_Shoes", async function (data) {
    await Search_Shoes(data, socket).then(() => {});
  });
  socket.on("betLogPlz", async function (data) {
    await betLogPlz(data, socket);
  });
  socket.on("send_SumClick", async function (data) {
    GetRoom(data.RoomID).padCounting();
  });
  /* */
  /* For Control */
  const isPad_ctrl = { is: false, RoomID: null };
  socket.on("send_adminCheck_ctrl", async function (data) {
    await adminCheck_ctrl(data, socket);
  });
  socket.on("send_show_list_ctrl", function () {
    socket.emit("rev_show_list_ctrl", getRoomList());
  });
  socket.on("send_re_show_list_ctrl", function (data) {
    deleteCtrl(data.RoomID);
    isPad_ctrl.is = false;
    isPad_ctrl.RoomID = null;
    socket.emit("rev_re_show_list_ctrl", getRoomList());
  });
  socket.on("send_show_room_ctrl", function (data) {
    if (isExistCtrl(data.RoomID)) {
      return socket.emit("EnterFail_ctrl");
    }
    isPad_ctrl.is = true;
    isPad_ctrl.RoomID = data.RoomID;
    setCtrl(data.RoomID, socket);

    socket.emit("rev_show_room_ctrl", GetRoom(data.RoomID));
  });
  socket.on("send_manual_result_ctrl", function (data) {
    GetRoom(data.RoomID).resultWinner(data, false, true);
  });
  socket.on("ForceShoeChange_ctrl", function (data) {
    GetRoom(data.RoomID).ForceShoeChange_ctrl();
  });
  socket.on("ForceResultDelete_ctrl", function (data) {
    deleteResult_ctrl(data);
  });
  socket.on("setPrivate_ctrl", function (data) {
    // PrivateUpdate(data);
  });
  socket.on("setCommition_ctrl", function (data) {
    // CommitionUpdate(data);
  });
  socket.on("setSixType_ctrl", function (data) {
    // SixTypeUpdate(data);
  });
  socket.on("setLimit_ctrl", function (data) {
    // LimitUpdate(data, socket);
  });
  /* */
  let pingTimeout;
  const startPingCheck = () => {
    if (pingTimeout) clearTimeout(pingTimeout); // 기존 타이머 초기화
    pingTimeout = setTimeout(() => {
      if (socket.connected) {
        socket.disconnect("ping");
      } // 응답이 없으면 강제 disconnect
    }, 10000); // 10초 동안 응답이 없으면 disconnect
  };

  //Client require Code
  //LoginPage
  socket.on("Ping", function () {
    socket.emit("Pong"); // Pong 응답
    if (context.Type === "u") startPingCheck(); // 타이머 재설정
  });
  //login
  socket.on("LoginRequest", async function (data) {
    data.ip = context.ip;
    context.Type = "u";
    try {
      await getLock().lockAndExecute(data.sUserID, async () => {
        await Login_search_user(data, socket);
      });
    } catch (e) {
      console.error(`Error during LoginRequest:`, e);
    }
  });
  socket.on("GetUserInfo", async function (data) {
    if (!data.sUserID || !data.token) return;

    context.Private_Name = data.sUserID;
    context.token = data.token;

    data.ip = context.ip;
    context.Type = "u";

    if (GetSockets_Name(data.sUserID)) {
      RemoveSockets_Name(data.sUserID);
    }
    SetSockets_Name(data.sUserID, socket);
    await set_start_game(data, socket).then(async () => {
      await tb_login_log(data, socket);
    });
  });
  socket.on("AbatarFill", async function () {
    await AbatarFill(null, socket);
  });

  socket.on("EnterRoom", async function (data) {
    const isBet = findBettingByUser(context.Private_Name);
    try {
      await getLock()
        .lockAndExecute(context.Private_Name, async () => {
          await GetRoom(data.RoomID).EnterRoom(
            {
              sUserID: context.Private_Name,
              sUserCode: data.sUserCode,
              type: "u",
              money: data.money,
              RoomID: data.RoomID,
              ip: context.ip,
              bApiUser: "0",
              name: data.name,
              multiBet: data.multiBet,
              isBetRoom: isBet ? isBet.RoomID : "",
            },
            socket,
          );
        })
        .then(() => {
          context.RoomID = data.RoomID;
        });
    } catch (e) {
      console.error(`Error during EnterRoom:`, e);
    }
  });
  socket.on("ExitRoom", async function () {
    try {
      await getLock()
        .lockAndExecute(context.Private_Name, async () => {
          await GetRoom(context.RoomID).DisConnect(
            {
              sUserID: context.Private_Name,
              type: context.Type,
            },
            socket,
          );
        })
        .then(() => {
          context.RoomID = null;
        });
    } catch (e) {
      console.error(`Error during ExitRoom:`, e);
    }
  });
  socket.on("MoveRoom", async function (data) {
    try {
      await getLock()
        .lockAndExecute(context.Private_Name, async () => {
          await GetRoom(context.RoomID).MoveConnect(
            {
              sUserID: context.Private_Name,
              sUserCode: data.sUserCode,
              type: "u",
              RoomID: data.RoomID,
              ip: context.ip,
              bApiUser: "0",
              name: data.name,
              move: true,
              multiBet: data.multiBet,
            },
            socket,
          );
        })
        .then(() => {
          context.RoomID = data.RoomID;
        });
    } catch (e) {
      console.error(`Error during ExitRoom:`, e);
    }
  });
  socket.on("RefreshUInfo", function (data) {
    RefreshUInfo(data, socket);
  });
  /* 베팅관련 */
  socket.on("send_chipList", function (data) {
    console.log("send_chipList", data);

    chipList(data, socket);
  });
  socket.on("MoneyCheck", async function (data) {
    try {
      const room = GetRoom(data.RoomID);
      const dataSum = data.money.reduce((a, b) => a + b.money, 0);

      const U = getURoom().selPlayer(data.sUserID);
      const isBet = findBettingByUser(data.sUserID);

      if (!U) {
        socket.emit("notBet", { msg: "bettingFail" });
        return;
      }

      //처음 베팅할 때
      if (!isBet) {
        if (room && dataSum <= U.money) {
          await room.Betting(data).then((el) => {
            if (el === "bettingFail") {
              socket.emit("notBet", { msg: el });
            } else if (el === "Success") {
              U.isBetRoom = data.RoomID;
              socket.emit("OkBet");
            } else if (el === "BetLimitOver") {
              socket.emit("notBet", { msg: el });
            }
          });
        } else {
          socket.emit("notBet", { msg: "bettingFail" });
          return;
        }
      }
      //처음 베팅이 아닐때(1,2,3---번째,다른룸베팅)
      else {
        //멀티벳 불가자
        if (U.multiBet === 0 || U.multiBet === "0") {
          //원래 방에다가 베팅이라면 계속
          if (U.isBetRoom === data.RoomID || !U.isBetRoom) {
            if (room && dataSum <= U.money) {
              await room.Betting(data).then((el) => {
                if (el === "bettingFail") {
                  socket.emit("notBet", { msg: el });
                } else if (el === "Success") {
                  U.isBetRoom = data.RoomID;
                  socket.emit("OkBet");
                } else if (el === "BetLimitOver") {
                  socket.emit("notBet", { msg: el });
                }
              });
            } else {
              socket.emit("notBet", { msg: "bettingFail" });
              return;
            }
          } else {
            socket.emit("notBet", { msg: "bettingFail" });
            return;
          }
        }
        //멀티벳 가능자
        else {
          //계속베팅해
          if (room && dataSum <= U.money) {
            await room.Betting(data).then((el) => {
              if (el === "bettingFail") {
                socket.emit("notBet", { msg: el });
              } else if (el === "Success") {
                U.isBetRoom = data.RoomID;
                socket.emit("OkBet");
              } else if (el === "BetLimitOver") {
                socket.emit("notBet", { msg: el });
              }
            });
          } else {
            socket.emit("notBet", { msg: "bettingFail" });
          }
        }
      }
    } catch (e) {
      console.log("e", e);
    }
  });
  socket.on("cancelBet", async function (data) {
    const U = getURoom().selPlayer(data.sUserID);

    await GetRoom(data.RoomID)
      .cancelBet(data)
      .then((el) => {
        if (el === "CacelBetFail") {
          socket.emit("notCancelBet", { msg: el });
        } else if (el === "CancelBetSuccess") {
          if (U) U.isBetRoom = "";
          socket.emit("OkCancelBet", { msg: el });
        }
      });
  });
  socket.on("betLog", function (data) {
    betLog(data, socket);
  });

  //dealer
  socket.on("token_check", function (data) {
    context.ip = context.ip;
    context.Type = data.type;
    context.token = data.token;
    token_check(data, socket);
  });

  socket.on("login", async function (data) {
    if (context.Type === "d") {
      context.Private_Name = data.sUserID;
      SetSockets_Name(data.sUserID, socket);
    }

    context.RoomID = data.RoomID;

    context.SendData = {
      ip: context.ip,
      sUserID: data.sUserID,
      RoomID: context.RoomID,
    };

    if (context.Type === "u") {
      await Ploadmoney(context.SendData, socket);
      first_change_game(context.SendData);
    } else if (context.Type === "d") {
      DealerLogin(context.SendData, socket);
    }
  });
  socket.on("RoomActiveOnOff", function (data) {
    if (data.RoomID) {
      GetRoom(data.RoomID).RoomActiveOnOff(data);
    }
  });
  socket.on("ResultWinner", function (data) {
    GetRoom(data.RoomID).resultWinner(data, false);
  });
  socket.on("Shuffle", function (data) {
    GetRoom(data.RoomID).Shuffle();
  });
  socket.on("Ready", function (data) {
    GetRoom(data.RoomID).Ready();
  });
  socket.on("Start", function (data) {
    GetRoom(data.RoomID).Start();
  });

  socket.on("disconnect", async function () {
    // console.log("disconnect!!::", context);

    try {
      if (context.Type === "u") {
        if (context.Private_Name) {
          try {
            await getLock()
              .lockAndExecute(context.Private_Name, async () => {
                if (context.RoomID) {
                  await GetRoom(context.RoomID).DisConnect({
                    type: context.Type,
                    sUserID: context.Private_Name,
                    ip: context.ip,
                    move: false,
                  });
                }
                const isBet = findBettingByUser(context.Private_Name);
                if (!isBet) {
                  getURoom().outPlayer(context.Private_Name);
                  outdel(context.Private_Name);
                } else {
                  outset(context.Private_Name);
                }

                await set_end_game({ sUserID: context.Private_Name }).then(
                  async () => {
                    await removeUser(context.Private_Name);
                  },
                );
                await tb_login_log({
                  ip: context.ip,
                  sUserID: context.Private_Name,
                  sUserCode: "",
                  TN: context.RoomID || "0",
                  sDescriptions: "LogOut",
                });
              })
              .then((el) => {
                socket.leave(context.RoomID);
                context.RoomID = null;
              });
          } catch (error) {
            console.error(`Error during exitRoom:`, err);
          }
        }
      }

      if (context.Type === "d") {
        if (context.RoomID) {
          await GetRoom(context.RoomID).DisConnect({
            type: context.Type,
            sUserID: context.Private_Name,
            ip: context.ip,
            move: false,
          });
        }

        DealerUpdateOnOff({
          onoff: 0,
          RoomID: context.RoomID,
          reason: "socket disconnect",
          ip: context.ip,
        });
      }
    } catch (err) {
      console.error("Error during disconnect handling:", err);
    } finally {
      if (isPad_ctrl.is) {
        deleteCtrl(isPad_ctrl.RoomID);
        isPad_ctrl.is = false;
        isPad_ctrl.RoomID = null;
      }

      if (isPad.is) {
        deletePad(isPad.RoomID);
        isPad.is = false;
        isPad.RoomID = null;
      }

      RemoveSockets_Name(context.Private_Name);
      clearTimeout(pingTimeout);
      context.Private_Name = null;
      context.token = null;
      context.RoomID = null;
    }
  });
});
