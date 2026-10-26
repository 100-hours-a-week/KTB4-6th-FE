export type VoiceEnrollPhase = 'idle' | 'recording' | 'processing' | 'done' | 'denied' | 'failed';

export type VoiceEnrollScriptPhase = Extract<VoiceEnrollPhase, 'idle' | 'recording' | 'processing'>;

export type VoiceEnrollMode = 'first' | 'edit';
