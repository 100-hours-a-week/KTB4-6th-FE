import { listOpfsFileNames, readOpfsFile, removeOpfsFile } from '@/shared/lib';

const partFileName = (recordingSessionId: number, partIndex: number) =>
  `recording-${recordingSessionId}-part-${partIndex}.part`;

const PART_FILE_PATTERN = /^recording-(\d+)-part-(\d+)\.part$/;

interface PartFileEntry {
  name: string;
  partIndex: number;
}

/** OPFS에 있는 파일 중 이 recordingSessionId의 part 파일만 골라 번호순으로 정렬해서 반환한다. */
const findPartFileEntries = async (recordingSessionId: number): Promise<PartFileEntry[]> => {
  const names = await listOpfsFileNames();
  const entries: PartFileEntry[] = [];

  for (const name of names) {
    const match = PART_FILE_PATTERN.exec(name);
    if (!match) continue;

    const [, sessionIdText, partIndexText] = match;
    if (Number(sessionIdText) !== recordingSessionId) continue;

    entries.push({ name, partIndex: Number(partIndexText) });
  }

  return entries.sort((a, b) => a.partIndex - b.partIndex);
};

/**
 * 이 recordingSessionId로 OPFS에 이미 저장된 part 파일 중 가장 큰 번호를 찾는다.
 * 새로고침 등으로 재진입했을 때, 다음 part 번호를 이어서 매겨 기존 파일을 덮어쓰지 않기 위해 쓴다.
 * 해당 세션의 파일이 하나도 없으면 0을 반환한다(다음 파일은 자연히 1번부터 시작).
 */
export const findLatestOpfsPartIndex = async (recordingSessionId: number): Promise<number> => {
  const entries = await findPartFileEntries(recordingSessionId);
  return entries.at(-1)?.partIndex ?? 0;
};

/** 이 recordingSessionId의 part 파일들을 번호순으로 전부 읽어 File(=Blob) 배열로 반환한다. */
export const readOpfsPartFilesInOrder = async (recordingSessionId: number): Promise<File[]> => {
  const entries = await findPartFileEntries(recordingSessionId);
  return Promise.all(entries.map((entry) => readOpfsFile(entry.name)));
};

/** 이 recordingSessionId의 part 파일들을 전부 지운다. 업로드가 끝난 뒤 정리하는 용도. */
export const removeOpfsPartFiles = async (recordingSessionId: number): Promise<void> => {
  const entries = await findPartFileEntries(recordingSessionId);
  await Promise.all(entries.map((entry) => removeOpfsFile(entry.name)));
};

export { partFileName };
