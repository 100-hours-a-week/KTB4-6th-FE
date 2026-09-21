import type { TranscriptSegment } from '../model/preview-meeting';

interface MeetingTranscriptProps {
  segments: TranscriptSegment[];
  isRecording: boolean;
  isPaused: boolean;
}

const formatTimestamp = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');

export const MeetingTranscript = ({ segments, isRecording, isPaused }: MeetingTranscriptProps) => (
  <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
    <h3 className="flex items-center gap-2 text-sm font-bold text-cool-900">
      실시간 녹취
      {isRecording && <span aria-hidden="true" className="size-1.5 rounded-full bg-danger" />}
    </h3>

    <ol className="mt-2 flex flex-col gap-1.5">
      {segments.map((segment) => (
        <li
          key={segment.id}
          className="grid grid-cols-[76px_minmax(0,1fr)] gap-2 rounded-xl bg-white p-3"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-600">
              {segment.speakerNumber === null
                ? '발화자 확인 중'
                : '발화자 ' + segment.speakerNumber}
            </p>
            <time className="mt-1 block font-mono text-xs text-cool-500">
              {formatTimestamp(segment.startedAtSeconds)}
            </time>
          </div>
          <p className="text-sm leading-6 break-keep text-cool-900">{segment.text}</p>
        </li>
      ))}
    </ol>

    {segments.length === 0 && (
      <p className="flex flex-1 items-center justify-center text-center text-sm text-cool-500">
        아직 녹취된 내용이 없습니다.
      </p>
    )}

    {isPaused && (
      <p className="mt-2 rounded-xl bg-cool-100 px-3 py-3 text-center text-xs text-cool-600">
        일시정지 중에는 새로운 녹취가 기록되지 않습니다
      </p>
    )}
  </main>
);
