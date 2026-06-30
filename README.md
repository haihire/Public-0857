# 0857 — 모듈화 기반 멀티 호스트 실시간 룸 서버

[![Node.js](https://img.shields.io/badge/Node.js-ES%20Modules-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19.2-lightgrey.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-blue.svg)](https://socket.io/)
[![MySQL](https://img.shields.io/badge/MySQL-mysql2%203.11.3-orange.svg)](https://github.com/sidorares/node-mysql2)
[![License](https://img.shields.io/badge/License-Partial%20Permission-red.svg)]()

> 본 레포는 **공개 가능한 일부분만** 포함하며, 회사의 부분적 사용 허가를 받아 공개된 서버 아키텍처 샘플입니다.

---

## 📌 개요

멀티 호스트(vhost) 기반 실시간 룸 서버를 설계·구현하고, 모놀리식 서버를 **기능별 12개 모듈로 재설계**하여 후속 개발 기간을 약 **50% 단축**한 프로젝트입니다.

- **기간**: 2024.01 ~ 2024.07
- **역할**: 백엔드 개발 / 서버 아키텍처 설계
- 민감정보(DB 계정, 도메인, 포트 매핑 등)는 환경변수·샘플 파일로 대체되어 있습니다.

---

## ✨ 주요 특징

- **멀티 호스트(vhost)** — 단일 서버에서 Main / Dealer / Pad / Control 4가지 클라이언트 타입 동시 지원
- **실시간 양방향 통신** — Socket.IO Room 기반 타겟팅 메시징
- **동시성 제어** — `async-mutex` 기반 사용자별 Lock으로 Race Condition 방지
- **DB 안정성** — MySQL Connection Pool(최대 50) + 재시도 로직
- **하드웨어 통합** — TCP 소켓 기반 시리얼 카드 스캐너 연동
- **모듈화 아키텍처** — 단일 책임 원칙(SRP) 기반 기능별 분리

---

## 🛠 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| Runtime | Node.js (ES Modules) |
| Web Framework | Express.js 4.19.2 |
| Real-time | Socket.IO 4.6.1 |
| Database | MySQL (mysql2 3.11.3, Connection Pool) |
| Concurrency | async-mutex 0.5.0 |
| Security | Helmet.js 7.1.0, Custom CORS Policy |
| Virtual Hosting | vhost 3.0.2 |
| Process | nodemon |

---

## 📂 핵심 모듈 구조

```
server/
├── server.js          # 메인 엔트리포인트 (Express / Socket.IO 설정)
├── Manager.js         # 룸 생성·관리 및 라이프사이클 제어
├── Room.js            # 개별 룸 로직 및 게임 상태 관리
├── RRoom.js           # 베팅 트랜잭션 처리 및 검증
├── URoom.js           # 유저 세션 및 머니 관리
├── EmitManager.js     # 실시간 이벤트 발행·구독 관리
├── Lockmanager.js     # 동시성 제어 (Race Condition 방지)
├── SerialScanner.js   # 하드웨어 통합 (카드 스캐너)
├── SQL.js             # 데이터베이스 레이어 (Connection Pool)
├── Utility.js         # 공통 유틸리티
├── SevUrl.js          # 환경 설정 관리
└── Singleton.js       # 싱글톤 패턴 구현
```

---

## 📐 아키텍처 흐름 (요약)

```
Client (Main/Dealer/Pad/Control)
        │  Socket.IO
        ▼
     server.js
        ├─► EmitManager ──► Room Instance
        └─► Manager ───────┤
                           ├─► RRoom (Betting)
                           ├─► URoom (Users)
                           └─► SerialScanner (Hardware)
```

> 전체 시스템 구조 · 통신 플로우 · 동시성 제어 · 보안 계층 다이어그램은 [ARCHITECTURE.md](./ARCHITECTURE.md) 참고.

---

## 📄 문서

| 문서 | 내용 |
|------|------|
| [PORTFOLIO.md](./PORTFOLIO.md) | 프로젝트 성과·기술 챌린지·코드 샘플 상세 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 시스템 아키텍처 및 다이어그램 |

---

## ⚠️ 주의사항

- 본 코드는 **포트폴리오 목적**으로 공개되었으며, 실제 운영 환경의 민감정보(DB 자격증명, API 키, 서비스 URL/도메인)는 포함되지 않습니다.
- 실제 비즈니스 로직은 일반화·추상화되었습니다.
- 상업적 사용 또는 재배포 시 원 저작권자의 허가가 필요합니다.
