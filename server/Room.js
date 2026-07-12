import { Emit, GetSockets_Name } from "./EmitManager.js";
import {
  card_range,
  csl,
  initCard,
  setCard,
  setWin,
  GetIdEmit,
  delAutos,
  groupAndSum,
  winCalc,
  drawCards,
  isWhoTurn,
  convertReceiveToSerial,
  WhenCal,
  getPad,
  findBettingByUser,
  outhas,
  outdel,
  StartPlaying,
} from "./Utility.js";
import {
  tb_baccarat_progress_log,
  Select_Room,
  Cutcard_log,
  sp_dealer_tip_log,
  statusUpdate,
  updateRoomList,
  SQL_addAuto,
  delAuto,
  sp_auto_disconnect,
  RoomActiveOnOff,
  UpdatebResult,
  game_notice,
  tb_login_log,
  returnList,
  UpdateApibResult,
  EnterRoom,
  ExitRoom,
  DuplicateShoe,
} from "./SQL.js";
// import axios from "axios";
import { SevUrl } from "./SevUrl.js";
import { findRoomById } from "./Manager.js";
import { getRRoom } from "./RRoom.js";
import { getURoom } from "./URoom.js";
let SendData;
const RATE_PAIR = 12;
const RATE_TIE = 9;
const RATE_PLAYER = 2;
const RATE_BANKER = 1.95;
export default class Room {
  constructor(info) {
    this.serialScanner = null;
    //방정보
    this.id = info.id;
    this.RoomID = info.room_id;
    this.stream_id = info.stream_id;
    this.sStreamArn = info.sStreamArn;
    this.RoomNumber = info.sRoomNumber.trim();
    this.nBettingTime = info.nBettingTime;
    this.nWinnerShowTime = info.nWinnerShowTime;
    this.newBetTime = info.nBettingTime;
    this.newWinTime = info.nWinnerShowTime;
    this.active = info.active;
    this.status = info.status;
    this.nAutoPlayerSettingCnt = info.nAutoPlayerSettingCnt;
    this.sVideoType = info.sVideoType;
    this.sSite = info.sSite;
    //////////////////////////////////////
    this.sLogNumber = "";
    this.MainNotice = "";
    this.players = new Map();
    //바카라 게임정보
    this.GameType = info.GameType;
    this.CopyGameType = info.GameType;
    this.GamePossible = false;
    this.ShuffleOn = true;
    this.StartOn = false;
    this.ReadyOn = false;
    this.StateMessage = "";
    //시간정보
    this.TimerInfo = { Time: -1, State: false };

    this.EndTimerInfo = { Time: -1, State: false };
    //-dealer
    this.DealerName = "";
    this.DealerID = "";
    this.DealerTip = [];
    this.Playing = false;
    this.Auto = true;
    this.CBMap = new Map([
      ["Player_Pair", { users: new Map(), total: 0 }],
      ["Player", { users: new Map(), total: 0 }],
      ["Tie", { users: new Map(), total: 0 }],
      ["Banker", { users: new Map(), total: 0 }],
      ["Banker_Pair", { users: new Map(), total: 0 }],
    ]);

    this.videoPath = "";
    this.videoErr = "Normal";

    //each Scanner
    this.winPText = "";
    this.winBText = "";

    this.winSupportText = "";
    this.winCardText = "";
    this.cardCount = 1;
    this.PlayerSum = 0;
    this.BankerSum = 0;
    this.PlayerCardSum = [];
    this.BankerCardSum = [];

    this.LimitBet = {
      USD: {
        min: 0,
        max: 0,
        min_tie: 0,
        max_tie: 0,
        min_pair: 0,
        max_pair: 0,
      },
      KRW: {
        min: 0,
        max: 0,
        min_tie: 0,
        max_tie: 0,
        min_pair: 0,
        max_pair: 0,
      },
      CNY: {
        min: 0,
        max: 0,
        min_tie: 0,
        max_tie: 0,
        min_pair: 0,
        max_pair: 0,
      },
      JPY: {
        min: 0,
        max: 0,
        min_tie: 0,
        max_tie: 0,
        min_pair: 0,
        max_pair: 0,
      },
    };

    this.ShoeNumber = "";
    this.ShoeGameNumber = 0;
    this.userCount = 0;
    this.padCount = 0;
    this.padCountSet = false;
    this.padUser = {};
    this.PADMap = new Map([
      ["Player_Pair", { users: new Map(), total: 0 }],
      ["Player", { users: new Map(), total: 0 }],
      ["Tie", { users: new Map(), total: 0 }],
      ["Banker", { users: new Map(), total: 0 }],
      ["Banker_Pair", { users: new Map(), total: 0 }],
    ]);
  }

  limitSet(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].room_id === this.RoomID) {
        switch (data[i].currency) {
          case "USD":
            this.LimitBet.USD.min = data[i].min;
            this.LimitBet.USD.max = data[i].max;
            this.LimitBet.USD.min_tie = data[i].min_tie;
            this.LimitBet.USD.max_tie = data[i].max_tie;
            this.LimitBet.USD.min_pair = data[i].min_pair;
            this.LimitBet.USD.max_pair = data[i].max_pair;
            break;
          case "KRW":
            this.LimitBet.KRW.min = data[i].min;
            this.LimitBet.KRW.max = data[i].max;
            this.LimitBet.KRW.min_tie = data[i].min_tie;
            this.LimitBet.KRW.max_tie = data[i].max_tie;
            this.LimitBet.KRW.min_pair = data[i].min_pair;
            this.LimitBet.KRW.max_pair = data[i].max_pair;
            break;
          case "CNY":
            this.LimitBet.CNY.min = data[i].min;
            this.LimitBet.CNY.max = data[i].max;
            this.LimitBet.CNY.min_tie = data[i].min_tie;
            this.LimitBet.CNY.max_tie = data[i].max_tie;
            this.LimitBet.CNY.min_pair = data[i].min_pair;
            this.LimitBet.CNY.max_pair = data[i].max_pair;
            break;
          case "JPY":
            this.LimitBet.JPY.min = data[i].min;
            this.LimitBet.JPY.max = data[i].max;
            this.LimitBet.JPY.min_tie = data[i].min_tie;
            this.LimitBet.JPY.max_tie = data[i].max_tie;
            this.LimitBet.JPY.min_pair = data[i].min_pair;
            this.LimitBet.JPY.max_pair = data[i].max_pair;
            break;
        }
      }
    }
  }
  connectProcess(data, money) {
    outFilter(data.sUserID);
    this.players.delete(data.sUserID); // Remove existing entry if present
    this.players.set(data.sUserID, data); // Use Map to store player
  }
  connectPlayer(data, money) {
    this.connectProcess(data, money);
    tb_login_log({
      ip: data.ip,
      sUserID: data.sUserID,
      sUserCode: data.sUserCode,
      TN: this.RoomID,
      sDescriptions: "GameIn",
    });
    return this.invasion();
  }
  stopPlaying() {
    this.Playing = false;
    statusUpdate({
      RoomID: this.RoomID,
      status: this.status,
      sSite: this.sSite,
      Playing: false,
    });
  }
  async EnterRoom(data, socket) {
    // console.log("EnterRoom", data);
    let betData = getRRoom().selPlayer(data.sUserID, this.RoomID);

    if (betData) {
      betData = getRRoom().selPlayer(data.sUserID, this.RoomID).Betting;
    } else {
      betData = new Map([
        ["Player_Pair", { money: 0, rate: 12 }],
        ["Player", { money: 0, rate: 2 }],
        ["Tie", { money: 0, rate: 9 }],
        ["Banker", { money: 0, rate: 1.95 }],
        ["Banker_Pair", { money: 0, rate: 12 }],
      ]);
    }
    if (data.type == "u") {
      this.userCount += 1;
      this.players.delete(data.sUserID);
      this.players.set(data.sUserID, {
        ip: data.ip,
        sUserID: data.sUserID,
        name: data.name,
        sUserCode: data.sUserCode,
        bApiUser: data.bApiUser,

        RoomID: this.RoomID,
        Betting: betData,
      });
      await EnterRoom(
        {
          RoomID: this.RoomID,
          sUserID: data.sUserID,
          move: data.move,
        },
        socket,
      );

      if (!data.move) {
        getURoom().inPlayer(
          {
            sUserID: data.sUserID,
            sUserCode: data.sUserCode,
            ip: data.ip,
            name: data.name,
            RoomID: this.RoomID,
            bApiUser: data.bApiUser,
            multiBet: data.multiBet,
            isBetRoom: data.isBetRoom,
          },
          data.money,
        );
      } else {
        const U = getURoom().selPlayer(data.sUserID);

        getURoom().inPlayer(
          {
            sUserID: data.sUserID,

            sUserCode: U.sUserCode,
            ip: U.ip,
            name: U.name,
            RoomID: this.RoomID,
            bApiUser: U.bApiUser,
            multiBet: U.multiBet,
            isBetRoom: U.isBetRoom,
          },
          U.money,
        );
      }
    }
  }

  invasion() {
    return (SendData = {
      // RoomInfo
      StartOn: this.StartOn,
      ShuffleOn: this.ShuffleOn,
      ReadyOn: this.ReadyOn,
      DealerName: this.DealerName,
      Time: this.TimerInfo.State ? this.TimerInfo : this.EndTimerInfo, //진행중인 타이머
      EndTime: this.EndTimerInfo,
      CBMap: Object.fromEntries(
        Array.from(this.CBMap, ([key, value]) => [
          key,
          {
            users: Object.fromEntries(value.users),
            total: value.total,
          },
        ]),
      ),
      LogNumber: this.sLogNumber,
      message: this.StateMessage,
      onoff: this.Auto,
      active: this.active,
    });
  }
  //Api
  changeLimit(info) {
    this.LimitBet.KRW.min = Number(info.min);
    this.LimitBet.KRW.max = Number(info.max);
    this.LimitBet.KRW.min_tie = Number(info.min_tie);
    this.LimitBet.KRW.max_tie = Number(info.max_tie);
    this.LimitBet.KRW.min_pair = Number(info.min_pair);
    this.LimitBet.KRW.max_pair = Number(info.max_pair);

    SendData = {
      type: "tableLimit",
      s_room: this,
      RoomID: this.RoomID,
      sSite: this.sSite,
    };
    returnList(SendData);
  }
  //Room Refresh When GameEnd
  changeBetTime(info) {
    this.newBetTime = info.nBettingTime;
    this.newWinTime = info.nWinnerShowTime;

    this.active = info.active;
    const autoCount = info.nAutoPlayerSettingCnt - this.nAutoPlayerSettingCnt;
    if (autoCount > 0) {
      this.R_addAuto(autoCount);
    } else if (autoCount < 0) {
      this.delAuto(autoCount * -1);
    }

    this.nAutoPlayerSettingCnt = info.nAutoPlayerSettingCnt;
  }
  updatePlayers(sUserID) {
    const U = getURoom();
    if (sUserID === this.RoomNumber) {
      return;
    }
    const player = this.players.get(sUserID);
    const money = U.selPlayer(sUserID).money;
    U.selPlayer(sUserID).isBetRoom = "";
    // console.log("U.selPlayer(sUserID)", U.selPlayer(sUserID));

    if (player) {
      const playerData = {
        ip: player.ip,
        RoomID: this.RoomID,
        token: player.mb_token,
        sUserID: sUserID,
        name: player.name,
        money: money,
        sUserCode: player.sUserCode,
        Betting: new Map([
          ["Player_Pair", { money: 0, rate: RATE_PAIR }],
          ["Player", { money: 0, rate: RATE_PLAYER }],
          ["Tie", { money: 0, rate: RATE_TIE }],
          ["Banker", { money: 0, rate: RATE_BANKER }],
          ["Banker_Pair", { money: 0, rate: RATE_PAIR }],
        ]),
        total: 0,
      };
      this.players.set(sUserID, playerData);
    }

    if (outhas(sUserID)) {
      U.outPlayer(sUserID);
      outdel(sUserID);
    }
  }
  reMoney() {
    this.players.forEach((player) => {
      if (player) {
        player.total = 0;
        player.Betting.forEach((playerBet) => {
          // Map의 forEach 사용
          playerBet.money = 0;
        });
      }
    });
  }
  //bettings
  // async loadBetting(sUserID) {
  //   // const player = this.players.get(sUserID);
  //   // return player ? player.Betting : null;
  // }
  async Betting(data) {
    try {
      const player = this.players.get(data.sUserID);

      if (!player && !data.auto) {
        console.warn(
          `Betting Player ${data.sUserID} not found in room ${this.RoomID}`,
        );
        // GetSockets_Name(data.sUserID).emit('notBet');
        return "bettingFail";
      }
      if (!this.TimerInfo.State) {
        // if(true){
        console.warn(
          `Betting attempt outside of betting period by player ${data.sUserID}`,
        );
        // GetSockets_Name(data.sUserID).emit('notBet');
        return "bettingFail";
      }

      const peso = data.sUserCode.slice(0, 9) === "001002001";
      if (peso) {
        for (const bet of data.combind) {
          const PAD = this.PADMap.get(bet.name);
          let MAX_TOTAL = 0;
          switch (bet.name) {
            case "Player":
            case "Banker":
              MAX_TOTAL = this.LimitBet.KRW.max;
              break;
            case "Tie":
              MAX_TOTAL = this.LimitBet.KRW.max_tie;
              break;
            case "Player_Pair":
            case "Banker_Pair":
              MAX_TOTAL = this.LimitBet.KRW.max_pair;
              break;
            default:
              return "BetLimitOver";
              break;
          }
          if (bet.name === "Player") {
            MAX_TOTAL += this.PADMap.get("Banker").total;
          } else if (bet.name === "Banker") {
            MAX_TOTAL += this.PADMap.get("Player").total;
          }

          // PAD가 존재하고, (기존 total + 이번 money) 가 제한 초과라면
          if (PAD && PAD.total + Number(bet.money) > MAX_TOTAL) {
            console.warn(
              `Betting limit exceeded for ${bet.name}: ` +
                `${PAD.total} + ${bet.money} > ${MAX_TOTAL}`,
            );
            return "BetLimitOver";
          }
        }
        //PAD
        data.combind.forEach((bet) => {
          const PAD = this.PADMap.get(bet.name);
          if (PAD) {
            const existingMoney = PAD.users.get(data.sUserID) || 0;
            PAD.users.set(data.sUserID, existingMoney + Number(bet.money));
            PAD.total += Number(bet.money);
          }
        });
        for (const [name, playerBet] of player.Betting) {
          // Map을 활용한 for...of 루프
          const bet = data.combind.find((b) => b.name === name); // `name`으로 직접 매칭
          if (bet) {
            // player.total += bet.money;
            playerBet.money += bet.money;
            player.Betting.set(name, playerBet); // Map 업데이트
            await getRRoom().Betting({
              sUserID: data.sUserID,
              bet: bet,
              Rinfo: this,
              rate: playerBet.rate,
              BetData: player.Betting,
            });
          }
        }

        if (getPad(this.RoomID)) {
          getPad(this.RoomID).emit("padBetting", {
            RoomID: this.RoomID,
            PADMap: this.getRoomPADData().PADMap,
          });
        }
        GetIdEmit(data.sUserID, "padBetting", {
          RoomID: this.RoomID,
          PADMap: this.getRoomPADData().PADMap,
        });

        this.padCount = 0;
        this.padCountSet = false;

        return "Success";
      }

      for (const bet of data.combind) {
        const CB = this.CBMap.get(bet.name);
        let MAX_TOTAL = 0;
        switch (bet.name) {
          case "Player":
          case "Banker":
            MAX_TOTAL = this.LimitBet.KRW.max;
            break;
          case "Tie":
            MAX_TOTAL = this.LimitBet.KRW.max_tie;
            break;
          case "Player_Pair":
          case "Banker_Pair":
            MAX_TOTAL = this.LimitBet.KRW.max_pair;
            break;
          default:
            console.warn(`Unknown bet type: ${bet.name}`);
            break;
        }
        if (bet.name === "Player") {
          MAX_TOTAL += this.CBMap.get("Banker").total;
        } else if (bet.name === "Banker") {
          MAX_TOTAL += this.CBMap.get("Player").total;
        }

        // CB가 존재하고, (기존 total + 이번 money) 가 제한 초과라면
        if (CB && CB.total + Number(bet.money) > MAX_TOTAL) {
          console.warn(
            `Betting limit exceeded for ${bet.name}: ` +
              `${CB.total} + ${bet.money} > ${MAX_TOTAL}`,
          );
          return "BetLimitOver";
        }
      }
      for (const [name, playerBet] of player.Betting) {
        // Map을 활용한 for...of 루프
        const bet = data.combind.find((b) => b.name === name); // `name`으로 직접 매칭
        if (bet) {
          // player.total += bet.money;
          playerBet.money += bet.money;
          player.Betting.set(name, playerBet); // Map 업데이트
          await getRRoom().Betting({
            sUserID: data.sUserID,
            bet: bet,
            Rinfo: this,
            rate: playerBet.rate,
            BetData: player.Betting,
          });
        }
      }

      //CB
      data.combind.forEach((bet) => {
        const CB = this.CBMap.get(bet.name);
        if (CB) {
          const existingMoney = CB.users.get(data.sUserID) || 0;
          CB.users.set(data.sUserID, existingMoney + Number(bet.money));
          CB.total += Number(bet.money);
        }
      });

      updateRoomList({
        RoomID: this.RoomID,
        nPlayerCount: this.CBMap.get("Player").users.size,
        nBankerCount: this.CBMap.get("Banker").users.size,
        nTieCount: this.CBMap.get("Tie").users.size,
        nPPCount: this.CBMap.get("Player_Pair").users.size,
        nBPCount: this.CBMap.get("Banker_Pair").users.size,
        nPlayerMoney: this.CBMap.get("Player").total,
        nBankerMoney: this.CBMap.get("Banker").total,
        nTieMoney: this.CBMap.get("Tie").total,
        nPPMoney: this.CBMap.get("Player_Pair").total,
        nBPMoney: this.CBMap.get("Banker_Pair").total,
        CBMap: this.CBMap,
      });

      getURoom().selPlayer(data.sUserID).isBetRoom = this.RoomID;

      return "Success";
    } catch (error) {
      console.warn(`Betting try Error: ${error}`);
      return "bettingFail";
    }
  }

  async cancelBet(data) {
    const BETTING_PERIOD_ERROR = "cancelBet attempt outside of betting period";
    const PLAYER_NOT_FOUND_ERROR = "cancelBet Player not found in room";
    try {
      const player = this.players.get(data.sUserID);
      if (!player) {
        console.error(
          `${PLAYER_NOT_FOUND_ERROR} ${data.sUserID} in room ${this.RoomID}`,
        );
        return "CacelBetFail";
      }
      if (!this.TimerInfo.State) {
        console.warn(`${BETTING_PERIOD_ERROR} by player ${data.sUserID}`);
        return "CacelBetFail";
      }
      const userInfo = getURoom().selPlayer(data.sUserID);

      const playerData = {
        ip: player.ip,
        RoomID: this.RoomID,
        token: player.mb_token,
        sUserID: data.sUserID,
        name: player.name,
        money: userInfo.money,
        sUserCode: player.sUserCode,
        Betting: new Map([
          ["Player_Pair", { money: 0, rate: RATE_PAIR }],
          ["Player", { money: 0, rate: RATE_PLAYER }],
          ["Tie", { money: 0, rate: RATE_TIE }],
          ["Banker", { money: 0, rate: RATE_BANKER }],
          ["Banker_Pair", { money: 0, rate: RATE_PAIR }],
        ]),
        total: 0,
      };

      this.players.delete(data.sUserID);
      this.players.set(data.sUserID, playerData);

      await getRRoom().cancelBetting({
        sUserID: data.sUserID,
        RoomID: this.RoomID,

        Rinfo: this,
      });

      const peso = data.sUserCode.slice(0, 9) === "001002001";
      if (peso) {
        this.PADMap.forEach((bet) => {
          const userBet = bet.users.get(data.sUserID);
          if (userBet) {
            bet.total -= userBet;
            bet.users.delete(data.sUserID);
          }
        });

        if (getPad(this.RoomID)) {
          getPad(this.RoomID).emit("padBetting", {
            RoomID: this.RoomID,
            PADMap: this.getRoomPADData().PADMap,
          });
        }

        GetIdEmit(data.sUserID, "padBetting", {
          RoomID: this.RoomID,
          PADMap: this.getRoomPADData().PADMap,
        });
      } else {
        this.CBMap.forEach((bet) => {
          const userBet = bet.users.get(data.sUserID);
          if (userBet) {
            bet.total -= userBet;
            bet.users.delete(data.sUserID);
          }
        });

        updateRoomList({
          RoomID: this.RoomID,
          nPlayerCount: this.CBMap.get("Player").users.size,
          nBankerCount: this.CBMap.get("Banker").users.size,
          nTieCount: this.CBMap.get("Tie").users.size,
          nPPCount: this.CBMap.get("Player_Pair").users.size,
          nBPCount: this.CBMap.get("Banker_Pair").users.size,
          nPlayerMoney: this.CBMap.get("Player").total,
          nBankerMoney: this.CBMap.get("Banker").total,
          nTieMoney: this.CBMap.get("Tie").total,
          nPPMoney: this.CBMap.get("Player_Pair").total,
          nBPMoney: this.CBMap.get("Banker_Pair").total,
          CBMap: this.CBMap,
        });
        getURoom().selPlayer(data.sUserID).isBetRoom = "";
      }
      return "CancelBetSuccess";
    } catch (error) {
      console.warn(`Betting try Error: ${error}`);
      return "CacelBetFail";
    }
  }
  async tip(data) {
    await getURoom().updateMoney(data.sUserID, data.BetMoney);
    sp_dealer_tip_log({
      sUserID: data.sUserID,
      nTableNumber: this.RoomID.slice(9),
      sDealerID: this.DealerID,
      nTips: data.BetMoney,
    });
    Emit("Dealer", "tip", this.RoomID, {
      sUserID: data.sUserID,
      money: data.BetMoney,
    });
  }
  cardShare(data) {
    if (this.cardCount == 1) {
      //init
      this.winPText = "";
      this.winBText = "";
      this.winSupportText = "";
      this.winCardText = "";
      this.PlayerSum = 0;
      this.BankerSum = 0;
      this.PlayerCardSum = [];
      this.BankerCardSum = [];

      this.winPText += data.Origin;
      this.PlayerSum = parseInt(data.number) >= 10 ? 0 : parseInt(data.number);
      this.PlayerCardSum[0] = this.PlayerSum;
    } else if (this.cardCount == 2) {
      this.winBText += data.Origin;
      this.BankerSum = parseInt(data.number) >= 10 ? 0 : parseInt(data.number);
      this.BankerCardSum[0] = this.BankerSum;
    } else if (this.cardCount == 3) {
      this.winPText += data.Origin;
      this.PlayerSum = parseInt(data.number) >= 10 ? 0 : parseInt(data.number);
      this.PlayerCardSum[1] = this.PlayerSum;
      if (this.winPText.slice(1, 2) == data.Origin.slice(1, 2)) {
        this.winSupportText += "5";
      }
      this.winPText += "zz";
    } else if (this.cardCount == 4) {
      this.winBText += data.Origin;
      this.BankerSum = parseInt(data.number) >= 10 ? 0 : parseInt(data.number);
      this.BankerCardSum[1] = this.BankerSum;
      if (this.winBText.slice(1, 2) == data.Origin.slice(1, 2)) {
        if (this.winSupportText !== "") {
          this.winSupportText = "45";
        } else {
          this.winSupportText += "4";
        }
      }
      this.winBText += "zz";
    } else if (this.cardCount == 5) {
      let arr = this.winPText.split("");
      arr[4] = data.Origin.slice(0, 1);
      arr[5] = data.Origin.slice(1, 2);
      this.winPText = arr.join("");

      this.PlayerSum = parseInt(data.number) >= 10 ? 0 : parseInt(data.number);
      this.PlayerCardSum[2] = this.PlayerSum;
    } else if (this.cardCount == 6) {
      let arr = this.winBText.split("");
      arr[4] = data.Origin.slice(0, 1);
      arr[5] = data.Origin.slice(1, 2);
      this.winBText = arr.join("");

      this.BankerSum = parseInt(data.number) >= 10 ? 0 : parseInt(data.number);
      this.BankerCardSum[2] = this.BankerSum;
    }

    SendData = {
      end: this.winPText + this.winBText,
      RoomID: this.RoomID,
      type: "Typing",
      err: "",
    };

    const pSum = this.PlayerSum % 10;
    const bSum = this.BankerSum % 10;

    if (this.cardCount == 4) {
      if (WhenCal(pSum, [8, 9])) {
        return this.resultWinner(SendData);
      } else if (WhenCal(bSum, [8, 9])) {
        return this.resultWinner(SendData);
      } else if (WhenCal(pSum, [6, 7])) {
        if (WhenCal(bSum, [6, 7])) {
          return this.resultWinner(SendData);
        } else if (WhenCal(bSum, [0, 1, 2, 3, 4, 5])) {
          if (this.GameType == "Insurance") {
            //플레이어의 뱅커가 이기질지도 모르니 보험베팅
            if (WhenCal(pSum, [6])) {
              this.InsPossible = true;
              this.cardCount += 2;
              this.INSUR(3, "Player", "before", false);
            } else if (WhenCal(pSum, [7])) {
              this.InsPossible = true;
              this.cardCount += 2;
              this.INSUR(4, "Player", "before", false);
            } else {
              this.cardCount += 2;
              Emit("All", "CountChange", this.RoomID, {
                Count: this.cardCount,
              });
            }
          } else {
            this.cardCount += 2;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        }
      } else if (WhenCal(pSum, [0, 1, 2, 3, 4, 5])) {
        if (this.GameType == "Insurance") {
          //뱅커의 플레이어가 이기질지도 모르니 보험베팅
          if (WhenCal(bSum, [4]) && WhenCal(pSum, [0, 1, 2, 3])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(1.5, "Banker", "before", false);
          } else if (WhenCal(bSum, [5]) && WhenCal(pSum, [0, 1, 2, 3, 4])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(2, "Banker", "before", false);
          } else if (WhenCal(bSum, [6]) && WhenCal(pSum, [0, 1, 2, 3, 4, 5])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(3, "Banker", "before", false);
          } else if (WhenCal(bSum, [7]) && WhenCal(pSum, [0, 1, 2, 3, 4, 5])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(4, "Banker", "before", false);
          } else {
            this.cardCount += 1;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        } else {
          this.cardCount += 1;
          Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
        }
      }
    } else if (this.cardCount == 5) {
      if (WhenCal(bSum, [0, 1, 2])) {
        if (this.GameType == "Insurance") {
          if (WhenCal(pSum, [4])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(1.5, "Player", "after", false);
          } else if (WhenCal(pSum, [5])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(2, "Player", "after", false);
          } else if (WhenCal(pSum, [6])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(3, "Player", "after", false);
          } else if (WhenCal(pSum, [7])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(4, "Player", "after", false);
          } else if (WhenCal(pSum, [8])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(8, "Player", "after", false);
          } else if (WhenCal(pSum, [9])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(10, "Player", "after", false);
          } else if (WhenCal(bSum, [1]) && WhenCal(pSum, [1])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(7, "Banker", "after", false);
          } else if (WhenCal(bSum, [1, 2]) && WhenCal(pSum, [0])) {
            this.InsPossible = true;
            this.cardCount += 1;
            this.INSUR(10, "Banker", "after", false);
          } else {
            this.cardCount += 1;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        } else {
          this.cardCount += 1;
          Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
        }
      } else if (bSum == 3) {
        if (WhenCal(this.PlayerCardSum[2], [0, 1, 2, 3, 4, 5, 6, 7, 9])) {
          if (this.GameType == "Insurance") {
            if (WhenCal(pSum, [4])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(1.5, "Player", "after", false);
            } else if (WhenCal(pSum, [5])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(2, "Player", "after", false);
            } else if (WhenCal(pSum, [6])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(3, "Player", "after", false);
            } else if (WhenCal(pSum, [7])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(4, "Player", "after", false);
            } else if (WhenCal(pSum, [8])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(8, "Player", "after", false);
            } else if (WhenCal(pSum, [9])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(10, "Player", "after", false);
            } else if (WhenCal(pSum, [0])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(10, "Banker", "after", false);
            } else {
              this.cardCount += 1;
              Emit("All", "CountChange", this.RoomID, {
                Count: this.cardCount,
              });
            }
          } else {
            this.cardCount += 1;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        } else if (this.PlayerCardSum[2] == 8) {
          return this.resultWinner(SendData);
        }
      } else if (bSum == 4) {
        if (WhenCal(this.PlayerCardSum[2], [2, 3, 4, 5, 6, 7])) {
          if (this.GameType == "Insurance") {
            if (WhenCal(pSum, [5])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(2, "Player", "after", false);
            } else if (WhenCal(pSum, [6])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(3, "Player", "after", false);
            } else if (WhenCal(pSum, [7])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(4, "Player", "after", false);
            } else if (WhenCal(pSum, [8])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(8, "Player", "after", false);
            } else if (WhenCal(pSum, [9])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(10, "Player", "after", false);
            } else {
              this.cardCount += 1;
              Emit("All", "CountChange", this.RoomID, {
                Count: this.cardCount,
              });
            }
          } else {
            this.cardCount += 1;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        } else if (WhenCal(this.PlayerCardSum[2], [0, 1, 8, 9])) {
          return this.resultWinner(SendData);
        }
      } else if (bSum == 5) {
        if (WhenCal(this.PlayerCardSum[2], [4, 5, 6, 7])) {
          if (this.GameType == "Insurance") {
            if (WhenCal(pSum, [6])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(3, "Player", "after", false);
            } else if (WhenCal(pSum, [7])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(4, "Player", "after", false);
            } else if (WhenCal(pSum, [8])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(8, "Player", "after", false);
            } else if (WhenCal(pSum, [9])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(10, "Player", "after", false);
            } else {
              this.cardCount += 1;
              Emit("All", "CountChange", this.RoomID, {
                Count: this.cardCount,
              });
            }
          } else {
            this.cardCount += 1;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        } else if (WhenCal(this.PlayerCardSum[2], [0, 1, 2, 3, 8, 9])) {
          return this.resultWinner(SendData);
        }
      } else if (bSum == 6) {
        if (WhenCal(this.PlayerCardSum[2], [6, 7])) {
          if (this.GameType == "Insurance") {
            if (WhenCal(pSum, [7])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(4, "Player", "after", false);
            } else if (WhenCal(pSum, [8])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(8, "Player", "after", false);
            } else if (WhenCal(pSum, [9])) {
              this.InsPossible = true;
              this.cardCount += 1;
              this.INSUR(10, "Player", "after", false);
            } else {
              this.cardCount += 1;
              Emit("All", "CountChange", this.RoomID, {
                Count: this.cardCount,
              });
            }
          } else {
            this.cardCount += 1;
            Emit("All", "CountChange", this.RoomID, { Count: this.cardCount });
          }
        } else if (WhenCal(this.PlayerCardSum[2], [0, 1, 2, 3, 4, 5, 8, 9])) {
          return this.resultWinner(SendData);
        }
      } else if (bSum == 7) {
        return this.resultWinner(SendData);
      }
    } else if (this.cardCount == 6) {
      return this.resultWinner(SendData);
    }
    if (this.cardCount <= 3) {
      this.cardCount += 1;
    }
  }
  //Timers
  timer(timerInfo, interval, callback) {
    setTimeout(async () => {
      // 시간 정보 업데이트
      const SendData = {
        State: timerInfo["State"],
        Time: timerInfo["Time"],
        RoomID: this.RoomID,
      };

      // 클라이언트로 데이터 전송
      callback(SendData);

      // 타이머가 아직 진행 중인 경우, 재귀적으로 호출
      if (timerInfo["Time"] > 0) {
        this.timer(timerInfo, interval, callback);
      }

      // 시간 감소
      timerInfo["Time"] -= interval / 1000;

      if (timerInfo["Time"] <= 0) {
        // 타이머가 종료된 경우, 상태를 false로 업데이트
        timerInfo["State"] = false;
        timerInfo["Time"] = 0;
      }
    }, interval);
  }
  EndTimers() {
    this.timer(this.EndTimerInfo, 1000, (SendData) => {
      if (this.EndTimerInfo["Time"] > 0) {
        if (this.ShuffleOn || this.active === 0) {
          this.status = `Shuffle`;
        } else {
          this.status = `Winning-${this.EndTimerInfo.Time}`;
        }
        statusUpdate({
          RoomID: this.RoomID,
          status: this.status,
          sSite: this.sSite,
          Playing: this.Playing,
        });
        Emit("Dealer", "EndTimer", this.RoomID, SendData);
      } else {
        this.EndTimerInfo["State"] = false;
        Emit("Dealer", "EndTimer", this.RoomID, SendData);
        this.sLogNumber = "";
        if (this.ShuffleOn || this.active === 0) {
          this.stop();
        } else {
          this.Start();
        }
      }
    });
  }
  StartTimers() {
    this.timer(this.TimerInfo, 1000, async (SendData) => {
      if (this.TimerInfo["Time"] > 0) {
        this.status = `Betting-${this.TimerInfo.Time}`;
        statusUpdate({
          RoomID: this.RoomID,
          status: this.status,
          sSite: this.sSite,
          Playing: this.Playing,
        });
        Emit("All", "timer", this.RoomID, SendData);
      } else {
        this.status = "Dealing";
        statusUpdate({
          RoomID: this.RoomID,
          status: this.status,
          sSite: this.sSite,
          Playing: this.Playing,
        });
        Emit("All", "timer", this.RoomID, SendData);
        this.GamePossible = true;

        // SevUrl이 "services"일 경우 API 호출
        // if (SevUrl().allowUrl === "services" && this.sVideoType === "ivs") {
        //   try {
        //     const response = await axios.post(
        //       `https://ivs.so-broadcast.com/start_composition`,
        //       {
        //         room_id: this.RoomID,
        //       }
        //     );
        //     if (response.data.success) {
        //       this.videoPath = response.data.s3_route;
        //     } else {
        //       this.videoErr = response.data.msg;
        //     }
        //   } catch (error) {
        //     csl("start_composition Post err msg: ", error);
        //   }
        // }

        // 타이머가 끝났으므로 게임 결과 처리
        this.autoResult();
      }
    });
  }
  //로그저장
  async MiddleLog() {
    getRRoom().middleQuery({
      sLogNumber: this.sLogNumber,
      sRoomNumber: this.RoomNumber,
      nTableNumber: this.RoomID.slice(9),

      sGameType: "baccarat",
      type: "",
      sScoreNumber: "",
      sCardResult: "",
      sResult: "",
      nWinnerMoney: 0,
    });
  }
  whoseTurn() {
    return isWhoTurn(this.cardCount);
  }
  async resultWinner(data, how = true) {
    if (how) {
      if (
        this.BankerCardSum.reduce((a, b) => a + b, 0) % 10 ==
        this.PlayerCardSum.reduce((a, b) => a + b, 0) % 10
      ) {
        this.winCardText = "3";
      } else if (
        this.BankerCardSum.reduce((a, b) => a + b, 0) % 10 >
        this.PlayerCardSum.reduce((a, b) => a + b, 0) % 10
      ) {
        this.winCardText = "1";
      } else if (
        this.BankerCardSum.reduce((a, b) => a + b, 0) % 10 <
        this.PlayerCardSum.reduce((a, b) => a + b, 0) % 10
      ) {
        this.winCardText = "2";
      }

      data.end += this.winCardText + this.winSupportText;
      this.cardCount = 1;
    }
    if (!this.GamePossible) {
      return;
    }

    const end = data.end;
    const playerPart = end.slice(0, 6).split("");
    const bankerPart = end.slice(6, 12).split("");
    const winPart = end.slice(12).split("");

    let p = setCard(playerPart, this.RoomID, "Player", data.SerialP);
    let b = setCard(bankerPart, this.RoomID, "Banker", data.SerialB);
    let w = setWin(winPart);

    if (p.AllCard.length === 0 || b.AllCard.length === 0 || w.length === 0) {
      Emit("Dealer", "NotResult", this.RoomID, end);
      return;
    }

    let win = "";
    let pair = "";
    for (let i = 0; i < w.length; i++) {
      if (w[i].includes("Pair")) {
        if (pair.includes("Pair")) {
          pair += "," + w[i];
        } else {
          pair += w[i];
        }
      } else win = w[i];
    }

    if (
      card_range(b.AllCard[0]) === "" ||
      card_range(b.AllCard[1]) === "" ||
      card_range(p.AllCard[0]) === "" ||
      card_range(p.AllCard[1]) === "" ||
      p.Sum === NaN ||
      b.Sum === NaN
    ) {
      Emit("Dealer", "NotResult", this.RoomID, end);
      return;
    }

    tb_baccarat_progress_log({
      sLogNumber: this.sLogNumber,
      nTableNumber: this.RoomID.slice(9),
      B1Card: card_range(b.AllCard[0]),
      B2Card: card_range(b.AllCard[1]),
      B3Card: card_range(b.AllCard[2]),
      BScore: b.Sum,
      P1Card: card_range(p.AllCard[0]),
      P2Card: card_range(p.AllCard[1]),
      P3Card: card_range(p.AllCard[2]),
      PScore: p.Sum,
      win: win,
      pair: pair,
      sCardResult: w.join(),
      type: "Btn",
      sStatus: data.type === "Btn" ? `Manual(${data.err.join()})` : "Normal",
      sDeviceOrginalText: end,
      sRecodingFilePath: this.videoPath,
      sRecodingLog: this.videoErr,
      sSite: this.sSite,
      RoomID: this.RoomID,
      sShoeNumber: this.ShoeNumber,
      sShoeGameNumber: this.ShoeGameNumber,
    });

    this.GamePossible = false;

    Emit("All", "resultWinner", this.RoomID, {
      who: w,
      PlayerScore: p.Sum,
      BankerScore: b.Sum,
      pCard: p.AllCard,
      bCard: b.AllCard,
      RoomID: this.RoomID,
    });

    let sScoreNumber = `B${b.Sum}/`;
    sScoreNumber += b.AllCard.map((el) => {
      return card_range(el);
    }).join(",");
    sScoreNumber += `:P${p.Sum}/`;
    sScoreNumber += p.AllCard.map((el) => {
      return card_range(el);
    }).join(",");

    await getRRoom()
      .endQuery({
        Rinfo: this,
        Win: w,
        sScoreNumber: sScoreNumber,
        type: data.type,
      })
      .then((el) => {
        // console.log('el',el);
        if (el != "not") {
          UpdatebResult({
            sLogNumber: this.sLogNumber,
            win: w.join(),
            sScoreNumber: sScoreNumber,
          });
          UpdateApibResult({
            sLogNumber: this.sLogNumber,
            win: w.join(),
            sScoreNumber: sScoreNumber,
          });
        }
      });

    this.delZeroMoneyAuto(
      Array.from(this.players.values()).filter(
        (player) =>
          player.ip === "auto" &&
          getURoom().selPlayer(player.sUserID).money < 10000,
      ),
    );
    // this.reMoney();

    Select_Room({ RoomID: this.RoomID });

    this.EndTimerInfo["State"] = true;
    this.EndTimerInfo["Time"] = this.nWinnerShowTime;

    this.EndTimers();
    if (this.padCountSet) {
      this.padCount += 1;
      this.padCountSet = false;
    } else if (
      !this.padCountSet &&
      ((this.padCount >= 3 && this.sSite == "nustar") ||
        (this.padCount >= 5 && this.sSite == "okura") ||
        (this.padCount >= 20 && this.sSite == "hann"))
    ) {
      this.padCount = 0;
    }
  }
  //auto 관련
  R_addAuto(autoCount) {
    SQL_addAuto({ RoomID: this.RoomID, nAutoPlayerSettingCnt: autoCount });
  }
  autoResult() {
    if (
      this.Auto &&
      SevUrl().allowUrl !== "services" &&
      this.RoomID === "baccarat-68"
    ) {
      const cardList = initCard();
      const player = drawCards(cardList, Math.floor(Math.random() * 2) + 2); // 2~3장 카드 뽑기
      const banker = drawCards(cardList, Math.floor(Math.random() * 2) + 2); // 2~3장 카드 뽑기

      const end = winCalc(player, banker).OriginText;
      this.autoStart({
        end: end,
        RoomID: this.RoomID,
        type: "Btn",
        err: ["DealerMistake"],
      });
    }
  }
  autoStart(data) {
    setTimeout(() => {
      this.resultWinner(
        {
          end: data.end,
          RoomID: this.RoomID,
          type: "Btn",
          err: data.err,
        },
        false,
      );
    }, 2000);
  }
  AutoConnect(data, money) {
    this.connectProcess(data, money);
  }
  delZeroMoneyAuto(data) {
    for (const key of data) {
      delAutos(key.sUserID);
      sp_auto_disconnect({ sUserID: key.sUserID });
      this.DisConnect({ type: "auto", sUserID: key.sUserID });
      this.nAutoPlayerSettingCnt -= 1;
    }
  }
  delAuto(autoCount) {
    delAuto({ RoomID: this.RoomID, nAutoPlayerSettingCnt: autoCount });
  }
  autoBetting() {
    const autoFilter = Array.from(this.players.values()).filter(
      (player) =>
        player.ip === "auto" &&
        // player.total === 0 &&
        getURoom().selPlayer(player.sUserID).money >= 10000,
    );

    for (const key of autoFilter) {
      let Total = key.money;
      if (Total < 10000) {
        // Ensure there is enough money to place a minimum bet
        break;
      }
      let BetData = [];
      const random = Math.floor(Math.random() * 5) + 1;
      switch (random) {
        case 1:
          BetData.push({ name: "Player", money: 10000 });
          break;
        case 2:
          BetData.push({ name: "Banker", money: 10000 });
          break;
        case 3:
          BetData.push({ name: "Banker_Pair", money: 10000 });
          break;
        case 4:
          BetData.push({ name: "Player_Pair", money: 10000 });
          break;
        case 5:
          BetData.push({ name: "Tie", money: 10000 });
          break;
      }
      this.Betting({
        sUserID: key.sUserID,
        RoomID: this.RoomID,
        combind: groupAndSum(BetData),
        sShoeNumber: this.ShoeNumber,
      });
    }
  }
  async PadUserLogin(data) {
    this.padUser = data;
    getURoom().inPad(this.padUser);
  }
  padSet(data) {
    this.padUser = data;
  }
  async padBetting() {
    if (
      !this.padUser ||
      (typeof this.padUser === "object" &&
        Object.keys(this.padUser).length === 0)
    ) {
      return;
    }

    const result = Math.random() < 0.5 ? true : false;
    const aMoney = result ? 6000 : 5000;
    const bMoney = result ? 5000 : 6000;

    await getRRoom().Betting({
      sUserID: this.padUser.sUserID,
      bet: { name: "Player", money: aMoney },
      Rinfo: this,
      total: this.padUser.mb_money,
      rate: 2,
      padUser: this.padUser,
    });
    await getRRoom().Betting({
      sUserID: this.padUser.sUserID,
      bet: { name: "Banker", money: bMoney },
      Rinfo: this,
      total: this.padUser.mb_money,
      rate: 1.95,
      padUser: this.padUser,
    });
    const Player_PAD = this.PADMap.get("Player");
    Player_PAD.users.set(this.RoomNumber, aMoney);
    Player_PAD.total += Number(aMoney);
    const Banker_PAD = this.PADMap.get("Banker");
    Banker_PAD.users.set(this.RoomNumber, bMoney);
    Banker_PAD.total += Number(bMoney);

    if (getPad(this.RoomID)) {
      getPad(this.RoomID).emit("padBetting", {
        RoomID: this.RoomID,
        PADMap: this.getRoomPADData().PADMap,
      });
    }
  }
  //상태 관리
  Shuffle() {
    if (this.ShuffleOn) return;
    this.ShuffleOn = true;
    this.StartOn = false;
    this.ReadyOn = false;

    this.StateMessage = "Last_Game";
    Emit("Dealer", "Last_Game", this.RoomID, { message: this.StateMessage });
  }
  async Ready() {
    if (!this.active) {
      return;
    }
    this.ShuffleOn = false;
    this.ReadyOn = true;
    this.StartOn = false;
    this.StateMessage = "";

    if (SevUrl().allowUrl !== "services") {
      Cutcard_log({ nTableNumber: this.RoomID.slice(9), RoomID: this.RoomID });
    }

    this.status = "Ready";
    statusUpdate({
      RoomID: this.RoomID,
      status: this.status,
      sSite: this.sSite,
      Playing: this.Playing,
    });

    returnList({
      nTableNumber: this.RoomID.slice(9),
      type: "Single",
      sSite: this.sSite,
      RoomID: this.RoomID,
    });
  }

  async AbataBurn() {
    // if (this.status =/== "Ready") return;
    await DuplicateShoe({
      ShoeNumber: Math.floor(1_000_000 + Math.random() * 9_000_000),
      RoomID: this.RoomID,
    });
    this.ShoeGameNumber = 0;
    Cutcard_log({ nTableNumber: this.RoomID.slice(9), RoomID: this.RoomID });
    // this.status = "Ready";
    statusUpdate({
      RoomID: this.RoomID,
      status: this.status,
      sSite: this.sSite,
      Playing: this.Playing,
    });
    returnList({
      nTableNumber: this.RoomID.slice(9),
      type: "Single",
      sSite: this.sSite,
      RoomID: this.RoomID,
    });
    this.Start();
  }
  RoomActiveOnOff(data) {
    this.active = data.onoff;
    RoomActiveOnOff(data);
  }

  Start() {
    if (!this.active) {
      return;
    }

    StartPlaying(this.RoomID);
    this.ShoeGameNumber += 1;

    this.ShuffleOn = false;
    this.ReadyOn = false;
    this.StartOn = true;
    this.videoPath = "";
    this.videoErr = "Normal";
    this.StateMessage = "";
    this.GamePossible = false;

    this.sLogNumber = "B" + new Date().getTime();
    this.stop();
  }
  async stop() {
    // if (SevUrl().allowUrl == "services" && this.sVideoType === "ivs") {
    //   axios
    //     .post(`https://ivs.so-broadcast.com/stop_composition`, {
    //       room_id: this.RoomID,
    //     })
    //     .then((el) => {
    //       if (el.data.success) {
    //       } else {
    //       }
    //     })
    //     .catch((error) => {
    //       csl("stop_composition Post err msg: ", error);
    //     });
    // }
    this.Wait();
  }
  async Wait() {
    this.Init();

    if (this.ShuffleOn || this.active === 0) {
      this.StateMessage = "Shuffle card. Please wait a moment.";
      Emit("All", "Game_Wait", this.RoomID, this);
      returnList({
        idx: this.RoomID.slice(9),
        Cut: true,
        type: "Cut",
        sSite: this.sSite,
        RoomID: this.RoomID,
      });
      this.status = "Shuffle";
      statusUpdate({
        RoomID: this.RoomID,
        status: this.status,
        sSite: this.sSite,
        Playing: this.Playing,
      });
    } else {
      this.nBettingTime = this.newBetTime;
      this.nWinnerShowTime = this.newWinTime;

      this.TimerInfo["State"] = true;
      this.TimerInfo["Time"] = this.nBettingTime;
      Emit("All", "Game_Start", this.RoomID, this);
      returnList({
        idx: this.RoomID.slice(9),
        Cut: false,
        type: "Cut",
        sSite: this.sSite,
        RoomID: this.RoomID,
      });

      this.StartTimers();
      setTimeout(() => {
        if (this.PADMap.get("Banker").total === 0) {
          if (this.sSite === "nustar" && this.padCount >= 3) {
            this.padBetting();
          } else if (this.sSite === "okura" && this.padCount >= 5) {
            this.padBetting();
          } else if (this.sSite === "hann" && this.padCount >= 20) {
            this.padBetting();
          }
        }
      }, 2000);
    }
  }
  async ForceShoeChange_ctrl() {
    await DuplicateShoe({
      ShoeNumber: Math.floor(1_000_000 + Math.random() * 9_000_000),
      RoomID: this.RoomID,
    });
    Cutcard_log({ nTableNumber: this.RoomID.slice(9), RoomID: this.RoomID });
    statusUpdate({
      RoomID: this.RoomID,
      status: this.status,
      sSite: this.sSite,
    });

    returnList({
      nTableNumber: this.RoomID.slice(9),
      type: "Single",
      sSite: this.sSite,
      RoomID: this.RoomID,
    });
  }
  padCounting() {
    if (
      this.padCountSet ||
      (this.padCount >= 3 && this.sSite === "nustar") ||
      (this.padCount >= 5 && this.sSite === "okura") ||
      (this.padCount >= 20 && this.sSite === "hann")
    ) {
      return;
    }
    this.padCountSet = true;
  }
  Init() {
    //유저
    //방정보
    if (this.CopyGameType != this.GameType) {
      this.GameType = this.CopyGameType;
    }
    //-dealer
    this.DealerTip = [];
    //시간정보
    this.TimerInfo = { Time: 0, State: false };

    //베팅정보
    this.CBMap = new Map([
      ["Player_Pair", { users: new Map(), total: 0 }],
      ["Player", { users: new Map(), total: 0 }],
      ["Tie", { users: new Map(), total: 0 }],
      ["Banker", { users: new Map(), total: 0 }],
      ["Banker_Pair", { users: new Map(), total: 0 }],
    ]);
    this.PADMap = new Map([
      ["Player_Pair", { users: new Map(), total: 0 }],
      ["Player", { users: new Map(), total: 0 }],
      ["Tie", { users: new Map(), total: 0 }],
      ["Banker", { users: new Map(), total: 0 }],
      ["Banker_Pair", { users: new Map(), total: 0 }],
    ]);

    updateRoomList({
      RoomID: this.RoomID,
      nPlayerCount: 0,
      nBankerCount: 0,
      nTieCount: 0,
      nPPCount: 0,
      nBPCount: 0,
      nPlayerMoney: 0,
      nBankerMoney: 0,
      nTieMoney: 0,
      nPPMoney: 0,
      nBPMoney: 0,
      CBMap: this.CBMap,
    });
  }

  DealerConnect(data) {
    this.DealerID = data.sUserID;
    this.DealerName = data.name;

    return this.invasion();
  }
  async DisConnect(data, socket = null) {
    // console.log('Room DisConnect');

    if (data.type == "auto") {
      this.players.delete(data.sUserID); // Remove player from Map
    } else if (data.type == "u") {
      this.players.delete(data.sUserID); // Remove player from Map
      await ExitRoom(
        {
          sUserID: data.sUserID,
        },
        socket,
      );
      this.userCount -= 1;
    } else if (data.type == "d") {
      this.DealerID = "";
      this.DealerName = "";
      Emit("All", "d_change", this.RoomID, { DealerName: this.DealerName });
    }
    // console.log(this.players);
  }
  MoveConnect(data, socket) {
    // console.log("MoveConnect", data);

    this.players.delete(data.sUserID); // Remove player from Map
    findRoomById(data.RoomID).EnterRoom(
      {
        ip: data.ip,
        sUserID: data.sUserID,
        name: data.name,
        sUserCode: data.sUserCode,
        bApiUser: data.bApiUser,
        type: data.type,
        move: true,
      },
      socket,
    );
  }
  getRoomData() {
    return {
      players: Array.from(this.players.entries()),
      CBMap: Object.fromEntries(
        Array.from(this.CBMap, ([key, value]) => [
          key,
          {
            users: Object.fromEntries(value.users),
            total: value.total,
          },
        ]),
      ),
    };
  }
  getRoomPADData() {
    return {
      players: Array.from(this.players.entries()),
      PADMap: Object.fromEntries(
        Array.from(this.PADMap, ([key, value]) => [
          key,
          {
            users: Object.fromEntries(value.users),
            total: value.total,
          },
        ]),
      ),
    };
  }
  AutoDealer(data) {
    this.Auto = data.onoff;
    this.Start();
  }
  getLogNum() {
    return this.sLogNumber;
  }
}
