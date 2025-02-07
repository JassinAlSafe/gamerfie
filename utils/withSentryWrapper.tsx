"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export function withSentryWrapper(Component: React.ComponentType<any>) {
  return function WrappedComponent(props: any) {
    useEffect(() => {
      Sentry.setTag("component", Component.name);
    }, []);

    return <Component {...props} />;
  };
}
