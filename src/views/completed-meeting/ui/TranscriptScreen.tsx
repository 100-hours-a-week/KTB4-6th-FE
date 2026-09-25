'use client';

import { ArrowDown } from 'lucide-react';
import { getActiveTranscriptId } from '../model/get-active-transcript-id';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { useAudioPlayer } from '../model/useAudioPlayer';
import type { AudioViewState } from '../model/useAudioViewState';
import { useAudioSource } from '../model/useAudioSource';
import { useTranscriptAutoFollow } from '../model/useTranscriptAutoFollow';
import { useTranscriptViewState } from '../model/useTranscriptViewState';
import { AudioExpiredNotice } from './AudioExpiredNotice';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptLoadErrorState } from './TranscriptLoadErrorState';
import { TranscriptLoadingState } from './TranscriptLoadingState';
import { TranscriptTab } from './TranscriptTab';

interface TranscriptScreenProps {
  meetingId: number;
  /** 개발 환경 전용 미리보기 전사. 없으면 전사를 조회한다. */
  previewEntries?: TranscriptEntry[];
  audio: AudioViewState;
}

/**
 * 전사 탭 화면. 전사 목록과 음성 플레이어를 함께 다룬다.
 * 재생 위치에 맞춰 전사를 강조하고 따라가며 스크롤하며, 이 화면을 벗어나면 재생도 멈춘다.
 */
export const TranscriptScreen = ({ meetingId, previewEntries, audio }: TranscriptScreenProps) => {
  const { status, entries, retry } = useTranscriptViewState({ meetingId, previewEntries });
  const hasTranscript = entries.length > 0;
  const isAudioExpired = audio.kind === 'expired';
  const isAudioPlayerVisible = hasTranscript && audio.kind === 'available';
  const audioDurationSeconds = audio.kind === 'available' ? audio.durationSeconds : 0;
  const audioSource = useAudioSource(audio, isAudioPlayerVisible);
  const {
    isPlaying,
    isMuted,
    canPlay,
    displayMs,
    togglePlay,
    seek,
    beginScrub,
    updateScrub,
    endScrub,
    toggleMute,
  } = useAudioPlayer(audioSource);
  // 재생 위치(끄는 중이면 끄는 위치)에 해당하는 발화를 강조한다. 플레이어가 없으면 강조하지 않는다.
  const activeEntryId = isAudioPlayerVisible ? getActiveTranscriptId(entries, displayMs) : null;
  const { containerRef, isFollowing, resumeFollowing } = useTranscriptAutoFollow(
    activeEntryId,
    isAudioPlayerVisible,
  );

  // 재생 위치를 직접 옮기는 것은 그 위치를 보겠다는 뜻이라, 스크롤이 멈춰 있었어도 다시 따라간다.
  const handleSeek = (ms: number) => {
    resumeFollowing();
    seek(ms);
  };
  const handleScrubStart = (ms: number) => {
    resumeFollowing();
    beginScrub(ms);
  };

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <main
          ref={containerRef}
          data-tab="transcript"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {status === 'loading' && <TranscriptLoadingState />}
          {status === 'error' && <TranscriptLoadErrorState onRetry={retry} />}
          {status === 'ready' && (
            <TranscriptTab
              meetingId={meetingId}
              entries={entries}
              isPreview={previewEntries !== undefined}
              activeEntryId={activeEntryId}
            />
          )}
        </main>
        {isAudioPlayerVisible && !isFollowing && activeEntryId && (
          <button
            type="button"
            aria-label="현재 재생 위치로 이동"
            onClick={resumeFollowing}
            className="absolute right-5 bottom-4 flex size-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_8px_24px_rgba(20,34,56,0.24)]"
          >
            <ArrowDown aria-hidden="true" className="size-5" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {hasTranscript && isAudioExpired && <AudioExpiredNotice />}
      {isAudioPlayerVisible && (
        <AudioPlayer
          isPlaying={isPlaying}
          isMuted={isMuted}
          canPlay={canPlay}
          displayMs={displayMs}
          durationSeconds={audioDurationSeconds}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onSeek={handleSeek}
          onScrubStart={handleScrubStart}
          onScrubMove={updateScrub}
          onScrubEnd={endScrub}
        />
      )}
    </>
  );
};
