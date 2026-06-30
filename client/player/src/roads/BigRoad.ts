export class BigRoad {
  public array: any;
  public row: number;
  public col: number;
  public bigRoad: any[][];
  public over: boolean;
  public cut: boolean;
  public color: boolean;
  public constructor(info: any) {
    this.array = info.array;
    this.row = info.row;
    this.col = info.col;
    this.bigRoad = [];
    this.over = false;
    this.cut = info.cut;
    this.color = info.color;
  }
  PairInsert(data: string) {
    let pair = 0;
    switch (data) {
      case "Player_Pair":
        pair = 1;
        break;
      case "Banker_Pair":
        pair = 2;
        break;
      case "Player_Pair,Banker_Pair":
      case "Banker_Pair,Player_Pair":
        pair = 3;
        break;
    }
    return pair;
  }
  public getBigRoad() {
    if (this.array.length === 0) {
      return { old: [], new: [] };
    }

    const columnBreaks: {
      rowIndex: number;
      colIndex: number;
      tempColIndex: number;
    }[] = [];
    this.bigRoad = [];

    for (let i = 0; i < 6; i++) {
      let rows: {
        TieCount: number;
        Win: string;
        Pair: number;
        WinScore: number;
      }[] = [];
      for (let j = 0; j < 200; j++) {
        rows.push({
          TieCount: 0,
          Win: "",
          Pair: 0, //0 = no , 1 = pp , 2= bp, 3 = pp+bp
          WinScore: 0,
        });
      }
      this.bigRoad.push(rows);
    }
    let rowIndex = 0;
    let colIndex = 0;
    let tempColIndex = 0;

    let reRows = "";
    for (let i = 0; i < this.array.length; i++) {
      if (i === 0 && this.array[i].sWinner === "Tie") {
        continue;
      } else {
        if (this.color) {
          if (this.array[i].sWinner === "Tie") {
            rowIndex += 1;

            if (
              rowIndex >= 6 ||
              this.bigRoad[rowIndex][colIndex].Win !== "" ||
              tempColIndex !== 0
            ) {
              rowIndex -= 1;
              colIndex += 1;
              if (tempColIndex === 0) {
                tempColIndex = colIndex;
              }

              columnBreaks.push({
                rowIndex: rowIndex,
                colIndex: colIndex,
                tempColIndex: tempColIndex,
              });
            }

            this.bigRoad[rowIndex][colIndex].Win = this.array[i].sWinner;
            this.bigRoad[rowIndex][colIndex].Pair = this.PairInsert(
              this.array[i].sPair
            );
            this.bigRoad[rowIndex][colIndex].WinScore = this.SetWinScore(
              this.array[i]
            );
          } else if (
            this.array[i].sWinner === this.bigRoad[rowIndex][colIndex].Win ||
            this.array[i].sWinner === reRows
          ) {
            rowIndex += 1;

            if (
              rowIndex >= 6 ||
              this.bigRoad[rowIndex][colIndex].Win !== "" ||
              tempColIndex !== 0
            ) {
              rowIndex -= 1;
              colIndex += 1;
              if (tempColIndex === 0) {
                tempColIndex = colIndex;
              }

              columnBreaks.push({
                rowIndex: rowIndex,
                colIndex: colIndex,
                tempColIndex: tempColIndex,
              });
            }

            this.bigRoad[rowIndex][colIndex].Win = this.array[i].sWinner;
            this.bigRoad[rowIndex][colIndex].Pair = this.PairInsert(
              this.array[i].sPair
            );
            this.bigRoad[rowIndex][colIndex].WinScore = this.SetWinScore(
              this.array[i]
            );
            reRows = this.array[i].sWinner;
          } else if (
            this.array[i].sWinner !== this.bigRoad[rowIndex][colIndex].Win ||
            this.array[i].sWinner !== reRows
          ) {
            colIndex += 1;
            rowIndex = 0;

            if (tempColIndex !== 0) {
              colIndex = tempColIndex;
              tempColIndex = 0;
            }

            if (i === 0) {
              rowIndex = 0;
              colIndex = 0;
            }

            this.bigRoad[rowIndex][colIndex].Win = this.array[i].sWinner;
            this.bigRoad[rowIndex][colIndex].Pair = this.PairInsert(
              this.array[i].sPair
            );
            this.bigRoad[rowIndex][colIndex].WinScore = this.SetWinScore(
              this.array[i]
            );
            reRows = this.array[i].sWinner;
          }
        } else if (this.array[i].sWinner === "Tie") {
          this.bigRoad[rowIndex][colIndex].TieCount += 1;
        } else if (
          this.array[i].sWinner === this.bigRoad[rowIndex][colIndex].Win
        ) {
          rowIndex += 1;

          if (
            rowIndex >= 6 ||
            this.bigRoad[rowIndex][colIndex].Win !== "" ||
            tempColIndex !== 0
          ) {
            rowIndex -= 1;
            colIndex += 1;
            if (tempColIndex === 0) {
              tempColIndex = colIndex;
            }

            columnBreaks.push({
              rowIndex: rowIndex,
              colIndex: colIndex,
              tempColIndex: tempColIndex,
            });
          }

          this.bigRoad[rowIndex][colIndex].Win = this.array[i].sWinner;
          this.bigRoad[rowIndex][colIndex].Pair = this.PairInsert(
            this.array[i].sPair
          );
        } else if (
          this.array[i].sWinner !== this.bigRoad[rowIndex][colIndex].Win
        ) {
          colIndex += 1;
          rowIndex = 0;

          if (tempColIndex !== 0) {
            colIndex = tempColIndex;
            tempColIndex = 0;
          }

          if (i === 0) {
            rowIndex = 0;
            colIndex = 0;
          }

          this.bigRoad[rowIndex][colIndex].Win = this.array[i].sWinner;
          this.bigRoad[rowIndex][colIndex].Pair = this.PairInsert(
            this.array[i].sPair
          );
        }
      }
    }

    let Origin = this.bigRoad.map((row) => [...row]);

    this.bigRoad = this.updateRows();

    return {
      old: Origin,
      new: this.bigRoad,
      gubunIndex: columnBreaks,
      over: this.over,
    };
  }
  SetWinScore(data) {
    let num = 0;
    if (data.sWinner === "Tie") {
      num = data.sBanker_Score;
    } else if (data.sWinner === "Banker") {
      num = data.sBanker_Score;
    } else if (data.sWinner === "Player") {
      num = data.sPlayer_Score;
    }
    return num;
  }
  updateArr(tArr) {
    let arr = [...tArr.reverse()];

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].Win !== "") {
        // 멈춘 지점 이전의 모든 요소를 제거합니다.
        arr = arr.slice(i);
        break;
      }
    }

    if (arr.length === 200) {
      return [];
    }
    return arr.reverse();
  }
  updateRows() {
    let t0 = this.updateArr(this.bigRoad[0]);
    let t1 = this.updateArr(this.bigRoad[1]);
    let t2 = this.updateArr(this.bigRoad[2]);
    let t3 = this.updateArr(this.bigRoad[3]);
    let t4 = this.updateArr(this.bigRoad[4]);
    let t5 = this.updateArr(this.bigRoad[5]);

    // 가장 긴 배열 찾기
    const arrays = [t0, t1, t2, t3, t4, t5];

    const maxLength = Math.max(...arrays.map((array) => array.length));
    //-add React
    const reMax = Math.max(maxLength, this.col);

    const modifiedArrays = arrays.map((array) => {
      const newArray = [...array];
      //-change React
      while (newArray.length < reMax) {
        newArray.push({ TieCount: 0, Win: "" }); // 뒤에 요소 추가
      }
      if (this.cut) {
        while (newArray.length > this.col) {
          newArray.shift(); // 첫 번째 요소 삭제
          this.over = true;
        }
      }

      return newArray;
    });

    return modifiedArrays;
  }
}
