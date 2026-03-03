import Singleton from "./Singleton.js";
import crypto from "crypto";
import fs from "fs";
// import path from "path";
import silly_date from "silly-datetime";

const L_DEBUG = 3;
const L_INFO = 2;
const L_WARN = 1;
const L_ERR = 0;
var g_level = L_DEBUG;

export default class Utilsc extends Singleton {
  static get instance() {
    return super.GetInstance();
  }

  write(filename, fmt) {
    fs.writeFile(
      filename,
      fmt + "\r\n",
      { flag: "a", encoding: "utf-8", mode: "0644" },
      function (err) {}
    );
  }

  RedFileSize(path_filename, callback) {
    fs.stat(path_filename, function (error, stats) {
      if (error) {
        callback(error, stats);
      } else {
        callback(null, stats.size);
      }
    });
  }

  createDirectory(path_filename) {
    fs.stat(path_filename, function (error, stats) {
      if (error !== null) {
        fs.mkdirSync(path_filename);
      }
    });
  }

  cur_YearMonthDate() {
    const today = silly_date.format(new Date(), "YYYY-MM-DD");
    return today;
  }

  cur_Date() {
    var date = new Date();
    var ret_val = date.getDate();
    return ret_val;
  }

  cur_Datetime() {
    const today = silly_date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    return today;
  }

  timestamp() {
    var date = new Date();
    var time = Date.parse(date);
    time = time / 1000;
    return time;
  }

  md5(data) {
    var md5 = crypto.createHash("md5");
    md5.update(data);
    return md5.digest("hex");
  }

  getTimestamp() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var hour = now.getHours();
    var min = now.getMinutes();
    var sec = now.getSeconds();
    var msec = now.getMilliseconds();
    return (
      "[" +
      y +
      "-" +
      (m < 10 ? "0" + m : m) +
      "-" +
      (d < 10 ? "0" + d : d) +
      " " +
      (hour < 10 ? "0" + hour : hour) +
      ":" +
      (min < 10 ? "0" + min : min) +
      ":" +
      (sec < 10 ? "0" + sec : sec) +
      "." +
      (msec < 100 ? (msec < 10 ? "00" + msec : "0" + msec) : msec) +
      "] "
    );
  }

  static curConverTime(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

  static getServerTime() {
    return this.curConverTime(new Date().getTime());
  }
}
