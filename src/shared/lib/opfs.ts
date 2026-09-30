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

/** OPFS 루트에 있는 파일 이름을 전부 나열한다(하위 디렉터리는 다루지 않는다). */
export const listOpfsFileNames = async (): Promise<string[]> => {
  const root = await navigator.storage.getDirectory();
  const iterable = root as unknown as AsyncIterable<[string, FileSystemHandle]>;
  const names: string[] = [];

  for await (const [name, handle] of iterable) {
    if (handle.kind === 'file') names.push(name);
  }

  return names;
};

/** OPFS 루트에 있는 파일을 읽어 File(=Blob)로 반환한다. */
export const readOpfsFile = async (fileName: string): Promise<File> => {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName);
  return fileHandle.getFile();
};

/** OPFS 루트에 있는 파일을 지운다. 이미 없으면 조용히 넘어간다. */
export const removeOpfsFile = async (fileName: string): Promise<void> => {
  const root = await navigator.storage.getDirectory();
  await root.removeEntry(fileName).catch(() => {});
};
