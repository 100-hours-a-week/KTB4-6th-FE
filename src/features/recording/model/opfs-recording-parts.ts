import { listOpfsFileNames, readOpfsFile, removeOpfsFile } from '@/shared/lib';

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
