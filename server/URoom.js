import { PadUserGet, sp_balance_change } from "./SQL.js";
import { outdel } from "./Utility.js";

export default class URoom {
  constructor() {
    this.Player = new Map();
    this.pads = new Map();
  }
  inPad(data) {
    this.pads.set(data.sUserID, data);
  }
  inPlayer(data, money) {
    // console.log("URoom inPlayer", data);
    this.Player.set(data.sUserID, {
      sUserID: data.sUserID,
      money: parseFloat(money),
      sUserCode: data.sUserCode,
      ip: data.ip,
      name: data.name,
      sGameType: "baccarat",
      currentRoomID: data.RoomID,
      bApiUser: data.bApiUser,
      multiBet: data.multiBet,
      isBetRoom: data.isBetRoom,
    });
    outdel(data.sUserID);
    // console.log('Player list after inPlayer:', this.Player);
  }
  outPlayer(sUserID) {
    // console.log('URoom outPlayer');
    this.Player.delete(sUserID);
    // console.log('Player list after outPlayer:', this.Player);
  }
  selPlayer(sUserID) {
    // console.log('URoom selPlayer');
    return this.Player.get(sUserID) || null;
  }
  selPad(sUserID) {
    // console.log('URoom selPlayer');
    return this.pads.get(sUserID) || null;
  }
  async updateMoney(sUserID, money) {
    if (this.Player.has(sUserID)) {
      const player = this.Player.get(sUserID);
      player.money -= money;
      await sp_balance_change({ sUserID, BetMoney: money });
      // console.log('Updated player money:', player);
    } else if (this.pads.has(sUserID)) {
      const player = this.pads.get(sUserID);
      player.money += -money;

      await sp_balance_change({ sUserID, BetMoney: money });
      await PadUserGet({ id: sUserID, RoomID: player.RoomID });
    } else {
      console.error("Player not found in updateMoney:", sUserID);

      //   await sp_balance_change({ sUserID, BetMoney: money });
      // }
    }
  }
}
