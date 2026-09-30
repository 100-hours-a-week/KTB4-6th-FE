import { listOpfsFileNames } from '@/shared/lib';

const partFileName = (recordingSessionId: number, partIndex: number) =>
  `recording-${recordingSessionId}-part-${partIndex}.part`;

const PART_FILE_PATTERN = /^recording-(\d+)-part-(\d+)\.part$/;

/**
 * 이 recordingSessionId로 OPFS에 이미 저장된 part 파일 중 가장 큰 번호를 찾는다.
 * 새로고침 등으로 재진입했을 때, 다음 part 번호를 이어서 매겨 기존 파일을 덮어쓰지 않기 위해 쓴다.
 * 해당 세션의 파일이 하나도 없으면 0을 반환한다(다음 파일은 자연히 1번부터 시작).
 */
export const findLatestOpfsPartIndex = async (recordingSessionId: number): Promise<number> => {
  const names = await listOpfsFileNames();
  let latestIndex = 0;

  for (const name of names) {
    const match = PART_FILE_PATTERN.exec(name);
    if (!match) continue;

    const [, sessionIdText, partIndexText] = match;
    if (Number(sessionIdText) !== recordingSessionId) continue;

    latestIndex = Math.max(latestIndex, Number(partIndexText));
  }

  return latestIndex;
};

export { partFileName };
