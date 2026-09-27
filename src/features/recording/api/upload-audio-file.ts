export const uploadAudioFile = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error('녹음 파일을 스토리지에 업로드하지 못했습니다.');
  }
};
