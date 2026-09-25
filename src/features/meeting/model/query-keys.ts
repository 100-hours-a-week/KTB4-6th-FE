export const meetingKeys = {
  summary: (meetingId: number) => ['meetings', meetingId, 'summary'] as const,
  audioFile: (meetingId: number) => ['meetings', meetingId, 'audio-file'] as const,
  audioDownloadUrl: (audioFileId: number) => ['audio-files', audioFileId, 'download-url'] as const,
  transcript: (meetingId: number) => ['meetings', meetingId, 'transcript'] as const,
  speakerMapping: (meetingId: number, segmentId: number) =>
    ['meetings', meetingId, 'transcript', segmentId, 'speaker-mapping'] as const,
};
