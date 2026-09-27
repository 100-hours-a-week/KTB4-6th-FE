'use client';

import { useMutation } from '@tanstack/react-query';
import { deleteAudioFile } from '../api/delete-audio-file';

/**
 * 화면마다 성공 후 처리(조회 캐시 갱신 등)가 달라서 이 훅에는 담지 않고, 호출하는 쪽에서 onSuccess로 처리한다.
 */
export const useDeleteAudioFile = () => useMutation({ mutationFn: deleteAudioFile });
