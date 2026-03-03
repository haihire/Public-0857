import React from "react";
import { ConvertCard, moneyformatNumber } from "../util";
import { useStore } from "../store";
const Result = () => {
  const {
    PoolClick,
    ScoreB,
    ScoreP,
    winner,
    CardP,
    CardB,
    ShoeNumber,
    GameCount,
    momentwinMoney,
  } = useStore();

  function displayWin(winner) {
    const blank = <div className="r_img" id="popResult"></div>;
    if (!winner) return blank;

    let name = "";
    for (let i = 0; i < winner.length; i++) {
      const element = winner[i];

      switch (element) {
        case "Player":
          name = "player";
          break;
        case "Banker":
          name = "banker";
          break;
        case "Tie":
          name = "tie";
          break;
        default:
          break;
      }
    }

    return <div className={`r_img r_${name}`} id="popResult"></div>;
  }

  const PCardForceOrderChange = (num) => {
    if (num === 0) {
      return 1;
    } else if (num === 1) {
      return 0;
    } else return num;
  };

  return (
    <div
      className="layerpopup gameover"
      id="item_result"
      style={{ display: winner.length === 0 ? "none" : "" }}
    >
      <div className="content">
        <div>
          <div className="content-info" style={{ width: "1100px" }}>
            <div
              id="userbet_result"
              style={{ display: momentwinMoney === 0 ? "none" : "" }}
            >
              {/* <img src="./require/ani1.gif" className="animation" alt="" /> */}
              {/* <img src="./require/ani1.gif" className="animation-etc" alt="" /> */}
              <div className="result-bonus ko">
                <span className="money" id="result_winmoney">
                  {moneyformatNumber(momentwinMoney)}
                </span>
              </div>
            </div>

            {/* <!-- vip 와 동일한 구조의 태그 className --> */}
            <div className="item_result ">
              <div className="item">
                <div className="r_score r_score1" id="p_score">
                  {ScoreP}
                  {PoolClick ? (
                    <span style={{ paddingLeft: "110px" }}>
                      {ShoeNumber}-{GameCount}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <div className="r_score r_score2" id="b_score">
                  {ScoreB}
                </div>

                {displayWin(winner)}
                <div className="r_card card1">
                  {/* <div
                    className={`popCardAreaP1 s_13`}
                    id={`popCardAreaP1`}
                  ></div> */}
                  {CardP.map((item, i) => (
                    <div
                      key={i}
                      className={`popCardAreaP${i + 1} 
                      ${ConvertCard(
                        CardP[PCardForceOrderChange(i)].Num,
                        CardP[PCardForceOrderChange(i)].Shape
                      )}`}
                      id={`popCardAreaP${i + 1}`}
                    ></div>
                  ))}
                </div>

                <div className="r_card card2">
                  {CardB.map((item, i) => (
                    <div
                      key={i}
                      className={`popCardAreaB${i + 1} ${ConvertCard(
                        item.Num,
                        item.Shape
                      )}`}
                      id={`popCardAreaB${i + 1}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-opacity"></div>
    </div>
  );
};

export default Result;
