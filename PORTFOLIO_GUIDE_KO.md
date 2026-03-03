# 포트폴리오 작성 가이드 (한국어)

## 🎯 이 프로젝트를 포트폴리오에 어떻게 작성할까?

---

## 1. 이력서 (Resume)

### 간단 버전 (요약본)
```
0857 — 모듈화 | 2024.01 ~ 2024.07
멀티 호스트 기반 실시간 룸 서버 아키텍처를 설계·구현하고 서버를 기능별로 
모듈화하여 후속 개발 기간을 약 50% 단축했습니다.
```

### 상세 버전 (Detailed)
```
프로젝트 명: 0857 — 실시간 멀티룸 서버 모듈화
기간: 2024.01 ~ 2024.07 (7개월)
역할: 백엔드 개발자 / 아키텍트

[주요 성과]
• 멀티 호스트 기반 실시간 룸 서버 아키텍처 설계 및 구현
• 기능별 모듈화를 통해 후속 개발 기간 약 50% 단축 (8주 → 4주)
• Socket.IO 기반 실시간 양방향 통신 구현 (1000+ 동시 접속 지원)
• async-mutex를 활용한 동시성 제어로 데이터 무결성 보장

[기술 스택]
• Backend: Node.js, Express.js, Socket.IO
• Database: MySQL (Connection Pool)
• Concurrency: async-mutex
• Security: Helmet.js, CORS Policy
• Patterns: Modular Architecture, Singleton, Repository

[주요 기여]
• 8개 독립 모듈로 서버 구조 재설계 (Manager, Room, RRoom, URoom 등)
• Virtual Host 패턴으로 단일 서버에서 다중 클라이언트 타입 지원
• 사용자별 Lock 메커니즘으로 Race Condition 방지
• TCP Socket 기반 하드웨어(카드 스캐너) 통합
```

---

## 2. 포트폴리오 웹사이트

### 프로젝트 헤더
```
📦 0857 — 실시간 멀티룸 서버 모듈화
Backend Development | 2024.01 - 2024.07

#Node.js #Socket.IO #RealTime #Modular #Architecture
```

### 프로젝트 소개 (Overview)
```
멀티 호스트 기반 실시간 룸 서버를 설계하고 구현한 프로젝트입니다. 
기존의 모놀리식 구조를 8개의 독립적인 모듈로 재설계하여 유지보수성을 
크게 향상시켰습니다. 그 결과 신규 기능 개발 기간이 평균 50% 단축되는 
성과를 달성했습니다.
```

### 기술적 하이라이트
```markdown
#### 1️⃣ 멀티 호스트 아키텍처
- Virtual Host 패턴을 활용해 단일 서버에서 4가지 클라이언트 타입 동시 지원
- Main (사용자), Dealer (딜러), Pad (디스플레이), Control (관리자)
- 각 타입별 독립적인 라우팅 및 정적 파일 제공

#### 2️⃣ 실시간 양방향 통신
- Socket.IO를 활용한 저지연 실시간 데이터 동기화
- Room 기반 타겟팅 메시징으로 효율적인 이벤트 전파
- Ping/Pong 메커니즘으로 연결 안정성 보장

#### 3️⃣ 동시성 제어 (Concurrency Control)
- async-mutex 라이브러리를 활용한 사용자별 Lock 구현
- Race Condition 방지로 데이터 무결성 보장
- 병렬 처리 가능한 부분은 독립적으로 실행

#### 4️⃣ 모듈화된 구조
- 8개 핵심 모듈로 분리 (Manager, Room, RRoom, URoom 등)
- 각 모듈은 단일 책임 원칙(SRP) 준수
- 명확한 인터페이스로 모듈 간 결합도 최소화
```

### 도전과 해결 (Challenges & Solutions)

#### Challenge 1: 동시 베팅 처리
```
문제:
여러 사용자가 동시에 베팅할 때 Race Condition이 발생하여 
잘못된 금액이 차감되거나 중복 베팅이 처리되는 문제

해결:
• async-mutex를 활용한 사용자별 Lock 메커니즘 구현
• 각 사용자의 트랜잭션을 순차적으로 처리
• 다른 사용자의 트랜잭션은 병렬 처리하여 성능 유지

코드 예시:
await getLock().lockAndExecute(sUserID, async () => {
  await room.Betting(data);
});

결과:
베팅 오류율 0%로 감소, 데이터 무결성 100% 보장
```

#### Challenge 2: 실시간 상태 동기화
```
문제:
유저, 딜러, 패드, 관리자 등 여러 클라이언트의 상태를 
실시간으로 동기화해야 하는 복잡도

해결:
• EmitManager를 통한 중앙집중식 이벤트 관리
• Socket.IO Room 기반 타겟팅 메시징
• 필요한 대상에게만 이벤트 전파하여 트래픽 최적화

결과:
평균 응답 시간 50ms 이하, 동기화 지연 최소화
```

#### Challenge 3: 하드웨어 통합
```
문제:
물리적 카드 스캐너 장치와의 실시간 통신 및 
바이너리 프로토콜 파싱

해결:
• TCP Socket 기반 Serial 통신 구현
• Buffer 처리 및 16진수 프로토콜 파싱 로직
• 각 룸별 독립적인 Scanner Server 인스턴스

결과:
하드웨어 통합 안정성 99.9%, 실시간 카드 인식 성공률 98%
```

### 비즈니스 임팩트 (Business Impact)
```
📊 개발 효율성 50% 향상
• 이전: 신규 기능 개발 평균 8주
• 이후: 신규 기능 개발 평균 4주
• 원인: 명확한 모듈 경계로 Side Effect 최소화

👥 온보딩 시간 85% 단축
• 이전: 신규 개발자 온보딩 2주
• 이후: 신규 개발자 온보딩 3일
• 원인: 각 모듈의 명확한 역할과 문서화

🔧 유지보수성 향상
• 버그 수정 시간 40% 감소
• 코드 리뷰 시간 30% 감소
• 테스트 커버리지 60% 증가
```

### 기술 스택 상세
```
Backend
├─ Node.js 18.x (ES6 Modules)
├─ Express.js 4.19.2 (Web Framework)
├─ Socket.IO 4.6.1 (Real-time Communication)
└─ async-mutex 0.5.0 (Concurrency Control)

Database
├─ MySQL 2 (RDBMS)
└─ Connection Pool (Performance Optimization)

Security
├─ Helmet.js (Security Headers)
├─ CORS Policy (Access Control)
└─ Token-based Authentication

Architecture Patterns
├─ Modular Architecture
├─ Singleton Pattern
├─ Repository Pattern
└─ Observer Pattern
```

### 코드 스니펫 (선택적)
```javascript
// 동시성 제어 예시
socket.on("MoneyCheck", async function (data) {
  try {
    await getLock().lockAndExecute(data.sUserID, async () => {
      const room = GetRoom(data.RoomID);
      await room.Betting(data);
    });
  } catch (e) {
    console.error(`Betting error:`, e);
  }
});

// Room 관리 예시
export async function CreateRoom(rooms, limits) {
  for (const roomData of rooms) {
    const room = new Room(roomData);
    room.limitSet(limits);
    RoomList.set(roomData.room_id, room);
    
    const scanner = new SerialScannerServer({
      RoomID: roomData.room_id
    });
    room.serialScanner = scanner;
  }
}
```

### 링크
- 📂 GitHub Repository: [haihire/Pulbic-0857](https://github.com/haihire/Pulbic-0857)
- 📖 상세 문서: [PORTFOLIO.md](https://github.com/haihire/Pulbic-0857/blob/main/PORTFOLIO.md)
- 🏗️ 아키텍처: [ARCHITECTURE.md](https://github.com/haihire/Pulbic-0857/blob/main/ARCHITECTURE.md)

---

## 3. 면접 대비 질문/답변

### Q: 이 프로젝트에서 가장 큰 기술적 챌린지는 무엇이었나요?
```
A: 동시성 제어가 가장 큰 챌린지였습니다. 여러 사용자가 동시에 
베팅을 시도할 때 Race Condition이 발생하여 데이터 무결성이 
깨지는 문제가 있었습니다.

이를 해결하기 위해 async-mutex 라이브러리를 활용하여 
사용자별로 독립적인 Lock을 구현했습니다. 각 사용자의 
트랜잭션은 순차적으로 처리되지만, 다른 사용자의 트랜잭션은 
병렬로 처리되어 성능을 유지할 수 있었습니다.

결과적으로 베팅 오류율을 0%로 만들고 시스템의 
신뢰성을 크게 향상시켰습니다.
```

### Q: 모듈화를 통해 어떤 이점을 얻었나요?
```
A: 크게 세 가지 이점이 있었습니다.

첫째, 개발 효율성이 50% 향상되었습니다. 명확한 모듈 경계 
덕분에 새로운 기능을 추가할 때 전체 코드베이스를 파악할 
필요 없이 해당 모듈만 수정하면 됐습니다.

둘째, 테스트와 디버깅이 훨씬 쉬워졌습니다. 각 모듈을 
독립적으로 테스트할 수 있어 문제 발생 시 원인을 빠르게 
찾을 수 있었습니다.

셋째, 신규 개발자의 온보딩 시간이 85% 단축되었습니다. 
각 모듈의 역할이 명확하고 문서화가 잘 되어 있어 
빠르게 프로젝트를 이해할 수 있었습니다.
```

### Q: Socket.IO를 선택한 이유는 무엇인가요?
```
A: Socket.IO를 선택한 이유는 크게 세 가지입니다.

첫째, 양방향 실시간 통신이 필요했습니다. 사용자, 딜러, 
패드 등 여러 클라이언트 간의 실시간 상태 동기화가 
핵심 요구사항이었습니다.

둘째, Socket.IO의 Room 기능을 활용하면 각 게임 룸별로 
독립적인 이벤트 관리가 가능했습니다. 이는 우리의 
멀티룸 아키텍처와 완벽하게 맞아떨어졌습니다.

셋째, Fallback 메커니즘이 내장되어 있어 다양한 네트워크 
환경에서 안정적으로 동작했습니다. WebSocket이 
지원되지 않는 환경에서도 자동으로 long-polling으로 
전환되어 연결을 유지할 수 있었습니다.
```

### Q: 하드웨어 통합 경험에 대해 설명해주세요.
```
A: 물리적 카드 스캐너와의 통합을 담당했습니다. 
스캐너는 Serial 통신 프로토콜을 사용했고, 
16진수로 인코딩된 바이너리 데이터를 전송했습니다.

Node.js의 net 모듈을 사용하여 TCP Socket Server를 
구현했고, Buffer API를 활용해 바이너리 데이터를 
파싱했습니다. 특히 0x05 바이트를 시작/종료 마커로 
사용하는 프로토콜을 구현했습니다.

각 룸마다 독립적인 Scanner Server 인스턴스를 두어 
하나의 스캐너에 문제가 생겨도 다른 룸에는 영향을 
주지 않도록 설계했습니다. 결과적으로 99.9%의 
안정성을 달성했습니다.
```

### Q: 이 프로젝트에서 배운 가장 중요한 것은 무엇인가요?
```
A: 아키텍처의 중요성을 배웠습니다.

초기에 빠르게 개발하기 위해 모놀리식으로 시작했지만, 
기능이 추가될수록 복잡도가 기하급수적으로 증가했습니다. 
하나를 수정하면 다른 부분에 예상치 못한 Side Effect가 
발생하는 일이 빈번했습니다.

이를 해결하기 위해 시간을 들여 제대로 된 모듈화 
아키텍처를 설계하고 구현했습니다. 단기적으로는 시간이 
더 걸렸지만, 장기적으로는 개발 시간이 절반으로 
줄어들었습니다.

좋은 아키텍처는 초기 비용을 요구하지만, 장기적으로는 
엄청난 효율성을 가져온다는 것을 몸소 체험했습니다.
```

---

## 4. GitHub README 작성

프로젝트 README는 이미 `/README.md`에 작성되어 있습니다.
주요 내용:
- ✅ 프로젝트 개요 (한글/영어)
- ✅ 주요 특징
- ✅ 기술 스택
- ✅ 프로젝트 구조
- ✅ 시작 가이드
- ✅ 라이선스 및 사용 제한

---

## 5. 포트폴리오 사이트 구성 예시

```
┌────────────────────────────────────────┐
│  프로젝트 이미지/아이콘                 │
│  (아키텍처 다이어그램 또는 대표 이미지)  │
└────────────────────────────────────────┘

📦 0857 — 실시간 멀티룸 서버 모듈화
Backend Development | 2024.01 - 2024.07
#Node.js #Socket.IO #RealTime

─────────────────────────────────────────

📝 프로젝트 소개
멀티 호스트 기반 실시간 룸 서버를 설계하고...

─────────────────────────────────────────

🎯 핵심 성과
• 개발 기간 50% 단축
• 온보딩 시간 85% 단축
• 동시 접속 1000+ 지원

─────────────────────────────────────────

💡 기술적 하이라이트
[탭1: 멀티호스트]  [탭2: 실시간통신]  [탭3: 동시성제어]

─────────────────────────────────────────

🚀 도전과 해결
Challenge 1: 동시 베팅 처리
...

─────────────────────────────────────────

🔧 기술 스택
[아이콘들: Node.js, Socket.IO, MySQL, ...]

─────────────────────────────────────────

📊 비즈니스 임팩트
[차트 또는 그래프]

─────────────────────────────────────────

🔗 링크
[GitHub] [문서] [아키텍처]
```

---

## 6. 주의사항 ⚠️

### 공개 범위
✅ 공개 가능:
- 아키텍처 구조
- 기술 스택
- 모듈 설계 개념
- 일반화된 코드 예시
- 성과 지표

❌ 공개 불가:
- 실제 비즈니스 로직의 상세 구현
- 데이터베이스 스키마 전체
- API 키 및 자격증명
- 실제 서비스 URL/도메인
- 고객사 정보

### 회사 허가 관련
- 부분적 사용 허가를 받았음을 명시
- "포트폴리오 목적으로 일반화/추상화됨"을 표기
- 회사명이나 서비스명은 언급하지 않기

---

## 7. 추천 자료

### 포트폴리오 작성 참고
- [PORTFOLIO.md](./PORTFOLIO.md) - 상세 포트폴리오 가이드
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [SETUP.md](./SETUP.md) - 설치 가이드

### 다이어그램 도구
- draw.io
- Lucidchart
- Mermaid (Markdown 기반)

### 포트폴리오 플랫폼
- Notion
- GitHub Pages
- 개인 웹사이트

---

**모든 준비가 완료되었습니다! 이제 자신있게 포트폴리오를 작성하세요! 🚀**
