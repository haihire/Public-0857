# Pulbic-0857 — 모듈화 프로젝트 (Modularization Project)

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-blue.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Partial%20Permission-orange.svg)]()

해당 Repo 는 공개가능한 일부분만을 포함하고 있습니다.

# 0857 Server — 모듈화 기반 멀티 호스트 실시간 룸 서버

## 개요

본 레포는 회사의 부분적 사용 허가를 받아 공개된 서버 아키텍처 샘플입니다.
민감정보(DB 계정, 도메인, 포트 매핑 등)는 환경변수·샘플 파일로 대체되어 있습니다.

## 주요 특징

- 멀티 호스트(vhost) 기반 실시간 룸 서버
- 기능별 모듈화로 재사용성·유지보수성 확보
- Socket.IO 기반 실시간 통신
- MySQL 연결 풀 및 재시도 로직
- 시리얼 스캐너 연동(SerialScanner.js)

## 주의사항

- 본 코드는 포트폴리오 목적으로 공개되었으며, 실제 운영 환경의 민감정보는 포함되지 않습니다.
- 상업적 사용 또는 재배포 시 원 저작권자의 허가가 필요합니다.
