# Roads (바카라 로드맵 / 중국점)

바카라 결과 로그를 받아 **빅로드(큰길)**와 3종 **파생 로드(중국점)**를 그려주는 모듈.

| 파일 | 한글 명칭 | 역할 |
|---|---|---|
| `BigRoad.ts` | 빅로드(큰길) | 결과 로그 → 6행 그리드. 나머지 로드의 **원천 데이터** 생성 |
| `BigEyeRoad.ts` | 큰눈(대안로) | 빅로드 컬럼을 **offset 1**로 비교한 파생 로드 |
| `SmallRoad.ts` | 작은눈(소로) | **offset 2** 비교 파생 로드 |
| `CockroachRoad.ts` | 아기돼지(육매/꼬리로) | **offset 3** 비교 파생 로드 |

> 파생 3종은 구조가 거의 동일하다. "빅로드의 컬럼 길이 패턴을 비교해서 Player(파랑)/Banker(빨강) 마크를 찍는다"가 핵심.

---

## 1. 입력 데이터 (`array`)

`BigRoad`의 `array`는 한 슈(shoe)의 라운드 결과 배열이다. 각 원소는 DB `tb_baccarat_progress_log` 레코드 모양:

```js
{
  sWinner: "Player" | "Banker" | "Tie",        // 승자 (필수)
  sPair:   "" | "Player_Pair" | "Banker_Pair"  // 페어 (없으면 "")
         | "Player_Pair,Banker_Pair",          // 양쪽 페어
  sPlayer_Score: 0..9,                          // 플레이어 끗 (color 모드에서 사용)
  sBanker_Score: 0..9,                          // 뱅커 끗
  // 그 외 카드 필드(sBanker_1_Card 등)는 로드 계산에 안 쓰임
}
```

- **로드 계산에 실제로 읽는 필드는 `sWinner`, `sPair`, 점수 2개뿐.** 나머지는 무시된다.
- 보통 호출 전에 **선두 Tie를 잘라낸다**(빅로드는 첫 칸이 Tie면 시작점이 꼬임). 예: `client/player/src/util.js`의 `GunSet`.

### 파생 로드의 입력
파생 3종은 `array`가 아니라 **빅로드 결과의 `.old` 그리드**와 **`.gubunIndex`**를 먹는다. (아래 사용법 참고)

---

## 2. 사용법 (실제 호출 패턴)

`client/player/src/util.js` / `client/player/src/Game/Game.js`에서 쓰는 그대로:

```js
import { BigRoad } from "./roads/BigRoad.ts";
import { BigEyeRoad } from "./roads/BigEyeRoad.ts";
import { SmallRoad } from "./roads/SmallRoad.ts";
import { CockroachRoad } from "./roads/CockroachRoad.ts";

// 1) 빅로드 먼저 — 모든 파생 로드의 원천
const g1 = new BigRoad({
  array: log,      // 위 입력 데이터 배열 (선두 Tie 제거된 상태 권장)
  row: Row,        // 행 수. 항상 6
  col: Gun1Col,    // 표시 컬럼 수 (그리드 가로 길이)
  cut: true,       // true면 col 길이 넘는 앞쪽 컬럼을 잘라냄(=오래된 것 버림)
  color: false,    // true면 Tie도 새 줄로 그리는 모드 (점수 컬러 모드)
}).getBigRoad();
// g1 = { old, new, gubunIndex, over }

// 2) 파생 로드 — 반드시 g1.gubunIndex 와 g1.old 를 넘긴다
const g2 = new BigEyeRoad({
  gubun: g1.gubunIndex,  // ★ 빅로드의 컬럼 구분점 (키 이름은 'gubun')
  row: Row,
  col: Gun2Col * 2,      // ★ 파생은 보통 col 을 *2 로 준다
  cut: true,
}).getBigEyeRoad(g1.old);   // ★ g1.new 가 아니라 g1.old(원본 그리드)

const g3 = new SmallRoad({
  gubun: g1.gubunIndex, row: Row, col: Gun3Col * 2, cut: true,
}).getSmallRoad(g1.old);

const g4 = new CockroachRoad({
  gubun: g1.gubunIndex, row: Row, col: Gun4Col * 2, cut: true,
}).getCockroachRoad(g1.old);
```

### 예측(다음 패) 모드
세 번째/네 번째 인자 `(g1.old, inGame=true, Who)`를 주면, 반환값 대신 **`Expects.expect{P|B}Gun{2|3|4}s`** 전역에 "다음 패가 어디 찍힐지" 예측 마크를 기록한다. `Game.js`에서 `"Player"`/`"Banker"` 두 가상 케이스로 호출하는 용도.

```js
new CockroachRoad({ gubun: pg1.gubunIndex, row: Row, col: c, cut: true })
  .getCockroachRoad(pg1.old, true, "Player");   // 반환 안 쓰고 Expects만 갱신
```

> ⚠️ `0857-pad2-main/src/roads/`의 동일 파일들은 이 `Expects` 블록이 **주석 처리**되어 예측 부수효과가 없다. 두 복사본은 입출력은 같지만 이 부분만 다르다.

---

## 3. 출력 데이터

### BigRoad → `{ old, new, gubunIndex, over }`
- `old`: 트림 **전** 6×200 원본 그리드. **파생 로드 입력으로 이걸 쓴다.**
- `new`: 트림/패딩된 **렌더용** 그리드. 셀 모양:
  ```js
  { TieCount: number, Win: "Player"|"Banker"|"Tie"|"", Pair: 0|1|2|3, WinScore: number }
  ```
  렌더 쪽에서 `g1.new[col][row].Win` 으로 읽는다.
- `gubunIndex`: 컬럼이 6행을 넘겨 꺾일 때(용꼬리) 생긴 구분점 배열. 원소 `{ rowIndex, colIndex, tempColIndex }`. **소비자는 `rowIndex`/`colIndex`만 읽는다.**
- `over`: cut으로 잘린 컬럼이 있었는지 여부.

### 파생 로드 → `{ Mark }[][]`
6행 × (col 길이) 그리드. 각 셀:
```js
{ Mark: "Player" | "Banker" | "" }   // "" = 빈칸
```
- `Player` = 파랑, `Banker` = 빨강 (중국점은 색만 의미 있고 실제 P/B 승패와 직접 매핑되지 않음).

---

## 4. 함수 레퍼런스 (각 파일)

### BigRoad.ts
| 함수 | 설명 |
|---|---|
| `constructor(info)` | `array/row/col/cut/color` 보관 |
| `getBigRoad()` | **메인**. `array`를 6행 그리드로 채우고 `{old,new,gubunIndex,over}` 반환 |
| `PairInsert(sPair)` | 페어 문자열 → 코드(0 없음/1 PP/2 BP/3 둘다) |
| `SetWinScore(round)` | 승자 쪽 끗 점수 추출(Tie면 뱅커 점수) |
| `updateArr(row)` | 한 행 앞쪽 빈칸 제거(트림) |
| `updateRows()` | 6행을 `col` 길이에 맞춰 패딩, `cut`이면 초과분 앞에서 제거 |

### BigEyeRoad.ts / SmallRoad.ts / CockroachRoad.ts (공통 구조)
| 함수 | 설명 |
|---|---|
| `constructor(info)` | `gubun(=gubunIndex)/row/col/cut` 보관 |
| `getBigEyeRoad` / `getSmallRoad` / `getCockroachRoad(bigRoad, inGame?, Who?)` | **메인**. 빅로드 컬럼들을 offset 비교해 마크 그리드 생성. `inGame`이면 `Expects`에 예측 기록 |
| `evaluatePosition(...)` | 현재 위치를 아래 6판정으로 분류해 `Banker`/`Player` 마크 push |
| `ChangeJul(...)` | 같은 컬럼의 가로 꼬리(용꼬리) 칸들도 이어서 판정 |
| `checkBox(rows)` | 패턴: 최근 줄 == 직전 줄 길이 (박스 완성) |
| `checkWillBox(rows)` | 패턴: 최근 줄 < 직전 줄 (박스 만들어지는 중) |
| `checkPlump(rows)` | 패턴: 최근/직전/전전 모두 길이 1 (퐁당퐁당) |
| `checkBoxComp(rows)` | 패턴: 최근 줄 길이 1 & 직전==전전 (박스 완성 직후) |
| `checkWillLine(rows)` | 패턴: 최근 줄이 직전보다 2 이상 길다 (줄) |
| `arraysEqual(a,b)` | 두 배열 원소 동일 비교 |
| `getCopy(data)` | 마크 리스트를 6행 그리드(컬럼 꺾임 포함)로 배치 |
| `updateArr` / `updateRows` | 트림 / 패딩·cut (BigRoad와 동일 역할) |

#### 파일별 차이
- **시작 컬럼/offset**: 큰눈 = offset 1(3번째 패부터), 작은눈 = offset 2(4번째), 육매 = offset 3(5번째).
- **그룹핑 방식**: `BigEyeRoad`는 `reverseArray.includes()` 기반, `SmallRoad`/`CockroachRoad`는 `typeof === "number"`(컬럼 구분자) 기반.
- **`collectColumnTail(...)`**: `CockroachRoad`에만 실제 정의(`SmallRoad`는 주석). 가로 꼬리 칸 수집용 헬퍼지만 현재 호출부는 주석 처리되어 미사용.
- **`i === 5 && j === 0/1/2` 블록**: 맨 아래 행(6행째)에서 가로로 이어진 꼬리를 처리하는 특수 분기. 육매 3개, 작은눈 2개, 큰눈 1개.

---

## 5. 주의 (로직 변경 시 깨지기 쉬운 곳)

1. 파생 로드는 `g1.new`가 아니라 **`g1.old`**(트림 전 원본)를 먹는다.
2. 파생 생성자 키는 `gubun` (값은 `g1.gubunIndex`). 이름 불일치 주의.
3. 파생 `col`은 관례상 **`*2`**, 빅로드 `col`은 화면별로 `/2`가 들어가기도 함.
4. `color` true/false에 따라 빅로드 Tie 처리(새 줄 vs 카운트)가 갈린다.
5. player 로드는 `Expects` 부수효과 있음 / 0857-pad2-main 로드는 없음.
