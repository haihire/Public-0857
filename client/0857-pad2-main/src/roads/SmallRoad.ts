/* eslint-disable no-loop-func */
export class SmallRoad {
  public row: number;
  public col: number;
  public smallRoad: any[][];
  public id: number;
  public visited: any[];
  public Before: any[];
  public columnBreaks: any[];
  public cut: boolean;
  public constructor(info: any) {
    this.row = info.row;
    this.col = info.col;
    this.smallRoad = [];
    this.id = info.id;
    this.visited = [];
    this.Before = [];
    this.columnBreaks = info.gubun;
    this.cut = info.cut;
  }
  // collectColumnTail(bigRoad: any[][], i: number, j: number, copyBigRoad: any[], rows: any[]){
  //     let offset = 1;
  //     while (bigRoad[i][j + offset] && bigRoad[i][j + offset].Win !== ""&&
  //         bigRoad[i][j].Win === bigRoad[i][j + offset].Win &&
  //         !this.columnBreaks.some(el=>el.rowIndex===i&&el.colIndex===(j+offset))
  //     ) {
  //         this.visited.push({ i: i, j: j + offset });
  //         copyBigRoad.push(bigRoad[i][j+offset].Win);
  //         offset+=1;
  //     }
  //     if(this.columnBreaks.some(el=>el.rowIndex===i&&el.colIndex===(j+offset))){
  //         this.visited.push({ i: i, j: j + offset });
  //         copyBigRoad.push(bigRoad[i][j+offset].Win);
  //     }

  // }
  public getSmallRoad(
    bigRoad: any[][],
    inGame: boolean = false,
    Who: string = ""
  ): any[][] {
    if (bigRoad.length === 0) {
      return [];
    }
    this.smallRoad = [];

    let copyBigRoad: any[] = [];
    let rows: any[] = [];
    let CurJ = 0;
    for (let j = 0; j < bigRoad[0].length; j++) {
      CurJ = 0;
      for (let i = 0; i < this.row; i++) {
        if (this.visited.some((el) => el.i === i && el.j === j)) {
          continue;
        }

        if (bigRoad[i][j].Win !== "") {
          if (CurJ !== j) {
            copyBigRoad.push(j);
            CurJ = j;
          }
          copyBigRoad.push(bigRoad[i][j].Win);
          // this.collectColumnTail(bigRoad, i, j, copyBigRoad, rows);
        }

        if (i === 5 && j === 0) {
          let offset = 1;
          while (
            bigRoad[i][j + offset] &&
            bigRoad[i][j + offset].Win !== "" &&
            bigRoad[i][j].Win === bigRoad[i][j + offset].Win &&
            !this.columnBreaks.some(
              (el) => el.rowIndex === i && el.colIndex === j + offset
            )
          ) {
            copyBigRoad.push(bigRoad[i][j + offset].Win);
            this.visited.push({ i: i, j: j + offset });
            offset += 1;
          }

          if (
            this.columnBreaks.some(
              (el) => el.rowIndex === i && el.colIndex === j + offset
            )
          ) {
            copyBigRoad.push(bigRoad[i][j + offset].Win);
            this.visited.push({ i: i, j: j + offset });
          }
        }

        if (i === 5 && j === 1) {
          let offset = 1;
          while (
            bigRoad[i][j + offset] &&
            bigRoad[i][j + offset].Win !== "" &&
            bigRoad[i][j].Win === bigRoad[i][j + offset].Win &&
            !this.columnBreaks.some(
              (el) => el.rowIndex === i && el.colIndex === j + offset
            )
          ) {
            copyBigRoad.push(bigRoad[i][j + offset].Win);
            this.visited.push({ i: i, j: j + offset });
            offset += 1;
          }
          if (
            this.columnBreaks.some(
              (el) => el.rowIndex === i && el.colIndex === j + offset
            )
          ) {
            copyBigRoad.push(bigRoad[i][j + offset].Win);
            this.visited.push({ i: i, j: j + offset });
          }
        }
        if (
          j <= 1 ||
          (i === 0 && j === 2) ||
          (bigRoad[1][2].Win === "" && bigRoad[0][3].Win === "") ||
          bigRoad[i][j].Win === ""
        ) {
          continue;
        }

        if (!copyBigRoad.some((el) => el !== copyBigRoad[0])) {
          continue;
        }

        this.evaluatePosition(bigRoad, i, j, copyBigRoad, rows);
      }
    }

    this.smallRoad = this.getCopy(rows);

    // if (inGame) {
    //   if (Who === "Player") {
    //     Expects.expectPGun3s = rows[rows.length - 1]
    //       ? rows[rows.length - 1].Mark
    //       : Who;
    //   } else if (Who === "Banker") {
    //     Expects.expectBGun3s = rows[rows.length - 1]
    //       ? rows[rows.length - 1].Mark
    //       : Who;
    //   }
    // }

    return this.smallRoad;
  }
  private evaluatePosition(
    bigRoad: any[][],
    i: number,
    j: number,
    copyBigRoad: any[],
    rows: any[],
    re: boolean = false
  ) {
    if (this.visited.some((el) => el.i === i && el.j === j)) {
      return;
    }

    if (this.checkBox(copyBigRoad) && bigRoad[i][j].Win !== "" && i !== 0) {
      //박스완성
      // cc.log('checkBox');
      rows.push({ Mark: "Banker" });
    } else if (
      this.checkWillBox(copyBigRoad) &&
      bigRoad[i][j].Win !== "" &&
      i !== 0
    ) {
      // 박스 따라가는중
      // cc.log('checkWillBox');
      rows.push({ Mark: "Banker" });
    } else if (
      this.checkPlump(copyBigRoad) &&
      bigRoad[i][j].Win !== "" &&
      i === 0
    ) {
      //퐁당퐁당
      // cc.log('checkPlump');
      rows.push({ Mark: "Banker" });
    } else if (
      this.checkBoxComp(copyBigRoad) &&
      bigRoad[i][j].Win !== "" &&
      i === 0
    ) {
      // 박스 완성 후
      // cc.log('checkBoxComp');
      rows.push({ Mark: "Banker" });
    } else if (this.checkWillLine(copyBigRoad) && bigRoad[i][j].Win !== "") {
      // 줄
      // cc.log('checkWillLine');
      rows.push({ Mark: "Banker" });
    } else if (bigRoad[i][j].Win !== "") {
      // cc.log('6번');
      rows.push({ Mark: "Player" });
    }

    if (!re) this.ChangeJul(bigRoad, i, j, copyBigRoad, rows);
  }
  ChangeJul(
    bigRoad: any[][],
    i: number,
    j: number,
    copyBigRoad: any[],
    rows: any[]
  ) {
    let offset = 1;

    while (
      bigRoad[i][j + offset] &&
      bigRoad[i][j + offset].Win !== "" &&
      bigRoad[i][j].Win === bigRoad[i][j + offset].Win &&
      this.columnBreaks.some((el) => el.rowIndex === i && el.colIndex === j + offset)
    ) {
      // cc.log('특별1',this.visited)
      copyBigRoad.push(bigRoad[i][j + offset].Win);
      this.evaluatePosition(bigRoad, i, j + offset, copyBigRoad, rows, true);
      this.visited.push({ i: i, j: j + offset });
      offset += 1;
    }
    // if(this.columnBreaks.some(el=>el.rowIndex===i&&el.colIndex===(j+offset))){
    //     // cc.log('특별2')
    //     copyBigRoad.push(bigRoad[i][j+offset].Win);
    //     this.evaluatePosition(bigRoad, i, j+offset, copyBigRoad, rows,true);
    //     this.visited.push({ i: i, j: j + offset });
    // }
  }
  checkBoxComp(rows: any[]): any {
    const reRows = [...rows].reverse();
    const reverseArray: any[] = [];
    const LastArray: any[][] = [];

    let count = 0;
    for (let i = 0; i < reRows.length; i++) {
      if (i === 0) {
        reverseArray.push(reRows[i]);
      } else {
        if (LastArray.length === 3) {
          continue;
        }

        if (count === 2) {
          if (typeof reRows[i] === "number") {
            count += 1;
            continue;
          } else {
            continue;
          }
        }

        if (typeof reRows[i] === "number") {
          count += 1;

          LastArray.push([...reverseArray]);
          reverseArray.length = 0;
        } else {
          reverseArray.push(reRows[i]);
        }
      }
    }

    if (LastArray.length <= 1) {
      return false;
    }

    if (LastArray.length === 2) {
      LastArray.push([...reverseArray]);
    }

    //최근 전적이 하나이며 전 전적과 전전 전적이 같다면 true mark 빨강
    if (
      LastArray[0].length === 1 &&
      LastArray[1].length === LastArray[2].length
    ) {
      return true;
    } else {
      return false;
    }
  }
  checkPlump(rows: any[]): any {
    const reRows = [...rows].reverse();
    const reverseArray: any[] = [];
    const LastArray: any[][] = [];

    let count = 0;
    for (let i = 0; i < reRows.length; i++) {
      if (i === 0) {
        reverseArray.push(reRows[i]);
      } else {
        if (LastArray.length === 3) {
          continue;
        }

        if (count === 2) {
          if (typeof reRows[i] === "number") {
            count += 1;
            continue;
          } else {
            continue;
          }
        }

        if (typeof reRows[i] === "number") {
          count += 1;

          LastArray.push([...reverseArray]);
          reverseArray.length = 0;
        } else {
          reverseArray.push(reRows[i]);
        }
      }
    }

    if (LastArray.length < 2) {
      return false;
    }

    if (LastArray.length === 2) {
      LastArray.push([...reverseArray]);
    }
    //최근 전적 === 전 전적 === 전전 전적 갯수가 모두 1이면 true mark 빨강
    if (
      LastArray[0].length === 1 &&
      LastArray[1].length === 1 &&
      LastArray[2].length === 1
    ) {
      return true;
    } else {
      return false;
    }
  }
  checkWillLine(rows: any[]): any {
    const reRows = [...rows].reverse();
    const reverseArray: any[] = [];
    const LastArray: any[][] = [];

    let count = 0;
    for (let i = 0; i < reRows.length; i++) {
      if (i === 0) {
        reverseArray.push(reRows[i]);
      } else {
        if (LastArray.length === 2) {
          continue;
        }

        if (count === 1) {
          if (typeof reRows[i] === "number") {
            count += 1;
            continue;
          } else {
            continue;
          }
        }

        if (typeof reRows[i] === "number") {
          count += 1;

          LastArray.push([...reverseArray]);
          reverseArray.length = 0;
        } else {
          reverseArray.push(reRows[i]);
        }
      }
    }

    if (LastArray.length === 1) {
      LastArray.push([...reverseArray]);
    }
    //최근 전적 갯수가 전 전적 갯수보다 2이상 많다면 true mark 빨강
    if (LastArray[0].length - LastArray[1].length >= 2) {
      return true;
    } else {
      return false;
    }
  }
  private checkWillBox(rows: any[]): any {
    //박스가 되가는중

    const reRows = [...rows].reverse();
    const reverseArray: any[] = [];
    const LastArray: any[][] = [];

    let count = 0;
    for (let i = 0; i < reRows.length; i++) {
      if (i === 0) {
        reverseArray.push(reRows[i]);
      } else {
        if (LastArray.length === 2) {
          continue;
        }

        if (count === 1) {
          if (typeof reRows[i] === "number") {
            count += 1;
            continue;
          } else {
            continue;
          }
        }

        if (typeof reRows[i] === "number") {
          count += 1;

          LastArray.push([...reverseArray]);
          reverseArray.length = 0;
        } else {
          reverseArray.push(reRows[i]);
        }
      }
    }

    if (LastArray.length === 1) {
      LastArray.push([...reverseArray]);
    }

    // cc.log('rows',rows);
    // cc.log('reverseArray',reverseArray);
    // cc.log('LastArray',LastArray);
    // cc.log('count',count);
    // cc.log('this.Before',this.Before);

    if (
      this.Before.length !== 0 &&
      !this.arraysEqual(this.Before, LastArray[1])
    ) {
      this.Before = LastArray[1];
      return false;
    }

    //최근 전적이 전 전적갯수보다 적다면 true mark 빨강
    if (LastArray[0].length < LastArray[1].length) {
      this.Before = LastArray[1];
      return true;
    } else {
      return false;
    }
  }
  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }
  private checkBox(rows: any[]): any {
    //박스 완성
    const reRows = [...rows].reverse();
    const reverseArray: any[] = [];
    const LastArray: any[][] = [];

    let count = 0;
    for (let i = 0; i < reRows.length; i++) {
      if (i === 0) {
        reverseArray.push(reRows[i]);
      } else {
        if (LastArray.length === 2) {
          continue;
        }

        if (count === 1) {
          if (typeof reRows[i] === "number") {
            count += 1;
            continue;
          } else {
            continue;
          }
        }

        if (typeof reRows[i] === "number") {
          count += 1;

          LastArray.push([...reverseArray]);
          reverseArray.length = 0;
        } else {
          reverseArray.push(reRows[i]);
        }
      }
    }

    // cc.log('ROWS',rows);
    // cc.log('reRows',reRows);
    // cc.log('reverseArray',reverseArray);
    // cc.log('LastArray',LastArray);

    if (LastArray.length === 1) {
      LastArray.push([...reverseArray]);
    }

    //최근 전적과 전 전적갯수가 같다면 true mark 빨강
    if (LastArray[0].length === LastArray[1].length) {
      return true;
    } else {
      return false;
    }
  }

  private getCopy(data: any[]): any[][] {
    let copyLoad: { Mark: string }[][] = [];

    for (let i = 0; i < 6; i++) {
      let rows: { Mark: string }[] = [];
      for (let j = 0; j < 200; j++) {
        rows.push({ Mark: "" });
      }
      copyLoad.push(rows);
    }

    let rowIndex = 0;
    let colIndex = 0;
    let tempColIndex = 0;

    for (let i = 0; i < data.length; i++) {
      if (data[i].Mark === copyLoad[rowIndex][colIndex].Mark) {
        rowIndex += 1;

        if (
          rowIndex >= 6 ||
          copyLoad[rowIndex][colIndex].Mark !== "" ||
          tempColIndex !== 0
        ) {
          rowIndex -= 1;
          colIndex += 1;
          if (tempColIndex === 0) {
            tempColIndex = colIndex;
          }
        }

        copyLoad[rowIndex][colIndex].Mark = data[i].Mark;
      } else if (data[i].Mark !== copyLoad[rowIndex][colIndex].Mark) {
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

        copyLoad[rowIndex][colIndex].Mark = data[i].Mark;
      }
    }
    return this.updateRows(copyLoad);
  }

  private updateArr(tArr: any[]): any[] {
    let arr = [...tArr.reverse()];

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].Mark !== "") {
        arr = arr.slice(i);
        break;
      }
    }

    if (arr.length === 200) {
      return [];
    }
    return arr.reverse();
  }

  private updateRows(data: any[][]): any[][] {
    let t0 = this.updateArr(data[0]);
    let t1 = this.updateArr(data[1]);
    let t2 = this.updateArr(data[2]);
    let t3 = this.updateArr(data[3]);
    let t4 = this.updateArr(data[4]);
    let t5 = this.updateArr(data[5]);

    const arrays = [t0, t1, t2, t3, t4, t5];

    const maxLength = Math.max(...arrays.map((array) => array.length));
    const reMax = Math.max(maxLength, this.col);
    const modifiedArrays = arrays.map((array) => {
      const newArray = [...array];
      while (newArray.length < reMax) {
        newArray.push({ Mark: "" });
      }
      if (this.cut) {
        while (newArray.length > this.col) {
          newArray.shift();
        }
      }
      return newArray;
    });
    return modifiedArrays;
  }
}
