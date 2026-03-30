// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Sentry error monitoring — catches unhandled JS errors and reports them.

import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://e53fad22c0758cdeaa33fd9603970881@o4511131659796480.ingest.us.sentry.io/4511131663138816',
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
});
