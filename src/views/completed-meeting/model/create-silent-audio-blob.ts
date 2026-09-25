const SAMPLE_RATE = 8000;
const WAV_HEADER_BYTES = 44;
// 8비트 PCM에서 무음은 0이 아니라 중간값(128)이다.
const SILENCE_BYTE = 128;

const writeAscii = (view: DataView, offset: number, text: string) => {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
};

/** 지정한 길이의 무음 WAV(8kHz·8비트·모노)를 만든다. 실제 음성 파일이 없는 개발 화면에서 재생 동작을 확인하는 용도다. */
export const createSilentAudioBlob = (durationSeconds: number) => {
  const dataBytes = SAMPLE_RATE * Math.max(1, Math.ceil(durationSeconds));
  const buffer = new ArrayBuffer(WAV_HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt 청크 크기
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // 모노
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE, true); // 초당 바이트 수 (8비트 모노)
  view.setUint16(32, 1, true); // 블록 크기
  view.setUint16(34, 8, true); // 샘플당 비트 수
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);
  new Uint8Array(buffer, WAV_HEADER_BYTES).fill(SILENCE_BYTE);

  return new Blob([buffer], { type: 'audio/wav' });
};
