export type VoiceEnrollPhase =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'done'
  | 'denied'
  | 'unsupported'
  | 'unavailable'
  | 'failed';

export type VoiceEnrollScriptPhase = Extract<VoiceEnrollPhase, 'idle' | 'recording' | 'processing'>;

export type VoiceEnrollMode = 'first' | 'edit';
