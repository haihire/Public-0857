import { useEffect, useRef, useState } from "react";
import { useSocket } from "../SocketContext";
import { useStore } from "../store";
import {
  Expects,
  getTranslation,
  GunSet,
  isFullScreen,
  isMobile,
  moneyformatNumber,
} from "../util";

function BettingInfo({ setBtn_betlog }) {
  const {
    r_room,
    id,
    language,

    Roomgun1,
    RoomGun1Col,
    Roomgun4,
    Roomgun3,
    Roomgun2,
    RoomGun2Col,
    RoomGun3Col,
    RoomGun4Col,
    setIsMove,
    momentwinMoney,
    mb_money,
    setRoom_r,
    setRoomGun1,
    setRoomGun2,
    setRoomGun3,
    setRoomGun4,
    gun1,
    gun2,
    gun3,
    gun4,
    setPoolClick,
    setScoreB,
    setScoreP,
    setWinner,
    setCardB,
    setCardP,
    setShoeNumber,
    setGameCount,
    TimeState,
    whiteMoney,
    setBetLog,
    reversalColor,
    ColorRoomgun1,
    setColorRoomGun1,
    score_room,
  } = useStore();
  const socket = useSocket();
  const [isfull, setIsfull] = useState(isFullScreen());
  const [land, setLand] = useState(false);
  useEffect(() => {
    const updateIsFull = () => {
      setIsfull(isFullScreen());
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isLandscape = viewportWidth > viewportHeight;
      setLand(isLandscape);
    };
    updateIsFull();
    window.addEventListener("resize", updateIsFull);
    return () => {
      window.removeEventListener("resize", updateIsFull);
    };
  }, []);

  const [open, setOpen] = useState(false);

  const [add, setAdd] = useState(false);
  const latestRoomDataRef = useRef(null);
  function gun_click(type) {
    if (!TimeState.State) return;
    if (add) return;
    setAdd(true);

    const newData = [
      ...r_room[id],
      type === "Player"
        ? {
            sBanker_Score: "0",
            sPlayer_Score: "7",
            sWinner: "Player",
            sPair: "",
          }
        : {
            sBanker_Score: "7",
            sPlayer_Score: "0",
            sWinner: "Banker",
            sPair: "",
          },
    ];

    setRoom_r(id, newData);
    RoomGunSets(newData);
    RoomGunSet(newData);
    setTimeout(() => {
      const latestData = latestRoomDataRef.current || r_room[id];
      RoomGunSets(latestData);
      RoomGunSet(latestData);
      setRoom_r(id, latestData);
      latestData.current = null;
      setAdd(false);
    }, 2000);
  }
  const Row = 6;
  function RoomGunSets(r_room) {
    const { g1, g2, g3, g4 } = GunSet(r_room, {
      Row,
      RoomGun1Col,
      RoomGun2Col,
      RoomGun3Col,
      RoomGun4Col,
    });

    if (Roomgun1 !== g1) {
      setRoomGun1(g1);
    }

    if (Roomgun2 !== g2) {
      setRoomGun2(g2);
    }

    if (Roomgun3 !== g3) {
      setRoomGun3(g3);
    }
    if (Roomgun4 !== g4) {
      setRoomGun4(g4);
    }
  }
  function RoomGunSet(r_room) {
    const { g1 } = GunSet(
      r_room,
      {
        Row,
        RoomGun1Col,
      },
      true
    );

    if (ColorRoomgun1 !== g1) {
      setColorRoomGun1(g1);
    }
  }
  function getPredict(data) {
    if (data === "Player") {
      return "2";
    } else if (data === "Banker") {
      return "1";
    }
    return "";
  }
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsfull(true);
        })
        .catch((err) => {
          console.error("Error entering fullscreen", err);
        });
    } else {
      alert("전체화면 모드가 지원되지 않습니다.");
    }
  };
  // 전체화면 모드 종료
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document
        .exitFullscreen()
        .then(() => {
          setIsfull(false);
        })
        .catch((err) => {
          console.error("Error exiting fullscreen", err);
        });
    }
  };
  useEffect(() => {
    const selectors = [
      ".beadplate2",
      ".bigroad",
      ".bigeyeboy",
      ".smallroad",
      ".cockroachpig",
    ];
    const sliders = selectors
      .map((sel) => document.querySelector(sel))
      .filter((el) => el != null);

    // 각 요소별로 핸들러 참조를 저장할 맵
    const handlersMap = new Map();

    sliders.forEach((el) => {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      const onMouseDown = (e) => {
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      };
      const onMouseLeave = () => {
        isDown = false;
      };
      const onMouseUp = () => {
        isDown = false;
      };
      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2; // 스크롤 속도 조절
        el.scrollLeft = scrollLeft - walk;
      };

      el.scrollLeft = 0;

      if (r_room?.[id]?.length !== 0) {
        const name = el.className;

        if (name === "beadplate2" && r_room?.[id]?.length > 66) {
          const maxScrollLeft = el.scrollWidth - el.clientWidth;
          const lastRecord = r_room[id].length - 66;
          const autoScroll = Math.ceil(lastRecord / 6) + 2;
          el.scrollLeft = Math.min(Math.max(autoScroll * 45), maxScrollLeft);
        }

        if (name === "bigroad" && gun1?.[id]?.old?.[0]) {
          const findArray = gun1[id].old[0];
          const idx = findArray.findIndex((item) => item.Win === "");

          if (idx > 26) {
            const maxScrollLeft = el.scrollWidth - el.clientWidth;
            const lastidx = Math.floor(idx / 2);
            el.scrollLeft = Math.min(Math.max(lastidx * 23), maxScrollLeft);
          }
        }

        if (name === "bigeyeboy" && gun2?.[id]?.[0]) {
          const findArray = gun2[id][0];
          const idx = findArray.findIndex((item) => item.Mark === "");
          if (idx === -1) {
            const maxScrollLeft = el.scrollWidth - el.clientWidth;

            el.scrollLeft = maxScrollLeft;
          }
        }

        if (name === "smallroad" && gun3?.[id]?.[0]) {
          const findArray = gun3[id][0];
          const idx = findArray.findIndex((item) => item.Mark === "");
          if (idx === -1) {
            const maxScrollLeft = el.scrollWidth - el.clientWidth;
            el.scrollLeft = maxScrollLeft;
          }
        }

        if (name === "cockroachpig" && gun4?.[id]?.[0]) {
          const findArray = gun4[id][0];
          const idx = findArray.findIndex((item) => item.Mark === "");
          if (idx === -1) {
            const maxScrollLeft = el.scrollWidth - el.clientWidth;
            el.scrollLeft = maxScrollLeft;
          }
        }
      }

      // 이벤트 등록
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("mouseleave", onMouseLeave);
      el.addEventListener("mouseup", onMouseUp);
      el.addEventListener("mousemove", onMouseMove);

      // 나중에 제거할 수 있도록 저장
      handlersMap.set(el, {
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove,
      });
    });

    // cleanup: 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      sliders.forEach((el) => {
        const h = handlersMap.get(el);
        if (h) {
          el.removeEventListener("mousedown", h.onMouseDown);
          el.removeEventListener("mouseleave", h.onMouseLeave);
          el.removeEventListener("mouseup", h.onMouseUp);
          el.removeEventListener("mousemove", h.onMouseMove);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, r_room[id]?.length === 0]);
  function quickOption(type) {
    setOpen(false);
    switch (type) {
      case "history":
        setBetLog([]);
        setBtn_betlog(true);
        break;
      case "move":
        setIsMove(true);
        break;
      case "exit":
        socket.emit("ExitRoom");
        break;
      case "refresh":
        window.location.reload();
        break;
      case "exitFull":
        exitFullscreen();
        break;
      case "enterFull":
        enterFullscreen();
        break;

      default:
        console.log("default");
        break;
    }
  }
  function Pool(index) {
    const record = r_room?.[id]?.[index];
    const Blank = (
      <li key={index}>
        <div className="in" id={`${index}`}></div>
      </li>
    );

    if (!record) return Blank;
    // 카드 문자열 → { Num, Shape } 객체로 변환하는 헬퍼
    const mapCard = (cardStr) => {
      if (!cardStr) return null;
      const suit = cardStr.charAt(0);
      const value = parseInt(cardStr.slice(1), 10);
      const suitMap = { "◆": 1, "♣": 2, "♥": 3, "♠": 4 };
      return { Num: value, Shape: suitMap[suit] || 0 };
    };
    // Player / Banker 카드 배열 생성
    const pCard = [
      mapCard(record.sPlayer_1_Card),
      mapCard(record.sPlayer_2_Card),
      mapCard(record.sPlayer_3_Card),
    ].filter(Boolean);

    const bCard = [
      mapCard(record.sBanker_1_Card),
      mapCard(record.sBanker_2_Card),
      mapCard(record.sBanker_3_Card),
    ].filter(Boolean);
    let firstName = "";

    let startNum = 1;
    switch (record.sWinner) {
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
    if (firstName) {
      switch (record.sPair) {
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
      <li
        key={index}
        onClick={() => {
          if (add) return;
          setShoeNumber(record.sShoeNumber);
          setGameCount(index + 1);
          // 점수는 숫자로 변환
          setScoreP(Number(record.sPlayer_Score));
          setScoreB(Number(record.sBanker_Score));
          // 승자는 배열 형태로
          setWinner([record.sWinner]);
          // 변환된 카드 배열
          setCardP(pCard);
          setCardB(bCard);
          setPoolClick(true);
        }}
      >
        <div className={`in gr_${startNum}`} id={`${index}`}>
          {firstName}
        </div>
      </li>
    );
  }
  function Gun1El(index) {
    const Blank = (
      <li key={index}>
        <div className="in" id="">
          <span></span>
        </div>
      </li>
    );
    const selGun = !reversalColor ? Roomgun1 : ColorRoomgun1;
    if (!selGun?.new?.length) {
      return Blank;
    }

    const mod = Math.floor(index % 6);
    const namuzi = Math.floor(index / 6);

    if (!selGun?.new?.[mod]?.[namuzi]) {
      return Blank;
    }

    const reName = selGun.new[mod][namuzi];

    if (reName.Win === "") return Blank;
    else {
      if (reversalColor) {
        if (reName.Win === "Tie") {
          return (
            <li key={index}>
              <div class="in glr_9" id="">
                {reName.WinScore}
              </div>
            </li>
          );
        } else {
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

          return (
            <li key={index}>
              <div className={`in glr_${startNum} `} id="">
                <span>{reName.WinScore}</span>
              </div>
            </li>
          );
        }
      } else {
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
  }
  function Gun2El(index) {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );

    if (!r_room?.[id]?.length) {
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
    const reName1 = Roomgun2[startRow]?.[startCol] || { Mark: "" };
    const reName2 = Roomgun2[startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = Roomgun2[startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = Roomgun2[startRow + 1]?.[startCol + 1] || { Mark: "" };

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
  function Gun3El(index) {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );
    if (!r_room?.[id]?.length) {
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
    const reName1 = Roomgun3[startRow]?.[startCol] || { Mark: "" };
    const reName2 = Roomgun3[startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = Roomgun3[startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = Roomgun3[startRow + 1]?.[startCol + 1] || { Mark: "" };
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
  function Gun4El(index) {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );
    if (!r_room?.[id]?.length) {
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
    const reName1 = Roomgun4[startRow]?.[startCol] || { Mark: "" };
    const reName2 = Roomgun4[startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = Roomgun4[startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = Roomgun4[startRow + 1]?.[startCol + 1] || { Mark: "" };
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
  function testGetMoney() {
    let t = Object.values(whiteMoney).reduce((sum, amount) => sum + amount, 0);

    return moneyformatNumber(t);
  }
  const panelCtrl = (type) => {
    if (type === "table-info") {
      if (!isMobile()) {
        if (open) return "1100px";
        else if (!open) return "1437px";
      } else if (isMobile()) {
        if (land) {
          if (open) return "1100px";
          else if (!open) return "1437px";
        } else {
          return "";
        }
      }
    } else if (type === "pannelbtn") {
      if (!isMobile()) {
        if (open) return "open";
        else if (!open) return "close";
      } else if (isMobile()) {
        if (land) {
          if (open) return "open";
          else if (!open) return "close";
        } else {
          if (!open) return "open";
          else if (open) return "close";
        }
      }
    } else if (type === "myinfo") {
      if (!isMobile()) {
        if (open) return "open";
        else if (!open) return "close";
      } else if (isMobile()) {
        if (land) {
          if (open) return "open";
          else if (!open) return "close";
        } else {
          if (open) return "open";
          else if (!open) return "close";
        }
      }
    } else if (type === "sysbtn_tiger") {
      if (!isMobile()) {
        return true;
      } else if (isMobile()) {
        if (land) {
          return true;
        } else {
          if (open) return true;
          else if (!open) return false;
        }
      }
    }
  };
  return (
    <div className="betting-info">
      {/* <!-- 중국점 --> */}
      <div
        className="table-info "
        style={{
          width: panelCtrl("table-info"),
        }}
      >
        <div className="scoreboard" id="sh_65">
          <ul className="beadplate2">
            {Array.from({ length: 20 * 6 }).map((_, index) => {
              return Pool(index);
            })}
          </ul>
          <ul className="bigroad">
            {Array.from({ length: RoomGun1Col * 6 }).map((_, index) => {
              return Gun1El(index);
            })}
          </ul>
          <ul className="bigeyeboy">
            {Array.from({ length: 6 * RoomGun2Col }).map((_, index) => {
              return Gun2El(index);
            })}
          </ul>
          <ul className="smallroad">
            {Array.from({ length: 6 * RoomGun3Col }).map((_, index) => {
              return Gun3El(index);
            })}
          </ul>
          <ul className="cockroachpig">
            {Array.from({ length: 6 * RoomGun4Col }).map((_, index) => {
              return Gun4El(index);
            })}
          </ul>
        </div>
      </div>

      <div className="etc-info ">
        <ul className="beadplate2">
          <li>
            <div className="gr_1">B</div>
            <strong className="txred" id="bw">
              {score_room[id]?.[0] || 0}
            </strong>
          </li>
          <li>
            <div className="gr_5">P</div>
            <strong className="txblue" id="pw">
              {score_room[id]?.[1] || 0}
            </strong>
          </li>
          <li>
            <div className="gr_9">T</div>
            <strong className="txgreen" id="tw">
              {score_room[id]?.[2] || 0}
            </strong>
          </li>
          <li>
            <div className="gr_3">B</div>
            <strong className="txred" id="bp">
              {score_room[id]?.[3] || 0}
            </strong>
          </li>
          <li>
            <div className="gr_6">P</div>
            <strong className="txblue" id="pp">
              {score_room[id]?.[4] || 0}
            </strong>
          </li>
        </ul>
        <ul className="etc-infosub">
          <li
            className="prediction_banker"
            onClick={() => {
              gun_click("Banker");
            }}
          >
            <ul
              style={{
                display: !isMobile() && land ? "grid" : "",
                placeItems: !isMobile() && land ? "center" : "",
                gap: !isMobile() && land ? "4px" : "",
              }}
            >
              <li>
                <div className="gr_1 f16">B</div>
              </li>
              <li>
                <div
                  id="banker_p_c1"
                  className={`r_c1_${getPredict(Expects.expectBGun2s)}`}
                >
                  <span></span>
                </div>
              </li>
              <li>
                <div
                  id="banker_p_c2"
                  className={`r_c2_${getPredict(Expects.expectBGun3s)}`}
                >
                  <span></span>
                </div>
              </li>
              <li>
                <div
                  id="banker_p_c3"
                  className={`r_c3_${getPredict(Expects.expectBGun4s)}`}
                >
                  <span></span>
                </div>
              </li>
            </ul>
          </li>
          <li
            className="prediction_player"
            onClick={() => {
              gun_click("Player");
            }}
          >
            <ul
              style={{
                display: !isMobile() && land ? "grid" : "",
                placeItems: !isMobile() && land ? "center" : "",
                gap: !isMobile() && land ? "4px" : "",
              }}
            >
              <li>
                <div className="gr_5 f16">P</div>
              </li>
              <li>
                <div
                  id="player_p_c1"
                  className={`r_c1_${getPredict(Expects.expectPGun2s)}`}
                >
                  <span></span>
                </div>
              </li>
              <li>
                <div
                  id="player_p_c2"
                  className={`r_c2_${getPredict(Expects.expectPGun3s)}`}
                >
                  <span></span>
                </div>
              </li>
              <li>
                <div
                  id="player_p_c3"
                  className={`r_c3_${getPredict(Expects.expectPGun4s)}`}
                >
                  <span></span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* <!-- 내정보 --> */}
      <div className={`myinfo ${panelCtrl("myinfo")}`}>
        <ul className="money">
          {/* <!-- 메뉴가 접혔을 때 dispaly:none 처리 --> */}
          <li>
            <span id="txt_game_betmoney">
              {getTranslation(language, "betmoney")}
            </span>
            <span className="txt-blue" id="user_bet_money">
              {testGetMoney()}
            </span>
          </li>
          <li>
            <span id="t_lang_game_winmoney">
              {getTranslation(language, "winmoney")}
            </span>
            <span className="txt-red" id="user_win_money">
              {moneyformatNumber(momentwinMoney)}
            </span>
          </li>
        </ul>
        <ul className="money2">
          {/* <!-- 메뉴가 접혔을 때 dispaly:none 처리 --> */}
          <li>
            <span id="txt_title_balance">
              {getTranslation(language, "havemoney")}
            </span>{" "}
            <span id="user_money">{moneyformatNumber(mb_money)}</span>
          </li>
        </ul>
        <ul
          className={`sysbtn_tiger`}
          style={{
            display: panelCtrl("sysbtn_tiger") ? "block" : "none",
          }}
        >
          <li className="move">
            <button onClick={() => quickOption("move")}>
              <span id="t_btn_table_move">
                {getTranslation(language, "tableMove")}
              </span>
            </button>
          </li>
          <li className="fullscreen">
            {isfull ? (
              <button onClick={() => quickOption("exitFull")} id="re_screen">
                <span id="t_btn_small">
                  {getTranslation(language, "exitFullscreen")}
                </span>
              </button>
            ) : (
              <button id="full_screen" onClick={() => quickOption("enterFull")}>
                <span id="t_btn_full">
                  {getTranslation(language, "fullscreen")}
                </span>
              </button>
            )}
          </li>
          <li className="history">
            <button onClick={() => quickOption("history")}>
              <span id="g_btn_list">{getTranslation(language, "betlog")}</span>
            </button>
          </li>
          <li className="exit">
            <button onClick={() => quickOption("exit")}>
              <span id="t_btn_prev">
                {getTranslation(language, "lobbyMove")}
              </span>
            </button>
          </li>
          <li className="re">
            <button onClick={() => quickOption("refresh")}>
              <span id="t_btn_chip_refresh">
                {getTranslation(language, "refresh")}
              </span>
            </button>
          </li>
        </ul>
        <span
          className={`pannelbtn ${panelCtrl("pannelbtn")}`}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <i></i>
        </span>
      </div>
    </div>
  );
}

export default BettingInfo;
