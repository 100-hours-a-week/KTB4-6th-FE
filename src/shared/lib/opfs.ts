/** 이 브라우저가 OPFS(Origin Private File System)를 지원하는지. */
export const isOpfsSupported = () =>
  typeof navigator !== 'undefined' &&
  'storage' in navigator &&
  typeof navigator.storage.getDirectory === 'function';

/**
 * OPFS 루트에 파일을 하나 열어 새로 쓰기 시작한다.
 * 이미 같은 이름의 파일이 있으면 내용을 비우고 새로 쓴다 — 이어쓰기가 필요하면
 * 반환된 스트림에 여러 번 write()를 호출한다(스트림 하나가 열려있는 동안은 계속 이어서 써진다).
 */
export const openOpfsFileForWriting = async (
  fileName: string,
): Promise<FileSystemWritableFileStream> => {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName, { create: true });
  return fileHandle.createWritable();
};
