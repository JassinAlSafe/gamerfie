import { cn } from "@/lib/utils";

interface BackgroundGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function BackgroundGradient({
  children,
  className,
  ...props
}: BackgroundGradientProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 p-[1px]",
        className
      )}
      {...props}
    >
      <div className="relative z-10 bg-background rounded-xl p-4 h-full">
        {children}
      </div>
    </div>
  );
}
