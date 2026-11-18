import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../api/axiosClient';
import type { PaymentSocketMessage } from '../types/subscription';

interface UseSubscriptionSocketProps {
  userId?: string;
  onPaymentSuccess: (message: PaymentSocketMessage) => void;
  onPaymentFailed: (message: PaymentSocketMessage) => void;
  enabled: boolean;
}

export const useSubscriptionSocket = ({
  userId,
  onPaymentSuccess,
  onPaymentFailed,
  enabled,
}: UseSubscriptionSocketProps) => {
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  const onPaymentFailedRef = useRef(onPaymentFailed);

  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess;
    onPaymentFailedRef.current = onPaymentFailed;
  });

  useEffect(() => {
    if (!enabled || !userId) return;

    const socketUrl = import.meta.env.VITE_WS_URL || `${API_BASE_URL}/ws`;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]:', str);
        }
      },
      onConnect: () => {
        console.log(`[WebSocket] Connected to payment broker. Subscribing to /topic/subscription-payment/${userId}`);
        stompClient.subscribe(`/topic/subscription-payment/${userId}`, (frame) => {
          try {
            const data: PaymentSocketMessage = JSON.parse(frame.body);
            console.log('[WebSocket] Payment message received:', data);
            if (data.success && data.paymentStatus === 'PAID') {
              onPaymentSuccessRef.current(data);
            } else {
              onPaymentFailedRef.current(data);
            }
          } catch (error) {
            console.error('[WebSocket] Error parsing payment socket message:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[WebSocket] Broker reported error:', frame.headers['message'], frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [userId, enabled]);
};

