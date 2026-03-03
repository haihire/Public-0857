import { useStore } from "../store";
import { getTranslation, moneyformatNumber } from "../util";

import { useSocket } from "../SocketContext.js";
import { useState } from "react";
function Rooms({ idx }) {
  const Row = 6;
  const socket = useSocket();
  const {
    language,
    score_room,
    r_room,
    s_room,
    gun1,
    gun2,
    gun3,
    gun4,
    sUserCode,
    mb_money,
    mb_name,
    Site,
    userLimit,
    mb_multiBet,
  } = useStore();
  const [isEnter, setIsEnter] = useState(false);

  function Pool(index) {
    const Blank = (
      <li key={index}>
        <div className="in"></div>
      </li>
    );
    if (!r_room[idx].length) {
      return Blank;
    }

    const PoolShowTotal = Row * Row;
    const PoolEmpty = Row;
    const PoolShowOver = PoolShowTotal - PoolEmpty;

    let diffLength = 0;
    let PoolData = [];
    if (r_room[idx].length <= PoolShowOver) {
      PoolData = r_room[idx];
    } else {
      diffLength = PoolShowTotal - r_room[idx].length;
      const reLength =
        diffLength === 1
          ? -36
          : (((r_room[idx].length % PoolShowTotal) % PoolEmpty) +
              PoolShowOver) *
            -1;
      PoolData = r_room[idx].slice(reLength);
    }

    if (PoolData?.[index]) {
      let firstName = "";

      let startNum = 1;
      switch (PoolData[index].sWinner) {
        case "Player":
          firstName += "P";
          startNum = 5;
          break;
        case "Tie":
          firstName += "T";
          startNum = 9;
          break;
        case "Banker":
          firstName += "B";
          startNum = 1;
          break;
        default:
          firstName = "";
          break;
      }
      if (firstName !== "") {
        switch (PoolData[index].sPair) {
          case "Banker_Pair":
            startNum += 2;
            break;
          case "Player_Pair":
            startNum += 1;
            break;
          case "Player_Pair,Banker_Pair":
          case "Banker_Pair,Player_Pair":
            startNum += 3;
            break;
          default:
            break;
        }
      }

      return (
        <li key={index}>
          <div className={`in gr_${startNum}`} id={`${index}`}>
            {firstName}
          </div>
        </li>
      );
    }
    return Blank;
  }
  function Gun1(index) {
    const Blank = (
      <li key={index}>
        <div className="in" id="">
          <span></span>
        </div>
      </li>
    );
    if (!r_room[idx].length) {
      return Blank;
    }

    const mod = Math.floor(index % Row);
    const namuzi = Math.floor(index / Row);

    if (!gun1?.[idx]?.new?.[mod]?.[namuzi]) {
      return Blank;
    }

    const reName = gun1[idx].new[mod][namuzi];
    if (reName.Win === "") return Blank;
    else {
      let startNum = reName.Win === "Player" ? 5 : 1;

      switch (reName.Pair) {
        case 3:
          startNum += 3;
          break;
        case 2:
          startNum += 2;
          break;
        case 1:
          startNum += 1;
          break;
        default:
          break;
      }
      let tieName = "glr_" + startNum + "_1";
      let tieCount = "";
      if (reName.TieCount === 0) tieName = "";
      else {
        tieCount = reName.TieCount;
      }
      return (
        <li key={index}>
          <div className={`in glr_${startNum} ${tieName}`} id="">
            <span>{tieCount}</span>
          </div>
        </li>
      );
    }
  }
  function Gun2(index) {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );

    if (!r_room[idx].length) {
      return Blank;
    }
    const numBlockRows = 3;
    const blockSize = 2; // 블록 한 변의 길이
    const blockRow = index % numBlockRows; // 나머지를 이용해 행 인덱스 구함
    const blockCol = Math.floor(index / numBlockRows); // 몫을 이용해 열 인덱스 구함
    // 블록 시작 좌표 계산
    const startRow = blockRow * blockSize;
    const startCol = blockCol * blockSize;

    // gun2 배열에서 값 가져오기 (없으면 기본값)
    const reName1 = gun2[idx][startRow]?.[startCol] || { Mark: "" };
    const reName2 = gun2[idx][startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = gun2[idx][startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = gun2[idx][startRow + 1]?.[startCol + 1] || { Mark: "" };

    return (
      <li key={index}>
        <span
          className={`lefttop ${
            reName1.Mark === "Player"
              ? "c1_2"
              : reName1.Mark === "Banker"
              ? "c1_1"
              : ""
          }`}
        ></span>
        <span
          className={`righttop ${
            reName2.Mark === "Player"
              ? "c1_2"
              : reName2.Mark === "Banker"
              ? "c1_1"
              : ""
          }`}
        ></span>
        <span
          className={`leftbottom ${
            reName3.Mark === "Player"
              ? "c1_2"
              : reName3.Mark === "Banker"
              ? "c1_1"
              : ""
          }`}
        ></span>
        <span
          className={`rightbottom ${
            reName4.Mark === "Player"
              ? "c1_2"
              : reName4.Mark === "Banker"
              ? "c1_1"
              : ""
          }`}
        ></span>
      </li>
    );
  }
  function Gun3(index) {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );
    if (!r_room[idx].length) {
      return Blank;
    }
    const numBlockRows = 3;
    const blockSize = 2; // 블록 한 변의 길이
    const blockRow = index % numBlockRows; // 나머지를 이용해 행 인덱스 구함
    const blockCol = Math.floor(index / numBlockRows); // 몫을 이용해 열 인덱스 구함
    // 블록 시작 좌표 계산
    const startRow = blockRow * blockSize;
    const startCol = blockCol * blockSize;

    // gun2 배열에서 값 가져오기 (없으면 기본값)
    const reName1 = gun3[idx][startRow]?.[startCol] || { Mark: "" };
    const reName2 = gun3[idx][startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = gun3[idx][startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = gun3[idx][startRow + 1]?.[startCol + 1] || { Mark: "" };
    return (
      <li key={index}>
        <span
          className={`lefttop ${
            reName1.Mark === "Player"
              ? "c2_2"
              : reName1.Mark === "Banker"
              ? "c2_1"
              : ""
          }`}
        ></span>
        <span
          className={`righttop ${
            reName2.Mark === "Player"
              ? "c2_2"
              : reName2.Mark === "Banker"
              ? "c2_1"
              : ""
          }`}
        ></span>
        <span
          className={`leftbottom ${
            reName3.Mark === "Player"
              ? "c2_2"
              : reName3.Mark === "Banker"
              ? "c2_1"
              : ""
          }`}
        ></span>
        <span
          className={`rightbottom ${
            reName4.Mark === "Player"
              ? "c2_2"
              : reName4.Mark === "Banker"
              ? "c2_1"
              : ""
          }`}
        ></span>
      </li>
    );
  }
  function Gun4(index) {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );
    if (!r_room[idx].length) {
      return Blank;
    }
    const numBlockRows = 3;
    const blockSize = 2; // 블록 한 변의 길이
    const blockRow = index % numBlockRows; // 나머지를 이용해 행 인덱스 구함
    const blockCol = Math.floor(index / numBlockRows); // 몫을 이용해 열 인덱스 구함
    // 블록 시작 좌표 계산
    const startRow = blockRow * blockSize;
    const startCol = blockCol * blockSize;

    // gun2 배열에서 값 가져오기 (없으면 기본값)
    const reName1 = gun4[idx][startRow]?.[startCol] || { Mark: "" };
    const reName2 = gun4[idx][startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = gun4[idx][startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = gun4[idx][startRow + 1]?.[startCol + 1] || { Mark: "" };
    return (
      <li key={index}>
        <span
          className={`lefttop ${
            reName1.Mark === "Player"
              ? "c3_2"
              : reName1.Mark === "Banker"
              ? "c3_1"
              : ""
          }`}
        ></span>
        <span
          className={`righttop ${
            reName2.Mark === "Player"
              ? "c3_2"
              : reName2.Mark === "Banker"
              ? "c3_1"
              : ""
          }`}
        ></span>
        <span
          className={`leftbottom ${
            reName3.Mark === "Player"
              ? "c3_2"
              : reName3.Mark === "Banker"
              ? "c3_1"
              : ""
          }`}
        ></span>
        <span
          className={`rightbottom ${
            reName4.Mark === "Player"
              ? "c3_2"
              : reName4.Mark === "Banker"
              ? "c3_1"
              : ""
          }`}
        ></span>
      </li>
    );
  }
  return (
    <div
      className="box speed "
      id="listbox_65"
      data-casino="13"
      data-gtype="speed"
      style={{
        display:
          Site === "" || s_room[idx]?.sSite === Site ? "inline-block" : "none",
      }}
    >
      <div className="ribbon_class speed">
        <span id="t_type_SPEED">{getTranslation(language, "SPEED")}</span>
      </div>
      <div className="ribbon_class_a">
        <span id="t_type_ABET">BET</span>
      </div>
      <div className="type">
        {" "}
        <h3 className="all">
          {/* <img src={`./require/logo_${s_room[idx].sSite}.png`} alt="" />{" "} */}
          <img src={`./require/0857logo.png`} alt="" />{" "}
          <span>{s_room[idx].RoomNumber}</span>
        </h3>{" "}
        <div id="class_id_65">
          {" "}
          <span>
            <span id="t_limit0">{getTranslation(language, "BetLimit")}</span> :{" "}
            <span id="bet_min_id">
              {moneyformatNumber(userLimit.bet_min || 0)}
            </span>{" "}
            ~{" "}
            <span id="bet_max_id">
              {moneyformatNumber(userLimit.bet_max || 0)}
            </span>
          </span>
          <div>
            {" "}
            <ul>
              {" "}
              <li>
                <span>
                  <span id="t_bet_min0">
                    {" "}
                    {getTranslation(language, "minmax")}
                  </span>
                  :
                </span>{" "}
                <div>
                  <span id="bet_min_id">
                    {moneyformatNumber(userLimit.bet_min || 0)}
                  </span>{" "}
                  ~{" "}
                  <span id="bet_max_id">
                    {moneyformatNumber(userLimit.bet_max || 0)}
                  </span>
                </div>
              </li>
              <li>
                <span>
                  <span id="t_tie_min0">
                    {getTranslation(language, "tie_minmax")}
                  </span>
                  :
                </span>{" "}
                <div>
                  <span id="tie_min_id">
                    {moneyformatNumber(userLimit.tie_min || 0)}
                  </span>{" "}
                  ~{" "}
                  <span id="tie_max_id">
                    {moneyformatNumber(userLimit.tie_max || 0)}
                  </span>
                </div>
              </li>
              <li>
                <span>
                  <span id="t_pair_min0">
                    {getTranslation(language, "pair_minmax")}
                  </span>
                  :
                </span>{" "}
                <div>
                  <span id="pair_min_id">
                    {moneyformatNumber(userLimit.pair_min || 0)}
                  </span>{" "}
                  ~{" "}
                  <span id="pair_max_id">
                    {moneyformatNumber(userLimit.pair_max || 0)}
                  </span>
                </div>
              </li>{" "}
            </ul>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      <div className="scoreboard2" id="sh_65">
        <ul className="Pools">
          {Array.from({ length: 6 * 6 }).map((_, i) => {
            return Pool(i);
          })}
        </ul>
        <div className="Guns">
          <ul className="Gun1s">
            {Array.from({ length: 6 * 22 }).map((_, index) => {
              return Gun1(index);
            })}
          </ul>
          <ul className="Gun2s">
            {Array.from({ length: 3 * 22 }).map((_, index) => {
              return Gun2(index);
            })}
          </ul>
          <div className="Gun34s">
            <ul className="Gun3s">
              {Array.from({ length: 3 * 11 }).map((_, index) => {
                return Gun3(index);
              })}
            </ul>
            <ul className="Gun4s">
              {Array.from({ length: 3 * 11 }).map((_, index) => {
                return Gun4(index);
              })}
            </ul>
          </div>
        </div>
        {s_room[idx].status === "Shuffle" && <div className="Shuffle"></div>}
      </div>
      <div className="bpt-time">
        <div id="bpt_time_65">
          <div className="play_text_list">
            {s_room[idx].Playing && getTranslation(language, "playing")}
          </div>
        </div>
      </div>{" "}
      <div className="bpt-info">
        <ul>
          <li className="txt-red">
            B <span id="bw65">{score_room[idx]?.[0]}</span>
          </li>{" "}
          <li className="txt-blue">
            P <span id="pw65">{score_room[idx]?.[1]}</span>
          </li>{" "}
          <li className="txt-green">
            T <span id="tw65">{score_room[idx]?.[2]}</span>
          </li>{" "}
        </ul>{" "}
        <button
          onClick={() => {
            if (isEnter) return;
            setIsEnter(true);
            socket.emit("EnterRoom", {
              RoomID: s_room[idx].RoomID,
              sUserCode: sUserCode,
              money: mb_money,
              name: mb_name,
              multiBet: mb_multiBet,
            });
          }}
          className={`${language}_enter`}
        ></button>{" "}
      </div>{" "}
    </div>
  );
}

export default Rooms;
