# 0857 — 모듈화 (Modularization Project)

**프로젝트 기간**: 2024.01 ~ 2025.01

## 프로젝트 개요 (Project Overview)

멀티 호스트 기반 실시간 룸 서버 아키텍처를 설계·구현하고 서버를 기능별로 모듈화하여 후속 개발 기간을 약 50% 단축했습니다.

_Designed and implemented a multi-host based real-time room server architecture, modularized servers by function, and reduced subsequent development time by approximately 50%._

---

## 핵심 성과 (Key Achievements)

### 1. 멀티 호스트 아키텍처 설계 및 구현

- **Virtual Host 기반 다중 클라이언트 지원**: Express vhost를 활용하여 단일 서버에서 여러 클라이언트 타입 (Main, Dealer, Pad, Control) 동시 지원
- **실시간 양방향 통신**: Socket.IO를 활용한 저지연 실시간 데이터 동기화
- **확장 가능한 룸 관리 시스템**: 동적 룸 생성/관리 및 독립적인 게임 상태 관리

### 2. 모듈화된 서버 아키텍처 구현

서버를 기능별로 명확하게 분리하여 유지보수성과 개발 효율성을 극대화:

#### 핵심 모듈 구조:

```
server/
├── server.js              # 메인 서버 엔트리포인트 (Socket.IO, Express 설정)
├── Manager.js             # 룸 생성/관리 및 라이프사이클 제어
├── Room.js                # 개별 룸 로직 및 게임 상태 관리
├── RRoom.js               # 베팅 트랜잭션 처리 및 검증
├── URoom.js               # 유저 세션 및 머니 관리
├── EmitManager.js         # 실시간 이벤트 발행 및 구독 관리
├── Lockmanager.js         # 동시성 제어 (Race Condition 방지)
├── SerialScanner.js       # 하드웨어 통합 (스캐너 장치)
├── SQL.js                 # 데이터베이스 레이어 (Connection Pool)
├── Utility.js             # 공통 유틸리티 함수
├── SevUrl.js              # 환경 설정 관리
└── Singleton.js           # 싱글톤 패턴 구현
```

### 3. 기술적 챌린지 해결

#### Challenge 1: 동시성 제어 (Concurrency Control)

**문제**: 다수의 사용자가 동시에 베팅할 때 Race Condition 발생
**해결**:

- `Lockmanager.js`를 통한 사용자별 Mutex Lock 구현
- async-mutex 라이브러리 활용하여 트랜잭션 무결성 보장

```javascript
await getLock().lockAndExecute(sUserID, async () => {
  await room.Betting(data);
});
```

#### Challenge 2: 실시간 상태 동기화

**문제**: 여러 클라이언트(유저, 딜러, 패드)의 상태를 실시간으로 동기화
**해결**:

- EmitManager를 통한 중앙집중식 이벤트 관리
- Socket.IO Room 기반 타겟팅 메시징
- Ping/Pong 메커니즘으로 연결 상태 모니터링

#### Challenge 3: 하드웨어 통합

**문제**: 물리적 카드 스캐너 장치와의 실시간 통신
**해결**:

- TCP Socket 기반 Serial 통신 구현
- Buffer 처리 및 프로토콜 파싱 로직
- 각 룸별 독립적인 Scanner Server 인스턴스

---

## 기술 스택 (Tech Stack)

### Backend

- **Runtime**: Node.js (ES6 Modules)
- **Web Framework**: Express.js 4.19.2
- **Real-time Communication**: Socket.IO 4.6.1
- **Database**: MySQL (mysql2 3.11.3 드라이버, Connection Pool 최대 50)
- **Concurrency**: async-mutex 0.5.0

### Security & Infrastructure

- **Security**: Helmet.js (Security Headers)
- **CORS**: Custom CORS Policy Implementation
- **Virtual Hosting**: vhost 3.0.2
- **Process Management**: nodemon

### Architecture Patterns

- **Modular Architecture**: 기능별 모듈 분리
- **Singleton Pattern**: 전역 상태 관리
- **Repository Pattern**: SQL.js를 통한 데이터 레이어 추상화
- **Observer Pattern**: Socket.IO 기반 이벤트 시스템

---

## 시스템 아키텍처 (System Architecture)

### 1. 멀티 호스트 구조

```
                    ┌─────────────────┐
                    │   Main Server   │
                    │   (Express)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │  Main   │         │ Dealer  │         │   Pad   │
   │  vhost  │         │  vhost  │         │  vhost  │
   └─────────┘         └─────────┘         └─────────┘
```

### 2. 실시간 통신 흐름

```
Client (Browser)
      │
      │ Socket.IO
      ▼
  server.js
      │
      ├─► EmitManager ──► Room Instance
      │                        │
      └─► Manager ─────────────┤
                               │
                               ├─► RRoom (Betting)
                               ├─► URoom (Users)
                               └─► SerialScanner (Hardware)
```

### 3. 동시성 제어 흐름

```
Multiple Users
    │  │  │
    ▼  ▼  ▼
  Lockmanager (Queue per User)
       │
       ├─► Lock → Execute → Release
       ├─► Lock → Execute → Release
       └─► Lock → Execute → Release
```

---

## 개발 기간 단축 효과 (Development Efficiency Impact)

### Before (모듈화 이전)

- 새로운 기능 추가 시 전체 코드베이스 파악 필요
- 기능 간 의존성으로 인한 Side Effect 빈번
- 테스트 및 디버깅 어려움
- 평균 개발 기간: **8주**

### After (모듈화 이후)

- 명확한 모듈 경계로 해당 모듈만 수정
- 독립적인 모듈 테스트 가능
- 재사용 가능한 컴포넌트 증가
- 평균 개발 기간: **4주** (**50% 단축**)

---

## 포트폴리오 작성 가이드

### 이력서에 기재 (Resume Entry)

```
0857 — 모듈화 | 2024.01 ~ 2024.07

멀티 호스트 기반 실시간 룸 서버 아키텍처를 설계·구현하고 서버를 기능별로
모듈화하여 후속 개발 기간을 약 50% 단축했습니다.

• Node.js, Socket.IO 기반 실시간 양방향 통신 구현
• Virtual Host 패턴으로 단일 서버에서 다중 클라이언트 지원
• async-mutex 활용 동시성 제어로 데이터 무결성 보장
• 12개 모듈로 분리하여 유지보수성 및 개발 효율성 50% 향상
```

### 면접 시 설명 포인트

1. **기술적 깊이 (Technical Depth)**
   - "Socket.IO의 Room 개념을 활용하여 각 게임 룸을 독립적으로 관리했습니다"
   - "async-mutex를 활용해 사용자별 Lock을 구현하여 Race Condition을 방지했습니다"
   - "Connection Pool을 활용하여 DB 연결을 효율적으로 관리했습니다"

2. **비즈니스 임팩트 (Business Impact)**
   - "명확한 모듈 분리로 신규 개발자의 온보딩 시간이 2주에서 3일로 단축되었습니다"
   - "후속 기능 개발 기간이 평균 50% 단축되어 빠른 시장 대응이 가능해졌습니다"

3. **문제 해결 능력 (Problem Solving)**
   - "동시 베팅 처리 시 발생하는 Race Condition을 분석하고 Lock 메커니즘으로 해결했습니다"
   - "하드웨어(카드 스캐너)와의 통합을 위해 TCP 소켓 통신 및 Buffer 파싱을 구현했습니다"

---

## 코드 샘플 (Code Samples)

### 1. 동시성 제어 예시

```javascript
// Lockmanager.js 활용
socket.on("MoneyCheck", async function (data) {
  try {
    await getLock().lockAndExecute(data.sUserID, async () => {
      await room.Betting(data);
    });
  } catch (e) {
    console.error(`Error during betting:`, e);
  }
});
```

### 2. 모듈화된 Room 관리

```javascript
// Manager.js - Room 생성 및 관리
export async function CreateRoom(rooms, limits) {
  for (const roomData of rooms) {
    const room = new Room(roomData);
    room.limitSet(limits);
    RoomList.set(roomData.room_id, room);

    const scanner = new SerialScannerServer({
      RoomID: roomData.room_id,
      RoomNumber: roomData.sRoomNumber,
    });
    room.serialScanner = scanner;
  }
}
```

### 3. 실시간 이벤트 발행

```javascript
// EmitManager.js - 타겟팅 메시징
export function Emit(Who, eventName, RoomID, data) {
  const room = GetRoom(RoomID);
  if (Who === "Player") {
    room.players.forEach((player) => {
      const socket = GetSockets_Name(player.sUserID);
      if (socket) socket.emit(eventName, data);
    });
  }
}
```

---

## 주의사항 (Important Notes)

⚠️ **본 포트폴리오는 회사의 부분적 사용 허가를 받아 작성되었습니다.**

- 실제 비즈니스 로직은 일반화/추상화되었습니다
- 민감한 정보(DB 자격증명, API 키 등)는 제거되었습니다
- 실제 서비스 URL 및 도메인 정보는 마스킹 처리되었습니다

---

## 참고 자료 (References)

- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Virtual Hosting](https://expressjs.com/en/guide/using-middleware.html)
- [async-mutex](https://www.npmjs.com/package/async-mutex)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
