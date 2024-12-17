import { LoadingSpinner } from "@/components/loadingSpinner";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <LoadingSpinner />
      <p className="mt-4 text-gray-400">{message}</p>
    </div>
  );
} 