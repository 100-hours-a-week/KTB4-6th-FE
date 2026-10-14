import { captureRouterTransitionStart, startSentry } from '@/shared/lib';
import { sentryOptions } from './sentry.shared.config';

startSentry(sentryOptions);

export const onRouterTransitionStart = captureRouterTransitionStart;
