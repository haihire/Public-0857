import React from "react";
import { useStore } from "../store";
import { getTranslation } from "../util";

function Rule() {
  const { openInfo, setOpenInfo, language } = useStore();

  return (
    <div
      className="layerpopup rule"
      style={{ display: openInfo ? "" : "none" }}
      id="popContent"
    >
      <div className="pop_cont">
        <div className="content">
          <div>
            <div className="content-info" style={{ width: "1100px" }}>
              <div className="title">
                <h4>{getTranslation(language, "gameInfo")}</h4>

                <button
                  style={{ border: "none" }}
                  className="close"
                  onClick={() => {
                    setOpenInfo(false);
                  }}
                ></button>
              </div>

              <div className="content-box">
                <h5>{getTranslation(language, "player")}</h5>
                <table>
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "60%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{getTranslation(language, "playerCardSum")}</th>
                      <th>{getTranslation(language, "drawingRule")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1, 2, 3, 4, 5</td>
                      <td>{getTranslation(language, "drawingRuleDrawCard")}</td>
                    </tr>
                    <tr>
                      <td>6, 7</td>
                      <td>{getTranslation(language, "drawingRuleStand")}</td>
                    </tr>
                    <tr>
                      <td>8, 9</td>
                      <td>{getTranslation(language, "drawingRuleNatural")}</td>
                    </tr>
                  </tbody>
                </table>

                <h5>{getTranslation(language, "banker")}</h5>
                <table>
                  <colgroup>
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "38%" }} />
                    <col style={{ width: "38%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{getTranslation(language, "bankerCardSum")}</th>
                      <th>
                        {getTranslation(
                          language,
                          "bankerDrawOnPlayerCondition"
                        )}
                      </th>
                      <th>
                        {getTranslation(
                          language,
                          "bankerNoDrawOnPlayerCondition"
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>3</td>
                      <td>0, 1, 2, 3, 4, 5, 6, 7, 9</td>
                      <td>8</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>2, 3, 4, 5, 6, 7</td>
                      <td>0, 1, 8, 9</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>4, 5, 6, 7</td>
                      <td>0, 1, 2, 3, 8, 9</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>6-7</td>
                      <td>1-2-3-4-5-8-9-10</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td>
                        {getTranslation(language, "bankerDrawValueSetStand")}
                      </td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>8, 9</td>
                      <td>
                        {getTranslation(language, "bankerDrawValueSetNatural")}
                      </td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>

                <ul className="layer-button">
                  <li>
                    <button onClick={() => setOpenInfo(false)}>
                      {getTranslation(language, "confirm")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-opacity3"></div>
      </div>
    </div>
  );
}

export default Rule;
