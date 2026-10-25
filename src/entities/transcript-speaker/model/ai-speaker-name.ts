export const toAiSpeakerName = (speakerId: unknown) =>
  typeof speakerId === 'number' && Number.isSafeInteger(speakerId) && speakerId >= 0
    ? `화자 ${speakerId + 1}`
    : null;
