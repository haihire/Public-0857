import { BigRoad } from "./roads/BigRoad.ts";
import { BigEyeRoad } from "./roads/BigEyeRoad.ts";
import { SmallRoad } from "./roads/SmallRoad.ts";
import { CockroachRoad } from "./roads/CockroachRoad.ts";
export function SevUrl() {
  const port = 7771;

  const servername = "pd-bet-services";
  // const servername = "pd-bet-test";

  return {
    servername: servername,
    port: port,
  };
}

export const FullScreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch(console.error);
  }
};
let isfull = false;
export const isFullScreen = () => {
  if (document.fullscreenElement) {
    isfull = true;
  } else {
    isfull = false;
  }
  return isfull;
};
export let Expects = {
  expectPGun2s: "Player",
  expectPGun3s: "Player",
  expectPGun4s: "Player",
  expectBGun2s: "Banker",
  expectBGun3s: "Banker",
  expectBGun4s: "Banker",
};
function getAvailableScreenSize() {
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
      scale: window.visualViewport.scale,
    };
  }
  // visualViewport가 지원되지 않는 경우 fallback
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
  };
}
export function isLandscape() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isLandscape = viewportWidth > viewportHeight;
  return isLandscape;
}
export function sizing(full = null) {
  const sizemode = document.querySelector(".size-mode");

  if (!sizemode) return;

  // const { width, height, scale } = getAvailableScreenSize();
  const { height } = getAvailableScreenSize();
  const newScale = height / 951.7766;
  if (isMobile()) {
    sizemode.style.transform = isLandscape()
      ? `scale(${newScale})`
      : `scale(1)`;
    console.log("current Scale", sizemode.style.transform);
  }

  if (typeof full === "number") {
    console.log("full true 자나", full);

    sizemode.style.transform = `scale(${full})`;
  }
}
export function isMobile() {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
export function ScoreSet(r_room) {
  let copyScore = [0, 0, 0, 0, 0];
  if (!r_room) return copyScore;
  if (r_room.length > 0) {
    let bankerScore = 0;
    let playerScore = 0;
    let tieScore = 0;
    let bPScore = 0;
    let pPScore = 0;
    for (let i = 0; i < r_room.length; i++) {
      switch (r_room[i].sWinner) {
        case "Banker":
          bankerScore++;
          break;
        case "Player":
          playerScore++;
          break;
        case "Tie":
          tieScore++;
          break;
        default:
          break;
      }
      switch (r_room[i].sPair) {
        case "Banker_Pair":
          bPScore++;
          break;
        case "Player_Pair":
          pPScore++;
          break;
        case "Player_Pair,Banker_Pair":
        case "Banker_Pair,Player_Pair":
          pPScore++;
          bPScore++;
          break;
        default:
          break;
      }
    }

    copyScore = [bankerScore, playerScore, tieScore, bPScore, pPScore];
  }
  return copyScore;
}
export function GunSet(
  r_room,
  { Row, LobbyGun1Col, LobbyGun2Col, LobbyGun3Col, LobbyGun4Col, cut = true },
  color = false
) {
  let g1 = {},
    g2 = [],
    g3 = [],
    g4 = [];
  if (!r_room) return { g1, g2, g3, g4 };
  if (r_room.length > 0) {
    let log = [...r_room];
    let FirstTie = 0;
    if (log.length > 0) {
      for (let i = 0; i < Math.min(8, log.length); i++) {
        if (log[i].sWinner === "Tie") FirstTie++;
        else break;
      }
    }

    log = log.slice(FirstTie);
    g1 = new BigRoad({
      array: log,
      row: Row,
      col: LobbyGun1Col,
      cut: cut,
      color: color,
    }).getBigRoad();

    g2 = new BigEyeRoad({
      gubun: g1.gubunIndex,
      row: Row,
      col: LobbyGun2Col * 2,
      cut: cut,
    }).getBigEyeRoad(g1.old);

    g3 = new SmallRoad({
      gubun: g1.gubunIndex,
      row: Row,
      col: LobbyGun3Col * 2,
      cut: cut,
    }).getSmallRoad(g1.old);

    g4 = new CockroachRoad({
      gubun: g1.gubunIndex,
      row: Row,
      col: LobbyGun4Col * 2,
      cut: cut,
    }).getCockroachRoad(g1.old);
  }
  return { g1, g2, g3, g4 };
}
export function moneyformatNumber(money) {
  // 정수 부분 추출
  let integerPart = Math.floor(money).toLocaleString(); // 세 자리마다 콤마 추가

  // money가 정수이면 바로 integerPart 반환
  if (money % 1 === 0) {
    return integerPart;
  }
}
export function ConvertCard(Num, Shape) {
  let Card = "";
  switch (Shape) {
    case 1:
      Card += "d_";
      //   scan_card += "◆";
      break;
    case 2:
      Card += "c_";
      //   scan_card += "♣";
      break;
    case 3:
      Card += "h_";
      //   scan_card += "♥";
      break;
    case 4:
      Card += "s_";
      //   scan_card += "♠";
      break;
    default:
      Card = "";
      break;
  }

  return (Card += Num);
}

export const isLocalhost = window.location.hostname === "localhost";
/** 베팅설정 */
var _cur_arr = [];
export function reduce_cur_arr() {
  return _cur_arr.reduce((a, b) => a + b.money, 0);
}
export function init_cur_arr() {
  _cur_arr = [];
}
export function cur_push(name, money) {
  _cur_arr.push({ name, money });
}
export function cur_pop() {
  return _cur_arr.pop();
}
export function cur_peek() {
  return _cur_arr[_cur_arr.length - 1];
}
export function cur_length() {
  return _cur_arr.length;
}
export function cur_arr() {
  return _cur_arr;
}
export function combinedMoney(data) {
  return data.reduce((acc, curr) => {
    let existing = acc.find((item) => item.name === curr.name);
    if (existing) {
      existing.money += curr.money;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);
}

//Stack All
var _arr = [];
export function init_arr() {
  _arr = [];
}
export function push(name, money) {
  _arr.push({ name, money });
}
export function pop() {
  return _arr.pop();
}
export function peek() {
  return _arr[_arr.length - 1];
}
export function length() {
  return _arr.length;
}
export function arr() {
  return _arr;
}
export function arr_cur_connect() {
  _arr = [..._arr, ..._cur_arr];
}

export function checkTableLimit(params, limit) {
  let minNum = 0;
  let maxNum = 0;
  switch (params) {
    case "Player":
    case "Banker":
      minNum = limit.min;
      maxNum = limit.max;
      break;
    case "Tie":
      minNum = limit.min_tie;
      maxNum = limit.max_tie;
      break;
    case "Player_Pair":
    case "Banker_Pair":
      minNum = limit.pair_min;
      maxNum = limit.pair_max;
      break;
    default:
      break;
  }

  return {
    min: minNum,
    max: maxNum,
  };
}
export function checkUserLimit(params, limit) {
  let minNum = 0;
  let maxNum = 0;
  switch (params) {
    case "Player":
    case "Banker":
      minNum = limit.bet_min;
      maxNum = limit.bet_max;
      break;
    case "Tie":
      minNum = limit.tie_min;
      maxNum = limit.tie_max;
      break;
    case "Player_Pair":
    case "Banker_Pair":
      minNum = limit.pair_min;
      maxNum = limit.pair_max;
      break;
    default:
      break;
  }

  return {
    min: minNum,
    max: maxNum,
  };
}
/** 언어설정 */
export const languageDisplay = {
  ko: "KOREAN",
  cn: "CHINESE",
  en: "ENGLISH",
  jp: "JAPANESE",
};
const translations = {
  ko: {
    BetLimitUnder: "베팅 한도 미만",
    BetLimitOver: "베팅 한도 초과",
    CacelBetFail: "베팅 취소 실패",
    CancelBetSuccess: "베팅 취소 성공",
    bettingFail: "베팅 실패",
    bettingSuccess: "베팅 성공",

    betstart: "베팅 시작",
    betend: "베팅 마감",

    betmoney: "배팅금액",
    winmoney: "이긴금액",
    betlog: "배팅내역",

    personmin: "개인 최소",
    personmax: "개인 최대",
    tablemax: "테이블 최대",

    pp: "P. 페어",
    bp: "B. 페어",
    tie: "타이",
    betcancel: "베팅취소",
    betconfirm: "베팅하기",

    havemoney: "보유금액",
    playing: "진행중",
    player: "플레이어",
    playerCardSum: "Player 측 두 카드의 합",
    drawingRule: "드로잉 룰",
    drawingRuleDrawCard: "한장의 카드를 더 받음",
    drawingRuleStand:
      "Stand (Player 측은 카드를 더 이상 받지 않고 Banker와 승부를 겨룸)",
    drawingRuleNatural:
      "Natural (Player와 Banker 모두 추가 카드를 받지 않고 승부가 결정됨)",
    banker: "뱅커",
    bankerCardSum: "Banker 측 처음 2장의 카드 합",
    bankerDrawOnPlayerCondition:
      "Player 측 세번째 카드가 아래의 경우 추가 카드를 받음",
    bankerDrawValueSetStand:
      "Stand (Banker 측은 카드를 더 이상 받지 않고 Player와 승부를 겨룸)",
    bankerDrawValueSetNatural:
      "Natural (Player와 Banker 모두 추가 카드를 받지 않고 승부가 결정됨)",
    bankerNoDrawOnPlayerCondition:
      "Player 측 세번째 카드가 아래의 경우 추가 카드를 받지 않음",
    confirm: "확인",
    minmax: "최소/최고",
    tie_minmax: "타이최소/타이최고",
    pair_minmax: "페어최소/페어최고",
    BetLimit: "베팅한도",
    game: "게임",
    minimum: "최소",
    maximum: "최대",
    tableMove: "테이블이동",
    lobbyMove: "로비이동",
    refresh: "새로고침",
    welcome: "안녕하세요. 게임에 참여하신 것을 환영합니다.",
    enter: "입장",
    gameInfo: "게임방법",
    exitFullscreen: "축소화면",
    fullscreen: "전체화면",
    main: "메인으로",
    Betting: "베팅",
    Shuffle: "셔플",
    Dealing: "딜링",
    Winning: "승리",
    err_account: "잘못된 계정정보입니다. \n", // 추가된 키
    id: "아이디",
    pw: "비밀번호",
    login: "로그인",
    guest_login: "게스트 로그인",
    login_fail: "잘못된 로그인 방식입니다.",
    cancel: "취소",
    terms_title: "사용자 계약",
    terms_text: `이 웹 사이트에 언급 된 온라인 거래 서비스는 관할 지역에서만 제공됩니다. 우리 회사에서 합법적으로 제공 할 수있는 경우. 사이트를 통한 웹 사이트 또는 서비스의 액세스 또는 사용은 특정 국가의 일부 또는 모든 거주자 또는 개인에게 합법적이지 않을 수 있습니다. 귀하가 거주하는 지역에 적용되는 법률을 결정할 책임이 있습니다.
      
    귀하는 게임에 액세스하는 위치에서 귀하에게 적용되는 법률을 준수해야합니다. 귀하에게 적용되는 법률이 귀하가 플레이하는 것을 제한하거나 금지하는 경우, 귀하는 해당되는 경우에 대한 법적 제한을 준수해야하며 당사 게임에 대한 액세스 및 / 또는 플레이를 중지해야합니다.
      
    웹 사이트, 해당 콘텐츠, 제품 및 서비스는 법적으로 계약을 체결할 수 있는 모든 법적 연령의 개인 또는 귀하의 관할 지역에서 합법적으로 인정받는 개인에게 제공됩니다.
      
    Player는 회사가 법적 고지 또는 보증을 제공할 수 없음을 이해하고 수락하며, 항상 자신이 보유한 현지 법률을 준수하도록 보장하는 것은 본인의 책임임을 인정합니다. 따라서 귀하는 완전한 법적 권리로 게임을 플레이해야 합니다.
      
    귀하는 귀하의 로그인 세부 정보를 보호하고 비밀을 유지하기 위한 필요한 조치를 취할 것에 동의합니다. 또한 귀하는 자신의 로그인 세부 정보를 타인과 공유하거나 다른 사람이 귀하의 로그인 세부 정보 또는 계정을 사용하도록 허용하지 않을 것에 동의합니다. 당사는 승인되지 않은 제3자가 귀하의 계정에 액세스하여 당사 게임을 플레이함으로써 발생하는 모든 피해, 또는 부정 또는 기타 방식으로 무단 사용되어 발생하는 손실 및 피해에 대해 책임을 지지 않습니다.
      
    이 웹 사이트 또는 이 웹 사이트에서 제공하는 온라인 서비스를 사용하기 전에, 귀하는 법적 연령에 도달한 모든 개인이 이용할 수 있다고 간주되며, 본 약관 및 규정을 읽고 이해한 후 동의한 것으로 간주됩니다.
      
    당사는 부적절한 행동을 사용하거나 어떠한 종류의 조작을 통해 서비스를 이용하려는 사람에 대해 서비스를 거부할 권리를 보유합니다.
      
    또한, 인적 또는 기술적 오류, 혹은 당사 웹 사이트의 가용성 부족으로 인한 손실이나 피해에 대해, 그리고 합리적으로 통제할 수 없는 게임 및/또는 소셜 미디어 채널에 관한 모든 문제에 대해 당사가 최종 결정권을 가진다는 것에 동의합니다.
      
    우리는 웹 사이트의 실패 또는 중단, 해커에 의한 바이러스 감염, 고의적인 손상, 하드웨어/소프트웨어 또는 시스템 장애, 정전, 통신 회선 장애 또는 제3자의 범죄 행위 등 어떤 이유로 인한 손실에 대해서도 책임을 지지 않습니다. 당사는 단독 재량에 따라 결과를 인쇄하여 저장하는 것은 귀하의 책임이며, 문제가 발생할 경우 불만을 제기할 권리가 있음을 인정합니다.
      
    분쟁을 피하기 위해, 게임을 시작하거나 종료하기 전에 계정 정보가 올바른지 반드시 확인하는 것은 귀하의 책임입니다.
      
    비정상적인 상황이 발견되면 반드시 상담원에게 확인하시기 바랍니다.
      
    그렇지 않으면 당사의 결정은 최종적이며, 어떠한 상황에서도 취소할 수 없습니다.
      
    카드는 사람이 직접 처리합니다. 딜러의 실수에는 다음과 같은 경우가 포함됩니다:
    1) 잘못된 순서 또는 카드를 처리하라는 명령.
    2) 결과가 올바르게 표시되지 않는 경우 (예: 두 개 이상의 카드가 솔루션에서 결정되는 경우).  
    당사는 실제 결과와 계산을 표시하기 위해 복원 조치를 취할 것입니다.
      
    귀하는 모든 상호 운용 및 결정이 최종적이며 법적 구속력이 있음을 인정하고 동의합니다.
      
    귀하는 본 약관을 읽고 이해한 것으로 간주되며, 이에 동의하는 것으로 간주됩니다. 이용 약관.`,
  },
  en: {
    BetLimitUnder: "Bet below the limit",
    BetLimitOver: "Bet above the limit",
    CacelBetFail: "Cancel Bet Failed",
    CancelBetSuccess: "Cancel Bet Successful",
    bettingFail: "Bet Failed",
    bettingSuccess: "Bet Success",
    betstart: "Bet Start",
    betend: "Bet End",

    betmoney: "Bet Amount",
    winmoney: "Winning Amount",
    betlog: "Bet Log",
    personmin: "Personal Min",
    personmax: "Personal Max",
    tablemax: "Table Max",

    pp: "Player Pair",
    bp: "Banker Pair",
    tie: "Tie",
    betcancel: "Cancel Bet",
    betconfirm: "Place Bet",
    havemoney: "Amount",
    playing: "Playing",
    player: "Player",
    playerCardSum: "Sum of Player’s two cards",
    drawingRule: "Drawing Rule",
    drawingRuleDrawCard: "Draw one card",
    drawingRuleStand: "Stand (Player stops drawing and competes with Banker)",
    drawingRuleNatural:
      "Natural (No additional cards for either Player or Banker)",
    banker: "Banker",
    bankerCardSum: "Sum of Banker’s first 2 cards",
    bankerDrawOnPlayerCondition:
      "When Player’s third card is in the following values, Banker draws an extra card",
    bankerDrawValueSetStand:
      "Stand (Banker stops drawing and competes with Player)",
    bankerDrawValueSetNatural:
      "Natural (No additional cards for either Player or Banker)",
    bankerNoDrawOnPlayerCondition:
      "When Player’s third card is in the following values, Banker does not draw an extra card",
    confirm: "Confirm",
    minmax: "Min/Max",
    tie_minmax: "Tie Min/Tie Max",
    pair_minmax: "Pair Min/Pair Max",
    BetLimit: "BetLimit",
    game: "Game",
    minimum: "Minimum",
    maximum: "Maximum",
    tableMove: "Table Move",
    lobbyMove: "Lobby Move",
    refresh: "Refresh",
    welcome: "Welcome to the game.",
    enter: "Enter",
    gameInfo: "Game Info",
    exitFullscreen: "exitFull",
    fullscreen: "Fullscreen",
    main: "Main",
    Betting: "Betting",
    Shuffle: "Shuffle",
    Dealing: "Dealing",
    Winning: "Winning",
    err_account: "Invalid account information. \n", // 추가된 키
    id: "ID",
    pw: "Password",
    login: "Login",
    guest_login: "Guest Login",
    login_fail: "Invalid login method.",
    cancel: "Cancel",
    terms_title: "User Agreement",
    terms_text: `The online trading services mentioned on this website are provided only in jurisdictions where our company is legally permitted to offer them. Access to or use of the website or its services may not be legal for some residents or individuals in certain countries. It is your responsibility to determine the laws applicable in your area.
        
    You must comply with the laws applicable to the location from which you access the game. If the laws applicable to you restrict or prohibit your play, you must adhere to those legal restrictions and cease accessing and/or playing our game.
        
    The website, its content, products, and services are provided to individuals who are of legal age or are legally recognized in your jurisdiction.
        
    Players understand and agree that the company cannot provide any legal notice or warranty, and that it is their responsibility to ensure compliance with local laws. Accordingly, you must play the game with full legal rights.
        
    You agree to take the necessary measures to protect and keep your login details confidential. You also agree not to share your login details with others or allow others to use your login information or account. The company is not liable for any damage incurred due to unauthorized access to your account or playing our game, nor for any loss or damage resulting from unauthorized use, fraud, or other means.
        
    Before using this website or the online services provided by it, it is assumed that all individuals of legal age in your jurisdiction are permitted access, and by doing so, you are deemed to have read, understood, and agreed to these terms and conditions.
        
    We reserve the right to refuse service to anyone using inappropriate behavior or attempting to manipulate the service in any way.
        
    Furthermore, you agree that we are not liable for any loss or damage due to human or technical errors, or due to the unavailability of our website, and that for games and/or social media channels beyond our reasonable control, we hold the final decision-making authority on all matters.
        
    We are not liable for any loss resulting from website failures or interruptions for any reason, including but not limited to virus contamination by hackers, intentional damage, hardware/software or system failures, power outages, communication line failures, or criminal acts by third parties. It is your responsibility to print and store the results at your discretion, and you have the right to raise complaints if issues arise.
        
    To avoid disputes, it is your responsibility to verify your account information before starting or ending the game.
        
    If any abnormal situation is detected, please consult with a representative.
        
    Otherwise, our decision is final and cannot be canceled regardless of the circumstances.
        
    Cards are handled manually. Dealer errors include:
    1) Incorrect order or command to handle the cards.
    2) Results not being displayed correctly (for example, when two or more cards determine the outcome in the solution).  
    We will take measures to restore the display to show the actual results and calculations.
        
    You agree that all interactions and decisions are final and legally binding.
        
    By using this service, you are deemed to have read, understood, and agreed to these terms and conditions (Terms of Use).`,
  },
  cn: {
    BetLimitUnder: "投注低于限额",
    BetLimitOver: "投注超过限额",
    CacelBetFail: "取消下注失败",
    CancelBetSuccess: "取消下注成功",
    bettingFail: "下注失败",
    bettingSuccess: "下注成功",

    betstart: "开始下注",
    betend: "下注结束",

    betmoney: "投注金额",
    winmoney: "赢得金额",
    betlog: "投注记录",
    personmin: "个人最小",
    personmax: "个人最大",
    tablemax: "桌子最大",
    pp: "玩家对子",
    bp: "庄家对子",
    tie: "和局",
    betcancel: "取消投注",
    betconfirm: "确认投注",
    havemoney: "持有額",
    playing: "进行中",
    player: "玩家",
    playerCardSum: "玩家两张牌的总和",
    drawingRule: "发牌规则",
    drawingRuleDrawCard: "再摸一张牌",
    drawingRuleStand: "Stand(玩家停止要牌，与庄家比点)",
    drawingRuleNatural: "Natural(玩家和庄家均不补牌, 直接决胜负)",
    banker: "庄家",
    bankerCardSum: "庄家前两张牌的总和",
    bankerDrawOnPlayerCondition: "当玩家第三张牌为以下数值时庄家补牌",
    bankerDrawValueSetStand: "Stand(庄家停止补牌，与玩家比点)",
    bankerDrawValueSetNatural: "Natural(玩家和庄家均不补牌，直接决胜负)",
    bankerNoDrawOnPlayerCondition: "当玩家第三张牌为以下数值时庄家不补牌",
    confirm: "确认",
    minmax: "最小/最大",
    tie_minmax: "和局最小/和局最大",
    pair_minmax: "对子最小/对子最大",
    BetLimit: "投注限额",
    game: "游戏",
    minimum: "最小",
    maximum: "最大",
    tableMove: "换桌",
    lobbyMove: "进入大厅",
    refresh: "刷新",
    welcome: "欢迎参加游戏。",
    enter: "进入",
    gameInfo: "游戏规则",
    exitFullscreen: "退出全屏",
    fullscreen: "全屏",
    main: "主菜单",
    Betting: "投注",
    Shuffle: "洗牌",
    Dealing: "发牌",
    Winning: "获胜",
    err_account: "账号信息无效. \n", // 추가된 키
    id: "账号",
    pw: "密码",
    login: "登录",
    guest_login: "游客登录",
    login_fail: "无效的登录方式.",
    cancel: "取消",
    terms_title: "用户协议",
    terms_text: `本网站所提及的在线交易服务仅在公司依法许可提供的辖区内提供。通过网站或服务的访问和使用，在某些国家可能对部分或全部居民或个人并不合法。您有责任确定适用于您所在地区的法律。
  
  您必须遵守您所在位置适用的法律。如果适用于您的法律限制或禁止您进行游戏，则您必须遵守这些法律限制，并停止访问和/或进行游戏。
  
  本网站、其内容、产品及服务仅提供给所有符合法定年龄或在您所在辖区内被合法认可的个人。
  
  玩家理解并同意，公司不能提供任何法律通知或担保，并且确保遵守当地法律是您个人的责任。因此，您必须以完全的法律权利参与游戏。
  
  您同意采取必要措施保护并保密您的登录信息。同时，您同意不将您的登录信息与他人共享，也不允许他人使用您的登录信息或账户。对于未经授权的第三方访问您的账户或因使用我们游戏而导致的任何损失和损害，公司不承担任何责任。
  
  在使用本网站或其提供的在线服务之前，您应被视为已经达到法定年龄，并且在阅读、理解并同意本条款和规定后使用该服务。
  
  我们保留拒绝向那些使用不当行为或试图以任何方式操纵服务的人提供服务的权利。
  
  此外，您同意我们不对因人为或技术错误，或因本网站无法使用而导致的任何损失或损害负责，并且对于超出我们合理控制范围的游戏及/或社交媒体渠道的所有问题，我们拥有最终决定权。
  
  对于因网站故障或中断导致的任何损失，包括但不限于黑客病毒感染、故意破坏、硬件/软件或系统故障、电力中断、通信线路故障或第三方的犯罪行为，我们不承担任何责任。您自行决定打印和存储结果，并且在出现问题时有权提出投诉。
  
  为避免争议，您有责任在开始或结束游戏之前核实您的账户信息是否正确。
  
  如果发现任何异常情况，请务必咨询客服人员。
  
  否则，我们的决定将是最终的，并且在任何情况下均不得撤销。
  
  牌局由人工处理。庄家的失误包括以下情况：
  1) 错误的顺序或指令导致处理牌错误；
  2) 结果显示不正确(例如，当两个或多个牌在决策过程中同时出现时)。
  我们将采取措施恢复显示实际结果和计算方式。
  
  您同意所有互动和决策均为最终决定，并具有法律约束力。
  
  您被视为已阅读、理解并同意本条款，即视为接受使用条款。`,
  },
  jp: {
    BetLimitUnder: "ベットはリミット未満です",
    BetLimitOver: "ベットはリミットを超えています",
    CacelBetFail: "ベットキャンセル失敗",
    CancelBetSuccess: "ベットキャンセル成功",
    bettingFail: "ベット失敗",
    bettingSuccess: "ベット成功",
    betstart: "ベット開始",
    betend: "ベット終了",

    betmoney: "ベット金額",
    winmoney: "獲得金額",
    betlog: "ベット履歴",
    personmin: "個人の最小",
    personmax: "個人の最大",
    tablemax: "テーブルの最大",
    pp: "プレイヤーペア",
    bp: "バンカーペア",
    tie: "タイ",
    betcancel: "ベットキャンセル",
    betconfirm: "ベットする",
    havemoney: "保有金額",
    playing: "進行中",
    player: "プレイヤー",
    playerCardSum: "プレイヤーの2枚のカードの合計",
    drawingRule: "ドローイングルール",
    drawingRuleDrawCard: "カードをもう1枚引く",
    drawingRuleStand: "Stand(プレイヤーがカードを引かず、バンカーと対決)",
    drawingRuleNatural:
      "Natural(プレイヤーもバンカーも追加カードを引かずに決着)",
    banker: "バンカー",
    bankerCardSum: "バンカーの最初の2枚のカードの合計",
    bankerDrawOnPlayerCondition:
      "プレイヤーの3枚目のカードが以下の場合、バンカーは追加カードを引く",
    bankerDrawValueSetStand:
      "Stand(バンカーがカードを引かず、プレイヤーと対決)",
    bankerDrawValueSetNatural:
      "Natural(プレイヤーもバンカーも追加カードを引かずに決着)",
    bankerNoDrawOnPlayerCondition:
      "プレイヤーの3枚目のカードが以下の場合、バンカーは追加カードを引かない",
    confirm: "確認",
    minmax: "最小/最大",
    tie_minmax: "タイ最小/タイ最大",
    pair_minmax: "ペア最小/ペア最大",
    BetLimit: "ベット制限",
    game: "ゲーム",
    minimum: "最小",
    maximum: "最大",
    tableMove: "テーブル移動",
    lobbyMove: "ロビー移動",
    refresh: "更新",
    welcome: "ゲームに参加していただきありがとうございます。",
    enter: "入る",
    gameInfo: "遊び方",
    exitFullscreen: "縮小画面",
    fullscreen: "全画面",
    main: "メインへ",
    Betting: "ベッティング",
    Shuffle: "シャッフル",
    Dealing: "ディーリング",
    Winning: "勝利",
    err_account: "無効なアカウント情報です. \n", // 추가된 키
    id: "ユーザーID",
    pw: "パスワード",
    login: "ログイン",
    guest_login: "ゲストログイン",
    login_fail: "無効なログイン方式です.",
    cancel: "キャンセル",
    terms_title: "利用規約",
    terms_text: `本ウェブサイトで言及されているオンライン取引サービスは、当社が法的に提供を許可されている管轄区域内でのみ提供されます。ウェブサイトまたはそのサービスへのアクセスや利用は、特定の国において、一部または全ての居住者や個人に対して合法ではない場合があります。ご利用の地域に適用される法律を判断する責任は、お客様にあります。
  
  お客様は、ゲームにアクセスする場所に適用される法律を遵守しなければなりません。もし、お客様に適用される法律がゲームのプレイを制限または禁止している場合は、それらの法的制限を遵守し、当社のゲームへのアクセスおよび/またはプレイを中止する必要があります。
  
  本ウェブサイト、そのコンテンツ、製品およびサービスは、法的に契約を締結できる全ての年齢の個人、またはお客様の管轄区域で合法的に認められている個人に対して提供されます。
  
  プレイヤーは、当社が法的通知や保証を提供できないことを理解し同意するとともに、常に自身が保持する現地の法律を遵守する責任があることを認識します。したがって、お客様は完全な法的権利のもとでゲームをプレイしなければなりません。
  
  お客様は、ご自身のログイン情報を保護し、秘密に保持するために必要な措置を講じることに同意します。また、お客様は自分のログイン情報を他者と共有しない、または他者にお客様のログイン情報やアカウントを使用させないことに同意します。認可されていない第三者がアカウントにアクセスし、当社のゲームをプレイすることによって発生する全ての損害や、不正使用、詐欺その他に起因する損失および損害について、当社は一切の責任を負いません。
  
  本ウェブサイトまたは本ウェブサイトで提供されるオンラインサービスを利用する前に、お客様は法的年齢に達したすべての個人が利用可能であるとみなされ、本利用規約および条件を読み、理解し、同意したものとみなされます。
  
  当社は、不適切な行動を取る、または何らかの操作を試みる人物に対して、サービスの提供を拒否する権利を留保します。
  
  さらに、人的または技術的なエラー、あるいは本ウェブサイトの利用不可能に起因する損失または損害について、また当社の合理的な制御を超えるゲームおよび/またはソーシャルメディアチャネルに関する全ての問題について、当社は最終的な決定権を有することに同意するものとします。
  
  ウェブサイトの故障または中断、ハッカーによるウイルス感染、故意の損壊、ハードウェア/ソフトウェアまたはシステム障害、停電、通信回線の障害、または第三者による犯罪行為など、いかなる理由による損失についても、当社は一切の責任を負いません。結果を印刷して保存するかどうかはお客様の裁量に委ねられ、問題が発生した場合に苦情を申し立てる権利を有します。
  
  紛争を避けるために、ゲームの開始または終了前に、アカウント情報が正しいかどうかを必ず確認する責任はお客様にあります。
  
  異常な状況が発見された場合は、必ず担当者にご確認ください。
  
  そうでなければ、当社の決定は最終的なものであり、いかなる状況下においても取り消すことはできません。
  
  カードは手作業で扱われます。ディーラーのミスには、次のような場合が含まれます：
  1) カードの順番を誤る、またはカードの扱いに関する指示ミス。
  2) 結果が正確に表示されない場合(例えば、ソリューションで複数のカードが同時に結果を決定する場合)。
  当社は実際の結果および計算を表示するために、復元措置を講じます。
  
  お客様は、すべての相互作用および決定が最終的であり、法的に拘束力があることに同意します。
  
  お客様は、本利用規約を読み、理解したものとみなされ、これに同意したものとみなされます。(利用規約)`,
  },
};

export function getTranslation(lang, key) {
  // 지정된 lang이 없으면 기본값(KOREAN) 사용
  const currentLang = translations[lang] ? lang : "ko";
  return translations[currentLang][key];
}
