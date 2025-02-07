import * as Sentry from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export function withSentry(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          url: req.url,
          method: req.method,
        },
      });
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
