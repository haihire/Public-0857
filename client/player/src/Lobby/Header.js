import { useEffect, useState } from "react";

import { getTranslation, isFullScreen, moneyformatNumber } from "../util";
import { useStore } from "../store";
import { useSocket } from "../SocketContext";

function Header() {
  const socket = useSocket();
  const { mb_name, mb_money, language, setLanguage, setOpenInfo } = useStore();
  const [isfull, setIsfull] = useState(isFullScreen());
  useEffect(() => {
    const updateIsFull = () => setIsfull(isFullScreen());
    window.addEventListener("resize", updateIsFull);
    return () => {
      window.removeEventListener("resize", updateIsFull);
    };
  }, []);
  // 전체화면 모드 진입
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          console.log("Entered fullscreen mode");
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
          console.log("Exited fullscreen mode");
          setIsfull(false);
        })
        .catch((err) => {
          console.error("Error exiting fullscreen", err);
        });
    }
  };

  return (
    <div className="header">
      <h1 className="game-type">
        <img src={`./require/0857logo.png`} alt="" />
      </h1>
      <div className="notice">
        <div className="marquee-wrapper">
          <div className="marquee-content">
            <span id="txt_welcome">{getTranslation(language, "welcome")}</span>
          </div>
        </div>
      </div>

      <ul className="user-info">
        <li className="nick">
          <i></i> <span>{mb_name}</span> <span id="txt_nim"></span>
        </li>
        <li className="money">
          <i></i>{" "}
          <span id="txt_title_balance">
            {getTranslation(language, "havemoney")}
          </span>{" "}
          : <span id="user_money">{moneyformatNumber(mb_money)}</span>
        </li>

        <li className="select-box">
          <select
            name="lang"
            onChange={(e) => {
              setLanguage(e.target.value);
              localStorage.setItem("lang", e.target.value);
            }}
          >
            <option value={localStorage.getItem("lang") || "ko"}>
              LANGUAGE
            </option>
            <option value="ko">KOREAN</option>
            <option value="cn">CHINESE</option>
            <option value="en">ENGLISH</option>
            <option value="jp">JAPANESE</option>
          </select>
        </li>
      </ul>

      <ul className="quick-button">
        <li>
          <button id="btn_role" onClick={() => setOpenInfo(true)}>
            <span id="t_btn_gameinfo">
              {getTranslation(language, "gameInfo")}
            </span>
          </button>
        </li>

        <li>
          {isfull ? (
            <button
              id="re_screen"
              onClick={() => {
                exitFullscreen();
              }}
            >
              <span id="t_btn_small">
                {getTranslation(language, "exitFullscreen")}
              </span>
            </button>
          ) : (
            <button
              id="full_screen"
              onClick={() => {
                enterFullscreen();
              }}
            >
              <span id="t_btn_full">
                {getTranslation(language, "fullscreen")}
              </span>
            </button>
          )}
        </li>
        <li>
          <button
            onClick={() => {
              localStorage.removeItem("id");
              localStorage.removeItem("pw");

              localStorage.removeItem("roomid");
              localStorage.removeItem("lobby");

              localStorage.removeItem("sUserCode");
              localStorage.removeItem("mb_money");
              localStorage.removeItem("mb_name");
              localStorage.removeItem("mb_multiBet");
              socket.disconnect();
            }}
          >
            <span id="t_btn_logout">{getTranslation(language, "main")}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Header;
