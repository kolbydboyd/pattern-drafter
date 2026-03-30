// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Sentry error monitoring — catches unhandled JS errors and reports them.
// Create a free account at sentry.io, create a Browser JavaScript project,
// and set VITE_SENTRY_DSN in your environment.

import * as Sentry from '@sentry/browser';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sampleRate: 1.0,
    // Only report errors from our own code, not third-party scripts
    allowUrls: [/peoplespatterns\.com/, /localhost/],
  });
}
