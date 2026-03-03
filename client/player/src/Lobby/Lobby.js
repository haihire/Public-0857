import React, { useCallback, useEffect, useRef } from "react";
import "./lobbygame.scss";
import "./lobbylayout.scss";
import Header from "./Header";
import GameList from "./GameList";
import Rule from "./Rule";
import { useSocket } from "../SocketContext";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useStore } from "../store";
import { GunSet, init_arr, init_cur_arr, push, ScoreSet } from "../util";

function Lobby() {
  const location = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === "POP") {
      localStorage.removeItem("roomid");
    }
  }, [location, navType]);
  const socket = useSocket();
  const navigate = useNavigate();
  const initRoom = useRef(false);
  const Row = 6;
  const {
    setUserLimit,
    sUserCode,
    LobbyGun1Col,
    LobbyGun2Col,
    LobbyGun3Col,
    LobbyGun4Col,
    gun1,
    gun2,
    gun3,
    gun4,
    setRoom_s,
    setRoom_r,
    setScore_room,
    setGun1,
    setGun2,
    setGun3,
    setGun4,
    score_room,
    s_room,
    setId,
    setRoomID,
    setCBMap,
    setTimeState,
    setAllYellowMoney,
    setAllWhiteMoney,
    setWhiteMoney,
    AllsetRoom_s,
    AllsetRoom_r,
    AllsetScore_room,
    Loading,
    setLoading,
    setIsMove,
  } = useStore();
  const playSilent = () => {
    const audio = new Audio("/sounds/silent.mp3"); // 아주 짧고 무음인 파일
    audio.play().catch(() => {});
  };
  const AllScoreSets = React.useCallback(
    (r_room) => {
      const copyScore = [];
      r_room.forEach((el) => {
        copyScore.push(ScoreSet(el));
      });
      if (score_room !== copyScore) {
        AllsetScore_room(copyScore);
      }
    },
    [AllsetScore_room, score_room]
  );
  const ScoreSets = React.useCallback(
    (roomIndex, r_room) => {
      const copyScore = ScoreSet(r_room);

      if (score_room[roomIndex] !== copyScore) {
        setScore_room(roomIndex, copyScore);
      }
    },
    [score_room, setScore_room]
  );
  const AllGunSets = React.useCallback(
    (r_room) => {
      r_room.forEach((el, idx) => {
        const { g1, g2, g3, g4 } = GunSet(el, {
          Row,
          LobbyGun1Col,
          LobbyGun2Col,
          LobbyGun3Col,
          LobbyGun4Col,
        });
        if (gun1[idx] !== g1) {
          setGun1(idx, g1);
        }
        if (gun2[idx] !== g2) {
          setGun2(idx, g2);
        }
        if (gun3[idx] !== g3) {
          setGun3(idx, g3);
        }
        if (gun4[idx] !== g4) {
          setGun4(idx, g4);
        }
      });
    },
    [
      LobbyGun1Col,
      LobbyGun2Col,
      LobbyGun3Col,
      LobbyGun4Col,
      gun1,
      gun2,
      gun3,
      gun4,
      setGun1,
      setGun2,
      setGun3,
      setGun4,
    ]
  );
  const GunSets = React.useCallback(
    (roomIndex, r_room) => {
      const { g1, g2, g3, g4 } = GunSet(r_room, {
        Row,
        LobbyGun1Col,
        LobbyGun2Col,
        LobbyGun3Col,
        LobbyGun4Col,
      });

      if (gun1[roomIndex] !== g1) {
        setGun1(roomIndex, g1);
      }
      if (gun2[roomIndex] !== g2) {
        setGun2(roomIndex, g2);
      }
      if (gun3[roomIndex] !== g3) {
        setGun3(roomIndex, g3);
      }
      if (gun4[roomIndex] !== g4) {
        setGun4(roomIndex, g4);
      }

      console.log("gun2", gun2);
    },
    [
      LobbyGun1Col,
      LobbyGun2Col,
      LobbyGun3Col,
      LobbyGun4Col,
      gun1,
      gun2,
      gun3,
      gun4,
      setGun1,
      setGun2,
      setGun3,
      setGun4,
    ]
  );
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

  const handleAbatarFill = useCallback(
    (data) => {
      const desiredOrder = ["maxim", "okura", "hann", "nustar"];
      const combined = data.s_room.map((s, i) => ({
        s, // s_room 데이터
        r: data.r_room[i], // r_room 대응 데이터
      }));
      combined.sort((a, b) => {
        const iA = desiredOrder.indexOf(a.s.sSite);
        const iB = desiredOrder.indexOf(b.s.sSite);
        // 둘 다 순서 배열에 없으면 원래 순서 유지
        if (iA === -1 && iB === -1) return 0;
        // a가 없으면 뒤로
        if (iA === -1) return 1;
        // b가 없으면 a를 앞으로
        if (iB === -1) return -1;
        return iA - iB;
      });
      const r = combined.map(({ r }) => r);
      AllsetRoom_s(combined.map(({ s }) => s));
      AllsetRoom_r(r);
      AllScoreSets(r);
      AllGunSets(r);
      const roomid = localStorage.getItem("roomid");
      if (roomid) {
        const sUserCode = localStorage.getItem("sUserCode");
        const mb_money = localStorage.getItem("mb_money");
        const mb_name = localStorage.getItem("mb_name");
        const mb_multiBet = localStorage.getItem("mb_multiBet");

        socket.emit("EnterRoom", {
          RoomID: roomid,
          sUserCode: sUserCode,
          money: mb_money,
          name: mb_name,
          multiBet: mb_multiBet,
        });
      } else {
        setLoading(false);
      }
    },
    [AllsetRoom_s, AllsetRoom_r, AllScoreSets, AllGunSets, socket, setLoading]
  );
  const handleStatusLobby = useCallback(
    (data) => {
      const roomIndex = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (roomIndex === -1) return;

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
    },
    [s_room, setRoom_s]
  );
  const handleEnterSingle = useCallback(
    (data) => {
      const idx = s_room.findIndex((el) => el.RoomID === data.RoomID);
      if (idx === -1) return;

      setRoom_s(idx, data.s_room);
      setRoom_r(idx, data.result);
      ScoreSets(idx, data.result);
      GunSets(idx, data.result);
    },
    [s_room, setRoom_s, setRoom_r, ScoreSets, GunSets]
  );
  const handleEnterSuccess = useCallback(
    (data) => {
      setIsMove(false);
      const peso = sUserCode.slice(0, 9) === "001002001";
      setCBMap(peso ? data.PADMap : data.CBMap);
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
      setRoomID(data.s_room.RoomID);
      setId(s_room.findIndex((el) => el.RoomID === data.s_room.RoomID));

      if (data.BetData) {
        const bettingArray = Object.entries(data.BetData).map(
          ([name, value]) => ({ name, money: value.money, rate: value.rate })
        );

        bettingArray.forEach((el, idx) => {
          if (el.money !== 0) {
            push(el.name, el.money);
            setWhiteMoney({ [el.name]: el.money });
          }
        });
      }
      navigate("/Game");
    },
    [
      setIsMove,
      sUserCode,
      setCBMap,
      setAllYellowMoney,
      setAllWhiteMoney,
      setRoomID,
      setId,
      s_room,
      navigate,
      setWhiteMoney,
    ]
  );
  useEffect(() => {
    if (!socket.connected || initRoom.current) return;
    playSilent();
    sessionStorage.setItem("manualLogin", "true");
    localStorage.setItem("lobby", true);
    initRoom.current = true;

    setRoom_s([]);
    setRoom_r([]);
    AllsetScore_room([]);
    setGun1([]);
    setGun2([]);
    setGun3([]);
    setGun4([]);
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
    setTimeState({ Time: 0, State: false });

    init_cur_arr();
    init_arr();

    const storedId = localStorage.getItem("id");
    socket.emit("AbatarFill");
    socket.emit("RefreshUInfo", { sUserID: storedId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.connected]);

  useEffect(() => {
    socket.on("AbatarFill", handleAbatarFill);
    socket.on("statusLobby", handleStatusLobby);
    socket.on("enterSingleLobby", handleEnterSingle);
    socket.on("EnterRoomSuccess", handleEnterSuccess);
    socket.on("userLimit", handleUserLimit);
    socket.on("tableLimit", handleTableLimit);
    return () => {
      socket.off("AbatarFill", handleAbatarFill);
      socket.off("statusLobby", handleStatusLobby);
      socket.off("enterSingleLobby", handleEnterSingle);
      socket.off("EnterRoomSuccess", handleEnterSuccess);
      socket.off("userLimit", handleUserLimit);
      socket.off("tableLimit", handleTableLimit);
    };
  }, [
    socket,
    handleUserLimit,
    handleTableLimit,
    handleAbatarFill,
    handleStatusLobby,
    handleEnterSingle,
    handleEnterSuccess,
  ]);

  return (
    <div className="Lobby_wrap" style={{ display: Loading ? "none" : "" }}>
      <div className="room_list size-modes">
        <Header></Header>
        <GameList></GameList>
        <Rule></Rule>
      </div>
    </div>
  );
}

export default Lobby;
