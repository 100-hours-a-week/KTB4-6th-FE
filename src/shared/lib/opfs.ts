/** 이 브라우저가 OPFS(Origin Private File System)를 지원하는지. */
export const isOpfsSupported = () =>
  typeof navigator !== 'undefined' &&
  'storage' in navigator &&
  typeof navigator.storage.getDirectory === 'function';

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
