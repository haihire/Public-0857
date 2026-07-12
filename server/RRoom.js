import {
  sp_baccarat_sum_log,
  tb_baccarat_money_move_log,
  tb_transaction,
} from "./SQL.js";
import { getLock } from "./Lockmanager.js";
import { findRoomById, getURoom } from "./Manager.js";
import { v4 as uuidv4 } from "uuid";
export default class RRoom {
  constructor() {
    this.players = new Map();
    this.bettings = new Map();
    this.lock = getLock();
  }

  async Betting(data) {
    const sUserID = data.sUserID;
    await this.lock.lockAndExecute(sUserID, async () => {
      const bet = data.bet;
      const Rinfo = data.Rinfo;
      // const total = data.total;
      const rate = data.rate;

      const userInfo =
        getURoom().selPlayer(sUserID) ?? getURoom().selPad(sUserID);

      const sTransactionKey = !userInfo
        ? ""
        : userInfo.bApiUser === 1
          ? uuidv4().replace(/-/g, "")
          : "";

      const sLogNumber = Rinfo.sLogNumber;
      const sRoomNumber = Rinfo.RoomNumber;
      const nTableNumber = Rinfo.RoomID.slice(9);
      const RoomID = Rinfo.RoomID;
      const ShoeNumber = Rinfo.ShoeNumber;
      const ShoeGameNumber = Rinfo.ShoeGameNumber;
      const sSite = Rinfo.sSite;

      const nStartMoney = userInfo.money;
      const betMoney = Math.abs(bet.money);

      const endMoney = userInfo.money + bet.money * -1;

      if (userInfo.bApiUser === 1) {
        tb_transaction({
          sUserID: sUserID,
          sUserCode: userInfo.sUserCode,
          sLogNumber: sLogNumber,
          nEndMoney: endMoney,
          nWinnerMoney: 0,
          sScoreNumber: "",
          sCardResult: "",
          sResult: "",
          nBettingMoney: betMoney,
          nTableNumber: nTableNumber,
          nBeforeBalance: nStartMoney,
          sType: "bet",
          sTransactionKey: sTransactionKey,
          sBettingPos: bet.name,
        });
      }

      tb_baccarat_money_move_log(
        {
          sLogNumber: sLogNumber,
          sRoomNumber: sRoomNumber,
          sUserID: sUserID,
          sUserCode: userInfo.sUserCode,
          nTableNumber: nTableNumber,
          sScoreNumber: "",
          nStartMoney: nStartMoney,
          nBettingMoney: betMoney,
          nEndMoney: endMoney,
          nWinnerMoney: 0,
          sBettingPos: bet.name,
          sCardResult: "",
          ip: userInfo.ip,
          sResult: "",
          sTransactionKey: sTransactionKey,
          sShoeNumber: ShoeNumber,
          sShoeGameNumber: ShoeGameNumber,
          sSite: sSite,
        },
        "bet",
      );

      await getURoom().updateMoney(sUserID, betMoney);

      const key = `${sUserID}-${RoomID}`;
      const playerBetData = {
        sUserID: sUserID,
        sLogNumber: sLogNumber,
        RoomID: RoomID,
        nStartMoney: nStartMoney,
        nBettingMoney: betMoney,
        nEndMoney: endMoney,
        sBettingPos: bet.name,
        sRoomNumber: sRoomNumber,
        nTableNumber: nTableNumber,
        rate: rate,
      };

      if (!this.bettings.has(key)) {
        this.bettings.set(key, []);
      }
      this.bettings.get(key).push(playerBetData);

      const playerData = {
        sUserID: sUserID,
        sLogNumber: sLogNumber,
        RoomID: RoomID,
        // total: total,
        Betting: data.BetData,
      };
      this.players.set(key, playerData);
    });
  }

  async cancelBetting(data) {
    const sUserID = data.sUserID;
    await this.lock.lockAndExecute(sUserID, async () => {
      const Rinfo = data.Rinfo;

      const RoomID = Rinfo.RoomID;
      const key = `${sUserID}-${RoomID}`;
      const bettings = this.bettings.get(key);
      if (bettings) {
        for (const betting of bettings) {
          const userInfo = getURoom().selPlayer(betting.sUserID);
          const sTransactionKey =
            userInfo.bApiUser === 1 ? uuidv4().replace(/-/g, "") : "";
          const ShoeNumber = Rinfo.ShoeNumber;
          const ShoeGameNumber = Rinfo.ShoeGameNumber;
          const sSite = Rinfo.sSite;
          if (userInfo.bApiUser === 1) {
            tb_transaction({
              sUserID: betting.sUserID,
              sUserCode: userInfo.sUserCode,
              sLogNumber: betting.sLogNumber,
              nEndMoney: userInfo.money + betting.nBettingMoney,
              nWinnerMoney: 0,
              sScoreNumber: "",
              sCardResult: "",
              sResult: "",
              nBettingMoney: betting.nBettingMoney,
              nTableNumber: betting.nTableNumber,
              nBeforeBalance: userInfo.money,
              sType: "cancel",
              sTransactionKey: sTransactionKey,
              sBettingPos: betting.sBettingPos,
            });
          }

          tb_baccarat_money_move_log(
            {
              sLogNumber: betting.sLogNumber,
              sRoomNumber: betting.sRoomNumber,
              sUserID: betting.sUserID,
              sUserCode: userInfo.sUserCode,
              nTableNumber: betting.nTableNumber,
              sScoreNumber: "",
              nStartMoney: userInfo.money,
              nBettingMoney: betting.nBettingMoney,
              nEndMoney: userInfo.money + betting.nBettingMoney,
              nWinnerMoney: 0,
              sBettingPos: betting.sBettingPos,
              sCardResult: "",
              ip: userInfo.ip,
              sResult: "",
              sTransactionKey: sTransactionKey,
              sShoeNumber: ShoeNumber,
              sShoeGameNumber: ShoeGameNumber,
              sSite: sSite,
            },
            "cancel",
          );

          await getURoom().updateMoney(sUserID, -betting.nBettingMoney);
        }

        this.bettings.delete(key);
        this.players.delete(key);
      }
    });
  }
  async endQuery(data) {
    // console.log('RRoom endQuery', data);

    const Rinfo = data.Rinfo;
    const RoomID = Rinfo.RoomID;
    const roomBettings = Array.from(this.bettings.entries()).filter(([key]) =>
      key.endsWith(`-${RoomID}`),
    );

    if (roomBettings.length === 0) return "not";

    for (const [key, bettingRecords] of roomBettings) {
      for (const betting of bettingRecords) {
        await this.lock.lockAndExecute(betting.sUserID, async () => {
          const userInfo =
            getURoom().selPlayer(betting.sUserID) ??
            getURoom().selPad(betting.sUserID);
          const sTransactionKey =
            userInfo.bApiUser === 1 ? uuidv4().replace(/-/g, "") : "";
          const Win = data.Win;
          const nTableNumber = RoomID.slice(9);
          const sScoreNumber = data.sScoreNumber;
          const sShoeNumber = Rinfo.ShoeNumber;
          const ShoeGameNumber = Rinfo.ShoeGameNumber;
          const sSite = Rinfo.sSite;
          let nWinnerMoney = 0;
          let sResult = "Lose";

          if (Win.includes(betting.sBettingPos)) {
            nWinnerMoney = betting.nBettingMoney * betting.rate;
            sResult = "Win";
          } else if (
            Win.includes("Tie") &&
            betting.sBettingPos !== "Tie" &&
            !betting.sBettingPos.includes("Pair")
          ) {
            nWinnerMoney = betting.nBettingMoney;
            sResult = "Tie";
          }

          sp_baccarat_sum_log({
            sUserID: betting.sUserID,
            sLogNumber: betting.sLogNumber,
            sResult: sResult,
            nBettingMoney: betting.nBettingMoney,
            nWinnerMoney: nWinnerMoney,
            nTableNumber: betting.nTableNumber,
          });

          if (userInfo.bApiUser === 1) {
            tb_transaction({
              sUserID: betting.sUserID,
              sUserCode: userInfo.sUserCode,
              sLogNumber: betting.sLogNumber,
              nEndMoney: userInfo.money + nWinnerMoney,
              nWinnerMoney: nWinnerMoney,
              sScoreNumber: sScoreNumber,
              sCardResult: Win.join(),
              sResult: sResult,
              nBettingMoney: betting.nBettingMoney,
              nTableNumber: nTableNumber,
              nBeforeBalance: betting.nStartMoney,
              sType: "result",
              sTransactionKey: sTransactionKey,
              sBettingPos: betting.sBettingPos,
            });
          }

          tb_baccarat_money_move_log(
            {
              sLogNumber: betting.sLogNumber,
              sRoomNumber: betting.sRoomNumber,
              sUserID: betting.sUserID,
              sUserCode: userInfo.sUserCode,
              nTableNumber: betting.nTableNumber,
              sScoreNumber: sScoreNumber,
              nStartMoney: betting.nStartMoney,
              nBettingMoney: betting.nBettingMoney,
              nEndMoney: userInfo.money + nWinnerMoney,
              nWinnerMoney: nWinnerMoney,
              sBettingPos: betting.sBettingPos,
              sCardResult: Win.join(),
              sResult: sResult,
              ip: userInfo.ip,
              sTransactionKey: sTransactionKey,
              sShoeNumber: sShoeNumber,
              sShoeGameNumber: ShoeGameNumber,
              sSite: sSite,
            },
            "result",
          );

          await getURoom().updateMoney(betting.sUserID, -nWinnerMoney);
        });
      }
    }
    let users = [];
    for (const [key, bets] of roomBettings) {
      this.bettings.delete(key);
      this.players.delete(key);

      bets.forEach(({ sUserID, RoomID }) => {
        users.push({ sUserID, RoomID });
      });
    }
    // 1) 고유키 문자열 배열 생성
    const keyStrs = users.map((u) => `${u.sUserID}|${u.RoomID}`);

    // 2) Set으로 중복 제거
    const uniqueKeyStrs = [...new Set(keyStrs)];

    // 3) 다시 객체로 복원
    const uniqueUsers = uniqueKeyStrs.map((str) => {
      const [sUserID, RoomID] = str.split("|");
      return { sUserID, RoomID };
    });

    // 4) 업데이트
    uniqueUsers.forEach(({ RoomID, sUserID }) => {
      findRoomById(RoomID).updatePlayers(sUserID);
    });

    return "ok";
  }
  selPlayer(sUserID, RoomID) {
    // console.log('RRoom selPlayer');
    const key = `${sUserID}-${RoomID}`;
    return this.players.get(key) || null;
  }
}
