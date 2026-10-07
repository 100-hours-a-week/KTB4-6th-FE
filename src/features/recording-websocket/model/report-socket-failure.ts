import * as Sentry from '@sentry/nextjs';

/** 녹음 음성 전송 연결이 끊긴 사실을 보고한다. 이후 음성은 서버로 실시간 전송되지 않는다. */
export const reportSocketFailure = (
  message: string,
  recordingSessionId: number,
  opened: boolean,
  closeEvent?: CloseEvent,
) => {
  Sentry.captureMessage(message, {
    level: 'error',
    tags: {
      feature: 'recording-websocket',
      'recording.session_id': recordingSessionId,
      'connection.phase': opened ? 'connected' : 'connecting',
      'page.visibility': document.visibilityState,
      ...(closeEvent && { 'websocket.close_code': closeEvent.code }),
    },
    ...(closeEvent && {
      contexts: {
        websocket: {
          code: closeEvent.code,
          reason: closeEvent.reason,
          wasClean: closeEvent.wasClean,
        },
      },
    }),
  });
};
