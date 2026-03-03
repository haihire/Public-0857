import { useStore } from "../store";
import { useSocket } from "../SocketContext";

function TableInfo({ moving, setMoving }) {
  const { Movegun1, s_room, setIsMove, id, mb_multiBet, sUserCode, mb_name } =
    useStore();
  const Row = 6;
  const socket = useSocket();
  function moveGun1(index, data) {
    const blank = (
      <li key={index}>
        <div className="in" id="s2_64_1335158_5_0">
          <span></span>
        </div>
      </li>
    );

    if (Object.keys(data).length === 0) {
      return blank;
    }

    const mod = Math.floor(index % Row);
    const namuzi = Math.floor(index / Row);
    if (!data?.new?.[mod]?.[namuzi]) {
      return blank;
    }
    const reName = data.new[mod][namuzi];

    if (reName.Win === "") return blank;
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
  }

  function moveRoom(idx) {
    if (moving) return;
    setMoving(true);
    if (idx === id) {
      setMoving(false);
      return;
    }

    socket.emit("MoveRoom", {
      RoomID: s_room[idx].RoomID,
      multiBet: mb_multiBet,
      sUserCode: sUserCode,
      name: mb_name,
    });
  }
  return (
    <div className="layerpopup" id="move_room">
      <div
        className="room-change-list"
        style={{ transform: "translate3d(0, 0px, 0px)" }}
      >
        <div className="fixHeight">
          <h4 id="txt_table_move">Move Table</h4>
          <span
            className="close"
            onClick={() => {
              setIsMove(false);
            }}
          ></span>
          <div className="list" id="move_room_list">
            {Movegun1.map((GunData, idx) => {
              return (
                <div
                  key={idx}
                  className="info speed"
                  onClick={() => {
                    moveRoom(idx);
                  }}
                >
                  <h5>
                    <img
                      src={`./require/0857logo.png`}
                      align="absmiddle"
                      alt=""
                    />
                    <div style={{ position: "absolute", marginTop: "-5px" }}>
                      <h3>
                        [ SPEED ] <span>{s_room?.[idx]?.RoomNumber}</span>
                      </h3>
                    </div>
                    <div
                      className="play_text"
                      style={{ position: "absolute" }}
                    ></div>
                  </h5>
                  <div className="scoreboard">
                    <ul className="bigroad">
                      {Array.from({ length: 6 * 43 }).map((_, index) => {
                        return moveGun1(index, GunData);
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableInfo;
