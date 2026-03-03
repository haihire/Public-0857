// import Singleton from "./Singleton.js";
import { format } from "util";
import Utilsc from "./Utilsc.js";
const utilscInstance = Utilsc.instance;
var LEVEL = {
  ALL: Infinity,
  INFO: 3,
  WARN: 2,
  ERROR: 1,
  COLOR: 4,
  NONE: -Infinity,
};

var COLOR = {
  RESET: "\u001b[0m",
  INFO: "\u001b[32;1m",
  WARN: "\u001b[33;1m",
  ERROR: "\u001b[31;1m",
};

var coloredOutput = true;

export const errorType = {
  normal: 0,
  sql: 1,
};

export default class LogManager {
  // static get instance() {
  //   return super.GetInstance();
  // }

  constructor() {
    // super();
    this.before_date_info = -1;
    this.cur_file_count_info = 0;
    this.before_date_error = -1;
    this.cur_file_count_error = 0;
    this.cur_server_name = "";
    this.is_write_file = true;
    this.path_log = "../" + "baccarat";
  }

  init() {
    this.cur_server_name = "baccarat error";
    this.before_date_info = -1;
    this.cur_file_count_info = 0;
    this.before_date_error = -1;
    this.cur_file_count_error = 0;
    utilscInstance.createDirectory(this.path_log);
    utilscInstance.createDirectory(this.path_log + "/" + this.cur_server_name);
  }

  setColoredOutput(bool) {
    coloredOutput = bool;
  }

  error(arg, type) {
    this.log(LEVEL.ERROR, null, arg, type);
  }

  newPrepareStackTrace(error, structuredStack) {
    return structuredStack;
  }

  get_project_path(project_path) {
    let server_root_path = "baccarat";
    let path_index = project_path.lastIndexOf(server_root_path);
    let new_path = project_path.substring(
      path_index + server_root_path.length + 1
    );
    return new_path;
  }

  log(level, color, message, type) {
    let oldPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = this.newPrepareStackTrace;
    let structuredStack = new Error().stack;
    Error.prepareStackTrace = oldPrepareStackTrace;
    let caller = structuredStack[2];
    let project_path = this.get_project_path(caller.getFileName());
    let fileName = project_path;
    let lineNumber = caller.getLineNumber();
    let levelString;
    switch (level) {
      case LEVEL.INFO:
        levelString = "[INFO]";
        break;
      case LEVEL.WARN:
        levelString = "[WARN]";
        break;
      case LEVEL.ERROR:
        levelString = "[ERROR]";
        break;
      default:
        levelString = "[INFO]";
        break;
    }

    let textMsg = "";
    if (type === errorType.normal) {
      textMsg = message.stack;
    } else if (type === errorType.sql) {
      textMsg = message.stack + "\n" + message.sql + "\n" + message.sqlMessage;
    }

    let output = format(
      "%s %s %s(%dLine)" + "\n%s %j",
      levelString,
      utilscInstance.cur_Datetime(),
      fileName,
      lineNumber,
      levelString,
      textMsg
    );

    if (this.is_write_file === true) {
      // Do something with the file output here
    }

    if (!coloredOutput) {
      process.stdout.write(output + "\n");
    } else {
      switch (level) {
        case LEVEL.ERROR:
          process.stdout.write(COLOR.ERROR + output + COLOR.RESET + "\n");
          process.stdout.write(
            COLOR.ERROR +
              "---------------------------------------------------------------------------" +
              COLOR.RESET +
              "\n"
          );
          if (this.is_write_file === true) {
            // Do something with the file output here
            utilscInstance.RedFileSize(
              this.path_log +
                "/" +
                this.cur_server_name +
                "/" +
                "error" +
                utilscInstance.cur_YearMonthDate() +
                "_" +
                this.cur_file_count_error +
                ".log",
              (error, size) => {
                if (error === null) {
                  if (size > 20000000) {
                    this.cur_file_count_error = this.cur_file_count_error + 1;
                  }
                }
              }
            );
            let cur_date_error = utilscInstance.cur_Date();
            if (this.before_date_error !== cur_date_error) {
              this.before_date_error = cur_date_error;
            }
            utilscInstance.write(
              this.path_log +
                "/" +
                this.cur_server_name +
                "/" +
                "error" +
                utilscInstance.cur_YearMonthDate() +
                "_" +
                this.cur_file_count_error +
                ".log",
              output
            );
          }
          break;
        default:
          break;
      }
    }
  }
}
