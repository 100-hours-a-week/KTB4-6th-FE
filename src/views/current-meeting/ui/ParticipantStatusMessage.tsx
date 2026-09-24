interface ParticipantStatusMessageProps {
  isEnding: boolean;
  isCompleted: boolean;
  isDisconnected: boolean;
  isPaused: boolean;
  recorderName: string;
}

/** 녹음을 진행하지 않는 참여자에게 현재 회의 진행 상황을 한 줄로 알려준다. */
export const ParticipantStatusMessage = ({
  isEnding,
  isCompleted,
  isDisconnected,
  isPaused,
  recorderName,
}: ParticipantStatusMessageProps) => {
  const message = isEnding
    ? '회의 종료 처리 중입니다'
    : isCompleted
      ? '회의가 종료되었습니다'
      : isDisconnected
        ? '실시간 연결이 끊어졌습니다'
        : isPaused
          ? recorderName + '님이 녹음을 일시정지했습니다'
          : recorderName + '님이 녹음을 진행 중입니다';

  return (
    <p className="flex h-12 min-w-0 items-center justify-center rounded-xl border border-cool-200 bg-cool-50 px-2 text-center text-xs text-cool-700">
      {message}
    </p>
  );
};
