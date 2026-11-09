import 'server-only';

import { getApiOnServer } from '@/shared/api/index.server';
import type { ActiveTeamData } from '../model/types';

export const getActiveTeamOnServer = (accessToken: string) =>
  getApiOnServer<ActiveTeamData>('/api/v1/teams/me', accessToken);
