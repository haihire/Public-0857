import { Emit } from "./EmitManager.js";
import { GetRoom } from "./Manager.js";
import { convertReceiveToSerial, csl } from "./Utility.js";
import { WebSocketServer } from "ws";
import { Scan_data } from "./SQL.js";

export default class ScannerServer {
  constructor() {
    this.TableNum = 0;
    this.timer = null;
  }

  ws_listen(app, port) {
    app.use("/", (req, res) => {
      res.end("ok");
    });
    const HTTPServer = app.listen(port, () => {
      console.log("Baccarat Scanner is open at port: " + port);
    });
    this.server = new WebSocketServer({
      server: HTTPServer,
      perMessageDeflate: false,
    });
    this.server.on("connection", this.on_client_connection.bind(this));
    this.server.on("close", this.on_listen_close.bind(this));
  }
  client_close_cb(client_socket) {
    csl("RS_client_close_cb");
  }
  on_client_connection(client_socket) {
    csl("RS_on_client_connection");

    client_socket.on("error", (err) => {
      csl("RS_error", err);
    });
    client_socket.on("close", () => {
      csl("RS_close");
      GetRoom("baccarat-" + this.TableNum).ScannerOn(0);
      this.TableNum = 0;
      this.client_close_cb(client_socket);
    });
    client_socket.on("message", (data) => {
      const parseData = JSON.parse(data);
      const { table, shape, number } = parseData;
      const roomID = `baccarat-${table}`;

      this.TableNum = table;

      const room = GetRoom(roomID);

      if (!room) return;

      if (this.TableNum != 0 && shape == 2000 && number == 2000) {
        // GetRoom(roomID).ScannerOn(1);
        // this.startTimer();
      } else if (shape == 9000 && number == 9000) {
        // GetRoom(roomID).ScannerOn(0);
      } else if (shape == 1000 && number == 1000) {
        // GetRoom(roomID).ScannerOn(1);
      } else if (shape == 8000 && room.GamePossible == true) {
        // Scan_data(parseData, "error");
        // Emit("Dealer", "MissCard", roomID);
      } else if (shape == 5 && parseInt(number) == 1) {
        // if (room.TimerInfo.State || room.InsTime.State)
        //   Emit("Dealer", "Guide", roomID, "The timer is in progress");
        // else GetRoom(roomID).Start(roomID);
      } else if (shape == 5 && parseInt(number) == 2) {
        // if (room.TimerInfo.State || room.InsTime.State)
        //   Emit("Dealer", "Guide", roomID, "The timer is in progress");
        // else if (room.CutTime)
        //   Emit("Dealer", "Guide", roomID, "The CutTime is in progress");
        // else GetRoom(roomID).ClearGame(roomID);
      } else if (shape == 6 && parseInt(number) == 1) {
        // if (room.CutTime)
        //   Emit("Dealer", "Guide", roomID, "Already The CutTime is in progress");
        // else GetRoom(roomID).Cut(roomID, true);
      } else if (room.GameType == "Speed") {
        if (room.GamePossible == true && shape != 2000 && number != 2000) {
          const body = {
            table: roomID,
            shape: shape,
            number: number,
            who: room.whoseTurn(),
            Origin: convertReceiveToSerial(parseInt(shape), parseInt(number)),
          };
          console.log("body", body);

          Scan_data(body, "good");
          room.cardShare(body);
        }
      }
    });
  }
  on_listen_error(error) {
    csl("RS_on_listen_error", error);
  }
  on_listen_close() {
    csl("RS_on_listen_close");
  }
  startTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Set a new timer to trigger after 70 seconds
    this.timer = setTimeout(() => {
      // Trigger ScannerOn with the specified parameters after 70 seconds
      GetRoom("baccarat-" + this.TableNum).ScannerOn(0);
    }, 70000); // 70 seconds in milliseconds
  }
}
