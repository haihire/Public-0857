export function SevUrl() {
  const port = 7771;

  //so test
  // const servername = "pd-bet-test";

  // so live
  const servername = "pd-bet-services";

  return {
    servername: servername,
    port: port,
  };
}
function CalcRange(card) {
  const shapeMap = {
    1: "a", // Diamond
    2: "b", // Club
    3: "c", // Heart
    4: "d", // Spade
  };

  const numberMap = {
    1: "e",
    2: "f",
    3: "g",
    4: "h",
    5: "i",
    6: "j",
    7: "k",
    8: "l",
    9: "m",
    10: "n",
    11: "o",
    12: "p",
    13: "q",
  };

  return shapeMap[card.shape] + numberMap[card.numbers];
}
function isPair(arr) {
  return arr[0] === arr[1];
}
// Main function to calculate the result
export function winCalc(player, banker) {
  let OriginText = "";

  let pPart = "";
  let bPart = "";
  const pPair = [];
  const bPair = [];
  let pPoint = 0;
  let bPoint = 0;
  // Build player part
  for (let i = 0; i < player.length; i++) {
    pPart += CalcRange(player[i]);
    if (i < 2) {
      pPair.push(player[i].numbers);
    }
    pPoint += player[i].numbers > 10 ? 10 : player[i].numbers;
  }

  if (pPart.length === 4) {
    pPart += "zz";
  }

  // Build banker part
  for (let i = 0; i < banker.length; i++) {
    bPart += CalcRange(banker[i]);
    if (i < 2) {
      bPair.push(banker[i].numbers);
    }
    bPoint += banker[i].numbers > 10 ? 10 : banker[i].numbers;
  }
  if (bPart.length === 4) {
    bPart += "zz";
  }

  OriginText += pPart + bPart;

  //
  // Calculate player and banker points
  const playerPoints = pPoint % 10;
  const bankerPoints = bPoint % 10;

  let result = [];

  // Determine who wins
  if (playerPoints > bankerPoints) {
    OriginText += 2;
    result.push("Player");
  } else if (playerPoints < bankerPoints) {
    OriginText += 1;
    result.push("Banker");
  } else {
    OriginText += 3;
    result.push("Tie");
  }

  // Check for player pair
  const isPlayerPair = isPair(pPair);
  if (isPlayerPair) {
    OriginText += 5;
    result.push("Player_Pair");
  }
  // Check for banker pair
  const isBankerPair = isPair(bPair);
  if (isBankerPair) {
    OriginText += 4;
    result.push("Banker_Pair");
  }

  return { OriginText: OriginText, result: result };
}
//천단위마다 콤마+소수점 미표시
export function formatNumber(num) {
  num = Math.floor(num); // convert number to integer by rounding down
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

//천단위마다 콤마+소수점 표시
export function unit(params) {
  return params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//m,k 표시
const formatter = new Intl.NumberFormat("en", {
  // style: 'decimal',
  // signDisplay: 'always',
  // useGrouping: true,
  notation: "compact",
});
export function Moneyunit(params) {
  return formatter.format(params);
}

export function CardRange(Shape, Num) {
  let card = "";
  switch (Shape) {
    case "1":
      card = "dia/";
      break;
    case "2":
      card = "clover/";
      break;
    case "3":
      card = "heart/";
      break;
    case "4":
      card = "spade/";
      break;
    default:
      console.log("Utility CardRange error1");
      break;
  }
  switch (Num) {
    case 1:
      card += "A";
      break;
    case 2:
      card += "2";
      break;
    case 3:
      card += "3";
      break;
    case 4:
      card += "4";
      break;
    case 5:
      card += "5";
      break;
    case 6:
      card += "6";
      break;
    case 7:
      card += "7";
      break;
    case 8:
      card += "8";
      break;
    case 9:
      card += "9";
      break;
    case 10:
      card += "10";
      break;
    case 11:
      card += "J";
      break;
    case 12:
      card += "Q";
      break;
    case 13:
      card += "K";
      break;
    default:
      console.log("Utility CardRange error2");
      break;
  }
  return card;
}

//시간포맷
export function formatTime(secs) {
  if (secs === undefined) return "00:00";
  secs = Math.round(secs / 1000);
  const hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  const mins = Math.floor(secs / 60);
  secs -= mins * 60;
  return hours > 0
    ? `${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
    : `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
