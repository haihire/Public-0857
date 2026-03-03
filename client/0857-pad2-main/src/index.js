//moudule
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import io from "socket.io-client";
import { SevUrl } from "./util";
//page
import App from "./App";

const isLocalhost = window.location.hostname === "localhost";
const EndPoint = isLocalhost
  ? "localhost:7771"
  : `https://baccarat-server.${SevUrl().servername}.com:${SevUrl().port}`;
const socket = io(EndPoint, {
  transports: ["websocket"],
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App socket={socket} />);
reportWebVitals();
