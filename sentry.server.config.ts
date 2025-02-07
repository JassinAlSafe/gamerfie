// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://806509d9f471586c08554937d2e52d20@o4507563075764224.ingest.de.sentry.io/4508779306811472",
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
});
