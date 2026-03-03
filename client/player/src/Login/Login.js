import { useEffect, useRef, useState } from "react";
import "./Login.scss";
import { useStore } from "../store";
import { getTranslation, isLocalhost, languageDisplay } from "../util";
import { useSocket } from "../SocketContext";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
function Login() {
  const location = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === "POP") {
      // console.log("Login Pop detected!");
      localStorage.removeItem("id");
      localStorage.removeItem("pw");

      localStorage.removeItem("roomid");
      localStorage.removeItem("lobby");

      localStorage.removeItem("sUserCode");
      localStorage.removeItem("mb_money");
      localStorage.removeItem("mb_name");
      localStorage.removeItem("mb_multiBet");
      sessionStorage.clear();
      socket.disconnect();
      socket.connect(); // 소켓 재연결
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navType]);
  const initRoom = useRef(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const {
    language,
    setLanguage,
    setToken,
    setMb_name,
    setMb_money,
    setCurrencyType,
    isSubmitting,
    setIsSubmitting,
    setMb_id,
    setsUserCode,
    setUserLimit,
    setMb_multiBet,
    setLoading,
    toggleChipSel,
    All_CHIPS,
  } = useStore();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userId, setUserId] = useState(isLocalhost ? "aaa06" : "");
  const [userPw, setUserPw] = useState(isLocalhost ? "1234" : "");
  const [Term, setTerm] = useState(false);
  const [sendData, setSendData] = useState({
    sUserID: "",
    sUserCode: "",
    name: "",
    money: "",
    token: "",
    RoomID: "",
    currencyType: "",
    bApiUser: "",
  });

  useEffect(() => {
    if (socket.connected && !initRoom.current) {
      initRoom.current = true;

      setLangDropdownOpen(false);
      setIsSubmitting(false);
      setTerm(false);
      setSendData({
        sUserID: "",
        sUserCode: "",
        name: "",
        id: "",
        money: "",
        token: "",
        RoomID: "",
        currencyType: "",
        bApiUser: "",
      });
      if (!isLocalhost) {
        setUserId("");
        setUserPw("");
      }

      const manualLogin = sessionStorage.getItem("manualLogin");
      const id = localStorage.getItem("id");
      const pw = localStorage.getItem("pw");
      const lobby = localStorage.getItem("lobby");

      if (manualLogin && lobby && id && pw) {
        socket.emit("LoginRequest", { id: id, pw: pw });
      } else {
        localStorage.removeItem("id");
        localStorage.removeItem("pw");

        localStorage.removeItem("roomid");
        localStorage.removeItem("lobby");

        localStorage.removeItem("sUserCode");
        localStorage.removeItem("mb_money");
        localStorage.removeItem("mb_name");
        localStorage.removeItem("mb_multiBet");
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.connected]);
  useEffect(() => {
    const onSuccess = (data) => {
      console.log("onSuccess", data);

      setTerm(true);
      setSendData({
        sUserID: data.sUserID,
        sUserCode: data.sUserCode,
        name: data.name,
        money: data.money,
        token: data.token,
        RoomID: data.TN,
        currencyType: data.currencyType,
        bApiUser: "0",
      });
      setToken(data.token);
      setMb_name(data.name);
      const chipList = data.chipList.split(",");
      const updatedChips = All_CHIPS.map((chip, idx) => ({
        ...chip,
        show: chipList[idx] > 0,
      }));
      toggleChipSel(updatedChips);
      setMb_money(data.money);
      setMb_id(data.sUserID);
      setCurrencyType(data.currencyType);
      setsUserCode(data.sUserCode);
      setUserLimit({
        bet_min: data.bet_min,
        bet_max: data.bet_max,
        tie_min: data.tie_min,
        tie_max: data.tie_max,
        pair_min: data.pair_min,
        pair_max: data.pair_max,
      });
      setMb_multiBet(data.multiBet);
      setIsSubmitting(false);

      localStorage.setItem("id", data.sUserID);
      localStorage.setItem("pw", data.pass);

      localStorage.setItem("sUserCode", data.sUserCode);
      localStorage.setItem("mb_money", data.money);
      localStorage.setItem("mb_name", data.name);
      localStorage.setItem("mb_multiBet", data.multiBet);

      const lobby = localStorage.getItem("lobby");
      if (lobby) {
        socket.emit("GetUserInfo", {
          sUserID: data.sUserID,
          sUserCode: data.sUserCode,
          name: data.name,
          money: data.money,
          token: data.token,
          RoomID: data.TN,
          currencyType: data.currencyType,
          bApiUser: "0",
        });
      } else {
        console.log("보내기", sendData);

        socket.emit("GetUserInfo", {
          sUserID: data.sUserID,
          sUserCode: data.sUserCode,
          name: data.name,
          money: data.money,
          token: data.token,
          RoomID: data.TN,
          currencyType: data.currencyType,
          bApiUser: "0",
        });
      }
    };
    socket.on("LobbyEnterSuccess", () => {
      navigate("/Lobby");
    });
    socket.on("LoginSuccess", onSuccess);

    return () => {
      socket.off("LobbyEnterSuccess");
      socket.off("LoginSuccess", onSuccess);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const changeLangCookie = (lang) => {
    setLanguage(lang);
    setLangDropdownOpen(false); // 언어 선택 후 드롭다운 닫기
    localStorage.setItem("lang", lang);
  };

  const toggleDropdown = () => {
    // if (SevUrl().servername === "pd-bet-services") return;
    setLangDropdownOpen(!langDropdownOpen);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userId || !userPw) return;
    if (isSubmitting) return; // 이미 요청 중이면 무시
    setIsSubmitting(true); // 요청 시작
    if (!socket || !socket.connected) {
      console.warn("소켓 연결이 안 되어 있어서 연결을 시도합니다.");

      socket.connect(); // 연결 시도
      navigate("/Login");
      return;
    }

    // 이미 연결된 경우 바로 emit
    socket.emit("LoginRequest", { id: userId, pw: userPw });
  };
  function TermsModal(data) {
    const raw = data.replace(/\n/g, "<br/>");

    return (
      <div
        dangerouslySetInnerHTML={{ __html: raw }}
        style={{ lineHeight: 1.5 }}
      />
    );
  }
  return (
    <div className="Login_wrap">
      <img className="login_tl" src="./require/top_left.png" alt="" />
      <div className="login_footer">
        <img src="./require/footer_bottom.png" alt="" />
        <span>
          ONLY. All rights reserved. © 0857 Gaming Limited company 2025.
        </span>
      </div>
      <div className="login_footer_m">
        <div className="login_footer_m_one">
          <img src="./require/footer_bottom.png" alt="" />
          <span>ONLY. All rights reserved.</span>
        </div>
        <span>© 0857 Gaming Limited company 2025.</span>
      </div>
      <div className="login_center">
        <div className="login_center_h">
          <div className="login_center_h_t">零捌伍柒貴賓會</div>
          <div className="login_center_h_b">
            <div className="login_center_h_b_line"></div>
            0857 VIP CLUB
            <div className="login_center_h_b_line"></div>
          </div>
        </div>
        <form action="" className="login_form">
          <label htmlFor="">
            <div>USER NAME</div>
            <input
              type="text"
              placeholder={getTranslation(language, "id")}
              name="user_id"
              id="user_id"
              autoComplete="off"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>
          <label htmlFor="">
            <div>PASS WORD</div>
            <input
              type="password"
              placeholder={getTranslation(language, "pw")}
              name="user_pw"
              id="user_pw"
              autoComplete="off"
              value={userPw}
              onChange={(e) => setUserPw(e.target.value)}
            />
          </label>
        </form>
        <div className="login_center_btn">
          <button onClick={handleSubmit}>SIGN IN</button>
        </div>
        <img
          className="login_bottom_img"
          src="./require/login_img.webp"
          alt=""
        />
      </div>
      {/* {Term ? (
        <div className="overlay">
          <div
            className="form-container2"
            style={{ fontSize: "18px !important" }}
          >
            <div id="agree_title">
              {getTranslation(language, "terms_title")}
            </div>
            <div className="form-container2_box">
              <div className="i_list" id="agree_txt">
                {TermsModal(getTranslation(language, "terms_text"))}
              </div>
            </div>
            <div className="i_btn">
              <div className="input-field">
                <button
                  type="button"
                  onClick={() => setTerm(false)}
                  name="cancel"
                >
                  <span id="agree_cancel">
                    {getTranslation(language, "cancel")}
                  </span>
                </button>
              </div>
              <div className="input-field">
                <button
                  type="button"
                  onClick={() => socket.emit("GetUserInfo", sendData)}
                  name="ok"
                >
                  <span id="agree_ok">{getTranslation(language, "login")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overlay">
          <div className="form-container">
            <div className="img-box">
              <img src={`./require/hann.png`} alt="" />
            </div>

            <div className="language_class">
              <button type="button" id="btn_language" onClick={toggleDropdown}>
                <div id="select_lang">{languageDisplay[language]}</div>{" "}
                <span></span>
              </button>
              <div
                className="select"
                id="select"
                style={{ display: langDropdownOpen ? "block" : "none" }}
              >
                <div onClick={() => changeLangCookie("ko")}>
                  <img src="./require/language_ko.jpg" alt="" /> KOREAN
                </div>
                <div onClick={() => changeLangCookie("cn")}>
                  <img src="./require/language_ch.jpg" alt="" /> CHINESE
                </div>
                <div onClick={() => changeLangCookie("en")}>
                  <img src="./require/language_en.jpg" alt="" /> ENGLISH
                </div>
                <div onClick={() => changeLangCookie("jp")}>
                  <img src="./require/language_jp.jpg" alt="" /> JAPANESE
                </div>
              </div>
            </div>
            <div className="input-field">
              <input
                type="text"
                placeholder={getTranslation(language, "id")}
                name="user_id"
                id="user_id"
                autoComplete="off"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="password"
                placeholder={getTranslation(language, "pw")}
                name="user_pw"
                id="user_pw"
                autoComplete="off"
                value={userPw}
                onChange={(e) => setUserPw(e.target.value)}
              />
            </div>
            <div className="input-field">
              <button type="submit" id="login_submit" onClick={handleSubmit}>
                {getTranslation(language, "login")}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Login;
