import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  value: number;
  variant?: "default" | "achievement" | "challenge";
}

export function ProgressIndicator({
  value,
  variant = "default",
}: ProgressIndicatorProps) {
  return (
    <div className="relative w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-300",
          variant === "achievement" && "bg-yellow-500",
          variant === "challenge" && "bg-purple-500",
          variant === "default" && "bg-blue-500"
        )}
        style={{ width: `${value}%` }}
        data-variant={variant}
      />
    </div>
  );
}
