import React from "react";
import { useStore } from "../store";
import Rooms from "./Rooms";

const siteOptions = [
  { key: "maxim", img: "./require/list_c12.png?t=3" },
  { key: "okura", img: "./require/sol_temp.png?t=3" },
  { key: "hann", img: "./require/list_c13.png?t=3" },
  { key: "nustar", img: "./require/list_c14.png?t=3" },
];

function GameList() {
  const { s_room, r_room, setSite, Site } = useStore();

  return (
    <div className="game-list">
      <div className="game-room">
        <div className="box select selected">
          <ul>
            {siteOptions.map(({ key, img }) => (
              <li
                key={key}
                className={Site === key ? "selected" : ""}
                onClick={() => setSite(key)}
              >
                <img src={img} data-idx="12" alt={key} />
              </li>
            ))}
          </ul>
          <div
            style={{ display: "none" }}
            className={`box_all${Site === "" ? " selected" : ""}`}
            onClick={() => setSite("")}
          >
            {/* <img
              src="./require/list_all.png?t=3"
              alt="All"
              data-idx="0"
              style={{ width: "100%" }}
            /> */}
            <img src="./require/sol_temp2.png?" alt="" data-idx="0" />
            {/* <div id="txt_require_all">스피드테이블</div> */}
          </div>
        </div>

        {r_room.map((_, idx) =>
          Site === "" || s_room[idx]?.sSite === Site ? (
            <Rooms key={idx} idx={idx} />
          ) : null
        )}
      </div>
    </div>
  );
}

export default GameList;
