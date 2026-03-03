import net from "net";
import { converText, winnerCalc } from "./Utility.js";
import { GetRoom } from "./Manager.js";
import { buffer } from "./SQL.js";

export default class SerialScannerServer {
  constructor(info) {
    this.server = null;
    this.port = 0;

    this.AllowScanner = true;

    this.RoomNumber = info.RoomNumber;
    this.RoomID = info.RoomID;

    //Init data
    this.buf = Buffer.alloc(0);

    this.pCard = [];
    this.bCard = [];
    this.pOriginCard = [];
    this.bOriginCard = [];
    this.winner = "";
    this.pair = "";
    this.text = "";
    this.resulting = false;
    this.burnCardCount = 0;
  }

  // WebSocket 또는 네트워크 포트에서 연결을 리스닝하는 메서드
  ws_listen(port, RoomNumber) {
    this.port = port;
    this.RoomNumber = RoomNumber.trim();
    this.server = net.createServer((client) =>
      this.handleClientConnection(client)
    );
    this.server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(
          `⚠️  [Room ${this.RoomID}] port ${port} is already in use — skipping scanner.`
        );
      } else {
        console.error(`❌ [Room ${this.RoomID}] scanner error:`, err);
      }
    });
    this.server.listen(port, () => {
      // console
      // .log
      // `SerialScannerServer is listening on port ${port} ${this.RoomID} ${this.RoomNumber}`
      // ();
      // console.log('Get',GetRoom(this.RoomID).RoomNumber);
    });
  }

  handleClientConnection(client) {
    // console.log('Client connection:');
    // console.log('   local = %s:%s', client.localAddress, client.localPort);
    // console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
    client.setTimeout(500);

    client.on("data", (data) => {
      const hexData = data.toString("hex");
      // 데이터가 06이면 무시
      if (hexData === "06" || !this.AllowScanner) return;

      this.buf = Buffer.concat([this.buf, data]);
      // console.log("this.buf", this.buf);
      if (this.buf.length > 5) {
        const combinedBuffer = this.buf;
        if (combinedBuffer[0] == 0x05) {
          let start = 0;
          let end = 0;
          for (let i = 1; i < combinedBuffer.length; i++) {
            if (combinedBuffer[i] === 0x05) {
              end = i;
              const packet = combinedBuffer.slice(start, end);
              this.processBufferData(packet);
              start = end;
            }
          }
          if (
            start < combinedBuffer.length &&
            combinedBuffer.slice(start, start + 1)[0] === 0x05 &&
            combinedBuffer.length < 50
          ) {
            this.buf = Buffer.concat([combinedBuffer.slice(start)]);
          } else {
            this.buf = Buffer.alloc(0);
          }
        } else {
          let newBuf = Buffer.alloc(0);
          for (let i = 0; i < combinedBuffer.length; i++) {
            if (combinedBuffer[i] === 0x05) {
              newBuf = combinedBuffer.slice(i);
              break;
            }
          }

          let start = 0;
          for (let i = 1; i < newBuf.length; i++) {
            if (newBuf[i] === 0x05) {
              const packet = newBuf.slice(start, i);
              this.processBufferData(packet);
              start = i;
            }
          }
          if (
            start < newBuf.length &&
            newBuf.slice(start, start + 1)[0] === 0x05 &&
            combinedBuffer.length < 50
          ) {
            this.buf = Buffer.concat([newBuf.slice(start)]);
          } else {
            this.buf = Buffer.alloc(0);
          }
        }
      }
    });

    client.on("end", () => {
      // console.log('Client disconnected');
    });

    client.on("error", (err) => {
      // console.log('Serial Socket Error:', JSON.stringify(err));
    });

    client.on("timeout", () => {
      // console.log('Socket Timed out');
    });
  }

  // 받은 버퍼 데이터를 처리하는 메서드
  processBufferData(combinedBuffer) {
    let type = "";
    const room = GetRoom(this.RoomID);
    //번카드 끝났을 때
    if (
      this.burnCardCount > 0 &&
      (combinedBuffer[3] & 0xf0) === 0xd0 &&
      combinedBuffer.length == 8
    ) {
      type = "burnCarding";
      const expectedCode = 0xd0 + (this.burnCardCount - 1);

      if (combinedBuffer[3] === expectedCode) {
        this.burnCardCount -= 1;
        if (this.burnCardCount === 0) {
          room.AbataBurn();
        }
      }
      type += this.burnCardCount.toString();
    }
    // 번카드 시작
    else if (
      this.burnCardCount === 0 &&
      combinedBuffer[2] === 0x44 &&
      combinedBuffer[3] === 0xc0 &&
      combinedBuffer.length == 8
    ) {
      type = "burnCardStart";

      this.pCard = [];
      this.bCard = [];
      this.pOriginCard = [];
      this.bOriginCard = [];
      this.winner = "";
      this.pair = "";
      this.text = "";

      let CountCard = combinedBuffer[4].toString(16).split("")[1];
      type += CountCard;
      switch (CountCard) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          this.burnCardCount = Number(CountCard);
          break;
        case "a":
        case "b":
        case "c":
        case "d":
          this.burnCardCount = 10;
          break;
      }
      room.Shuffle();
    }
    //카드 뒷면일 때
    else if (
      combinedBuffer[2] === 0x44 &&
      combinedBuffer[4] === 0x80 &&
      combinedBuffer.length == 8
    ) {
      type = "BackCard";
      room.TimerInfo.Time = 0;
      room.TimerInfo.State = false;
      room.EndTimerInfo.Time = 0;
      room.EndTimerInfo.State = false;
    }
    //카드 패킷일 때
    else if (combinedBuffer[2] === 0x49 && combinedBuffer.length == 8) {
      type = "CardPacket";
      const code = combinedBuffer[3];
      const cardValue = combinedBuffer[4].toString(16);
      const cardHex = combinedBuffer.toString("hex");

      this.resulting = false;
      switch (code) {
        case 0x81:
          this.pCard = [];
          this.pOriginCard = [];
          this.pCard[0] = cardValue;
          this.pOriginCard[0] = cardHex;
          break;
        case 0x82:
          this.pCard[1] = cardValue;
          this.pOriginCard[1] = cardHex;
          break;
        case 0x83:
          this.pCard[2] = cardValue;
          this.pOriginCard[2] = cardHex;
          break;
        case 0x91:
          this.bCard = [];
          this.bOriginCard = [];
          this.bCard[0] = cardValue;
          this.bOriginCard[0] = cardHex;
          break;
        case 0x92:
          this.bCard[1] = cardValue;
          this.bOriginCard[1] = cardHex;
          break;
        case 0x93:
          this.bCard[2] = cardValue;
          this.bOriginCard[2] = cardHex;
          break;
      }
    }
    //결과 산출
    else if (
      combinedBuffer.length == 7 &&
      combinedBuffer[2] === 0x47 &&
      combinedBuffer[4] === 0x03 &&
      !this.resulting &&
      this.bCard.length > 1 &&
      this.pCard.length > 1
    ) {
      type = "Resulting";
      this.resulting = true;

      const wincalc = winnerCalc(this.pCard, this.bCard, this.RoomNumber);
      this.text = converText({
        pCard: this.pCard,
        bCard: this.bCard,
        winner: wincalc.winner,
        pair: wincalc.pair,
      });

      room.resultWinner(
        {
          end: this.text,
          type: "Typing",
          SerialP: this.pOriginCard,
          SerialB: this.bOriginCard,
        },
        false
      );
      // 초기화
      this.pCard = [];
      this.bCard = [];
      this.pOriginCard = [];
      this.bOriginCard = [];
      this.winner = "";
      this.pair = "";
      this.text = "";
    } else if (combinedBuffer[2] === 0x55 && combinedBuffer.length == 6) {
      // 05 36 55 03 36 30
      // 05 35 55 03 36 33
      type = "BlackCard";
      room.Shuffle();
    }

    if (room) {
      buffer({
        type: type,
        sShoeNumber: room.ShoeNumber,
        sShoeGameNumber: room.ShoeGameNumber,
        buffer: combinedBuffer.toString("hex").match(/.{2}/g).join(" "),
        roomNumber: this.RoomNumber,
      });
    }
  }
}
