// store.js
import { create } from "zustand";

export const useStore = create((set, get) => ({
  Loading: true,
  setLoading: (bool) => set({ Loading: bool }),
  betLog: [],
  setBetLog: (arr) => set({ betLog: arr }),
  CBMap: {
    Player_Pair: {
      users: {},
      total: 0,
    },
    Player: {
      users: {},
      total: 0,
    },
    Tie: {
      users: {},
      total: 0,
    },
    Banker: {
      users: {},
      total: 0,
    },
    Banker_Pair: {
      users: {},
      total: 0,
    },
  },
  setCBMap: (obj) => set({ CBMap: obj }),
  momentwinMoney: 0,
  setMomentWinMoney: (num) => set({ momentwinMoney: num }),

  GameCount: "",
  setGameCount: (v) => set({ GameCount: v }),
  ShoeNumber: "",
  setShoeNumber: (v) => set({ ShoeNumber: v }),

  ScoreP: 0,
  setScoreP: (v) => set({ ScoreP: v }),
  CardP: [],
  setCardP: (arr) => set({ CardP: arr }),
  winner: [],
  setWinner: (w) => set({ winner: w }),
  ScoreB: 0,
  setScoreB: (v) => set({ ScoreB: v }),
  CardB: [],
  setCardB: (arr) => set({ CardB: arr }),
  PoolClick: false,
  setPoolClick: (bool) => {
    set({ PoolClick: bool });
    setTimeout(() => {
      if (!get().Result) {
        set({ ShoeNumber: "" });
        set({ winner: [] });
        set({ ScoreP: 0 });
        set({ ScoreB: 0 });
        set({ CardP: [] });
        set({ CardB: [] });
        set({ PoolClick: false });
      }
    }, 2000);
  },

  userLimit: {
    bet_min: 0,
    bet_max: 0,
    tie_min: 0,
    tie_max: 0,
    pair_min: 0,
    pair_max: 0,
  },
  setUserLimit: (partial) =>
    set((state) => ({
      userLimit: { ...state.userLimit, ...partial },
    })),
  //disPlay 용
  yellowMoney: {
    Player: 0,
    Banker: 0,
    Tie: 0,
    Player_Pair: 0,
    Banker_Pair: 0,
  },
  setYellowMoney: (partial) =>
    set((state) => ({
      yellowMoney: { ...state.yellowMoney, ...partial },
    })),
  setAllYellowMoney: (obj) => set({ yellowMoney: obj }),
  whiteMoney: {
    Player: 0,
    Banker: 0,
    Tie: 0,
    Player_Pair: 0,
    Banker_Pair: 0,
  },
  setWhiteMoney: (partial) =>
    set((state) => ({
      whiteMoney: { ...state.whiteMoney, ...partial },
    })),
  setAllWhiteMoney: (obj) => set({ whiteMoney: obj }),
  Site: "",
  setSite: (string) => set({ Site: string }),

  msg: "",
  setMsg: (string) => {
    // 메시지 설정
    set({ msg: string });
    // 2초 뒤에 msg를 빈 문자열로 리셋
    setTimeout(() => {
      set({ msg: "" });
    }, 2000);
  },

  reversalColor: false,
  setReversalColor: (bool) => set({ reversalColor: bool }),
  All_CHIPS: [
    // { num: 100, show: true, sel: false },
    { num: 500, show: true, sel: false },
    { num: 1000, show: true, sel: false },
    { num: 5000, show: true, sel: false },
    { num: 10000, show: true, sel: false },
    { num: 50000, show: true, sel: false },
    { num: 100000, show: true, sel: false },
    { num: 500000, show: true, sel: false },
    { num: 1000000, show: true, sel: false },
    { num: 3000000, show: true, sel: false },
    { num: 5000000, show: true, sel: false },
    { num: 10000000, show: true, sel: false },
  ],
  toggleChipSel: (copy) => set({ All_CHIPS: copy }),
  Kindchip: false,
  setKindchip: (bool) => set({ Kindchip: bool }),

  isSubmitting: false,
  setIsSubmitting: (bool) => set({ isSubmitting: bool }),

  isMove: false,
  setIsMove: (move) => set({ isMove: move }),
  TimeState: { Time: 0, State: false },
  setTimeState: (time) => set({ TimeState: time }),
  openInfo: false,
  setOpenInfo: (newopenInfo) => set({ openInfo: newopenInfo }),
  scale: 1,
  setScale: (newscale) => set({ scale: newscale }),
  // 소켓 인스턴스를 전역에서 사용할 수 있도록 추가

  //login
  Terms: false,
  setTerms: (newTerms) => set({ Terms: newTerms }),
  /* UserInfo */
  token: "",
  setToken: (newToken) => set({ token: newToken }),
  mb_name: "",
  setMb_name: (newMb_name) => set({ mb_name: newMb_name }),
  mb_multiBet: 0,
  setMb_multiBet: (newMb_multiBet) => set({ mb_multiBet: newMb_multiBet }),
  mb_id: "",
  setMb_id: (newMb_id) => set({ mb_id: newMb_id }),
  mb_money: "",
  setMb_money: (newMb_money) => set({ mb_money: newMb_money }),
  currencyType: "",
  setCurrencyType: (newCurrencyType) => set({ currencyType: newCurrencyType }),
  sUserCode: "",
  setsUserCode: (string) => set({ sUserCode: string }),

  language: localStorage.getItem("lang") || "ko",
  setLanguage: (newLanguage) => set({ language: newLanguage }),

  RoomID: "",
  setRoomID: (newRoomID) => set({ RoomID: newRoomID }),
  id: 0,
  setId: (newId) => set({ id: newId }),

  s_room: [],
  setRoom_s: (index, value) =>
    set((state) => {
      const newsRoom = [...state.s_room];
      newsRoom[index] = value;
      return { s_room: newsRoom };
    }),
  AllsetRoom_s: (data) => set({ s_room: data }),
  r_room: [],
  setRoom_r: (index, value) =>
    set((state) => {
      const newrRoom = [...state.r_room];
      newrRoom[index] = value;
      return { r_room: newrRoom };
    }),
  AllsetRoom_r: (data) => set({ r_room: data }),
  score_room: [],
  setScore_room: (index, value) =>
    set((state) => {
      const newScoreRoom = [...state.score_room];
      newScoreRoom[index] = value;
      return { score_room: newScoreRoom };
    }),
  AllsetScore_room: (data) => set({ score_room: data }),
  LobbyGun1Col: 22,
  LobbyGun2Col: 22,
  LobbyGun3Col: 11,
  LobbyGun4Col: 11,
  gun1: [],
  setGun1: (index, value) =>
    set((state) => {
      const newGun = [...state.gun1];
      newGun[index] = value;
      return { gun1: newGun };
    }),

  gun2: [],
  setGun2: (index, value) =>
    set((state) => {
      const newGun = [...state.gun2];
      newGun[index] = value;
      return { gun2: newGun };
    }),
  gun3: [],
  setGun3: (index, value) =>
    set((state) => {
      const newGun = [...state.gun3];
      newGun[index] = value;
      return { gun3: newGun };
    }),
  gun4: [],
  setGun4: (index, value) =>
    set((state) => {
      const newGun = [...state.gun4];
      newGun[index] = value;
      return { gun4: newGun };
    }),
  RoomGun1Col: 60,
  RoomGun2Col: 25,
  RoomGun3Col: 15,
  RoomGun4Col: 15,
  Roomgun1: [],
  setRoomGun1: (newRoomgun1) => set({ Roomgun1: newRoomgun1 }),
  ColorRoomgun1: [],
  setColorRoomGun1: (newRoomgun1) => set({ ColorRoomgun1: newRoomgun1 }),
  Roomgun2: [],
  setRoomGun2: (newRoomgun2) => set({ Roomgun2: newRoomgun2 }),
  Roomgun3: [],
  setRoomGun3: (newRoomgun3) => set({ Roomgun3: newRoomgun3 }),
  Roomgun4: [],
  setRoomGun4: (newRoomgun4) => set({ Roomgun4: newRoomgun4 }),

  MoveGun1Col: 43,
  Movegun1: [],
  setMovegun1: (index, value) =>
    set((state) => {
      const newGun = [...state.Movegun1];
      newGun[index] = value;
      return { Movegun1: newGun };
    }),
}));
