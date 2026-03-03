Login 컴포넌트

1. 주요 파일

컴포넌트: Login/Login.js

스타일: Login/Login.scss

전역 상태: store.js

소켓 연결: SocketContext.js

2. 주요 상태 및 훅

useState로 사용자 입력(userId, userPw), 언어 드롭다운 상태, 약관 동의 여부(Term) 관리

useStore를 통해 전역 상태(setToken, setMb_name, setMb_money, setCurrencyType 등) 변경 가능

useSocket으로 서버와 WebSocket 연결 관리

useNavigate, useLocation, useNavigationType으로 라우팅 및 페이지 이동 제어

3. 초기화 로직

페이지 진입 시 navType === "POP"이면 뒤로 가기 감지로 간주하고, 다음을 실행:

localStorage 및 sessionStorage 값 초기화 (id, pw, roomid, lobby, sUserCode, mb_money, mb_name, mb_multiBet 제거)

기존 소켓 연결 해제 후 다시 연결 (socket.disconnect(), socket.connect())

4. 로그인 로직

사용자 입력 값(userId, userPw)을 이용하여 로그인 요청 전송

서버 연결 여부 확인 후 socket.emit("LoginRequest", { id: userId, pw: userPw }) 실행

서버로부터 응답 수신 시:

성공하면 사용자 정보(sUserID, pass, money, multiBet, sUserCode)를 localStorage 및 store에 저장

navigate("/Lobby")로 페이지 이동