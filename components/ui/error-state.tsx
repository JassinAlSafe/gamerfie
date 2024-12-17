interface ErrorStateProps {
  error: string;
  retry?: () => void;
}

export function ErrorState({ error, retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <p className="text-red-500 mb-4">{error}</p>
      {retry && (
        <button
          onClick={retry}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
} 