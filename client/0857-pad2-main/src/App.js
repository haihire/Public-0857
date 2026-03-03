import React, { useEffect, useState, useRef, useCallback } from "react";
import "./App.css";
import "./Result.css";
import { isLocalhost, moneyformatNumber, ConvertCard } from "./util.js";
import { BigRoad } from "./roads/BigRoad.ts";
import { BigEyeRoad } from "./roads/BigEyeRoad.ts";
import { SmallRoad } from "./roads/SmallRoad.ts";
import { CockroachRoad } from "./roads/CockroachRoad.ts";

const sites = [
  { key: "okura", label: "OKURA" },
  { key: "hann", label: "HANN" },
  { key: "maxim", label: "MAXIM" },
  { key: "nustar", label: "NUSTAR" },
];

function App({ socket }) {
  const [Title, setTitle] = useState("관리자 선택");
  const [curStep, setCurStep] = useState("Login");
  const currentSiteRef = useRef("");
  const [Loading, setLoading] = useState(true);
  /* Login */
  //ui
  const [showModal, setShowModal] = useState(false);
  const [ipValue, setIpValue] = useState("");
  const [pwValue, setPwValue] = useState(isLocalhost ? "1234" : "");
  const idInputRef = useRef(null);
  /* Login */
  /* Lobby */

  const [s_room, setS_room] = useState([]);

  /* Lobby */
  /* Room */

  const [curS_Room, setCurS_Room] = useState({});
  const [curR_Room, setCurR_Room] = useState([]);
  const [timerCount, setTimer] = useState(0);
  const [gun1, setGun1] = useState({});
  const [gun2, setGun2] = useState({});
  const [gun3, setGun3] = useState({});
  const [gun4, setGun4] = useState({});
  const RoomGun1Col = 80;
  const RoomGun2Col = 80;
  const RoomGun3Col = 40;
  const RoomGun4Col = 40;
  const Row = 6;
  const [PADMap, setPADMap] = useState({
    Player_Pair: {
      users: {},
      total: 0,
    },
    Player: {
      users: {},
      total: 0,
    },
    Tie: {
      users: {},
      total: 0,
    },
    Banker: {
      users: {},
      total: 0,
    },
    Banker_Pair: {
      users: {},
      total: 0,
    },
  });
  const [board, setBoard] = useState([]);
  //ui
  /* Sound */

  /* Sound */
  // const [btn_uc, setBtn_uc] = useState(true);

  const [Pan, setPan] = useState("Basic");
  const [ShoeLogs, setShoeLogs] = useState([]);
  const [btn_log, setBtn_log] = useState(false);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    if (curShoe === "XXXXXX") return;
    setLangDropdownOpen(!langDropdownOpen);
  };
  const [curShoe, setCurShoe] = useState("");
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  /* padBetting */
  const [padCount, setPadCount] = useState(0);

  /* padBetting */
  /* resultwinner */
  const [ScoreP, setScoreP] = useState(0);
  const [ScoreB, setScoreB] = useState(0);
  const [winner, setWinner] = useState([]);
  const [CardP, setCardP] = useState([]);
  const [CardB, setCardB] = useState([]);
  const [PoolClick, setPoolClick] = useState(false);
  const PCardForceOrderChange = (num) => {
    if (num === 0) {
      return 1;
    } else if (num === 1) {
      return 0;
    } else return num;
  };
  function displayWin(winner) {
    const blank = <div className="r_img" id="popResult"></div>;
    if (!winner) return blank;

    let name = "";
    for (let i = 0; i < winner.length; i++) {
      const element = winner[i];

      switch (element) {
        case "Player":
          name = "player";
          break;
        case "Banker":
          name = "banker";
          break;
        case "Tie":
          name = "tie";
          break;
        default:
          break;
      }
    }

    return <div className={`r_img r_${name}`} id="popResult"></div>;
  }
  /* */
  /* Room */
  const BetLogs = () => {
    if (btn_log) {
      setBtn_log(!btn_log);
      return;
    }
    setLogs([]);
    setTotal({
      totalBet: 0,
      totalWin: 0,
      totalLose: 0,
      totalWinLose: 0,
    });
    socket.emit("Search_Shoes", { RoomID: curS_Room.RoomID });
  };

  const init = React.useCallback(() => {
    setTitle("관리자 선택");
    setCurStep("Login");
    currentSiteRef.current = "";
    localStorage.clear();
    sessionStorage.clear();
    /* Login */
    setShowModal(false);
    setPwValue("");
    idInputRef.current = null;
    /* Login */
    /* Lobby */
    setS_room([]);
    /* Lobby */
    /* Room */
    setBtn_log(false);
    setCurS_Room({});
    setCurR_Room([]);
    setTimer(0);
    /* Room */
  }, []);

  const main = React.useCallback(() => {
    init();
    setShowModal(false);
    setTitle("관리자 선택");
    setCurStep("Login");
  }, [init]);
  const GunSet = React.useCallback((r_room) => {
    let g1 = {};
    let g2 = {};
    let g3 = {};
    let g4 = {};

    let log = [...r_room];
    let FirstTie = 0;
    if (log.length > 0) {
      for (let i = 0; i < Math.min(8, log.length); i++) {
        if (log[i].sWinner === "Tie") FirstTie++;
        else break;
      }
    }
    log = log.slice(FirstTie);
    g1 = new BigRoad({
      array: log,
      row: Row,
      col: RoomGun1Col,
      cut: true,
      color: false,
    }).getBigRoad();
    g2 = new BigEyeRoad({
      gubun: g1.gubunIndex,
      row: Row,
      col: RoomGun2Col * 2,
    }).getBigEyeRoad(g1.old);

    g3 = new SmallRoad({
      gubun: g1.gubunIndex,
      row: Row,
      col: RoomGun3Col * 2,
    }).getSmallRoad(g1.old);

    g4 = new CockroachRoad({
      gubun: g1.gubunIndex,
      row: Row,
      col: RoomGun4Col * 2,
    }).getCockroachRoad(g1.old);

    setGun1(g1);
    setGun2(g2);
    setGun3(g3);
    setGun4(g4);
  }, []);
  // emit admin credentials
  const handleOk = () => {
    if (!socket.connected) {
      alert("인터넷 재연결이 필요합니다");
      socket.connect();
      return;
    }
    if (pwValue === "") {
      alert("패스워드가 필요합니다");
      return;
    }
    socket.emit("send_adminCheck", {
      sIP: ipValue,
      sPassword: pwValue,
      sSite: currentSiteRef.current,
    });
  };
  // 1) 무음 비디오를 렌더링할 ref
  const unlockVideoRef = useRef(null);
  // 2) Web Audio API 컨텍스트
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [volume, setVolume] = useState(100);
  const handleVideoPlay = () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "running"
    ) {
      audioContextRef.current
        .resume()
        .then(() => {
          console.log("AudioContext has been unlocked!");
          setIsAudioUnlocked(true);
        })
        .catch((e) => {
          console.warn("Failed to unlock AudioContext:", e);
        });
    }
  };
  const playSound = useCallback(
    async (name) => {
      if (!audioContextRef.current || !isAudioUnlocked) {
        console.log("AudioContext not unlocked yet");
        return;
      }
      try {
        // fetch로 음원 파일을 불러와 AudioBuffer로 디코딩
        const response = await fetch(`/sounds/${name}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(
          arrayBuffer
        );

        // 버퍼 소스 노드 생성 → 재생
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;

        if (gainNodeRef.current) {
          source.connect(gainNodeRef.current);
        } else {
          // 혹시 gainNode가 없다면, fallback으로 destination에 직접 연결
          source.connect(audioContextRef.current.destination);
        }

        source.start(0);
      } catch (err) {
        console.warn("Web Audio playback failed:", err);
      }
    },
    [isAudioUnlocked]
  );
  useEffect(() => {
    const images = [
      "./require/poker.png",
      "./require/r_banker.png",
      "./require/r_player.png",
      "./require/r_tie.png",
      "./require/result.png",
    ];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const sounds = [
      "bet_start",
      "win_player",
      "win_banker",
      "win_tie",
      "silent",
    ];
    sounds.forEach((name) => {
      new Audio(`/sounds/${name}.mp3`);
    });
  }, []);
  // 1️⃣ Register socket listeners once
  useEffect(() => {
    if (!socket || !socket.connected) {
      socket.connect();
    }

    socket.on("connect", async () => {
      const site = localStorage.getItem("site");
      const password = localStorage.getItem("pw");
      const manual2 = sessionStorage.getItem("manualLogin");

      if (manual2 && password && site) {
        let ip = "";
        await fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => (ip = data.ip))
          .catch((err) => console.error("IP fetch error:", err));
        setLoading(true);
        socket.emit("send_adminCheck", {
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
    const rev_adminCheck = () => {
      localStorage.setItem("pw", pwValue);
      localStorage.setItem("site", currentSiteRef.current);
      socket.emit("send_show_list", { sSite: currentSiteRef.current });
    };
    socket.on("rev_adminCheck", rev_adminCheck);

    const Fail_adminCheck = () => {
      alert("관리자 IP 또는 비밀번호가 틀립니다.");
      localStorage.removeItem("roomid");
      localStorage.removeItem("site");
      localStorage.removeItem("pw");

      setShowModal(false);
    };
    socket.on("Fail_adminCheck", Fail_adminCheck);

    const rev_show_list = (data) => {
      setCurS_Room({});
      setCurR_Room([]);
      setTimer(0);
      setBtn_log(false);
      setShowModal(false);
      setCurStep("Lobby");
      setS_room(data);

      const manual = sessionStorage.getItem("manualLogin");
      const roomid = localStorage.getItem("roomid");

      if (manual && roomid) {
        console.log("roomid", roomid);
        socket.emit("send_show_room", { RoomID: roomid });
      } else {
        setLoading(false);
      }
    };
    socket.on("rev_show_list", rev_show_list);
    const rev_re_show_list = (data) => {
      setCurS_Room({});
      setCurR_Room([]);
      setTimer(0);
      setBtn_log(false);
      setShowModal(false);
      setCurStep("Lobby");
      setS_room(data);
      setLoading(false);
    };
    socket.on("rev_re_show_list", rev_re_show_list);
    /* Login */
    /* Lobby */
    const rev_show_room = (data) => {
      setPan("Basic");
      setWinner([]);
      setScoreP(0);
      setScoreB(0);
      setCardP([]);
      setCardB([]);
      setBtn_log(false);
      setLangDropdownOpen(false);
      setCurShoe("");
      setLogs([]);
      setShoeLogs([]);

      setPadCount(data.s_room.padCount);

      setPADMap(data.PADMap);
      const betTypes = [
        "Player_Pair",
        "Player",
        "Tie",
        "Banker",
        "Banker_Pair",
      ];
      const userMap = {};
      // 모든 베팅 타입을 한 번만 순회
      betTypes.forEach((betType) => {
        const users = data.PADMap[betType]?.users || {};

        Object.entries(users).forEach(([id, amount]) => {
          if (!userMap[id]) {
            // 기본 객체 생성 시 모든 베팅 타입을 0으로 초기화
            userMap[id] = Object.fromEntries(betTypes.map((t) => [t, 0]));
            userMap[id].id = id;
          }
          userMap[id][betType] = amount;
        });
      });

      const newBoard = Object.values(userMap);
      setBoard(newBoard);

      setCurStep("Room");
      setCurS_Room(data.s_room);
      setCurR_Room(data.r_room);

      GunSet(data.r_room);

      localStorage.setItem("roomid", data.s_room.RoomID);
      setLoading(false);
    };
    socket.on("rev_show_room", rev_show_room);
    const EnterFail = () => {
      localStorage.removeItem("roomid");
      setLoading(false);
      alert("해당 룸에는 이미 입장되어 있습니다.");

      setShowModal(false);
    };
    socket.on("EnterFail", EnterFail);
    /* Lobby */
    /* Room */
    const enterSingleLobby = (data) => {
      if (curS_Room.RoomID !== data.RoomID) return;
      // console.log("enterSingleLobby", data);
      setCurS_Room(data.s_room);
      setCurR_Room(data.result);
      GunSet(data.result);
    };
    socket.on("enterSingleLobby", enterSingleLobby);
    const Game_Start = (data) => {
      if (curS_Room.RoomID !== data.RoomID) return;
      setWinner([]);
      setScoreP(0);
      setScoreB(0);
      setCardP([]);
      setCardB([]);
      setPan("Basic");
      setPadCount(data.padCount);
      setPADMap({
        Player_Pair: {
          users: {},
          total: 0,
        },
        Player: {
          users: {},
          total: 0,
        },
        Tie: {
          users: {},
          total: 0,
        },
        Banker: {
          users: {},
          total: 0,
        },
        Banker_Pair: {
          users: {},
          total: 0,
        },
      });
      setBoard([]);
      setCurS_Room(data);
      setPan("Basic");
      playSound("bet_start");
    };
    socket.on("Game_Start", Game_Start);

    socket.on("Game_Wait", Game_Start);
    const timer = (data) => {
      if (curS_Room.RoomID !== data.RoomID) return;

      setTimer(data.Time);
    };
    socket.on("timer", timer);

    const padBetting = (data) => {
      if (curS_Room.RoomID !== data.RoomID) return;
      console.log("padBetting", data);

      setPADMap(data.PADMap);
      const betTypes = [
        "Player_Pair",
        "Player",
        "Tie",
        "Banker",
        "Banker_Pair",
      ];
      const userMap = {};
      // 모든 베팅 타입을 한 번만 순회
      betTypes.forEach((betType) => {
        const users = data.PADMap[betType]?.users || {};

        Object.entries(users).forEach(([id, amount]) => {
          if (!userMap[id]) {
            // 기본 객체 생성 시 모든 베팅 타입을 0으로 초기화
            userMap[id] = Object.fromEntries(betTypes.map((t) => [t, 0]));
            userMap[id].id = id;
          }
          userMap[id][betType] = amount;
        });
      });

      const newBoard = Object.values(userMap);
      setBoard(newBoard);
    };
    socket.on("padBetting", padBetting);
    const resultWinner = (data) => {
      if (curS_Room.RoomID !== data.RoomID) return;
      setPan("Result");

      setPoolClick(false);

      setWinner(data.who);
      setScoreB(data.BankerScore);
      setScoreP(data.PlayerScore);
      setCardB(data.bCard);
      setCardP(data.pCard);

      let Prate = 0;
      let Brate = 0;
      let Trate = 0;
      if (data.who.includes("Player")) {
        playSound("win_player");
        Prate = 2;
      } else if (data.who.includes("Banker")) {
        playSound("win_banker");
        Brate = 1.95;
      } else if (data.who.includes("Tie")) {
        playSound("win_tie");
        Trate = 9;
      }

      let PPrate = 0;
      let BPrate = 0;
      if (
        data.who.includes("Player_Pair") &&
        data.who.includes("Banker_Pair")
      ) {
        PPrate = 12;
        BPrate = 12;
      } else if (data.who.includes("Player_Pair")) {
        PPrate = 12;
      } else if (data.who.includes("Banker_Pair")) {
        BPrate = 12;
      }

      setPADMap((prev) => ({
        Player_Pair: {
          ...prev.Player_Pair,
          total: prev.Player_Pair.total * PPrate,
        },
        Player: {
          ...prev.Player,
          total: prev.Player.total * Prate,
        },
        Tie: {
          ...prev.Tie,
          total: prev.Tie.total * Trate,
        },
        Banker: {
          ...prev.Banker,
          total: prev.Banker.total * Brate,
        },
        Banker_Pair: {
          ...prev.Banker_Pair,
          total: prev.Banker_Pair.total * BPrate,
        },
      }));

      setTimeout(() => {
        setWinner([]);
        setScoreP(0);
        setScoreB(0);
        setCardP([]);
        setCardB([]);
      }, 2000);
    };
    socket.on("resultWinner", resultWinner);

    const rev_Search_Shoes = (data) => {
      setShoeLogs(data);
      setBtn_log(true);
      if (data.length > 0) setCurShoe(data[0].sShoeNumber);
      else setCurShoe("XXXXXX");
    };
    socket.on("rev_Search_Shoes", rev_Search_Shoes);
    const rev_betLogPlz = (data) => {
      console.log("rev_betLogPlz", data);
      const summaryByUser = data.reduce((acc, record) => {
        const {
          sUserID,
          nBettingMoney,
          nWinnerMoney,
          sSite,
          sRoomNumber,
          sShoeNumber,
          sResult,
        } = record;

        if (!acc[sUserID]) {
          acc[sUserID] = {
            sSite,
            sRoomNumber,
            sShoeNumber,
            sUserID,
            totalBet: 0, // "bet" 타입의 합산(실제 베팅 스테이크)
            totalWin: 0, // "result" 타입의 합산(획득 금액)
            totalLose: 0, // "bet" 타입의 합산(실제 손실 스테이크)
            totalWinLose: 0, // "result" 타입의 합산(획득 금액 - 손실 스테이크)
          };
        }
        acc[sUserID].totalBet += parseInt(nBettingMoney); // "bet" 타입의 합산(실제 베팅 스테이크)
        acc[sUserID].totalWin += parseInt(nWinnerMoney); // "result" 타입의 합산(획득 금액)
        if (sResult === "Lose") {
          acc[sUserID].totalLose += parseInt(nBettingMoney);
        }
        acc[sUserID].totalWinLose =
          acc[sUserID].totalBet - acc[sUserID].totalWin;

        return acc;
      }, {});
      console.log("summaryByUser", summaryByUser);

      // 객체 → 배열로 변환
      const result = Object.values(summaryByUser);

      setLogs(result);
    };
    socket.on("rev_betLogPlz", rev_betLogPlz);

    /* Room */

    socket.on("disconnect", (data) => {
      // console.log("disconnect", data);

      if (data === "transport close") {
        localStorage.clear();
        // window.location.reload();
      }
      main();
    });

    // if (btn_log && scrollRef.current) {
    //   scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    // }
    return () => {
      socket.off("connect");
      /* Login */
      socket.off("Fail_adminCheck", Fail_adminCheck);
      socket.off("EnterFail", EnterFail);
      socket.off("rev_adminCheck", rev_adminCheck);
      socket.off("rev_show_list", rev_show_list);
      /* Login */
      /* Lobby */
      socket.off("rev_show_room", rev_show_room);
      socket.off("rev_re_show_list", rev_re_show_list);
      /* Lobby */
      /* Room */
      socket.off("enterSingleLobby", enterSingleLobby);
      socket.off("Game_Start", Game_Start);
      socket.off("Game_Wait", Game_Start);
      socket.off("timer", timer);
      socket.off("padBetting", padBetting);
      socket.off("resultWinner", resultWinner);
      socket.off("rev_Search_Shoes", rev_Search_Shoes);
      socket.off("rev_betLogPlz", rev_betLogPlz);
      socket.off("rev_adminCheck", rev_adminCheck);
      /* Room */
      socket.off("disconnect");
      socket.off("tableLimit");
    };
  }, [
    PADMap,
    GunSet,
    btn_log,
    curS_Room.RoomID,
    curS_Room.RoomNumber,
    ipValue,
    main,
    pwValue,
    socket,
    timerCount,
    playSound,
  ]);
  const poolRef = useRef(null);
  const g1Ref = useRef(null);
  const g2Ref = useRef(null);
  const g3Ref = useRef(null);
  const g4Ref = useRef(null);

  // 2️⃣ Fetch IP when modal opens
  useEffect(() => {
    if (!showModal) return;
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => {
        setIpValue(d.ip);
      })
      .catch(() => setIpValue(""));
  }, [showModal]);

  // 3️⃣ Ensure input is focused after render
  // useLayoutEffect(() => {
  //   if (showModal) idInputRef.current?.focus();
  // }, [showModal]);

  // button click to open admin modal
  const adminCheck = (key) => {
    currentSiteRef.current = key;
    setTitle(`관리자: ${key.toUpperCase()}`);

    setPwValue(isLocalhost ? "1234" : "");
    setShowModal(true);
  };

  // cancel admin modal
  const handleCancel = () => {
    setShowModal(false);
    setTitle("관리자 선택");
  };

  // emit admin credentials

  const Pool = (index) => {
    const record = curR_Room?.[index];
    const Blank = (
      <li key={index}>
        <div className="in" id={`${index}`}></div>
      </li>
    );

    if (!record) return Blank;

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
        case "Banker_Pair,Banker_Pair":
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
  };
  const Gun1 = (index) => {
    const Blank = (
      <li key={index}>
        <div className="in" id="">
          <span></span>
        </div>
      </li>
    );
    const selGun = gun1;

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
  };
  const Gun2 = (index) => {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );

    if (!gun2?.length) {
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
    const reName1 = gun2[startRow]?.[startCol] || { Mark: "" };
    const reName2 = gun2[startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = gun2[startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = gun2[startRow + 1]?.[startCol + 1] || { Mark: "" };

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
  };
  const Gun3 = (index) => {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );
    if (!gun2?.length) {
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
    const reName1 = gun3[startRow]?.[startCol] || { Mark: "" };
    const reName2 = gun3[startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = gun3[startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = gun3[startRow + 1]?.[startCol + 1] || { Mark: "" };
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
  };
  const Gun4 = (index) => {
    const Blank = (
      <li key={index}>
        <span className="lefttop"></span>
        <span className="righttop"></span>
        <span className="leftbottom"></span>
        <span className="rightbottom"></span>
      </li>
    );
    if (!gun4?.length) {
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
    const reName1 = gun4[startRow]?.[startCol] || { Mark: "" };
    const reName2 = gun4[startRow + 1]?.[startCol] || { Mark: "" };
    const reName3 = gun4[startRow]?.[startCol + 1] || { Mark: "" };
    const reName4 = gun4[startRow + 1]?.[startCol + 1] || { Mark: "" };
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
  };
  const [total, setTotal] = useState({
    totalBet: 0,
    totalWin: 0,
    totalLose: 0,
    totalWinLose: 0,
  });
  const betList = (data, key) => {
    return (
      <tr key={key} style={{ height: "42px" }}>
        {/* <th>{data.sSite.toUpperCase() + "-" + data.sRoomNumber}</th> */}
        <th>{data.sRoomNumber}</th>
        <th>{data.sShoeNumber}</th>
        <th>{data.sUserID}</th>
        <th>{moneyformatNumber(data.totalBet)}</th>
        <th>{moneyformatNumber(data.totalWin)}</th>
        <th>{moneyformatNumber(data.totalLose)}</th>
        <th>{moneyformatNumber(data.totalWinLose)}</th>
      </tr>
    );
  };
  useEffect(() => {
    const totals = logs.reduce(
      (acc, { totalBet, totalWin, totalLose, totalWinLose }) => ({
        totalBet: acc.totalBet + totalBet,
        totalWin: acc.totalWin + totalWin,
        totalLose: acc.totalLose + totalLose,
        totalWinLose: acc.totalWinLose + totalWinLose,
      }),
      { totalBet: 0, totalWin: 0, totalLose: 0, totalWinLose: 0 }
    );
    setTotal(totals);
  }, [logs]);

  // 1) 컴포넌트가 마운트될 때 AudioContext 생성
  useEffect(() => {
    // 이 시점에는 일단 AudioContext만 미리 만들어두기
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const ac = new AudioContextClass();
      audioContextRef.current = ac;

      const gainNode = ac.createGain();
      gainNode.gain.value = volume / 100; // 초기 볼륨 세팅 (0~1 범위)
      gainNode.connect(ac.destination);

      gainNodeRef.current = gainNode;
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser", e);
    }
  }, [volume]);

  const SilentVideoUnlocker = () => (
    <video
      ref={unlockVideoRef}
      // muted + playsInline + loop + autoPlay를 반드시 지정해야 iOS가 허용함
      muted
      playsInline
      loop
      autoPlay
      // 화면에 보이지 않도록 style을 조정 (pointerEvents: "none" 으로 이벤트 블록 방지)
      style={{
        display: "block",
        width: "1px",
        height: "1px",
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0,
        pointerEvents: "none",
      }}
      // 실제로 비디오가 재생되기 시작하면 AudioContext를 resume 호출
      onPlay={handleVideoPlay}
      // 아래 src는 public 폴더 기준으로 경로를 지정하세요.
      src="/sounds/silent.mp3"
    />
  );
  return (
    <div className={`App_Range ${curStep}`} ref={scrollRef}>
      <SilentVideoUnlocker />
      {Loading && (
        <div className="Loading">
          <img src="./require/loading.gif" alt="Loading..." />
        </div>
      )}
      <div className="Header">
        {/* {curStep !== "Login" && (
          <button
            className="home-btn"
            onClick={() => {
              sessionStorage.removeItem("manualLogin");
              socket.disconnect();
            }}
          >
            🏠
          </button>
        )} */}
        <div className="header-title">
          {curStep !== "Login" && (
            <img
              src={`./require/${currentSiteRef.current}.png`}
              alt={Title}
              className="header-icon"
            />
          )}
          {Title}
          {curStep === "Room" && curS_Room && ` - ${curS_Room.RoomNumber}`}
        </div>
        {curStep !== "Login" && (
          <button
            className="back-btn"
            onClick={() => {
              if (curStep === "Room") {
                localStorage.removeItem("roomid");
                socket.emit("send_re_show_list", { RoomID: curS_Room.RoomID });
              } else if (curStep === "Lobby") {
                main();
              }
            }}
          >
            <img src="./require/backbtn.png" alt="" />
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
              <img src={`./require/${key}.png`} alt={label} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
      {curStep === "Lobby" && s_room && (
        <div className="lobby">
          <div className="room-buttons">
            {s_room
              .filter((el) => el.sSite === currentSiteRef.current)
              .map((room) => (
                <button
                  key={room.RoomNumber}
                  onClick={() => {
                    socket.emit("send_show_room", { RoomID: room.RoomID });
                  }}
                  className="room-button"
                >
                  {room.RoomNumber}
                </button>
              ))}
          </div>
        </div>
      )}
      {curStep === "Room" && curS_Room && curR_Room && (
        <div className="room-details">
          {/* Top bet buttons */}

          {/* Pair switches */}

          {/* Shoe change & Error */}

          {/* Result inputs */}
          <div
            className="BasicPan"
            style={{
              height: "100%",
              width: "100%",
              background: "#0c1932",
              display: Pan === "Basic" ? "" : "none",
            }}
          >
            {/* <!-- Start: game-board --> */}
            <div className="game-board">
              <div className="row main-row">
                <div className="fordisplex">
                  <h5>USER</h5>
                </div>
                <div className="fordisplex">
                  <h5>P.페어</h5>
                </div>
                <div className="fordisplex">
                  <h5>플레이어</h5>
                </div>
                <div className="fordisplex">
                  <h5>타이</h5>
                </div>
                <div className="fordisplex">
                  <h5>뱅커</h5>
                </div>
                <div className="fordisplex">
                  <h5>B.페어</h5>
                </div>
              </div>
              <div className="row main-row">
                <div className="col label_sub">
                  <h5>SUM</h5>
                </div>
                <div className="col label_sub">
                  <h5>
                    {" "}
                    {moneyformatNumber(
                      board.reduce(
                        (acc, cur) => acc + (cur.Player_Pair || 0),
                        0
                      )
                    )}
                  </h5>
                </div>
                <div className="col label_sub">
                  <h5>
                    {" "}
                    {moneyformatNumber(
                      board.reduce((acc, cur) => acc + (cur.Player || 0), 0)
                    )}
                  </h5>
                </div>
                <div className="col label_sub">
                  <h5>
                    {" "}
                    {moneyformatNumber(
                      board.reduce((acc, cur) => acc + (cur.Tie || 0), 0)
                    )}
                  </h5>
                </div>
                <div className="col label_sub">
                  <h5>
                    {moneyformatNumber(
                      board.reduce((acc, cur) => acc + (cur.Banker || 0), 0)
                    )}
                  </h5>
                </div>
                <div className="col label_sub">
                  <h5>
                    {moneyformatNumber(
                      board.reduce(
                        (acc, cur) => acc + (cur.Banker_Pair || 0),
                        0
                      )
                    )}
                  </h5>
                </div>
              </div>
              <div className="row mmain-row">
                {board.map((el) => {
                  return (
                    <div key={el.id} className="onUsers">
                      <div className="fordisplex">{el.id}</div>
                      <div className="fordisplex">
                        <h5> {moneyformatNumber(el.Player_Pair)}</h5>
                      </div>
                      <div className="fordisplex">
                        <h5>{moneyformatNumber(el.Player)}</h5>
                      </div>
                      <div className="fordisplex">
                        <h5>{moneyformatNumber(el.Tie)}</h5>
                      </div>
                      <div className="fordisplex">
                        <h5> {moneyformatNumber(el.Banker)}</h5>
                      </div>
                      <div className="fordisplex">
                        <h5> {moneyformatNumber(el.Banker_Pair)}</h5>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="timer-container">
                <div className="timer-label">
                  <span>TIME</span>
                </div>
                <div className="timer p-0 m-0">{timerCount}</div>
              </div>
            </div>
            {/* <!-- End: game-board --> */}
            {/* <!-- Start: game-result --> */}
            <div
              className="d-flex justify-content-center align-items-center game-result plate"
              // style={{ display: btn_uc ? "" : "none" }}
            >
              <div ref={poolRef} className="Pool">
                {Array.from({ length: 20 * 6 }).map((_, index) => {
                  return Pool(index);
                })}
              </div>
              <div className="Guns">
                <div ref={g1Ref} className="Gun1">
                  {Array.from({ length: 80 * 6 }).map((_, index) => {
                    return Gun1(index);
                  })}
                </div>
                <div ref={g2Ref} className="Gun2">
                  {Array.from({ length: 80 * 3 }).map((_, index) => {
                    return Gun2(index);
                  })}
                </div>
                <div className="Gun34">
                  <div ref={g3Ref} className="Gun3">
                    {Array.from({ length: 40 * 3 }).map((_, index) => {
                      return Gun3(index);
                    })}
                  </div>
                  <div ref={g4Ref} className="Gun4">
                    {Array.from({ length: 40 * 3 }).map((_, index) => {
                      return Gun4(index);
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- End: game-result --> */}
            {/* <!-- Start: bottom-section --> */}
            <div className="bottom-section">
              {/* <!-- Start: 사운드 컨트롤 --> */}

              {/* <!-- End: 사운드 컨트롤 --> */}
              <div className="bottom-controls">
                {/* <!-- Start: game-info --> */}
                <div className="game-info">
                  <div className="game-id">
                    <div>
                      <span>
                        {curS_Room.ShoeNumber} / {curS_Room.ShoeGameNumber}
                      </span>
                    </div>
                    <div>
                      <span>게임대기</span>
                    </div>
                  </div>
                  {/* <!-- Start: turn-info --> */}
                  <div className="turn-info">
                    <div className="notForSound">
                      <span>
                        TABLE : {curS_Room.sSite.toUpperCase()}{" "}
                        {curS_Room.RoomNumber}
                      </span>
                    </div>
                    <div className="forSound">
                      <div className="media-controls">
                        <button className="volume-button">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon
                              points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                              className="volume-icon"
                            ></polygon>
                            <path
                              d="M15.54 8.46a5 5 0 0 1 0 7.07"
                              className="volume-wave-1"
                              style={{ opacity: "1" }}
                            ></path>
                            <path
                              d="M19.07 4.93a10 10 0 0 1 0 14.14"
                              className="volume-wave-2"
                              style={{ opacity: "1" }}
                            ></path>
                            <line
                              x1="2"
                              y1="2"
                              x2="22"
                              y2="22"
                              className="mute-line"
                              style={{ display: volume === 0 ? "" : "none" }}
                            ></line>
                          </svg>
                        </button>

                        <input
                          type="range"
                          className="volume-slider"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setVolume(v);
                            if (gainNodeRef.current) {
                              gainNodeRef.current.gain.value = v / 100;
                            }
                          }}
                        />
                      </div>

                      <div className="turn-info-tm">
                        <span>
                          T : {curS_Room.userCount} M : {curS_Room.userCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <!-- End: turn-info --> */}
                </div>
                {/* <!-- End: game-info --> */}
                <div className="buttons-container">
                  <button className="button">
                    <i className="padCount">
                      Count&nbsp;
                      {padCount}/
                      {currentSiteRef.current === "nustar" ||
                      currentSiteRef.current === "okura"
                        ? 3
                        : 20}
                    </i>
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      window.location.reload();
                      // GunSet(curR_Room);
                      // setTimer(0);
                    }}
                  >
                    <i className="fas fa-sync-alt text-warning me-2">
                      새로고침
                    </i>
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      sessionStorage.removeItem("manualLogin");
                      window.location.reload();
                    }}
                  >
                    <i className="fas fa-house-damage text-info-emphasis me-2">
                      메인으로
                    </i>
                  </button>
                  <button
                    className="button blue"
                    onClick={() => {
                      BetLogs();
                    }}
                  >
                    <i className="fas fa-check me-2">CHECK W/L</i>
                  </button>
                  <button
                    className="btn button info"
                    onClick={() => {
                      socket.emit("send_SumClick", {
                        RoomID: curS_Room.RoomID,
                      });
                      setPan("Betting");
                    }}
                  >
                    P 합계
                  </button>
                  <button
                    className="btn button info"
                    onClick={() => {
                      socket.emit("send_SumClick", {
                        RoomID: curS_Room.RoomID,
                      });
                      setPan("Betting");
                    }}
                  >
                    B 합계
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="BettingPan"
            style={{
              height: "100%",
              width: "100%",
              background: "#0c1932",
              display: Pan === "Betting" || Pan === "Result" ? "" : "none",
            }}
          >
            <div
              className="box"
              onClick={() => {
                setPan("Basic");
                if (Pan === "Result") {
                  // setPADMap({
                  //   Player_Pair: {
                  //     users: {},
                  //     total: 0,
                  //   },
                  //   Player: {
                  //     users: {},
                  //     total: 0,
                  //   },
                  //   Tie: {
                  //     users: {},
                  //     total: 0,
                  //   },
                  //   Banker: {
                  //     users: {},
                  //     total: 0,
                  //   },
                  //   Banker_Pair: {
                  //     users: {},
                  //     total: 0,
                  //   },
                  // });
                }
              }}
            >
              <div className="row top">
                <div className="cell r">
                  <h1 className="mb">
                    P.P{" "}
                    {Pan === "Result"
                      ? ""
                      : `(${Object.keys(PADMap.Player_Pair.users).length})`}
                  </h1>
                  <h1>{moneyformatNumber(PADMap.Player_Pair.total)}</h1>
                </div>
                <div className="cell g">
                  <h1 className="mb">
                    TIE{" "}
                    {Pan === "Result"
                      ? ""
                      : `(${Object.keys(PADMap.Tie.users).length})`}
                  </h1>
                  <h1>{moneyformatNumber(PADMap.Tie.total)}</h1>
                </div>
                <div className="cell y">
                  <h1 className="mb">
                    B.P{" "}
                    {Pan === "Result"
                      ? ""
                      : `(${Object.keys(PADMap.Banker_Pair.users).length})`}
                  </h1>
                  <h1>{moneyformatNumber(PADMap.Banker_Pair.total)}</h1>
                </div>
              </div>
              <div className="row bottom">
                <div className="cell r">
                  <h1 className="">
                    Player{" "}
                    {Pan === "Result"
                      ? ""
                      : `(${Object.keys(PADMap.Player.users).length})`}
                  </h1>
                  <h1>{moneyformatNumber(PADMap.Player.total)}</h1>
                </div>
                <div className="cell y">
                  <h1 className="">
                    Banker{" "}
                    {Pan === "Result"
                      ? ""
                      : `(${Object.keys(PADMap.Banker.users).length})`}
                  </h1>
                  <h1>{moneyformatNumber(PADMap.Banker.total)}</h1>
                </div>
              </div>
            </div>
            <div className="bg-result">
              {Pan === "Result"
                ? "RESULT"
                : board.length === 0
                ? "FREE GAME"
                : "User Betting"}
            </div>
          </div>

          {
            <div
              className="ResultPan"
              id="item_result"
              style={{
                display: winner.length === 0 ? "none" : "",
              }}
            >
              <div className="content">
                <div>
                  <div className="content-info">
                    <div className="item_result ">
                      <div className="item">
                        <div className="r_score r_score1" id="p_score">
                          {ScoreP}
                          {PoolClick ? (
                            <span style={{ paddingLeft: "110px" }}>
                              {curS_Room.ShoeNumber}-{curS_Room.GameCount}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="r_score r_score2" id="b_score">
                          {ScoreB}
                        </div>

                        {displayWin(winner)}
                        <div className="r_card card1">
                          {CardP.map((item, i) => (
                            <div
                              key={i}
                              className={`popCardAreaP${i + 1} 
                      ${ConvertCard(
                        CardP[PCardForceOrderChange(i)].Num,
                        CardP[PCardForceOrderChange(i)].Shape
                      )}`}
                              id={`popCardAreaP${i + 1}`}
                            ></div>
                          ))}
                        </div>

                        <div className="r_card card2">
                          {CardB.map((item, i) => (
                            <div
                              key={i}
                              className={`popCardAreaB${i + 1} ${ConvertCard(
                                item.Num,
                                item.Shape
                              )}`}
                              id={`popCardAreaB${i + 1}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          <div
            className="bg-opacity"
            style={{
              display: winner.length === 0 ? "none" : "",
            }}
          ></div>
        </div>
      )}
      {btn_log && (
        <div className="betlogs layerpopup">
          <div className="pop_cont">
            <div
              className="content"
              style={{
                width: "100%",
                height: "100%",
              }}
              // ref={scrollRef}
            >
              <div
                style={
                  {
                    // width: isMobile() && !isLandscape() && btn_betlog ? "100%" : "",
                  }
                }
              >
                <div className="content-info">
                  <div className="title">
                    <h4 id="txt_btn_list">배팅내역</h4>
                    <span
                      className="close"
                      // onClick={onClose}
                    ></span>
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
                              <span id="t_startdate_txt">SHOE No.</span> :
                              <button onClick={toggleDropdown}>
                                {curShoe}
                              </button>
                              <div
                                className="shoeList"
                                style={{
                                  display: langDropdownOpen ? "" : "none",
                                }}
                              >
                                {ShoeLogs.map((el) => {
                                  return (
                                    <button
                                      key={el.sShoeNumber}
                                      onClick={() => {
                                        setCurShoe(el.sShoeNumber);
                                        setLangDropdownOpen(false);
                                      }}
                                    >
                                      {el.sShoeNumber}
                                    </button>
                                  );
                                })}
                              </div>
                            </th>
                            <th></th>
                            <th style={{ textAlign: "right" }}>
                              <button
                                onClick={() => {
                                  socket.emit("betLogPlz", {
                                    sShoeNumber: curShoe,
                                    sRoomNumber: curS_Room.RoomNumber,
                                  });
                                }}
                                id="t_search_txt"
                              >
                                검색
                              </button>
                            </th>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* <div
                        id="loading"
                        style={{ textAlign: "center", display: "none" }}
                      >
                        <img
                          id="loading-image"
                          src="./require/loading.gif"
                          alt="Loading..."
                        />
                      </div> */}
                    <div className="allLogContainer">
                      <div
                        className="scroll"
                        // style={{
                        //   border: "1px solid rgb(50, 56, 76)",
                        // }}
                      >
                        <table className="p_table">
                          <colgroup>
                            <col
                              style={{
                                width: "10%",
                              }}
                            />
                            <col
                              style={{
                                width: "10%",
                              }}
                            />
                            <col
                              style={{
                                width: "16%",
                              }}
                            />
                            <col
                              style={{
                                width: "16%",
                              }}
                            />
                            <col
                              style={{
                                width: "16%",
                              }}
                            />

                            <col
                              style={{
                                width: "16%",
                              }}
                            />
                            <col
                              style={{
                                width: "16%",
                              }}
                            />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>
                                <span id="t_lang_casino_name">Table</span>
                              </th>
                              <th>
                                <span id="t_lang_table_name">Shoe</span>
                              </th>
                              <th>
                                <span id="t_lang_shoe_name">USER</span>
                              </th>
                              <th>
                                <span id="t_lang_gameno_name">BET</span>
                              </th>
                              <th>
                                <span id="t_lang_game_no">WIN</span>
                              </th>
                              <th>
                                <span id="t_lang_game_result">Lose</span>
                              </th>
                              <th>
                                <span id="t_lang_game_bettype">W/L</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody style={{ fontSize: "13px" }}>
                            {logs.map(betList)}
                            <tr></tr>
                          </tbody>
                        </table>
                      </div>
                      <table className="p_table2">
                        <colgroup>
                          <col style={{ width: "36.4%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "16%" }} />
                        </colgroup>
                        <tbody>
                          <tr>
                            <th className="">TOTAL</th>
                            <th>{moneyformatNumber(total.totalBet)}</th>
                            <th>{moneyformatNumber(total.totalWin)}</th>
                            <th>{moneyformatNumber(total.totalLose)}</th>
                            <th>{moneyformatNumber(total.totalWinLose)}</th>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <ul className="layer-button">
                      <li>
                        <button
                          onClick={() => {
                            // setBtn_betlog(false);
                            setBtn_log(false);
                          }}
                          // onclick='$("#popContent").css("display","none");'
                          id="txt_t_ok"
                        >
                          확인
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <input
              style={{ display: "none" }}
              type="text"
              value={ipValue}
              disabled
              onChange={(e) => setIpValue(e.target.value)}
              placeholder="IP"
            />
            <input
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
    </div>
  );
}

export default App;
