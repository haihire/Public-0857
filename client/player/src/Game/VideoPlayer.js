import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import axios from "axios";
import "./VideoPlayer.scss";
import { useStore } from "../store";
const VideoPlayer = ({ plus, roomId, roomType }) => {
  const { sound } = useStore((state) => state);

  const videoRef = useRef(null);
  const ivsVideoRef = useRef(null);
  const playerRef = useRef(null);
  const stageRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // 비디오 프레임 조정 함수

  // IVS 초기화
  const initializeStage = async (roomId) => {
    console.log(`[IVS] initializeStage 시작. roomId: ${roomId}`);
    // stageRef에 기존 인스턴스가 있다면 먼저 정리합니다.
    if (stageRef.current) {
      console.log("[IVS] 기존 Stage 인스턴스 정리 시도.");
      await stageRef.current.leave();
      stageRef.current = null;
      console.log("[IVS] 기존 Stage 인스턴스 정리 완료.");
    }

    try {
      // 1. 새로운 API 엔드포인트에서 Stage의 ARN을 가져옵니다.
      console.log("[IVS] 1. Stage ARN 요청 시작.");
      const arnResponse = await axios.post(
        "https://ivs.so-broadcast.com/get_stage_arn",
        {
          room_id: roomId,
        }
      );
      const stageArn = arnResponse.data.arn;
      console.log(`[IVS] 1. Stage ARN 수신 완료: ${stageArn}`);

      if (!stageArn) {
        console.error("[IVS] Stage ARN을 받아오지 못했습니다.");
        setIsLoading(false);
        return;
      }

      // 2. 받아온 ARN을 사용하여 참여 '토큰'을 요청합니다.
      console.log("[IVS] 2. 참여 토큰 요청 시작.");
      const tokenResponse = await axios.post(
        "https://ivs.so-broadcast.com/create_token",
        {
          arn: stageArn,
          user_id: "user",
          duration: 1440,
          capabilities: [],
        }
      );
      const token = tokenResponse.data.token;
      console.log(`[IVS] 2. 참여 토큰 수신 완료: ${token ? "성공" : "실패"}`);

      if (!token) {
        console.error("[IVS] 참여 토큰을 받아오지 못했습니다.");
        setIsLoading(false);
        return;
      }

      // 3. IVS Broadcast Client SDK를 사용하여 Stage에 참여합니다.
      console.log("[IVS] 3. Stage 참여 시작.");
      const { Stage, StageEvents, SubscribeType } = window.IVSBroadcastClient;

      const strategy = {
        audioTrack: undefined,
        videoTrack: undefined,

        updateTracks(newAudioTrack, newVideoTrack) {
          this.audioTrack = newAudioTrack;
          this.videoTrack = newVideoTrack;
        },

        stageStreamsToPublish() {
          return [this.audioTrack, this.videoTrack].filter(Boolean);
        },

        shouldPublishParticipant(participant) {
          return true;
        },

        shouldSubscribeToParticipant(participant) {
          return SubscribeType.AUDIO_VIDEO;
        },
      };

      const stage = new Stage(token, strategy);
      stageRef.current = stage;

      stage.on(
        StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED,
        (participant, streams) => {
          console.log("[IVS] 스트림 추가됨. 비디오를 연결합니다.");
          const videoStream = streams.find(
            (stream) => stream.mediaStreamTrack.kind === "video"
          );
          if (videoStream && ivsVideoRef.current) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(videoStream.mediaStreamTrack);
            ivsVideoRef.current.srcObject = mediaStream;
            setIsLoading(false);
            console.log("[IVS] 비디오 연결 성공.");
          }
        }
      );

      stage.on(StageEvents.ERROR, (error) => {
        console.error("[IVS] Stage SDK 에러:", error);
      });

      await stage.join();
      console.log("[IVS] Stage Join 완료.");
    } catch (error) {
      console.error("[IVS] 초기화 중 오류 발생:", error);
      if (error.response) {
        // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
        console.error("   - 에러 데이터:", error.response.data);
        console.error("   - 에러 상태:", error.response.status);
        console.error("   - 에러 헤더:", error.response.headers);
      } else if (error.request) {
        // 요청이 이루어 졌으나 응답을 받지 못했습니다.
        console.error("   - 응답 없음:", error.request);
      } else {
        // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
        console.error("   - 요청 설정 오류:", error.message);
      }
      setIsLoading(false);
    }
    // finally 블록에서 setIsLoading(false)를 제거하여, 성공적으로 스트림을 받을 때만 로딩이 끝나도록 합니다.
  };

  // Video.js 초기화 (Ant Media)
  const initializeVideoJS = async (roomId) => {
    // playerRef에 기존 플레이어 인스턴스가 있다면 먼저 제거합니다.
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // videoRef.current (video 태그)가 없으면 함수를 종료합니다.
    if (!videoRef.current) return;

    try {
      // 1. 서버에 POST 요청을 보내 스트림 ID를 가져옵니다.
      //    - 제공된 코드의 'arn_token'을 'roomId' prop으로 대체했습니다.
      const response = await axios.post(
        "https://ivs.so-broadcast.com/get_ant_token",
        {
          room_id: roomId,
        }
      );

      const streamId = response.data.stream_id;
      if (!streamId) {
        console.error("스트림 ID를 받아오지 못했습니다.");
        return;
      }

      // 2. video.js 플레이어를 생성합니다.
      const player = videojs(videoRef.current, {
        controls: false,
        autoplay: false, // 자동 재생은 play() 메서드로 직접 제어
        preload: "auto",
        children: [],
      });

      // 생성된 플레이어 인스턴스를 playerRef에 저장합니다.
      playerRef.current = player;

      // 3. 받아온 streamId를 사용하여 WebRTC 소스를 설정합니다.
      player.src({
        src: `wss://speedaddr2.kanx.io/live/${streamId}.webrtc`,
        iceServers: [{ urls: "stun:stun1.l.google.com:19302" }], // JSON 객체 형식으로 전달
      });

      // 4. 이벤트 핸들러를 등록합니다.
      player.on("playing", () => {
        console.log("비디오 재생 시작");
        setIsLoading(false);
        // 제공된 코드의 window.set_videojs_frame 함수가 필요하다면 여기에 호출
        // if (window.set_videojs_frame) {
        //   window.set_videojs_frame(StType, StW, StH); // StType, StW, StH 변수는 정의 필요
        // }
      });

      player.on("error", (e) => {
        console.error("VideoJS 플레이어 오류:", e);
      });

      // 5. 비디오 재생을 시도합니다.
      player.play().catch((error) => {
        console.warn(
          "자동 재생이 차단되었습니다. 사용자의 상호작용이 필요할 수 있습니다.",
          error
        );
        // 자동 재생 실패 시, 음소거 후 다시 시도하거나 사용자 클릭을 유도할 수 있습니다.
        if (player.muted() === false) {
          player.muted(true);
          player
            .play()
            .catch((e) => console.error("음소거 후 자동 재생 실패:", e));
        }
      });
    } catch (error) {
      console.error("Ant Media 초기화 중 오류 발생:", error);
      setIsLoading(false);
    }
  };

  // 방 타입에 따라 플레이어 초기화
  useEffect(() => {
    console.log(`[VideoPlayer] useEffect 실행됨. props:`, {
      roomId,
      roomType,
      plus,
    });

    if (!roomId || !roomType) {
      console.log(
        "[VideoPlayer] roomId 또는 roomType이 없어 초기화를 중단합니다."
      );
      return;
    }

    // IVS SDK 스크립트를 동적으로 로드하는 함수
    const loadIVSScript = () => {
      return new Promise((resolve) => {
        if (window.IVSBroadcastClient) return resolve();

        const script = document.createElement("script");
        script.src =
          "https://web-broadcast.live-video.net/1.6.0/amazon-ivs-web-broadcast.js";
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    const initPlayer = async () => {
      console.log(`[VideoPlayer] initPlayer 실행. roomType: ${roomType}`);
      // roomType이 'ivs'일 경우
      if (roomType === "ivs") {
        await loadIVSScript(); // IVS 스크립트 로드
        initializeStage("baccarat-3"); // IVS 플레이어 초기화 함수 호출
      } else if (roomType === "ant") {
        initializeVideoJS("baccarat-3"); // Ant Media(webrtc) 플레이어 초기화 함수 호출
      }
    };

    initPlayer();

    // 컴포넌트가 언마운트될 때 플레이어 정리
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (stageRef.current) {
        stageRef.current.leave();
      }
    };
  }, [plus, roomId, roomType]);

  return (
    <div
      className="video-js vjs-default-skin vjs-paused vjs-controls-disabled vjs-workinghover vjs-v7 vjs-user-active videojs-webrtc-plugin"
      tabIndex="-1"
      translate="no"
      aria-label="Video Player"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {isLoading && (
        <div
          className="loading-box"
          id="loading-box"
          style={{ backgroundColor: "black" }}
        >
          <div className="loadingTest"></div>
        </div>
      )}

      <video
        ref={videoRef}
        className="video-js"
        autoPlay
        loop
        disablePictureInPicture
        muted={!sound}
        playsInline
        webkit-playsinline=""
        controls={false}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      <video
        ref={ivsVideoRef}
        className="vjs-tech"
        autoPlay
        loop
        disablePictureInPicture
        muted={!sound}
        playsInline
        webkit-playsinline=""
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default VideoPlayer;
