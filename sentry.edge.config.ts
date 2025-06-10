// This file configures the initialization of Sentry for edge runtimes
// The config you add here will be used whenever your application is deployed on the edge.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Temporarily disable Sentry to fix build issues
// Sentry.init({
//   dsn: "https://806509d9f471586c08554937d2e52d20@o4507563075764224.ingest.de.sentry.io/4508779306811472",
//   tracesSampleRate: 1.0,
// });

// No-op initialization
Sentry.init({
  enabled: false,
});
