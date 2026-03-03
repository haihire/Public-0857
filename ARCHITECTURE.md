# 시스템 아키텍처 (System Architecture)

## 전체 시스템 구조 (Overall System Structure)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Main    │  │  Dealer  │  │   Pad    │  │  Control │       │
│  │ (Users)  │  │ (Dealer) │  │ (Display)│  │  (Admin) │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        │          Socket.IO (Real-time Communication)
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼──────────────┐
│                     Application Layer                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              server.js (Main Server)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ Express.js │  │ Socket.IO  │  │  vhost     │        │   │
│  │  │  (REST)    │  │  (WS)      │  │ (Routing)  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              Manager.js (Core Orchestrator)              │   │
│  │  • Room Lifecycle Management                             │   │
│  │  • Dynamic Room Creation/Deletion                        │   │
│  │  • Global State Coordination                             │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                 Business Logic Layer                     │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Room.js   │  │  RRoom.js  │  │  URoom.js  │        │   │
│  │  │  (Game)    │  │  (Betting) │  │  (Users)   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │EmitManager │  │LockManager │  │SerialScanner│       │   │
│  │  │ (Events)   │  │(Concurrency│  │ (Hardware) │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └───────────────────────────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              Data Access Layer                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  SQL.js    │  │ Utility.js │  │ SevUrl.js  │        │   │
│  │  │  (DB)      │  │  (Common)  │  │  (Config)  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └───────────────────────────────────────────────────────┘   │
└───────┬──────────────────────────────────────┬───────────────┘
        │                                       │
┌───────▼───────────────────────────┐  ┌───────▼───────────────┐
│    Database Layer (MySQL)         │  │   Hardware Layer      │
│  • Connection Pool                 │  │  • Card Scanner       │
│  • Transaction Management          │  │  • TCP Socket Comm.   │
└────────────────────────────────────┘  └───────────────────────┘
```

---

## 멀티 호스트 아키텍처 (Multi-Host Architecture)

### Virtual Host 라우팅 구조
```
                    Incoming Request
                          │
                          ▼
                ┌─────────────────┐
                │   Main Server   │
                │   (Express +    │
                │    vhost)       │
                └────────┬────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
    │main.*.com │  │dealer.*.com│ │pad.*.com│
    │           │  │           │  │          │
    │  Static   │  │  Static   │  │  Static  │
    │  Files    │  │  Files    │  │  Files   │
    └───────────┘  └───────────┘  └──────────┘
```

**특징**:
- 단일 서버에서 여러 도메인/서브도메인 처리
- 각 클라이언트 타입별 독립적인 정적 파일 제공
- CORS 정책 중앙 관리

---

## 실시간 통신 플로우 (Real-time Communication Flow)

### Socket.IO 이벤트 흐름
```
  User Action               Server Processing              Room Update
      │                           │                            │
      │   LoginRequest            │                            │
      ├──────────────────────────►│                            │
      │                           │ Authentication             │
      │                           │ User Session Create        │
      │                           │ Lock Acquire              │
      │                           │                            │
      │   LoginSuccess            │                            │
      │◄──────────────────────────┤                            │
      │                           │                            │
      │   EnterRoom               │                            │
      ├──────────────────────────►│                            │
      │                           │ Room.EnterRoom()           │
      │                           ├───────────────────────────►│
      │                           │                            │ Add Player
      │                           │                            │ Update State
      │                           │◄───────────────────────────┤
      │   EnterSuccess            │                            │
      │◄──────────────────────────┤                            │
      │                           │                            │
      │   MoneyCheck (Bet)        │                            │
      ├──────────────────────────►│                            │
      │                           │ Lock Acquire (per user)   │
      │                           │ Validate Money            │
      │                           │ Room.Betting()            │
      │                           ├───────────────────────────►│
      │                           │                            │ Update Bets
      │                           │                            │ Calculate Total
      │                           │◄───────────────────────────┤
      │   OkBet                   │                            │
      │◄──────────────────────────┤                            │
      │                           │ Emit to All Players       │
      │   change_betting          │ (via EmitManager)         │
      │◄──────────────────────────┤                            │
```

### EmitManager를 통한 이벤트 전파
```
                     ┌──────────────┐
                     │ EmitManager  │
                     │  Emit(...)   │
                     └──────┬───────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
      ┌────▼────┐      ┌───▼────┐      ┌───▼────┐
      │ Player1 │      │Player2 │      │ Dealer │
      │ Socket  │      │Socket  │      │ Socket │
      └─────────┘      └────────┘      └────────┘
```

**타겟팅 옵션**:
- `"Player"`: 룸의 모든 플레이어에게 전송
- `"Dealer"`: 딜러에게만 전송
- `"All"`: 플레이어 + 딜러 전체에게 전송

---

## 동시성 제어 아키텍처 (Concurrency Control Architecture)

### Lockmanager를 통한 사용자별 Lock
```
Multiple Concurrent Requests
     │         │         │
     │ User A  │ User B  │ User A
     │ Bet     │ Bet     │ Bet
     │         │         │
     ▼         ▼         ▼
┌────────────────────────────┐
│      Lockmanager.js        │
│                            │
│  UserLocks: {              │
│    "userA": Mutex,         │
│    "userB": Mutex          │
│  }                         │
└────────────────────────────┘
     │         │         │
     │ Lock A  │ Lock B  │ Wait...
     │ ✓       │ ✓       │
     ▼         ▼         │
┌─────────┐ ┌─────────┐ │
│Execute A│ │Execute B│ │
│  Bet    │ │  Bet    │ │
└────┬────┘ └────┬────┘ │
     │Release    │Release│
     ▼           ▼       ▼
     ✓           ✓    Lock A ✓
                      Execute...
```

**동작 원리**:
1. 각 사용자(sUserID)별로 독립적인 Mutex Lock 생성
2. 동일 사용자의 요청은 순차 처리 (Queue)
3. 다른 사용자의 요청은 병렬 처리 가능
4. Race Condition 방지, 데이터 무결성 보장

---

## Room 라이프사이클 (Room Lifecycle)

```
┌─────────────┐
│   Create    │  Manager.CreateRoom()
│             │  • Room instance 생성
└──────┬──────┘  • Scanner 초기화
       │         • DB limit 설정
       │
       ▼
┌─────────────┐
│   Ready     │  Room.Ready()
│             │  • 카드 초기화
└──────┬──────┘  • 타이머 설정
       │
       │
       ▼
┌─────────────┐
│   Start     │  Room.Start()
│             │  • 게임 시작
└──────┬──────┘  • 베팅 시간 시작
       │
       │
       ▼
┌─────────────┐
│   Betting   │  • 사용자 베팅 접수
│   Time      │  • 실시간 베팅액 업데이트
└──────┬──────┘
       │
       │
       ▼
┌─────────────┐
│   Game      │  • 카드 분배
│   Playing   │  • 결과 계산
└──────┬──────┘
       │
       │
       ▼
┌─────────────┐
│   Result    │  Room.resultWinner()
│   Winner    │  • 승패 결정
└──────┬──────┘  • 배당 계산 및 지급
       │         • DB 로그 저장
       │
       │
       ▼
┌─────────────┐
│   Shuffle?  │  • 카드 부족 시
│             │    Room.Shuffle()
└──────┬──────┘
       │
       │
       └──────► Back to Ready
```

---

## 데이터베이스 연동 (Database Integration)

### Connection Pool 패턴
```
                 ┌──────────────────┐
    Request 1 ───┤                  │
    Request 2 ───┤  Connection Pool ├─── Connection 1
    Request 3 ───┤   (MySQL2)       ├─── Connection 2
    Request 4 ───┤   Max: 50        ├─── Connection 3
                 │   Timeout: 10s   │    ...
                 └──────────────────┘
```

**장점**:
- 연결 재사용으로 성능 향상
- 동시 요청 처리 능력 향상
- 연결 수 제한으로 DB 부하 관리

### Retry 메커니즘
```
SQL Query
   │
   ▼
Execute
   │
   ├─ Success ─────────► Return Result
   │
   ├─ Error ──► Retry (Wait 1s) ──┐
   │                               │
   └◄──────────────────────────────┘
   │
   ├─ Success ─────────► Return Result
   │
   └─ Error (Max Retries) ────► Throw Error
```

---

## 하드웨어 통합 (Hardware Integration)

### Serial Scanner 통신 구조
```
Physical Card Scanner
        │
        │ Serial Port
        │
        ▼
  TCP Socket Server
  (Port: 8800-8899)
        │
        │ Buffer Data
        │ 0x05...0x05
        ▼
SerialScanner.js
        │
        ├─ Parse Buffer
        ├─ Convert to Card Data
        └─ Extract Winner Info
        │
        ▼
    Room.js
        │
        └─ resultWinner()
```

**특징**:
- 각 Room마다 독립적인 Scanner Server
- Buffer 기반 프로토콜 파싱
- 실시간 카드 인식 및 결과 처리

---

## 보안 아키텍처 (Security Architecture)

### 다층 보안 구조
```
┌────────────────────────────────────────┐
│  1. Network Layer                      │
│     • CORS Policy                      │
│     • Allowed Origins Whitelist        │
│     • Helmet.js (Security Headers)     │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│  2. Application Layer                  │
│     • Token Verification               │
│     • Session Management               │
│     • Rate Limiting (Ping/Pong)        │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│  3. Business Logic Layer               │
│     • Input Validation                 │
│     • Money Check (Balance)            │
│     • Betting Limit Check              │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│  4. Data Layer                         │
│     • SQL Injection Prevention         │
│     • Parameterized Queries            │
│     • Transaction Isolation            │
└────────────────────────────────────────┘
```

---

## 확장성 고려사항 (Scalability Considerations)

### 수평 확장 가능 구조
```
    Load Balancer
         │
    ┌────┼────┐
    │    │    │
  ┌─▼─┐┌─▼─┐┌─▼─┐
  │ S1 ││ S2 ││ S3 │  (Server Instances)
  └─┬─┘└─┬─┘└─┬─┘
    └────┼────┘
         │
    ┌────▼────┐
    │  Redis  │  (Session Store)
    └────┬────┘
         │
    ┌────▼────┐
    │  MySQL  │  (Database)
    └─────────┘
```

**현재 구조의 확장 가능성**:
- ✅ 모듈화된 구조로 마이크로서비스 전환 용이
- ✅ Room 단위 독립성으로 샤딩 가능
- ⚠️ Session 관리 Redis 도입 필요
- ⚠️ Socket.IO Adapter (Redis) 필요

---

## 성능 최적화 포인트 (Performance Optimization)

1. **Connection Pooling**: DB 연결 재사용
2. **Lock Granularity**: 사용자별 세밀한 Lock
3. **Event Targeting**: EmitManager로 필요한 클라이언트에만 전송
4. **Buffering**: Scanner 데이터 버퍼링
5. **Async/Await**: 비동기 처리로 블로킹 최소화

---

이 아키텍처는 **확장 가능하고**, **유지보수 가능하며**, **안정적인** 실시간 멀티 룸 서버를 구현합니다.
