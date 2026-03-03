import { useCallback, useEffect, useState } from "react";
import { useStore } from "../store";
import {
  getTranslation,
  isLandscape,
  isMobile,
  moneyformatNumber,
} from "../util";
import { useSocket } from "../SocketContext";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, parseISO } from "date-fns";

function LayerRule({ btn_betlog, setBtn_betlog }) {
  const socket = useSocket();
  const {
    setKindchip,
    All_CHIPS,
    toggleChipSel,
    Kindchip,
    language,
    mb_id,
    betLog,
  } = useStore();

  const [chips, setChips] = useState(() =>
    All_CHIPS.map((chip) => ({ ...chip }))
  );
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);

  const onClose = useCallback(() => {
    setKindchip(false);
    setBtn_betlog(false);
  }, [setKindchip, setBtn_betlog]);

  function onSubmit() {
    // const allHidden = chips.every((chip) => !chip.show);
    // console.log("aalHidden", allHidden);

    const newChipList = chips.map((chip) => (chip.show ? 1 : 0));
    console.log("newChipList", newChipList);
    socket.emit("send_chipList", {
      chipList: newChipList.join(","),
      sUserID: mb_id,
    });
  }

  const toggleChip = (idx) => {
    // Create a copy of the chips array and toggle the `show` property
    const updatedChips = [...chips];
    updatedChips[idx].show = !updatedChips[idx].show;
    setChips(updatedChips); // Update state, triggers re-render
    console.log("이게 왜 바뀌는건데");
  };

  const handleSubmit = () => {
    onSubmit();
  };

  const logs = (data, key) => {
    const color =
      data.sBettingPos === "Banker" || data.sBettingPos === "Banker_Pair"
        ? "red"
        : data.sBettingPos === "Player" || data.sBettingPos === "Player_Pair"
        ? "blue"
        : "green";

    const wins = (data.sCardResult || "").split(",").filter(Boolean);

    return (
      <tr key={key}>
        <th>{data.sSite.toUpperCase()}</th>
        <th>{data.sRoomNumber}</th>
        <th>{data.sShoeNumber}</th>
        <th>{data.sShoeGameNumber}</th>
        <th>{data.sLogNumber}</th>
        <th>
          {wins.map((el, idx) => {
            return (
              <img
                key={idx}
                src={`./require/ico_score${ScoreImg(el)}.png`}
                style={{ width: "25px" }}
                alt="Score Icon"
              />
            );
          })}
        </th>
        <th className={`txt-${color}`}>{data.sBettingPos.toUpperCase()}</th>
        <th>{moneyformatNumber(data.nBettingMoney)}</th>
        <th>
          {moneyformatNumber(
            data.nWinnerMoney === 0
              ? data.nBettingMoney * -1
              : data.nWinnerMoney
          )}
        </th>
        <th
          className={`txt-${
            data.sResult === "Win"
              ? "red"
              : data.sResult === "Lose"
              ? "blue"
              : "green"
          }`}
        >
          {data.sResult.toUpperCase()}
        </th>
        <th>{format(parseISO(data.dRegDate), "yyyy-MM-dd HH:mm:ss")}</th>
      </tr>
    );
  };
  function ScoreImg(data) {
    let Score_img = "";
    switch (data) {
      case "Player":
        Score_img = "2";
        break;
      case "Banker":
        Score_img = "1";
        break;
      case "Banker_Pair":
        Score_img = "4";
        break;
      case "Player_Pair":
        Score_img = "5";
        break;
      case "Tie":
        Score_img = "3";
        break;
      default:
        console.log("error");

        break;
    }
    return Score_img;
  }
  useEffect(() => {
    socket.on("rev_chipList", (data) => {
      console.log("data", data);

      const chipList = data.chipList.split(",");
      const updatedChips = All_CHIPS.map((chip, idx) => ({
        ...chip,
        show: chipList[idx] > 0,
      }));
      toggleChipSel(updatedChips);
      setChips(updatedChips);
      onClose();
    });
    return () => {
      socket.off("rev_chipList");
    };
  }, [All_CHIPS, onClose, socket, toggleChipSel]);
  return (
    <div className="layerpopup rule" id="popContent">
      <div className="pop_cont">
        <div
          className="content"
          style={{
            width: isMobile() && !isLandscape() && btn_betlog ? "100%" : "",
          }}
        >
          {btn_betlog && (
            <div
              style={{
                width: isMobile() && !isLandscape() && btn_betlog ? "100%" : "",
              }}
            >
              <div className="content-info">
                <div className="title">
                  <h4 id="txt_btn_list">배팅내역</h4>
                  <span className="close" onClick={onClose}></span>
                </div>
                <div className="content-box">
                  <div className="search">
                    <table className="title-table">
                      <colgroup>
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "40%" }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th>
                            <span id="t_startdate_txt">
                              {getTranslation(language, "startDay")}
                            </span>{" "}
                            :
                            <input
                              className="startDate"
                              type="text"
                              readOnly
                              onClick={() => setShowStartCal((v) => !v)}
                              value={
                                startDate ? format(startDate, "yyyy-MM-dd") : ""
                              }
                              placeholder="YYYY-MM-DD"
                            />
                            {showStartCal && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "2rem",
                                  left: 0,
                                  zIndex: 100,
                                }}
                              >
                                <Calendar
                                  value={startDate || new Date()}
                                  onChange={(date) => {
                                    setStartDate(date);
                                    setShowStartCal(false);
                                  }}
                                />
                              </div>
                            )}
                          </th>
                          <th>
                            <span id="t_enddate_txt">
                              {getTranslation(language, "endDay")}
                            </span>{" "}
                            :
                            <input
                              className="EndDate"
                              type="text"
                              readOnly
                              onClick={() => setShowEndCal((v) => !v)}
                              value={
                                endDate ? format(endDate, "yyyy-MM-dd") : ""
                              }
                              placeholder="YYYY-MM-DD"
                            />
                            {showEndCal && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "2rem",
                                  left: 0,
                                  zIndex: 100,
                                }}
                              >
                                <Calendar
                                  value={endDate || new Date()}
                                  onChange={(date) => {
                                    console.log("date", date);

                                    setEndDate(date);
                                    setShowEndCal(false);
                                  }}
                                />
                              </div>
                            )}
                          </th>
                          <th style={{ textAlign: "right" }}>
                            <button
                              onClick={() => {
                                const s = startDate
                                  ? `${format(
                                      startDate,
                                      "yyyy-MM-dd"
                                    )} 00:00:00`
                                  : "";
                                const e = endDate
                                  ? `${format(endDate, "yyyy-MM-dd")} 23:59:59`
                                  : "";
                                socket.emit("betLog", {
                                  startDate: s,
                                  endDate: e,
                                  sUserID: mb_id,
                                });
                              }}
                              id="t_search_txt"
                            >
                              {getTranslation(language, "search")}
                            </button>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div
                    id="loading"
                    style={{ textAlign: "center", display: "none" }}
                  >
                    <img
                      id="loading-image"
                      src="./require/loading.gif"
                      alt="Loading..."
                    />
                  </div>
                  <div
                    className="scroll"
                    style={{
                      border: "1px solid rgb(50, 56, 76)",
                    }}
                  >
                    <table className="p_table">
                      <colgroup>
                        <col
                          style={{
                            width:
                              !isMobile() && !isLandscape ? "10%" : "100px",
                          }}
                        />
                        <col
                          style={{
                            width:
                              !isMobile() && !isLandscape ? "10%" : "100px",
                          }}
                        />
                        <col
                          style={{
                            width: !isMobile() && !isLandscape ? "8%" : "80px",
                          }}
                        />
                        {/* <!--<col style="width:5%" />--> */}
                        <col style={{ width: !isMobile() ? "5%" : "60px" }} />
                        {/* <!--<col style="width:6%" />--> */}
                        <col style={{ width: !isMobile() ? "8%" : "110px" }} />
                        {/* <!--<col style="width:7%" />--> */}
                        {/* <!--<col style="width:7%" />--> */}
                        <col
                          style={{
                            width: !isMobile() && !isLandscape ? "7%" : "130px",
                          }}
                        />
                        <col
                          style={{
                            width: !isMobile() && !isLandscape ? "7%" : "70px",
                          }}
                        />

                        <col
                          style={{
                            width: !isMobile() && !isLandscape ? "8%" : "80px",
                          }}
                        />
                        <col
                          style={{
                            width: !isMobile() && !isLandscape ? "9%" : "90px",
                          }}
                        />
                        <col
                          style={{
                            width: !isMobile() && !isLandscape ? "8%" : "80px",
                          }}
                        />
                        <col
                          style={{
                            width:
                              !isMobile() && !isLandscape ? "20%" : "200px",
                          }}
                        />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>
                            <span id="t_lang_casino_name">CASINO</span>
                          </th>
                          <th>
                            <span id="t_lang_table_name">TABLE</span>
                          </th>
                          <th>
                            <span id="t_lang_shoe_name">SHOE</span>
                          </th>
                          <th>
                            <span id="t_lang_gameno_name">GameNo</span>
                          </th>
                          <th>
                            <span id="t_lang_game_no">
                              {getTranslation(language, "gameNumber")}
                            </span>
                          </th>
                          <th>
                            <span id="t_lang_game_result">
                              {getTranslation(language, "gameResult")}
                            </span>
                          </th>
                          <th>
                            <span id="t_lang_game_bettype">
                              {getTranslation(language, "betType")}
                            </span>
                          </th>
                          {/* <!--<th><span id="t_lang_game_beforemoney"></span></th>--> */}
                          <th>
                            <span id="t_lang_game_betmoneys">
                              {getTranslation(language, "betAmount")}
                            </span>
                          </th>
                          {/* <!--<th><span id="t_lang_game_betaftermoney"></span></th>--> */}
                          <th>
                            <span id="t_lang_game_resultmoney">
                              {getTranslation(language, "resultAmount")}
                            </span>
                          </th>
                          {/* <!--<th><span id="t_lang_game_resultaftermoney"></span></th>--> */}
                          {/* <!--<th><span id="t_lang_game_resultlastmoney"></span></th>--> */}
                          <th>
                            <span id="t_lang_game_betresult">
                              {getTranslation(language, "bettingResult")}
                            </span>
                          </th>
                          <th>
                            <span id="t_lang_game_date">
                              {getTranslation(language, "date")}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {betLog.map((el, idx) => {
                          return logs(el, idx);
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ul className="layer-button">
                    <li>
                      <button
                        onClick={() => {
                          setBtn_betlog(false);
                        }}
                        // onclick='$("#popContent").css("display","none");'
                        id="txt_t_ok"
                      >
                        {getTranslation(language, "confirm")}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {Kindchip && (
            <div>
              <div className="content-info">
                <div className="title">
                  <h4 id="txt_sb">Chip</h4>
                  <span className="close" onClick={onClose} />
                </div>

                <div className="content-box">
                  <ul className="chip_setup_ul">
                    {chips.map((chip, idx) => {
                      return (
                        <li key={chip.num}>
                          <label>
                            <div>
                              <input
                                type="checkbox"
                                checked={chip.show}
                                id={`chip${chip.num}`}
                                name={`chip${chip.num}`}
                                value={`chip${chip.num}`}
                                onChange={() => toggleChip(idx)}
                              />
                            </div>
                            <div>
                              <span className={`chip chip-${chip.num}`}></span>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <ul
                    className="layer-button"
                    style={{
                      listStyle: "none",
                      padding: 0,
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    <li>
                      <button onClick={handleSubmit} id="txt_t_ok">
                        OK
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* <div className="bg-opacity"></div> */}
      </div>
    </div>
  );
}
export default LayerRule;
