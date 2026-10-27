export const uploadVoiceProfileFile = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`음성 파일을 스토리지에 업로드하지 못했습니다. (HTTP ${response.status})`);
  }
};
