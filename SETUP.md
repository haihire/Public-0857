# 설치 및 설정 가이드 (Installation & Setup Guide)

## 목차 (Table of Contents)
1. [사전 요구사항](#사전-요구사항)
2. [설치](#설치)
3. [환경 설정](#환경-설정)
4. [데이터베이스 설정](#데이터베이스-설정)
5. [실행](#실행)
6. [테스트](#테스트)
7. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항 (Prerequisites)

### 필수 소프트웨어
- **Node.js**: 18.x 이상
- **npm**: 8.x 이상 (Node.js와 함께 설치됨)
- **MySQL**: 5.7 이상 또는 MariaDB 10.x

### 확인 방법
```bash
# Node.js 버전 확인
node --version
# 출력 예시: v18.17.0

# npm 버전 확인
npm --version
# 출력 예시: 9.6.7

# MySQL 버전 확인
mysql --version
# 출력 예시: mysql Ver 8.0.33
```

---

## 설치 (Installation)

### 1. 저장소 클론
```bash
git clone https://github.com/haihire/Pulbic-0857.git
cd Pulbic-0857
```

### 2. 의존성 설치
```bash
cd server
npm install
```

설치되는 주요 패키지:
- `express` - 웹 프레임워크
- `socket.io` - 실시간 통신
- `mysql2` - MySQL 드라이버
- `async-mutex` - 동시성 제어
- `helmet` - 보안 헤더
- `cors` - CORS 설정

---

## 환경 설정 (Environment Configuration)

### 1. 환경 변수 파일 생성
```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env
```

### 2. .env 파일 수정
```bash
# 텍스트 에디터로 .env 파일 열기
nano .env
# 또는
vim .env
# 또는
code .env
```

### 3. 필수 환경 변수 설정
```env
# 서버 설정
SERVER_URL=localhost
SERVER_PORT=7771
EXPRESS_PORT=3000
SCANNER_PORT=8806

# Virtual Host 설정 (개발 환경에서는 localhost 사용 가능)
VHOST_MAIN=localhost
VHOST_DEALER=localhost
VHOST_PAD=localhost
VHOST_CTRL=localhost

# 데이터베이스 설정 (실제 값으로 변경 필요!)
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=baccarat
DB_PORT=3306

# 환경
NODE_ENV=development
```

⚠️ **보안 주의사항**:
- `.env` 파일은 절대 Git에 커밋하지 마세요!
- 운영 환경에서는 강력한 비밀번호를 사용하세요.
- 가능하면 환경 변수 관리 도구(AWS Secrets Manager, HashiCorp Vault 등)를 사용하세요.

---

## 데이터베이스 설정 (Database Setup)

### 1. MySQL 접속
```bash
mysql -u root -p
```

### 2. 데이터베이스 생성
```sql
CREATE DATABASE baccarat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE baccarat;
```

### 3. 사용자 생성 및 권한 부여 (선택사항)
```sql
-- 새 사용자 생성
CREATE USER 'baccarat_user'@'localhost' IDENTIFIED BY 'strong_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON baccarat.* TO 'baccarat_user'@'localhost';

-- 권한 적용
FLUSH PRIVILEGES;
```

### 4. 테이블 스키마 생성
⚠️ 주의: 실제 스키마는 비공개입니다. 포트폴리오 목적으로 필요한 경우 최소한의 스키마만 생성하세요.

```sql
-- 예시 테이블 (실제 구조는 다를 수 있음)
CREATE TABLE tb_baccarat_room (
    room_id VARCHAR(50) PRIMARY KEY,
    sRoomNumber VARCHAR(10),
    active TINYINT DEFAULT 1,
    status VARCHAR(20)
);

-- 추가 테이블들...
```

---

## 실행 (Running the Server)

### 개발 모드 (Development Mode)
```bash
cd server
npm start
```

이는 `nodemon`을 사용하여 파일 변경 시 자동으로 서버를 재시작합니다.

### 프로덕션 모드 (Production Mode)
```bash
# NODE_ENV 설정
export NODE_ENV=production

# 직접 실행
node server.js

# 또는 PM2 사용 (권장)
npm install -g pm2
pm2 start server.js --name "baccarat-server"
pm2 save
pm2 startup
```

### 서버 확인
서버가 정상적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
Baccarat SERVER IS RUNNING7771
```

### 포트 확인
```bash
# 포트가 사용 중인지 확인
lsof -i :7771
lsof -i :3000
lsof -i :8806
```

---

## 테스트 (Testing)

### 서버 연결 테스트

#### 1. HTTP 엔드포인트 테스트
```bash
# Express 서버 테스트
curl http://localhost:3000

# 또는 브라우저에서
# http://localhost:3000
```

#### 2. Socket.IO 연결 테스트
간단한 HTML 테스트 파일을 생성:
```html
<!-- test-socket.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Socket.IO Test</title>
    <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
</head>
<body>
    <h1>Socket.IO Connection Test</h1>
    <div id="status">Connecting...</div>
    <script>
        const socket = io('http://localhost:7771');
        
        socket.on('connect', () => {
            document.getElementById('status').innerText = 'Connected!';
            console.log('Socket connected:', socket.id);
        });
        
        socket.on('disconnect', () => {
            document.getElementById('status').innerText = 'Disconnected';
        });
    </script>
</body>
</html>
```

브라우저에서 이 파일을 열어 연결을 테스트합니다.

---

## 트러블슈팅 (Troubleshooting)

### 문제 1: 포트가 이미 사용 중
**증상**: `EADDRINUSE` 오류
```
Error: listen EADDRINUSE: address already in use :::7771
```

**해결방법**:
```bash
# 해당 포트를 사용하는 프로세스 찾기
lsof -i :7771

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
# .env 파일에서 SERVER_PORT 변경
```

### 문제 2: 데이터베이스 연결 실패
**증상**: `ECONNREFUSED` 또는 `ER_ACCESS_DENIED_ERROR`

**해결방법**:
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 시작
sudo systemctl start mysql

# .env 파일의 DB 설정 확인
cat .env | grep DB_
```

### 문제 3: 모듈을 찾을 수 없음
**증상**: `Cannot find module 'xxx'`

**해결방법**:
```bash
# node_modules 제거 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm cache clean --force
npm install
```

### 문제 4: ES6 Module 오류
**증상**: `SyntaxError: Cannot use import statement outside a module`

**해결방법**:
`package.json`에 다음이 포함되어 있는지 확인:
```json
{
  "type": "module"
}
```

### 문제 5: CORS 오류
**증상**: 브라우저 콘솔에 CORS 관련 오류

**해결방법**:
1. `server.js`의 `allowedOrigins` 배열에 클라이언트 URL 추가
2. 개발 환경에서는 CORS를 일시적으로 완전히 허용:
```javascript
const corsOptions = {
  origin: '*',  // 개발 전용!
  credentials: true
};
```

---

## 로그 확인 (Logging)

### 서버 로그
```bash
# nodemon 사용 시 실시간 로그 확인
npm start

# PM2 사용 시
pm2 logs baccarat-server

# 로그 파일 확인 (있는 경우)
tail -f server/error_log.txt
```

---

## 개발 팁 (Development Tips)

### 1. 핫 리로드 (Hot Reload)
`nodemon`이 자동으로 파일 변경을 감지하여 서버를 재시작합니다.

### 2. 디버깅
```bash
# Chrome DevTools를 사용한 디버깅
node --inspect server.js

# 브라우저에서 chrome://inspect 접속
```

### 3. 환경별 설정
```bash
# 개발 환경
NODE_ENV=development npm start

# 테스트 환경
NODE_ENV=test npm start

# 프로덕션 환경
NODE_ENV=production npm start
```

---

## 다음 단계 (Next Steps)

1. **[아키텍처 문서](./ARCHITECTURE.md)** 읽기 - 시스템 구조 이해
2. **[포트폴리오 가이드](./PORTFOLIO.md)** 읽기 - 프로젝트 상세 내용
3. **코드 탐색** - 각 모듈의 역할과 구현 방식 학습

---

## 지원 (Support)

문제가 발생하거나 질문이 있으시면:
1. 이 문서의 트러블슈팅 섹션 확인
2. GitHub Issues 확인
3. 새로운 Issue 생성

---

**Happy Coding! 🚀**
