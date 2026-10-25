import type { RecordingSocketMessage } from './recording-socket-protocol';

export const createRecordingSessionFlags = () => {
  const endedByServer = new Set<number>();
  const aiRecovering = new Set<number>();
  const sendPaused = new Set<number>();

  const applyMessage = (recordingSessionId: number, message: RecordingSocketMessage) => {
    switch (message.type) {
      case 'recording.recovering':
        aiRecovering.add(recordingSessionId);
        sendPaused.add(recordingSessionId);
        break;
      case 'recording.replay.request':
        sendPaused.add(recordingSessionId);
        break;
      case 'recording.recovery.completed':
        aiRecovering.delete(recordingSessionId);
        break;
      case 'recording.error':
        endedByServer.add(recordingSessionId);
        break;
      default:
        break;
    }
  };

  return {
    applyMessage,
    isEndedByServer: (recordingSessionId: number) => endedByServer.has(recordingSessionId),
    isAiRecovering: (recordingSessionId: number) => aiRecovering.has(recordingSessionId),
    isSendPaused: (recordingSessionId: number) => sendPaused.has(recordingSessionId),
    resumeSending: (recordingSessionId: number) => {
      sendPaused.delete(recordingSessionId);
    },
    resetAiRecovery: (recordingSessionId: number) => {
      aiRecovering.delete(recordingSessionId);
      sendPaused.delete(recordingSessionId);
    },
  };
};
