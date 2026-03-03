import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import "./App.css";
import { isLocalhost, moneyformatNumber, winCalc } from "./util";

const sites = [
  { key: "okura", label: "OKURA" },
  { key: "hann", label: "HANN" },
  { key: "maxim", label: "MAXIM" },
  { key: "nustar", label: "NUSTAR" },
];

function App({ socket }) {
  const [Title, setTitle] = useState("관리자 선택");
  const [showModal, setShowModal] = useState(false);
  const [ipValue, setIpValue] = useState("");
  const [pwValue, setPwValue] = useState(isLocalhost ? "1234" : "");
  const [curStep, setCurStep] = useState("Login");
  const [rooms, setRooms] = useState([]);
  const [curRoom, setCurRoom] = useState({});
  const [Pair, setPair] = useState([]);
  const [msg, setMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");

  const [LimitMsg, setLimitMsg] = useState("");
  const [limitType, setLimitType] = useState("");
  const [limitValue, setLimitValue] = useState("");
  const handleLimitValueChange = (e) => {
    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
    setLimitValue(raw);
  };

  const currentSiteRef = useRef("");
  const [Loading, setLoading] = useState(true);
  const ipInputRef = useRef(null);

  const init = React.useCallback(() => {
    setTitle("관리자 선택");
    setCurStep("Login");
    currentSiteRef.current = "";
    localStorage.clear();
    sessionStorage.clear();
    /* Login */
    setShowModal(false);
    setPwValue("");
    /* Login */
    /* Lobby */
    setRooms([]);
    /* Lobby */
    /* Room */
    setCurRoom({});
    /* Room */
  }, []);
  const main = React.useCallback(() => {
    init();
    setShowModal(false);
    setTitle("관리자 선택");
    setCurStep("Login");
  }, [init]);
  // 1️⃣ Register socket listeners once
  useEffect(() => {
    if (!socket || !socket.connected) {
      socket.connect();
    }
    socket.on("connect", async () => {
      const site = localStorage.getItem("site");
      const password = localStorage.getItem("pw");
      const manual2 = sessionStorage.getItem("manualLogin");
      console.log("site", site);
      console.log("password", password);
      console.log("manual2", manual2);

      if (manual2 && password && site) {
        let ip = "";
        await fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => (ip = data.ip))
          .catch((err) => console.error("IP fetch error:", err));
        setLoading(true);

        socket.emit("send_adminCheck_ctrl", {
          sIP: ip,
          sPassword: password,
          sSite: site,
        });
        setPwValue(password);
        currentSiteRef.current = site;
        setTitle(`관리자: ${site.toUpperCase()}`);
      } else {
        localStorage.removeItem("roomid");
        localStorage.removeItem("site");
        localStorage.removeItem("pw");
        setLoading(false);
        sessionStorage.setItem("manualLogin", true);
      }
    });
    /* Login */
    const rev_adminCheck_ctrl = () => {
      console.log("rev_adminCheck_ctrl");

      localStorage.setItem("pw", pwValue);
      localStorage.setItem("site", currentSiteRef.current);
      socket.emit("send_show_list_ctrl", { sSite: currentSiteRef.current });
    };
    socket.on("rev_adminCheck_ctrl", rev_adminCheck_ctrl);

    const Fail_adminCheck_ctrl = () => {
      alert("관리자 IP 또는 비밀번호가 틀립니다.");
      localStorage.removeItem("roomid");
      localStorage.removeItem("site");
      localStorage.removeItem("pw");

      setShowModal(false);
      ipInputRef.current?.focus();
    };
    socket.on("Fail_adminCheck_ctrl", Fail_adminCheck_ctrl);

    const rev_show_list_ctrl = (data) => {
      console.log("rev_show_list_ctrl", data);

      setCurRoom({});
      setRooms([]);
      setShowModal(false);
      setCurStep("Lobby");
      setRooms(data);
      setTitle(currentSiteRef.current.toUpperCase());

      const manual = sessionStorage.getItem("manualLogin");
      const roomid = localStorage.getItem("roomid");
      if (manual && roomid) {
        console.log("roomid", roomid);
        socket.emit("send_show_room_ctrl", { RoomID: roomid });
      } else {
        setLoading(false);
      }
    };
    socket.on("rev_show_list_ctrl", rev_show_list_ctrl);
    const rev_re_show_list_ctrl = (data) => {
      setCurRoom({});
      setRooms([]);
      setShowModal(false);
      setCurStep("Lobby");
      setRooms(data);
      setTitle(currentSiteRef.current.toUpperCase());
      setLoading(false);
    };
    socket.on("rev_re_show_list_ctrl", rev_re_show_list_ctrl);
    /* Login */
    const rev_show_room_ctrl = (data) => {
      console.log("dat", data);

      setCurStep("Room");
      setCurRoom(data);

      localStorage.setItem("roomid", data.RoomID);
      setLoading(false);
    };
    socket.on("rev_show_room_ctrl", rev_show_room_ctrl);
    const EnterFail_ctrl = () => {
      localStorage.removeItem("roomid");
      setLoading(false);
      alert("해당 룸에는 이미 입장되어 있습니다.");

      setShowModal(false);
    };
    socket.on("EnterFail_ctrl", EnterFail_ctrl);
    socket.on("disconnect", () => {
      setMsg("");
      setLimitMsg("");
      setConfirmOpen(false);
      setShowModal(false);
      setTitle("관리자 선택");

      setCurStep("Login");
    });
    return () => {
      socket.off("rev_show_list_ctrl", rev_show_list_ctrl);
      socket.off("rev_re_show_list_ctrl", rev_re_show_list_ctrl);
      socket.off("rev_adminCheck_ctrl", rev_adminCheck_ctrl);
      socket.off("Fail_adminCheck_ctrl", Fail_adminCheck_ctrl);
      socket.off("rev_show_room_ctrl", rev_show_room_ctrl);
      socket.off("EnterFail_ctrl", EnterFail_ctrl);
    };
  }, [ipValue, pwValue, socket]);

  // 2️⃣ Fetch IP when modal opens
  useEffect(() => {
    if (!showModal) return;
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIpValue(d.ip))
      .catch(() => setIpValue(""));
  }, [showModal]);

  // 3️⃣ Ensure input is focused after render
  useLayoutEffect(() => {
    if (showModal) ipInputRef.current?.focus();
  }, [showModal]);

  // button click to open admin modal
  const adminCheck = (key) => {
    currentSiteRef.current = key;
    setTitle(`관리자: ${key.toUpperCase()}`);
    setShowModal(true);
  };

  // cancel admin modal
  const handleCancel = () => {
    setShowModal(false);
    setIpValue("");
    setPwValue("");
    setTitle("관리자 선택");
  };

  // emit admin credentials
  const handleOk = () => {
    socket.emit("send_adminCheck_ctrl", {
      sIP: ipValue,
      sPassword: pwValue,
      sSite: currentSiteRef.current,
    });
  };
  const handlePairChange = (e) => {
    const { name, checked } = e.target;
    setPair((prev) => {
      if (checked) {
        // 체크됐으면 추가 (중복 방지)
        return prev.includes(name) ? prev : [...prev, name];
      } else {
        // 해제됐으면 제거
        return prev.filter((item) => item !== name);
      }
    });
  };
  // show confirm modal
  const handleSendResult = (type) => {
    setConfirmType(type);
    setMsg("결과를 전송하시겠습니까?");
    setConfirmOpen(true);
  };

  const confirmYes = () => {
    if (msg === "슈 초기화를 진행하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("ForceShoeChange_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
      });
      return;
    } else if (msg === "가장 최신 결과의 데이터를 삭제합니다.") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("ForceResultDelete_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
      });
      return;
    } else if (msg === "프라이빗 룸을 추가하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setPrivate_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: true,
      });
      return;
    } else if (msg === "프라이빗 룸을 삭제하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setPrivate", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: false,
      });
      return;
    } else if (msg === "논 커미션 룸을 추가하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setCommition_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: true,
      });
      return;
    } else if (msg === "논 커미션 룸을 삭제하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setCommition_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: false,
      });
      return;
    } else if (msg === "Super6를(을) 추가하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setSixType_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: true,
        six: "super6",
      });
      return;
    } else if (msg === "Super6를(을) 삭제하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setSixType_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: false,
        six: "super6",
      });
      return;
    } else if (msg === "Tiger6를(을) 추가하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setSixType", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: true,
        six: "tiger6",
      });
      return;
    } else if (msg === "Tiger6를(을) 삭제하시겠습니까?") {
      setMsg("");
      setConfirmOpen(false);

      socket.emit("setSixType", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        add: false,
        six: "tiger6",
      });
      return;
    } else if (LimitMsg === "베팅금액을 적어주세요") {
      setLimitMsg("");
      socket.emit("setLimit_ctrl", {
        RoomID: curRoom.RoomID,
        sSite: currentSiteRef.current,
        where: limitType,
        money: limitValue,
      });
      return;
    }

    // console.log(`Confirmed action: ${confirmType}`, "Pairs:", Pair);

    let player = [];
    let banker = [];
    if (confirmType === "Player") {
      player = [
        { shape: 4, number: 9 },
        { shape: 4, number: 12 },
      ];
      banker = [
        { shape: 3, number: 8 },
        { shape: 2, number: 12 },
      ];
    } else if (confirmType === "Tie") {
      player = [
        { shape: 4, number: 9 },
        { shape: 4, number: 12 },
      ];
      banker = [
        { shape: 3, number: 9 },
        { shape: 2, number: 12 },
      ];
    } else if (confirmType === "Banker") {
      player = [
        { shape: 4, number: 8 },
        { shape: 4, number: 12 },
      ];
      banker = [
        { shape: 3, number: 9 },
        { shape: 2, number: 12 },
      ];
    }

    if (Pair.length === 1) {
      if (Pair.includes("Player_Pair")) {
        if (confirmType === "Player") {
          player[0].number = 9;
          player[1].number = 9;
          banker[0].number = 8;
          banker[1].number = 9;
        } else if (confirmType === "Banker") {
          player[0].number = 4;
          player[1].number = 4;
          banker[0].number = 5;
          banker[1].number = 4;
        } else if (confirmType === "Tie") {
          player[0].number = 9;
          player[1].number = 9;
          banker[0].number = 6;
          banker[1].number = 2;
        }
      } else if (Pair.includes("Banker_Pair")) {
        if (confirmType === "Player") {
          player[0].number = 4;
          player[1].number = 5;
          banker[0].number = 9;
          banker[1].number = 9;
        } else if (confirmType === "Banker") {
          player[0].number = 3;
          player[1].number = 4;
          banker[0].number = 4;
          banker[1].number = 4;
        } else if (confirmType === "Tie") {
          player[0].number = 6;
          player[1].number = 2;
          banker[0].number = 9;
          banker[1].number = 9;
        }
      }
    } else if (Pair.length === 2) {
      if (confirmType === "Player") {
        player[0].number = 9;
        player[1].number = 9;
        banker[0].number = 3;
        banker[1].number = 3;
      } else if (confirmType === "Banker") {
        player[0].number = 3;
        player[1].number = 3;
        banker[0].number = 9;
        banker[1].number = 9;
      } else if (confirmType === "Tie") {
        player[0].number = 9;
        player[1].number = 9;
        banker[0].number = 9;
        banker[1].number = 9;
      }
    }

    const end = winCalc(player, banker).OriginText;

    socket.emit("send_manual_result_ctrl", {
      end: end,
      RoomID: curRoom.RoomID,
      type: "Typing",
    });
    // emit or handle action here
    setConfirmOpen(false);
    setPair([]);
    setConfirmType("");
  };

  const confirmNo = () => {
    setConfirmOpen(false);
    setMsg("");
    setLimitMsg("");
    setPair([]);
  };

  const setLimitMoney = (type, curMoney) => {
    return;
    // eslint-disable-next-line no-unreachable
    setLimitMsg("베팅금액을 적어주세요");
    setLimitType(type);
    setLimitValue(curMoney);
  };
  return (
    <div className={`App_Range ${curStep}`}>
      {Loading && (
        <div className="Loading">
          <img src="./loading.gif" alt="Loading..." />
        </div>
      )}
      <div className="Header">
        {/* {curStep !== "Login" && (
          <button
            className="home-btn"
            onClick={() => {
              setMsg("");
              setConfirmOpen(false);
              setShowModal(false);
              setTitle("관리자 선택");

              setCurStep("Login");
            }}
          >
            🏠
          </button>
        )} */}
        <div className="header-title">
          {curStep !== "Login" && (
            <img
              src={`/${currentSiteRef.current}.png`}
              alt={Title}
              className="header-icon"
            />
          )}
          {Title}
          {curStep === "Room" && ` - ${curRoom.RoomNumber}`}
        </div>
        {curStep !== "Login" && (
          <button
            className="back-btn"
            onClick={() => {
              if (curStep === "Room") {
                localStorage.removeItem("roomid");
                socket.emit("send_re_show_list_ctrl", {
                  RoomID: curRoom.RoomID,
                });
              } else if (curStep === "Lobby") {
                main();
              }
            }}
          >
            <img src="./backbtn.png" alt="" />
          </button>
        )}
      </div>

      {curStep === "Login" && (
        <div className="button-group">
          {sites.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => adminCheck(key)}
              className="site-button"
            >
              <img src={`/${key}.png`} alt={label} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {curStep === "Lobby" && (
        <div className="lobby">
          <div className="room-buttons">
            {rooms
              .filter((el) => el.sSite === currentSiteRef.current)
              .map((room) => (
                <button
                  key={room.RoomNumber}
                  onClick={() =>
                    socket.emit("send_show_room_ctrl", { RoomID: room.RoomID })
                  }
                  className="room-button"
                >
                  {room.RoomNumber}
                </button>
              ))}
          </div>
        </div>
      )}

      {curStep === "Room" && (
        <div className="room-details">
          {/* Top bet buttons */}
          <div className="bet-buttonbtn">
            <div className="bet-buttons">
              <button
                onClick={() => handleSendResult("Player")}
                className="bet-btn bet-player"
              >
                PLAYER
              </button>
              <button
                onClick={() => handleSendResult("Tie")}
                className="bet-btn bet-tie"
              >
                TIE
              </button>
              <button
                onClick={() => handleSendResult("Banker")}
                className="bet-btn bet-banker"
              >
                BANKER
              </button>
            </div>
            {/* Pair switches */}
            <div className="pair-toggles">
              <div className="pair-group">
                <span className="switch-label">Player Pair</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Pair.includes("Player_Pair")}
                    onChange={handlePairChange}
                    name="Player_Pair"
                  />
                  <span className="slider round" />
                </label>
              </div>

              <div className="pair-group">
                <span className="switch-label">Banker Pair</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Pair.includes("Banker_Pair")}
                    onChange={handlePairChange}
                    name="Banker_Pair"
                  />
                  <span className="slider round" />
                </label>
              </div>
            </div>
          </div>
          {/* Shoe change & Error */}
          <button
            onClick={() => {
              setMsg("슈 초기화를 진행하시겠습니까?");
              setConfirmOpen(true);
            }}
            className="control-btn shoe-btn"
          >
            SHOE CHANGE
          </button>
          <button
            onClick={() => {
              setMsg("가장 최신 결과의 데이터를 삭제합니다.");
              setConfirmOpen(true);
            }}
            className="control-btn error-btn"
          >
            ERROR
          </button>

          {/* Action buttons */}
          <div className="action-buttons">
            <button className="action-btn green">AVATA</button>
            <button className="action-btn blue">SPEED</button>
            {false && (
              <button
                onClick={() => {
                  setMsg("프라이빗 룸을 추가하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn orange"
              >
                PRIVATE ADD
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("프라이빗 룸을 삭제하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn purple"
              >
                PRIVATE DELETE
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("논 커미션 룸을 추가하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn yellow"
              >
                NON-CM ADD
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("논 커미션 룸을 삭제하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn teal"
              >
                NON-CM DELETE
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("Super6를(을) 추가하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn pink"
              >
                Super6 ADD
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("Super6를(을) 삭제하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn brown"
              >
                Super6 DELETE
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("Tiger6를(을) 추가하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn lavender"
              >
                Tiger6 ADD
              </button>
            )}
            {false && (
              <button
                onClick={() => {
                  setMsg("Tiger6를(을) 삭제하시겠습니까?");
                  setConfirmOpen(true);
                }}
                className="action-btn cream"
              >
                Tiger6 DELETE
              </button>
            )}
          </div>

          {/* Result inputs */}
          <div className="result-inputs">
            <div className="result-row">
              <div
                className="left"
                onClick={() => {
                  setLimitMoney("min", curRoom.LimitBet.KRW.min);
                }}
              >
                {moneyformatNumber(curRoom.LimitBet.KRW.min)}
              </div>
              <div className="center">PLAYER</div>
              <div
                className="right"
                onClick={() => {
                  setLimitMoney("max", curRoom.LimitBet.KRW.max);
                }}
              >
                {moneyformatNumber(curRoom.LimitBet.KRW.max)}
              </div>
            </div>
            <div className="result-row">
              <div
                className="left"
                onClick={() => {
                  setLimitMoney("min_tie", curRoom.LimitBet.KRW.min_tie);
                }}
              >
                {moneyformatNumber(curRoom.LimitBet.KRW.min_tie)}
              </div>
              <div className="center">Tie</div>
              <div
                className="right"
                onClick={() => {
                  setLimitMoney("max_tie", curRoom.LimitBet.KRW.max_tie);
                }}
              >
                {moneyformatNumber(curRoom.LimitBet.KRW.max_tie)}
              </div>
            </div>
            <div className="result-row">
              <div
                className="left"
                onClick={() => {
                  setLimitMoney("min_pair", curRoom.LimitBet.KRW.min_pair);
                }}
              >
                {moneyformatNumber(curRoom.LimitBet.KRW.min_pair)}
              </div>
              <div className="center">Pair</div>
              <div
                className="right"
                onClick={() => {
                  setLimitMoney("max_pair", curRoom.LimitBet.KRW.max_pair);
                }}
              >
                {moneyformatNumber(curRoom.LimitBet.KRW.max_pair)}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Setting IP</h2>
            <input
              style={{ display: "none" }}
              type="text"
              value={ipValue}
              disabled
              onChange={(e) => setIpValue(e.target.value)}
              placeholder="IP"
            />
            <input
              ref={ipInputRef}
              type="password"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              placeholder="PASSWORD"
            />
            <div className="modal-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleOk}>OK</button>
            </div>
          </div>
        </div>
      )}
      {LimitMsg !== "" && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>{LimitMsg}</p>
            <input
              type="text"
              value={
                limitValue === "" ? "" : moneyformatNumber(Number(limitValue))
              }
              onChange={handleLimitValueChange}
              placeholder="Limit"
            />

            <div className="confirm-buttons">
              <button onClick={confirmNo}>취소</button>
              <button onClick={confirmYes}>확인</button>
            </div>
          </div>
        </div>
      )}
      {confirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>
              {msg === "결과를 전송하시겠습니까?" && (
                <>
                  {confirmType}-[{Pair}] <br />
                </>
              )}
              {msg}
            </p>
            <div className="confirm-buttons">
              <button onClick={confirmNo}>취소</button>
              <button onClick={confirmYes}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
