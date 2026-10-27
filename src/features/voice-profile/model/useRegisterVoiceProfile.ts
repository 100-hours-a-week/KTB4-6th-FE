'use client';

import { useMutation } from '@tanstack/react-query';
import { createVoiceProfileUploadUrl } from '../api/create-voice-profile-upload-url';
import { registerVoiceProfile } from '../api/register-voice-profile';
import { uploadVoiceProfileFile } from '../api/upload-voice-profile-file';
import { toVoiceProfileRegisterFailure } from './voice-profile-errors';

const submitVoiceProfile = async (file: File) => {
  const uploadUrl = await createVoiceProfileUploadUrl(file.type);
  await uploadVoiceProfileFile(uploadUrl, file);
  await registerVoiceProfile().catch((error: unknown) => {
    if (toVoiceProfileRegisterFailure(error) !== 'rerecord') throw error;
  });
};

export const useRegisterVoiceProfile = () => useMutation({ mutationFn: submitVoiceProfile });
