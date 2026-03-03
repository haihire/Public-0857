import { useStore } from "./store";
import { getTranslation } from "./util";
import { useSocket } from "./SocketContext";
import "./Fail.scss";
function Fail() {
  const socket = useSocket();
  const { language } = useStore();
  return (
    <div className="Fail_wrap">
      <div className="content">
        <div className="error_main">
          <p style={{ textAlign: "center" }}>
            <img src="./require/error.jpg" style={{ maxWidth: "90%" }} alt="" />
          </p>
          <p
            style={{
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              border: "1px solid #ddd",
              padding: "20px 0 20px 0",
            }}
          >
            {getTranslation(language, "err_account")}
            <br />
            <br />

            <button
              onClick={() => {
                sessionStorage.clear();
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
              style={{ color: "red" }}
            >
              <u style={{ color: "red" }}>{getTranslation(language, "main")}</u>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Fail;
