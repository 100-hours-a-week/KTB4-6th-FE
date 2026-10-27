const FAKE_REGISTER_DELAY_MS = 1_600;

export const registerVoiceProfile = async (file: File): Promise<void> => {
  if (file.size === 0) throw new Error('등록할 음성 파일이 비어 있습니다.');
  await new Promise((resolve) => window.setTimeout(resolve, FAKE_REGISTER_DELAY_MS));
};
