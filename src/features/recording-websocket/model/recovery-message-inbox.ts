import type { RecoveryMessage, RecoveryMessageType } from './recording-socket-protocol';

interface Waiter {
  types: RecoveryMessageType[];
  resolve: (message: RecoveryMessage) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * 세션별 복구 메시지 보관함. recovery.start는 연결 직후 바로 오므로,
 * 기다리기 전에 도착한 메시지는 쌓아두고 나중에 꺼내 준다.
 */
export const createRecoveryMessageInbox = () => {
  const messages = new Map<number, RecoveryMessage[]>();
  const waiters = new Map<number, Set<Waiter>>();

  const deliver = (recordingSessionId: number, message: RecoveryMessage) => {
    const sessionWaiters = waiters.get(recordingSessionId);
    const waiter = [...(sessionWaiters ?? [])].find((candidate) =>
      candidate.types.includes(message.type),
    );
    if (waiter) {
      clearTimeout(waiter.timeoutId);
      sessionWaiters?.delete(waiter);
      waiter.resolve(message);
      return;
    }
    messages.set(recordingSessionId, [...(messages.get(recordingSessionId) ?? []), message]);
  };

  const wait = (recordingSessionId: number, types: RecoveryMessageType[], timeoutMs: number) =>
    new Promise<RecoveryMessage>((resolve, reject) => {
      const queue = messages.get(recordingSessionId) ?? [];
      const queuedIndex = queue.findIndex((message) => types.includes(message.type));
      if (queuedIndex !== -1) {
        const [message] = queue.splice(queuedIndex, 1);
        resolve(message);
        return;
      }

      const sessionWaiters = waiters.get(recordingSessionId) ?? new Set<Waiter>();
      const waiter: Waiter = {
        types,
        resolve,
        reject,
        timeoutId: setTimeout(() => {
          sessionWaiters.delete(waiter);
          reject(new Error(`${types.join('·')} 메시지를 받지 못했습니다.`));
        }, timeoutMs),
      };
      sessionWaiters.add(waiter);
      waiters.set(recordingSessionId, sessionWaiters);
    });

  /** 연결이 바뀌거나 끊기면 쌓인 메시지를 버리고, 기다리던 쪽은 실패로 끝낸다. */
  const clear = (recordingSessionId: number) => {
    messages.delete(recordingSessionId);
    waiters.get(recordingSessionId)?.forEach((waiter) => {
      clearTimeout(waiter.timeoutId);
      waiter.reject(new Error('녹음 WebSocket 연결이 끊겼습니다.'));
    });
    waiters.delete(recordingSessionId);
  };

  return { deliver, wait, clear };
};
