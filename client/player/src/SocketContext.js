// SocketContext.js
import React, { createContext, useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import { SevUrl } from "./util";

const SocketContext = createContext(null);

const isLocalhost = window.location.hostname === "localhost";
const EndPoint = isLocalhost
  ? "http://localhost:7771" // ✅ protocol 꼭 붙이기!
  : `https://${SevUrl().servername}:${SevUrl().port}`;
console.log(EndPoint);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    return io(EndPoint, {
      autoConnect: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
