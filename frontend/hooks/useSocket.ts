'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BattleState, TurnResult } from '../types';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState<"connected" | "reconnecting" | "disconnected">("disconnected");

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setSocketStatus("connected");
      console.log('Connected to socket server');
    });

    socketInstance.on('disconnect', () => {
      setSocketStatus("disconnected");
      console.log('Disconnected from socket server');
    });

    socketInstance.on('connect_error', () => {
      setSocketStatus("reconnecting");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, socketStatus };
};
