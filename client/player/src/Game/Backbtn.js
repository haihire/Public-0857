import { useSocket } from "../SocketContext";

function Backbtn() {
  const socket = useSocket();

  return (
    <div className="backbtn" onClick={() => socket.emit("ExitRoom")}>
      <span title="뒤로가기"></span>
    </div>
  );
}
export default Backbtn;
