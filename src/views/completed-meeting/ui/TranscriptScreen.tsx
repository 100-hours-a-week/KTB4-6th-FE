'use client';

import { ArrowDown } from 'lucide-react';
import { getActiveTranscriptId } from '../model/get-active-transcript-id';
import { useAudioPlayer } from '../model/useAudioPlayer';
import type { AudioViewState } from '../model/useAudioViewState';
import { useAudioSource } from '../model/useAudioSource';
import { useTranscriptAutoFollow } from '../model/useTranscriptAutoFollow';
import { useTranscriptDeepLink } from '../model/useTranscriptDeepLink';
import { useTranscriptViewState } from '../model/useTranscriptViewState';
import { AudioErrorNotice } from './AudioErrorNotice';
import { AudioExpiredNotice } from './AudioExpiredNotice';
import { AudioPlayer } from './AudioPlayer';
import { AudioUploadingNotice } from './AudioUploadingNotice';
import { TranscriptLoadErrorState } from './TranscriptLoadErrorState';
import { TranscriptLoadingState } from './TranscriptLoadingState';
import { TranscriptTab } from './TranscriptTab';

interface TranscriptScreenProps {
  meetingId: number;
  targetEntryId: string | null;
  audio: AudioViewState;
  onAudioFileRetry: () => void;
}

export const TranscriptScreen = ({
  meetingId,
  targetEntryId,
  audio,
  onAudioFileRetry,
}: TranscriptScreenProps) => {
  const { status, entries, retry } = useTranscriptViewState({ meetingId });
  const hasTranscript = entries.length > 0;
  const audioDurationSeconds = audio.kind === 'available' ? audio.durationSeconds : 0;
  const {
    audioSource,
    status: audioSourceStatus,
    refreshAudioSource,
    retry: retryAudioSource,
  } = useAudioSource(audio, audio.kind === 'available');
  const isAudioExpired = audio.kind === 'expired' || audioSourceStatus === 'expired';
  const isAudioError = audio.kind === 'error' || audioSourceStatus === 'error';
  const isAudioPlayerVisible = audio.kind === 'available' && !isAudioExpired && !isAudioError;
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
  } = useAudioPlayer(audioSource, { onError: refreshAudioSource });
  const isTranscriptSyncEnabled = hasTranscript && isAudioPlayerVisible;
  const activeEntryId = isTranscriptSyncEnabled ? getActiveTranscriptId(entries, displayMs) : null;
  const { containerRef, isFollowing, resumeFollowing } = useTranscriptAutoFollow(
    activeEntryId,
    isTranscriptSyncEnabled,
  );
  const highlightedEntryId = useTranscriptDeepLink({
    containerRef,
    entries,
    targetEntryId,
    isEnabled: status === 'ready',
  });

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
          data-clarity-mask="true"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {status === 'loading' && <TranscriptLoadingState />}
          {status === 'error' && <TranscriptLoadErrorState onRetry={retry} />}
          {status === 'ready' && (
            <TranscriptTab
              meetingId={meetingId}
              entries={entries}
              activeEntryId={activeEntryId}
              highlightedEntryId={highlightedEntryId}
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

      {audio.kind === 'uploading' && <AudioUploadingNotice />}
      {isAudioExpired && <AudioExpiredNotice />}
      {!isAudioExpired && isAudioError && (
        <AudioErrorNotice onRetry={audio.kind === 'error' ? onAudioFileRetry : retryAudioSource} />
      )}
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
