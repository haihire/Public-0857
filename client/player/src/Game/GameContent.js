import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import {
  arr,
  checkTableLimit,
  checkUserLimit,
  combinedMoney,
  cur_arr,
  cur_length,
  cur_push,
  getTranslation,
  init_cur_arr,
  isLandscape,
  isMobile,
  length,
  moneyformatNumber,
} from "../util";
import VideoPlayer from "./VideoPlayer";
import { useSocket } from "../SocketContext";

function GameContent({ time, bet, setBet, sound, setSound }) {
  const {
    language,
    id,
    s_room,
    setKindchip,
    mb_money,
    All_CHIPS,
    currencyType,
    mb_id,
    RoomID,
    TimeState,

    setMb_money,
    msg,
    setMsg,
    userLimit,
    yellowMoney,
    whiteMoney,
    setYellowMoney,
    setAllYellowMoney,
    momentwinMoney,
    setWhiteMoney,
    CBMap,

    reversalColor,
    setReversalColor,
    sUserCode,
  } = useStore();
  const socket = useSocket();
  /* Sound */
  const audioRef = useRef(null);

  const playSound = useCallback(
    async (...names) => {
      if (!sound) return;
      try {
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
  const [currentChip, setCurrentChip] = useState(0);

  const [videoFull, setVideoFull] = useState(false);
  const [offset, setOffset] = useState(0);
  //기본4개 ((나열된거-기본4개)*120)
  const [maxOffset, setMaxOffset] = useState(() => {
    const selectedCount = All_CHIPS.filter((chip) => chip.show).length;
    return (selectedCount - 4) * -120;
  });
  const [mmaxOffset, msetMaxOffset] = useState(() => {
    const selectedCount = All_CHIPS.filter((chip) => chip.show).length;
    return (selectedCount - 4) * -60;
  });
  const step = 360; // 한번에 이동할 픽셀
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);

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

  // 컨테이너/콘텐츠 크기 측정해서 maxOffset 계산
  useEffect(() => {
    setMaxOffset(() => {
      const selectedCount = All_CHIPS.filter((chip) => chip.show).length;
      return (selectedCount - 4) * -120;
    });
    msetMaxOffset(() => {
      const selectedCount = All_CHIPS.filter((chip) => chip.show).length;
      return (selectedCount - 4) * -76;
    });
  }, [All_CHIPS]);
  useEffect(() => {
    const onChipNumber = All_CHIPS.filter((el) => el.show);
    setCurrentChip(onChipNumber[0].num);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const curChip = (data) => (data === currentChip ? "select" : "");
  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStartX(e.clientX || e.touches[0].clientX);
    setDragStartOffset(offset);
  };

  // 드래그 이동
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const clientX = e.clientX || e.touches[0].clientX; // For touch devices
    const deltaX = clientX - dragStartX;
    let newOffset = dragStartOffset + deltaX;

    newOffset = Math.min(
      0,
      Math.max(newOffset, isMobile() && !isLandscape() ? mmaxOffset : maxOffset)
    );
    setOffset(newOffset);
  };

  // 드래그 끝
  const handleMouseUp = () => {
    setDragging(false);
  };
  const handleMouseLeave = () => {
    setDragging(false);
  };
  // Mobile support: touch events
  function handleTouchStart(e) {
    handleMouseDown(e); // Reuse the mouseDown logic
  }

  function handleTouchMove(e) {
    handleMouseMove(e); // Reuse the mouseMove logic
  }

  function handleTouchEnd() {
    handleMouseUp(); // Reuse the mouseUp logic
  }

  function handleTouchCancel() {
    handleMouseLeave(); // Reuse the mouseLeave logic
  }
  function btn_betCancel() {
    if (bet || TimeState.Time <= 0 || (cur_length() === 0 && length() === 0)) {
      return;
    }
    console.log("btn_betCancel");

    if (length() !== 0) {
      socket.emit("cancelBet", {
        sUserID: mb_id,
        sUserCode: sUserCode,
        RoomID: RoomID,
      });
      setBet(true);
    }

    if (cur_length() !== 0) {
      let newMoney = mb_money;
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

      setMb_money(newMoney);

      init_cur_arr();
    }
  }
  function btn_betConfirm() {
    if (bet || TimeState.Time <= 0 || cur_length() === 0) {
      return;
    }
    setBet(true);
    const yelMoney = combinedMoney(cur_arr());

    if (yelMoney.some((el) => !checkLimitUser(el.name, el.money))) {
      console.log("한도 위반으로 배팅을 취소합니다");

      let newMoney = mb_money;

      yelMoney.forEach(({ name, money }) => {
        newMoney += money;
      });

      setAllYellowMoney({
        Player: 0,
        Banker: 0,
        Tie: 0,
        Player_Pair: 0,
        Banker_Pair: 0,
      });

      setMb_money(newMoney);

      init_cur_arr();
      setBet(false);
      return;
    }

    socket.emit("MoneyCheck", {
      money: cur_arr(),
      combind: combinedMoney(cur_arr()),
      RoomID: RoomID,
      sUserID: mb_id,
      sUserCode: sUserCode,
    });
  }
  function checkLimitUser(type, currentChip) {
    console.log("inCheckLimit");

    const limitConfig = {
      Player: {
        min: userLimit.bet_min,
        max: userLimit.bet_max,
        current: whiteMoney.Player,
      },
      Banker: {
        min: userLimit.bet_min,
        max: userLimit.bet_max,
        current: whiteMoney.Banker,
      },
      Tie: {
        min: userLimit.tie_min,
        max: userLimit.tie_max,
        current: whiteMoney.Tie,
      },
      Player_Pair: {
        min: userLimit.pair_min,
        max: userLimit.pair_max,
        current: whiteMoney.Player_Pair,
      },
      Banker_Pair: {
        min: userLimit.pair_min,
        max: userLimit.pair_max,
        current: whiteMoney.Banker_Pair,
      },
    };

    const cfg = limitConfig[type];
    if (!cfg) return false; // 알 수 없는 타입일 땐 그냥 통과(또는 false)

    if (cfg.current + currentChip < cfg.min) {
      setMsg("BetLimitUnder");
      return false;
    }
    if (currentChip + cfg.current > cfg.max) {
      setMsg("BetLimitOver");
      return false;
    }
    return true;
  }

  function CheckMoney(type) {
    if (bet || TimeState.Time <= 0 || mb_money === 0) {
      return;
    }

    let Plus = 0;

    //올인상황
    if (currentChip > mb_money) {
      Plus = mb_money;
    } else {
      Plus = currentChip;
    }

    if (type === "Banker" && Plus < 1000) {
      setMsg("BetLimitUnder"); // "한도 미만"
      setBet(false);
      return;
    } else if (type === "Player" && Plus < 100) {
      setMsg("BetLimitUnder"); // "한도 미만"
      setBet(false);
      return;
    }

    if (type === "Banker") {
      Plus = Plus - (Plus % 1000);
    } else if (type === "Player") {
      Plus = Plus - (Plus % 100);
    }

    //유저 개인한도
    if (
      whiteMoney[type] + yellowMoney[type] + Plus >
      checkUserLimit(type, userLimit).max
    ) {
      setMsg("BetLimitOver"); // "한도 초과"
      setBet(false);
      return;
    }
    //테이블 한도
    else if (
      whiteMoney[type] + yellowMoney[type] + Plus >
      checkTableLimit(type, s_room[id].LimitBet[currencyType]).max
    ) {
      setMsg("BetLimitOver"); // "한도 초과"
      setBet(false);
      return;
    }

    cur_push(type, Plus);

    setMb_money(mb_money - Plus);

    settingMoney();

    playSound("bet_click");
  }

  return (
    <div className="game-content">
      {/* 영상 */}
      <div className="movie-box" style={{ backgroundColor: "#666" }}>
        {/* 게임 진행상태 */}
        <div
          className="game_msg"
          id="game_msg"
          style={{
            border: "2px solid rgb(255, 198, 0)",
            color: "rgb(255, 198, 0)",
            zIndex: "99991",
            display: msg === "" ? "none" : "",
          }}
        >
          <font style={{ color: "#fff" }}>{getTranslation(language, msg)}</font>
        </div>
        {/* 상태 */}
        <div className="game_status" style={{ display: "none" }}>
          <div style={{ color: "#fe976e", fontWeight: "bold" }}>HANN 01</div>
          <div id="game_status">
            <font style={{ color: "#008cf8" }}>게임시작</font>
          </div>
        </div>
        {/* 시간 */}
        <div className="countdown_status" id="container" style={{}}>
          <div id="countdown">{time}</div>
        </div>
        {/* sound */}
        <div className="sound_mute_class" onClick={() => setSound(!sound)}>
          <div
            style={{
              backgroundImage: `url(./require/sound_${sound ? "1" : "2"}.png)`,
            }}
          ></div>
        </div>
        {/* COLOR CHANGE */}
        <div
          className="color_change_btn"
          onClick={() => setReversalColor(!reversalColor)}
        >
          COLOR
        </div>
        <div
          id="container"
          style={{
            zIndex: "9999",
            width: videoFull ? "1698px" : "100%",
            height: videoFull ? "868px" : "",
            position: videoFull ? "absolute" : "",
          }}
          onClick={() => {
            if (!isMobile()) setVideoFull(!videoFull);
          }}
        >
          <div style={{ overflow: "none" }} id="container_video_box">
            <div style={{ width: "100%", height: "100%" }}>
              <VideoPlayer
                plus={s_room?.[id]?.RoomID}
                roomId={s_room?.[id]?.RoomNumber}
                roomType="ivs"
              ></VideoPlayer>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* 영상 모바일 세로모드에서만 노출 */}
      <ul className="money-info">
        <li>
          <div>
            <span id="txt_game_betmoney">
              {getTranslation(language, "betmoney")}
            </span>{" "}
            <span className="txt-blue" id="user_bet_money">
              {moneyformatNumber(
                Object.values(whiteMoney).reduce(
                  (sum, amount) => sum + amount,
                  0
                )
              )}
            </span>
          </div>
        </li>
        <li>
          <div>
            <span id="t_lang_game_winmoney">
              {getTranslation(language, "winmoney")}
            </span>
            <span className="txt-red" id="user_win_money">
              {moneyformatNumber(momentwinMoney)}
            </span>
          </div>
        </li>
        <li>
          <div>
            <span id="txt_title_balance">
              {getTranslation(language, "havemoney")}
            </span>
            <span id="user_money">{moneyformatNumber(mb_money)}</span>
          </div>
        </li>
      </ul>
      <div className="betting-table" style={{ filter: "brightness(100%)" }}>
        {/* 정보 */}
        <div className="table-top">
          <div className="type">
            <h3>
              <span id="txt_title_game">
                {getTranslation(language, "game")}
              </span>{" "}
              <span id="shoe_num">{s_room?.[id]?.ShoeNumber || ""}</span> -{" "}
              <span id="game_cnt">{s_room?.[id]?.ShoeGameNumber}</span>
            </h3>

            <span className="logo">
              {/* <img src={`./require/logo_${s_room?.[id]?.sSite}.png`} alt="" /> */}
              <img src={`./require/0857logo.png`} alt="" />
            </span>

            <div>
              <span>
                <span id="txt_title_limit">
                  {getTranslation(language, "BetLimit")}
                </span>{" "}
                :
                <span id="txt_user_limit">
                  {moneyformatNumber(userLimit.bet_min)}
                </span>
                ~{" "}
                <span id="txt_user_limit">
                  {moneyformatNumber(userLimit.bet_max)}
                </span>
              </span>
              {/* 현재 hover로 작동 className on 을 추가하여 클릭시 오픈 가능 */}
              <div className={`${language}`}>
                <ul>
                  <li>
                    <span id="txt_personal_max">
                      {getTranslation(language, "personmax")}
                    </span>
                  </li>
                  <li>
                    <span id="txt_title_p" className="txt-blue">
                      {getTranslation(language, "player")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.bet_max)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_b" className="txt-yellow">
                      {getTranslation(language, "banker")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.bet_max)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_t" className="txt-green">
                      {getTranslation(language, "tie")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.tie_max)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_pp" className="txt-skyblue">
                      {getTranslation(language, "pp")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.pair_max)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_bp" className="txt-pink">
                      {getTranslation(language, "bp")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.pair_max)}
                      </span>
                    </div>
                  </li>
                </ul>
                <ul>
                  <li>
                    <span id="txt_personal_min">
                      {getTranslation(language, "personmin")}
                    </span>
                  </li>
                  <li>
                    <span id="txt_title_p" className="txt-blue">
                      {getTranslation(language, "player")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.bet_min)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_b" className="txt-yellow">
                      {getTranslation(language, "banker")}
                    </span>{" "}
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.bet_min)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_t" className="txt-green">
                      {getTranslation(language, "tie")}
                    </span>
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.tie_min)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_pp" className="txt-skyblue">
                      {getTranslation(language, "pp")}
                    </span>
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.pair_min)}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_bp" className="txt-pink">
                      {getTranslation(language, "bp")}
                    </span>
                    <div>
                      <span id="txt_user_limit">
                        {moneyformatNumber(userLimit.pair_min)}
                      </span>
                    </div>
                  </li>
                </ul>
                <ul>
                  <li>
                    <span id="txt_table_max">
                      {getTranslation(language, "tablemax")}
                    </span>
                  </li>
                  <li>
                    <span id="txt_title_p" className="txt-blue">
                      {getTranslation(language, "player")}
                    </span>{" "}
                    <div>
                      <span id="txt_table_limit">
                        {moneyformatNumber(
                          s_room[id]?.LimitBet?.[currencyType]?.max || 0
                        )}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_b" className="txt-yellow">
                      {getTranslation(language, "banker")}
                    </span>{" "}
                    <div>
                      <span id="txt_table_limit">
                        {moneyformatNumber(
                          s_room[id]?.LimitBet?.[currencyType]?.max || 0
                        )}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_t" className="txt-green">
                      {getTranslation(language, "tie")}
                    </span>{" "}
                    <div>
                      <span id="txt_table_limit">
                        {moneyformatNumber(
                          s_room[id]?.LimitBet?.[currencyType]?.max_tie || 0
                        )}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_pp" className="txt-skyblue">
                      {getTranslation(language, "pp")}
                    </span>{" "}
                    <div>
                      <span id="txt_table_limit">
                        {moneyformatNumber(
                          s_room[id]?.LimitBet?.[currencyType]?.max_pair || 0
                        )}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span id="txt_title_bp" className="txt-pink">
                      {getTranslation(language, "bp")}
                    </span>{" "}
                    <div>
                      <span id="txt_table_limit">
                        {moneyformatNumber(
                          s_room[id]?.LimitBet?.[currencyType]?.max_pair || 0
                        )}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* 정보 공지 */}
        <div className="notice">
          <div style={{ position: "relative", top: "7px", left: "50px" }}>
            <span
              id="txt_title_balance"
              style={{
                color: "#FFF",
                fontWeight: "bold",
                fontSize: "18px",
                width: "180px",
                display: "inline-block",
              }}
            >
              {getTranslation(language, "havemoney")}
            </span>
            <span
              id="user_money"
              style={{
                color: "#FFF",
                fontWeight: "bold",
                fontSize: "18px",
                width: "300px",
                textAlign: "right",
                display: "inline-block",
              }}
            >
              {moneyformatNumber(mb_money)}
            </span>
          </div>
        </div>{" "}
        {/* 공지 버튼 */}
        <div className="casino-button">
          <div className="btn-top">
            <div
              className="btn"
              onClick={() => {
                CheckMoney("Player_Pair");
              }}
            >
              {/* 선택시 className="select" 추가 */}
              <div id="pp_bet">
                <p className="top txt-player" id="txt_title_pp">
                  {getTranslation(language, "pp")}
                </p>
                <p className="middle">
                  <img src="./require/money_icon.png" width="18" alt="" />{" "}
                  <span id="live_pp_bet">
                    {moneyformatNumber(CBMap?.Player_Pair?.total || 0)}
                  </span>
                </p>
                <p className="bottom" id="betPPMoney">
                  {whiteMoney.Player_Pair > 0 &&
                    moneyformatNumber(whiteMoney.Player_Pair)}
                  {whiteMoney.Player_Pair > 0 &&
                    yellowMoney.Player_Pair > 0 &&
                    " + "}
                  {yellowMoney.Player_Pair > 0 &&
                    moneyformatNumber(yellowMoney.Player_Pair || 0)}
                </p>
              </div>
            </div>

            <div
              className="btn center"
              onClick={() => {
                CheckMoney("Tie");
              }}
            >
              <div id="t_bet">
                <p className="top txt-green" id="txt_title_t">
                  {getTranslation(language, "tie")}
                </p>
                <p className="middle">
                  <img src="./require/money_icon.png" width="18" alt="" />{" "}
                  <span id="live_tie_bet">
                    {moneyformatNumber(CBMap?.Tie?.total)}
                  </span>
                </p>
                <p className="bottom" id="betTMoney">
                  {whiteMoney.Tie > 0 && moneyformatNumber(whiteMoney.Tie)}
                  {whiteMoney.Tie > 0 && yellowMoney.Tie > 0 && " + "}
                  {yellowMoney.Tie > 0 && moneyformatNumber(yellowMoney.Tie)}
                </p>
              </div>
            </div>

            <div
              className="btn"
              onClick={() => {
                CheckMoney("Banker_Pair");
              }}
            >
              <div id="bp_bet">
                <p className="top txt-banker" id="txt_title_bp">
                  {getTranslation(language, "bp")}
                </p>
                <p className="middle">
                  <img src="./require/money_icon.png" width="18" alt="" />{" "}
                  <span id="live_bp_bet">
                    {moneyformatNumber(CBMap?.Banker_Pair?.total)}
                  </span>
                </p>
                <p className="bottom" id="betBPMoney">
                  {whiteMoney.Banker_Pair > 0 &&
                    moneyformatNumber(whiteMoney.Banker_Pair)}
                  {whiteMoney.Banker_Pair > 0 &&
                    yellowMoney.Banker_Pair > 0 &&
                    " + "}
                  {yellowMoney.Banker_Pair > 0 &&
                    moneyformatNumber(yellowMoney.Banker_Pair)}
                </p>
              </div>
            </div>
          </div>

          <div className="btn-bottom">
            <div
              className="btn"
              onClick={() => {
                CheckMoney("Player");
              }}
            >
              <div id="p_bet">
                <p className="top txt-player" id="txt_title_p">
                  {getTranslation(language, "player")}
                </p>
                <p className="middle">
                  <img src="./require/money_icon.png" width="18" alt="" />
                  <span id="live_player_bet">
                    {moneyformatNumber(CBMap?.Player?.total)}
                  </span>
                </p>
                <p className="bottom" id="betPMoney">
                  {whiteMoney.Player > 0 &&
                    moneyformatNumber(whiteMoney.Player)}
                  {whiteMoney.Player > 0 && yellowMoney.Player > 0 && " + "}
                  {yellowMoney.Player > 0 &&
                    moneyformatNumber(yellowMoney.Player)}
                </p>
              </div>
            </div>

            <div
              className="btn"
              onClick={() => {
                CheckMoney("Banker");
              }}
            >
              <div id="b_bet">
                <p className="top txt-banker" id="txt_title_b">
                  {getTranslation(language, "banker")}
                </p>
                <p className="middle">
                  <img src="./require/money_icon.png" width="18" alt="" />{" "}
                  <span id="live_banker_bet">
                    {moneyformatNumber(CBMap?.Banker?.total)}
                  </span>
                </p>
                <p className="bottom" id="betBMoney">
                  {whiteMoney.Banker > 0 &&
                    moneyformatNumber(whiteMoney.Banker)}
                  {whiteMoney.Banker > 0 && yellowMoney.Banker > 0 && " + "}
                  {yellowMoney.Banker > 0 &&
                    moneyformatNumber(yellowMoney.Banker)}
                </p>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* 버튼 칩버튼 */}
        <div className="chip-button">
          <div
            className="chip_arrow_left"
            onClick={() => setOffset((prev) => Math.min(prev + step, 0))}
          >
            <img src="./require/chip_arrow_left.png" alt="" />
          </div>
          <div
            className="chip_arrow_right"
            onClick={() =>
              setOffset((prev) =>
                Math.max(
                  prev - step,
                  isMobile() && !isLandscape() ? mmaxOffset : maxOffset
                )
              )
            }
          >
            <img src="./require/chip_arrow_right.png" alt="" />
          </div>
          <div className="chip_list">
            <div
              className="chip_list2 ui-draggable ui-draggable-handle"
              style={{
                left: `${offset}px`,
                transition: dragging ? "none" : "left 0.3s ease",
                cursor: dragging ? "grabbing" : "grab",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              {All_CHIPS.map((chip, idx) => {
                return (
                  <span
                    key={chip.num}
                    onClick={() => {
                      setCurrentChip(chip.num);
                    }}
                    className={`chip chip-${chip.num} KR ${curChip(chip.num)}`}
                    id={`C_${chip.num}`}
                    style={{
                      display: chip.show ? "" : "none",
                    }}
                  ></span>
                );
              })}
              {/* 칩선택 className="select" 추가 */}
            </div>
          </div>
        </div>
        <div className="betting-button">
          <span id="btn_betting_button">
            <button
              type="button"
              id="btn_cancel"
              data-cancel="Y"
              disabled=""
              onClick={() => {
                btn_betCancel();
              }}
            >
              <span id="txt_btn_cancel">
                {getTranslation(language, "betcancel")}
              </span>
            </button>
            <button
              type="button"
              className="bet"
              id="btn_submit"
              disabled=""
              onClick={() => {
                btn_betConfirm();
              }}
            >
              <span id="txt_btn_submit">
                {getTranslation(language, "betconfirm")}
              </span>
            </button>

            <img
              src="././require/chip_setup.png"
              className="chip_setup"
              alt=""
              onClick={() => {
                setKindchip(true);
              }}
            />

            <img
              src="././require/game_setup.png"
              className="game_setup"
              alt=""
            />

            <div className="game_setup_sub">
              <div className="game_setup_setup">
                <span id="txt_game_setup_setup">S</span>
              </div>
              <div className="game_setup_button">5</div>
              <div className="game_setup_button">4</div>
              <div className="game_setup_button">3</div>
              <div className="game_setup_button">2</div>
              <div className="game_setup_button">1</div>
              <div className="game_setup_prev">
                <span id="txt_game_setup_prev">BF</span>
              </div>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}

export default GameContent;
