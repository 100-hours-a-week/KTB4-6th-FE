const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

const configuredTracesSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? DEFAULT_TRACES_SAMPLE_RATE,
);

const tracesSampleRate =
  Number.isFinite(configuredTracesSampleRate) &&
  configuredTracesSampleRate >= 0 &&
  configuredTracesSampleRate <= 1
    ? configuredTracesSampleRate
    : DEFAULT_TRACES_SAMPLE_RATE;

export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate,
};
