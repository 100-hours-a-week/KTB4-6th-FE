import { PCM_SAMPLE_RATE } from '@/shared/lib';

const MIN_RECORDING_MS_PER_CHARACTER = 130;

export const VOICE_PROFILE_SCRIPT = [
  '오늘은 날씨가 꽤 좋은 것 같네요. 아침에 일어나 창문을 열어보니 시원한 바람이 불어왔습니다.',
  '오늘은 2026년 10월 26일입니다. 지금부터 다섯 가지 내용을 차례대로 확인하겠습니다.',
  '제 목소리가 잘 들리시나요? 혹시 잘 들리지 않는다면 편하게 말씀해 주세요. 다시 한번 설명해 드릴게요.',
] as const;

export const getMinSentenceSamples = (sentenceIndex: number) =>
  (VOICE_PROFILE_SCRIPT[sentenceIndex].length * MIN_RECORDING_MS_PER_CHARACTER * PCM_SAMPLE_RATE) /
  1000;
