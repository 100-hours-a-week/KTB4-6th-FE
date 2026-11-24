import 'server-only';

import { getApiOnServer } from '@/shared/api/index.server';
import type { HomeData } from '../model/types';

export const getHomeOnServer = (accessToken: string) =>
  getApiOnServer<HomeData>('/api/v1/home', accessToken);
