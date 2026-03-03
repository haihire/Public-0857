export function moneyformatNumber(money) {
  // 정수 부분 추출
  let integerPart = Math.floor(money).toLocaleString(); // 세 자리마다 콤마 추가
  console.log("integerPart", integerPart);

  // money가 정수이면 바로 integerPart 반환
  if (money % 1 === 0) {
    return integerPart;
  }
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

  // 값이 숫자면 -> map[key] 리턴
  // 값이 문자면 -> map에서 해당 문자에 해당하는 key를 찾아 숫자로 변환 리턴
  function convert(map, input) {
    // input이 숫자라면
    if (typeof input === "number") {
      return map[input];
    }
    // input이 문자라면
    else if (typeof input === "string") {
      // map 객체의 key-value 쌍을 순회하면서
      // value가 input과 같은 key를 찾아서 반환
      for (const [key, value] of Object.entries(map)) {
        if (value === input) {
          // key는 문자열이므로 숫자로 변환해서 리턴
          return Number(key);
        }
      }
    }
    // 둘 다 해당하지 않는다면 (에러 처리)
    // throw new Error(`Invalid input: ${input}`);
  }

  if (card.shape && card.number) {
    return convert(shapeMap, card.shape) + convert(numberMap, card.number);
  } else {
    return {
      // card.shape가 숫자든 문자든 convert로 매핑
      shape: convert(shapeMap, card.shape),
      number: convert(numberMap, card.number),
    };
  }
}
function isPair(arr) {
  return arr[0] === arr[1];
}
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
      pPair.push(player[i].number);
    }
    pPoint += player[i].number > 10 ? 10 : player[i].number;
  }
  if (pPart.length === 4) {
    pPart += "zz";
  }

  // Build banker part
  for (let i = 0; i < banker.length; i++) {
    bPart += CalcRange(banker[i]);
    if (i < 2) {
      bPair.push(banker[i].number);
    }
    bPoint += banker[i].number > 10 ? 10 : banker[i].number;
  }
  if (bPart.length === 4) {
    bPart += "zz";
  }

  OriginText += pPart + bPart;

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
export const isLocalhost = window.location.hostname === "localhost";
