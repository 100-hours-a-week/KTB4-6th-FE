import type { VoiceQualityWarning } from '@/features/voice-profile';

export const VOICE_QUALITY_MESSAGES: Record<VoiceQualityWarning, string> = {
  clipping: '소리가 깨져요. 조금 떨어져 주세요',
  'no-speech': '목소리가 잘 들리지 않아요',
  'too-quiet': '목소리가 작아요. 더 크게 읽어 주세요',
  noisy: '주변 소음으로 분석이 어려울 수 있어요',
};
