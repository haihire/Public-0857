import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import Lobby from "./Lobby/Lobby";
import { useEffect } from "react";
import Login from "./Login/Login";
import { useSocket } from "./SocketContext";
import Game from "./Game/Game";
import { useStore } from "./store";
import { isFullScreen, isMobile, sizing } from "./util";

import "./effect.css";
import "./reset.css";
import Fail from "./Fail";

function App() {
  const {
    setToken,

    setMb_money,
    setIsSubmitting,

    Loading,
    setTerms,
    setCurrencyType,
    setMb_name,
    setLoading,
  } = useStore();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(console.error);
    }
  };
  useEffect(() => {
    if (isMobile()) {
      import("./mobile.scss");
    }
    const onBack = (e) => {
      // 뒤로가기가 발생했을 때 실행할 로직
      console.log("뒤로가기 감지!", e.state);

      if (localStorage.getItem("roomid")) {
        localStorage.removeItem("roomid");
      } else if (localStorage.getItem("lobby")) {
        localStorage.removeItem("lobby");
        localStorage.removeItem("id");
        localStorage.removeItem("pw");

        localStorage.removeItem("roomid");
        localStorage.removeItem("lobby");

        localStorage.removeItem("sUserCode");
        localStorage.removeItem("mb_money");
        localStorage.removeItem("mb_name");
        localStorage.removeItem("mb_multiBet");
        sessionStorage.clear();
      } else {
        localStorage.removeItem("id");
        localStorage.removeItem("pw");

        localStorage.removeItem("roomid");
        localStorage.removeItem("lobby");

        localStorage.removeItem("sUserCode");
        localStorage.removeItem("mb_money");
        localStorage.removeItem("mb_name");
        localStorage.removeItem("mb_multiBet");
        sessionStorage.clear();
      }
      // e.state, location.pathname 등 필요 정보 조회 가능
    };
    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        handleFullScreen();
      }

      if (e.key === "Escape") {
        const sizemode = document.querySelector(".size-mode");
        sizemode.style.transform = ``;
      }
    };
    const handleFullScreenChange = () => {
      if (document.fullscreenElement) {
        if (location.pathname === "/Game" && !isMobile()) sizing(1.13);
      } else {
        const sizemode = document.querySelector(".size-mode");
        if (sizemode) sizemode.style.transform = ``;
      }
      isFullScreen();
    };

    window.addEventListener("resize", sizing);
    window.addEventListener("orientationchange", sizing);
    window.addEventListener("popstate", onBack);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    if (!socket || !socket.connected) {
      console.log("socket이 없습니다. 재연결합니다.");

      setIsSubmitting(false);
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("connect 되었습니다.", location.pathname);

      setIsSubmitting(false);
      navigate("/Login");

      socket.emit("Ping");
    });
    socket.on("Pong", () => {
      setTimeout(() => {
        socket.emit("Ping");
      }, 3000);
    });
    socket.on("ERROR", (data) => {
      console.log("ERROR::", data);
      const title = data.title;
      if (title === "LoginFail") {
        setIsSubmitting(false);
        navigate("/Fail");
      }
      setLoading(false);
    });
    socket.on("connect_error", (err) => {
      console.log("connect_error::", err);
      console.log("ree", err.name);
      console.log("err", err.message);

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

      window.location.href = "/Login";
    });
    socket.on("disconnect", (data) => {
      setToken("");
      console.log("disconnect::", data);

      if (data === "transport close") {
        localStorage.removeItem("id");
        localStorage.removeItem("pw");

        localStorage.removeItem("roomid");
        localStorage.removeItem("lobby");

        localStorage.removeItem("sUserCode");
        localStorage.removeItem("mb_money");
        localStorage.removeItem("mb_name");
        localStorage.removeItem("mb_multiBet");
        sessionStorage.clear();
        setTerms(false);
      }
      window.location.reload();
    });

    socket.on("LobbySuccess", (data) => {
      console.log("LobbySuccess");
      setToken(data.token);
      setMb_name(data.name);
      setMb_money(data.money);
      setCurrencyType(data.currencyType);
      localStorage.setItem("id", data.sUserID);
      localStorage.setItem("pw", data.pw);
      navigate("/Lobby");
      socket.emit("GetUserInfo", {
        sUserID: data.sUserID,
        token: data.token,
        RoomID: null,
      });
    });

    socket.on("RefreshUInfo", (data) => {
      console.log("RefreshUInfo on", data);
      if (data) {
        setMb_money(data.mb_money);
      }
    });
    socket.on("RefreshUserMoney", (data) => {
      console.log("RefreshUserMoney", data);
      setMb_money(data);
    });

    return () => {
      window.removeEventListener("resize", sizing);
      window.removeEventListener("orientationchange", sizing);
      window.removeEventListener("popstate", onBack);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);

      socket.off("connect");
      socket.off("Pong");
      socket.off("ERROR");
      socket.off("connect_error");
      socket.off("disconnect");

      socket.off("LobbySuccess");

      socket.off("RefreshUInfo");
      socket.off("RefreshUserMoney");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, socket, navigate]);

  return (
    <div className="App">
      {Loading && (
        <div className="Loading" style={{ overflow: "hidden" }}>
          <img src="./require/video_loading.gif" alt="Loading..." />
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Lobby" element={<Lobby />} />
        <Route path="/Game" element={<Game />} />
        <Route path="/Fail" element={<Fail />} />
      </Routes>
    </div>
  );
}

export default App;
