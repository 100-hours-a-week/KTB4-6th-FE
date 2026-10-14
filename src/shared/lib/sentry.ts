import type { Scope } from '@sentry/nextjs';

type Sentry = typeof import('./sentry-sdk');
type SentryOptions = Parameters<Sentry['init']>[0];

const LOAD_DELAY_AFTER_PAGE_LOAD_MS = 3000;

let sentryOptions: SentryOptions | undefined;
let sentryPromise: Promise<Sentry | undefined> | undefined;
let loadedSentry: Sentry | undefined;
const pendingErrors: unknown[] = [];

const handleWindowError = (event: ErrorEvent) => {
  bufferError(event.error ?? event.message);
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  bufferError(event.reason);
};

const stopBufferingErrors = () => {
  window.removeEventListener('error', handleWindowError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
};

const initSentry = (sentry: Sentry) => {
  if (!sentryOptions) return;

  sentry.init(sentryOptions);
  stopBufferingErrors();
  pendingErrors.splice(0).forEach((error) => {
    sentry.captureException(error, { mechanism: { handled: false } });
  });
};

const loadSentry = () => {
  sentryPromise ??= import('./sentry-sdk').then(
    (sentry) => {
      initSentry(sentry);
      loadedSentry = sentry;
      return sentry;
    },
    () => {
      sentryPromise = undefined;
      return undefined;
    },
  );
  return sentryPromise;
};

const bufferError = (error: unknown) => {
  pendingErrors.push(error);
  void loadSentry();
};

export const startSentry = (options: SentryOptions) => {
  sentryOptions = options;
  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  const scheduleLoad = () => {
    window.setTimeout(() => void loadSentry(), LOAD_DELAY_AFTER_PAGE_LOAD_MS);
  };

  if (document.readyState === 'complete') {
    scheduleLoad();
  } else {
    window.addEventListener('load', scheduleLoad, { once: true });
  }
};

export const captureException = (...args: Parameters<Sentry['captureException']>) => {
  void loadSentry().then((sentry) => sentry?.captureException(...args));
};

export const captureMessage = (...args: Parameters<Sentry['captureMessage']>) => {
  void loadSentry().then((sentry) => sentry?.captureMessage(...args));
};

export const withScope = (callback: (scope: Scope) => void) => {
  void loadSentry().then((sentry) => sentry?.withScope(callback));
};

export const captureRouterTransitionStart = (
  ...args: Parameters<Sentry['captureRouterTransitionStart']>
) => {
  loadedSentry?.captureRouterTransitionStart(...args);
};
