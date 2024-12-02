
import { Card, CardContent } from "./ui/card";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Oops! Something went wrong.</h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </Card>
  );
}