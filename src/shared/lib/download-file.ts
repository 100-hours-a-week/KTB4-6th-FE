/** 주소가 가리키는 파일을 다운로드하게 한다. */
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/** 텍스트 내용을 파일로 만들어 다운로드하게 한다. */
export const downloadTextFile = (
  content: string,
  filename: string,
  mimeType = 'text/plain;charset=utf-8',
) => {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
};
