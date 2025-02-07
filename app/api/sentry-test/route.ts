import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Test API Error");
  } catch (error) {
    Sentry.captureException(error);
    return new Response("Error occurred", { status: 500 });
  }
}
