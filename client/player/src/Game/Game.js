import React, { useCallback, useEffect, useRef, useState } from "react";
import GameContent from "./GameContent";
import BettingInfo from "./BettingInfo.js";
import { useSocket } from "../SocketContext.js";
import {
  arr,
  arr_cur_connect,
  combinedMoney,
  cur_arr,
  cur_length,
  GunSet,
  init_arr,
  init_cur_arr,
  isMobile,
  push,
  ScoreSet,
} from "../util.js";
import { useStore } from "../store.js";
import { BigRoad } from "../roads/BigRoad.ts";
import { BigEyeRoad } from "../roads/BigEyeRoad.ts";
import { SmallRoad } from "../roads/SmallRoad.ts";
import { CockroachRoad } from "../roads/CockroachRoad.ts";
import { useNavigate } from "react-router-dom";

import "./game.scss";
import "./layout.scss";

import TableInfo from "./TableInfo.js";

import Backbtn from "./Backbtn.js";
import Tablemovebtn from "./Tablemovebtn.js";
import LayerRule from "./LayerRule.js";
import Result from "./Result.js";
// import "../Lobby/Rooms.css";
function Game() {
  const Row = 6;
  const socket = useSocket();
  const {
    RoomID,
    Kindchip,
    setTimeState,

    setRoomGun1,
    setRoomGun2,
    setRoomGun3,
    setRoomGun4,
    Roomgun1,
    Roomgun2,
    Roomgun3,
    Roomgun4,
    setToken,
    TimeState,
    setMb_money,
    setCurrencyType,
    setRoomID,
    setId,
    r_room,
    s_room,
    id,
    setRoom_s,
    setRoom_r,
    setShoeNumber,
    setGameCount,
    RoomGun1Col,
    RoomGun2Col,
    RoomGun3Col,
    RoomGun4Col,
    Movegun1,
    setPoolClick,
    setMovegun1,
    setGun1,
    setGun2,
    setGun3,
    setGun4,
    setScore_room,
    setIsMove,
    isMove,
    setUserLimit,
    mb_money,
    setMsg,
    score_room,
    setYellowMoney,
    setWhiteMoney,
    setScoreP,
    setScoreB,
    setCardP,
    setCardB,
    setWinner,

    setMomentWinMoney,
    setAllWhiteMoney,
    setCBMap,
    setBetLog,
    setAllYellowMoney,
    ColorRoomgun1,
    setColorRoomGun1,
    setLoading,
    sUserCode,
  } = useStore();

  const latestRoomDataRef = useRef(null);
  const [moving, setMoving] = useState(false);
  const [btn_betlog, setBtn_betlog] = useState(false);
  const [bet, setBet] = useState(false);
  const initRoom = useRef(false);
  const navigate = useNavigate();

  /* Sound */
  const audioRef = useRef(null);
  const [sound, setSound] = useState(true);
  const playSound = useCallback(
    async (...names) => {
      try {
        if (!sound) return;
        // 기존 오디오 중지
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audios = names.map((name) => new Audio(`/sounds/${name}.mp3`));
        audioRef.current = audios[0]; // 첫 번째를 참조 저장

        // 모든 오디오 재생 시도 (병렬)
        await Promise.all(audios.map((audio) => audio.play()));
      } catch (err) {
        console.warn("Audio playback failed:", err);
      }
    },
    [sound]
  );
  /* Sound */

  const settingMoney = useCallback(() => {
    const yellowMoney = combinedMoney(cur_arr());
    const whiteMoney = combinedMoney(arr());

    yellowMoney.forEach(({ name, money }) => {
      setYellowMoney({ [name]: money });
    });
    whiteMoney.forEach(({ name, money }) => {
      setWhiteMoney({ [name]: money });
    });
  }, [setYellowMoney, setWhiteMoney]);
  const ScoreSets = React.useCallback(
    (roomIndex, r_room) => {
      const copyScore = ScoreSet(r_room);

      if (score_room[roomIndex] !== copyScore) {
        setScore_room(roomIndex, copyScore);
      }
    },
    [score_room, setScore_room]
  );
  const RoomGunSet = React.useCallback(
    (r_room, inGame = false, type = "") => {
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
    },
    [ColorRoomgun1, RoomGun1Col, setColorRoomGun1]
  );
  const RoomGunSets = React.useCallback(
    (r_room, inGame = false, type = "") => {
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
    },
    [
      RoomGun1Col,
      RoomGun2Col,
      RoomGun3Col,
      RoomGun4Col,
      Roomgun1,
      Roomgun2,
      Roomgun3,
      Roomgun4,
      setRoomGun1,
      setRoomGun2,
      setRoomGun3,
      setRoomGun4,
    ]
  );
  const Expect = React.useCallback(
    (r_room) => {
      let pg1;
      if (!r_room) return pg1;
      const newProom = [
        ...r_room,
        {
          sBanker_Score: "0",
          sPlayer_Score: "7",
          sWinner: "Player",
          sPair: "",
        },
      ];

      let plog = newProom;
      let pFirstTie = 0;
      if (plog.length > 0) {
        for (let i = 0; i < Math.min(8, plog.length); i++) {
          if (plog[i].sWinner === "Tie") {
            pFirstTie++;
          } else {
            break;
          }
        }
      }

      plog = plog.slice(pFirstTie, plog.length);
      pg1 = new BigRoad({
        array: plog,
        row: Row,
        col: RoomGun1Col,
        cut: true,
      }).getBigRoad();

      new BigEyeRoad({
        gubun: pg1.gubunIndex,
        row: Row,
        col: RoomGun2Col * 2,
        cut: true,
      }).getBigEyeRoad(pg1.old, true, "Player");

      new SmallRoad({
        gubun: pg1.gubunIndex,
        row: Row,
        col: RoomGun3Col * 2,
        cut: true,
      }).getSmallRoad(pg1.old, true, "Player");

      new CockroachRoad({
        gubun: pg1.gubunIndex,
        row: Row,
        col: RoomGun4Col * 2,
        cut: true,
      }).getCockroachRoad(pg1.old, true, "Player");
      ////////////////////
      let bg1;
      const newBroom = [
        ...r_room,
        {
          sBanker_Score: "7",
          sPlayer_Score: "0",
          sWinner: "Banker",
          sPair: "",
        },
      ];
      let blog = newBroom;
      let bFirstTie = 0;
      if (blog.length > 0) {
        for (let i = 0; i < Math.min(8, blog.length); i++) {
          if (blog[i].sWinner === "Tie") {
            bFirstTie++;
          } else {
            break;
          }
        }
      }
      blog = blog.slice(bFirstTie, blog.length);
      bg1 = new BigRoad({
        array: blog,
        row: Row,
        col: RoomGun1Col,
        cut: true,
      }).getBigRoad();

      new BigEyeRoad({
        gubun: bg1.gubunIndex,
        row: Row,
        col: RoomGun2Col * 2,
        cut: true,
      }).getBigEyeRoad(bg1.old, true, "Banker");

      new SmallRoad({
        gubun: bg1.gubunIndex,
        row: Row,
        col: RoomGun3Col * 2,
        cut: true,
      }).getSmallRoad(bg1.old, true, "Banker");

      new CockroachRoad({
        gubun: bg1.gubunIndex,
        row: Row,
        col: RoomGun4Col * 2,
        cut: true,
      }).getCockroachRoad(bg1.old, true, "Banker");
    },
    [RoomGun1Col, RoomGun2Col, RoomGun3Col, RoomGun4Col]
  );
  const MoveGunSet = React.useCallback(
    (roomIndex, r_room, inGame = false, type = "") => {
      let g1;

      if (r_room.length === 0) {
        g1 = {};
      } else {
        let log = r_room;
        let FirstTie = 0;
        if (log.length > 0) {
          for (let i = 0; i < Math.min(8, log.length); i++) {
            if (log[i].sWinner === "Tie") {
              FirstTie++;
            } else {
              break;
            }
          }
        }

        log = log.slice(FirstTie, log.length);
        g1 = new BigRoad({
          array: log,
          row: Row,
          col: RoomGun1Col / 2,
          cut: true,
        }).getBigRoad();
      }
      if (Movegun1[roomIndex] !== g1) {
        setMovegun1(roomIndex, g1);
      }
    },
    [Movegun1, RoomGun1Col, setMovegun1]
  );
  useEffect(() => {
    // Preload sounds when component mounts
    const sounds = [
      "bet_start",
      "bet_finish",
      "countdown",
      "win_player",
      "win_banker",
      "win_tie",
      "win_end",
      "bet_confirm",
      "bet_cancel",
    ];
    sounds.forEach((name) => {
      new Audio(`/sounds/${name}.mp3`);
    });
  }, []);
  const handleUserLimit = useCallback(
    (data) => {
      console.log("userLimit", data);
      setUserLimit({
        bet_min: data.bet_min,
        bet_max: data.bet_max,
        tie_min: data.min_tie,
        tie_max: data.max_tie,
        pair_min: data.min_pair,
        pair_max: data.max_pair,
      });
    },
    [setUserLimit]
  );
  const handleTableLimit = useCallback(
    (data) => {
      console.log("tableLimit", data);
      const roomIndex = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (roomIndex === -1 || !s_room) {
        return;
      }

      const updatedRoom = {
        ...s_room[roomIndex],
        LimitBet: data.s_room.LimitBet,
      };
      setRoom_s(roomIndex, updatedRoom);
    },
    [s_room, setRoom_s]
  );
  useEffect(() => {
    if (socket.connected && !initRoom.current) {
      localStorage.setItem("roomid", s_room[id].RoomID);

      setLoading(false);
      setBet(false);
      initRoom.current = true;

      setMomentWinMoney(0);
      setGun1([]);
      setGun2([]);
      setGun3([]);
      setGun4([]);

      setRoomGun1([]);
      setRoomGun2([]);
      setRoomGun3([]);
      setRoomGun4([]);
      setMovegun1([]);
      setScoreP(0);
      setCardP([]);
      setWinner([]);
      setScoreB(0);
      setCardB([]);

      latestRoomDataRef.current = null;
      RoomGunSets(r_room[id]);
      RoomGunSet(r_room[id]);
      ScoreSets(id, r_room[id]);
      Expect(r_room[id]);
      for (let i = 0; i < r_room.length; i++) {
        const roomData = r_room[i];
        MoveGunSet(i, roomData);
      }
    }
    socket.on("userLimit", handleUserLimit);
    socket.on("tableLimit", handleTableLimit);
    socket.on("timer", (data) => {
      if (RoomID !== data.RoomID) return;
      // console.log('timer',data);
      if (!TimeState.State && data.State) {
        playSound("bet_start");
      }
      setTimeState(data);

      if (!data.State) {
        setMsg("betend");
        playSound("bet_finish");
        setYellowMoney({
          Player: 0,
          Banker: 0,
          Tie: 0,
          Player_Pair: 0,
          Banker_Pair: 0,
        });

        let newMoney = mb_money;
        const yellowMoney = combinedMoney(cur_arr());
        yellowMoney.forEach(({ name, money }) => {
          newMoney += money;
        });

        setMb_money(newMoney);

        init_cur_arr();
      } else {
        if (data.Time > 0 && data.Time <= 9) {
          playSound("countdown");
        }
      }
    });
    socket.on("betLog", (data) => {
      console.log("betLog", data);
      setBetLog(data.result);
    });

    socket.on("statusLobby", (data) => {
      const roomIndex = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (roomIndex === -1) {
        return;
      }
      // console.log("Received statusLobby:", data);
      if (data.status === "Open" || data.status === "Close") {
        const updatedRoom = {
          ...s_room[roomIndex],
          active: data.status === "Open" ? 1 : 0,
          status: data.status.split("-")[0],
          Playing: data.Playing,
        };
        setRoom_s(roomIndex, updatedRoom);
      } else {
        if (
          s_room[roomIndex].status !== data.status.split("-")[0] ||
          s_room[roomIndex].Playing !== data.Playing
        ) {
          const updatedRoom = {
            ...s_room[roomIndex],
            status: data.status.split("-")[0],
            Playing: data.Playing,
          };
          setRoom_s(roomIndex, updatedRoom);
        }
      }
    });
    socket.on("enterSingleLobby", (data) => {
      console.log("enterSingleLobby", data);

      const roomIndex = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (roomIndex === -1) {
        return;
      }
      if (r_room[roomIndex] !== data.result) {
        setRoom_s(roomIndex, data.s_room);
        setRoom_r(roomIndex, data.result);
        ScoreSets(roomIndex, data.result);

        if (roomIndex === id) {
          RoomGunSets(data.result);
          RoomGunSet(data.result);
          Expect(data.result);
          latestRoomDataRef.current = data.result;
        }
        MoveGunSet(roomIndex, data.result);
      }
    });
    socket.on("Game_Start", (data) => {
      console.log("Game_Start", data);
      const roomIndex = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (roomIndex === -1) {
        return;
      }
      setRoom_s(roomIndex, data);
      setMomentWinMoney(0);
      setCBMap({
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
      setMsg("betstart");
      setScoreB(0);
      setScoreP(0);
      setWinner([]);
      setCardB([]);
      setCardP([]);
    });
    socket.on("Game_Wait", (data) => {
      console.log("Game_Wait", data);

      const roomIndex = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (roomIndex === -1) {
        return;
      }
      setMsg("Shuffle");
      setRoom_s(roomIndex, data);
      setMomentWinMoney(0);

      setScoreB(0);
      setScoreP(0);
      setWinner([]);
      setCardB([]);
      setCardP([]);
    });
    socket.on("resultWinner", (data) => {
      if (RoomID !== data.RoomID) return;
      console.log("resultWinner", data);
      // setPoolClick(false);
      setShoeNumber("");
      setGameCount("");
      const rates = {
        Player: 1,
        Banker: 0.95,
        Tie: 8,
        Player_Pair: 11,
        Banker_Pair: 11,
      };
      const winners = new Set(data.who);
      if (data.who.includes("Player")) {
        playSound("win_player", "win_end");
      } else if (data.who.includes("Banker")) {
        playSound("win_banker", "win_end");
      } else if (data.who.includes("Tie")) {
        playSound("win_tie", "win_end");
      }
      const totalWinMoney = combinedMoney(arr()).reduce(
        (sum, { name, money }) => {
          const rate = rates[name] || 0;
          return winners.has(name) ? sum + rate * money : sum;
        },
        0
      );

      setMomentWinMoney(totalWinMoney);

      init_cur_arr();
      init_arr();
      setYellowMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });
      setAllWhiteMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });

      setScoreB(data.BankerScore);
      setScoreP(data.PlayerScore);
      setWinner(data.who);
      setCardB(data.bCard);
      setCardP(data.pCard);
    });
    socket.on("change_betting", (data) => {
      if (RoomID !== data.RoomID) return;
      // console.log("change_betting", data);
      const peso = sUserCode.slice(0, 9) === "001002001";
      if (!peso) setCBMap(data.CBMap);
    });
    socket.on("padBetting", (data) => {
      if (RoomID !== data.RoomID) return;
      // console.log("padBetting", data);

      const peso = sUserCode.slice(0, 9) === "001002001";
      if (peso) setCBMap(data.PADMap);
    });
    socket.on("ExitRoomSuccess", () => {
      console.log("ExitRoomSuccess");
      setScoreB(0);
      setScoreP(0);
      setWinner([]);
      setCardB([]);
      setCardP([]);
      setIsMove(false);
      setRoomID("");
      setId(-1);
      setIsMove(false);
      localStorage.removeItem("roomid");
      navigate("/Lobby");
    });
    socket.on("MoveRoomSuccess", (data) => {
      console.log("MoveRoomSuccess", data);
      setBet(false);
      const peso = sUserCode.slice(0, 9) === "001002001";

      setCBMap(peso ? data.PADMap : data.CBMap);
      setYellowMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });
      setAllWhiteMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });

      const newRoomIndex = s_room.findIndex(
        (el) => el.RoomID === data.s_room.RoomID
      );
      setRoomID(data.s_room.RoomID);
      setId(newRoomIndex);

      setMoving(false);
      setRoomGun1([]);
      setRoomGun2([]);
      setRoomGun3([]);
      setRoomGun4([]);
      setMovegun1([]);
      setIsMove(false);
      setScoreP(0);
      setCardP([]);
      setWinner([]);
      setScoreB(0);
      setCardB([]);

      setTimeState({ Time: 0, State: false });
      initRoom.current = false;

      setMomentWinMoney(0);
      setMb_money(data.money);
      init_arr();
      init_cur_arr();
      if (data.BetData) {
        const bettingArray = Object.entries(data.BetData).map(
          ([name, value]) => ({ name, money: value.money, rate: value.rate })
        );

        bettingArray.forEach((el, idx) => {
          if (el.money !== 0) {
            setWhiteMoney({ [el.name]: el.money });
            push(el.name, el.money);
            setWhiteMoney({ [el.name]: el.money });
          }
        });
      }
    });

    socket.on("OkBet", () => {
      setMsg("bettingSuccess");
      arr_cur_connect();
      init_cur_arr();

      setAllYellowMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });

      settingMoney();
      setBet(false);

      playSound("bet_confirm");
    });
    socket.on("notBet", (data) => {
      console.log("notBet", data);
      setMsg(data.msg);

      let newMoney = mb_money;

      if (cur_length() !== 0) {
        const yellowMoney = combinedMoney(cur_arr());
        yellowMoney.forEach(({ name, money }) => {
          newMoney += money;
        });
        setAllYellowMoney({
          Player: 0,
          Banker: 0,
          Tie: 0,
          Player_Pair: 0,
          Banker_Pair: 0,
        });
      }

      setMb_money(newMoney);

      init_cur_arr();
      setBet(false);
    });

    socket.on("OkCancelBet", (data) => {
      setMsg(data.msg);

      init_arr();

      setAllYellowMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });
      setAllWhiteMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });
      setBet(false);
      playSound("bet_cancel");
    });
    socket.on("notCancelBet", (data) => {
      setMsg(data.msg);

      setBet(false);
    });
    return () => {
      socket.off("timer");
      socket.off("betLog");
      socket.off("enterSingleLobby");
      socket.off("statusLobby");
      socket.off("Game_Start");
      socket.off("resultWinner");
      socket.off("Game_Wait");
      socket.off("ExitRoomSuccess");
      socket.off("notBet");
      socket.off("notCancelBet");
      socket.off("OkBet");
      socket.off("OkCancelBet");

      socket.off("change_betting");
      socket.off("padBetting");
      socket.off("MoveRoomSuccess");

      socket.off("userLimit", handleUserLimit);
      socket.off("tableLimit", handleTableLimit);
    };
  }, [
    Expect,
    MoveGunSet,
    RoomGunSets,
    ScoreSets,
    id,
    navigate,
    r_room,
    s_room,
    setGun1,
    setGun2,
    setGun3,
    setGun4,
    setId,
    setMovegun1,
    setRoomGun1,
    setRoomGun2,
    setRoomGun3,
    setRoomGun4,
    setRoomID,
    setRoom_r,
    setRoom_s,
    setScore_room,
    socket,
    isMove,
    setTimeState,
    TimeState,
    setIsMove,
    setToken,
    setMb_money,
    setCurrencyType,
    mb_money,
    setMsg,
    setYellowMoney,
    setWhiteMoney,
    setScoreP,
    setCardP,
    setWinner,
    setScoreB,
    setCardB,
    RoomID,
    setMomentWinMoney,
    setAllWhiteMoney,
    setCBMap,
    setBetLog,
    setAllYellowMoney,
    settingMoney,
    RoomGunSet,
    setLoading,
    setPoolClick,
    sUserCode,
    setShoeNumber,
    setGameCount,
    playSound,
    handleUserLimit,
    handleTableLimit,
  ]);
  return (
    <div className="Game_wrap">
      <div className={`room game size-mode`}>
        <GameContent
          time={TimeState.Time}
          bet={bet}
          setBet={setBet}
          sound={sound}
          setSound={setSound}
        />
        <BettingInfo setBtn_betlog={setBtn_betlog} />
        {isMove && <TableInfo setMoving={setMoving} moving={moving} />}
        {isMobile() && window.innerWidth < window.innerHeight && <Backbtn />}
        {isMobile() && window.innerWidth < window.innerHeight && (
          <Tablemovebtn />
        )}
        {(Kindchip || btn_betlog) && (
          <LayerRule btn_betlog={btn_betlog} setBtn_betlog={setBtn_betlog} />
        )}
        <Result />
      </div>
    </div>
  );
}

export default Game;
