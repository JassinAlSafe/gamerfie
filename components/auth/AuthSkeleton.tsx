import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AuthFormSkeletonProps {
  mode?: "signin" | "signup";
  className?: string;
}

export function AuthFormSkeleton({ mode = "signin", className }: AuthFormSkeletonProps) {
  return (
    <div className={cn("grid gap-6", className)}>
      {/* Google Sign In Button Skeleton */}
      <div className="grid gap-2">
        <Skeleton className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <Skeleton className="h-3 w-48 mx-auto" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
      
      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Skeleton className="h-px w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <Skeleton className="h-4 w-36 bg-background" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4 auth-form-slide-in">
        {/* Email Field */}
        <div className="grid gap-2">
          <div className="relative">
            <Skeleton className="h-12 w-full" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Signup-specific fields */}
        {mode === "signup" && (
          <>
            <div className="grid gap-2">
              <div className="relative">
                <Skeleton className="h-12 w-full" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="relative">
                <Skeleton className="h-12 w-full" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Password Field */}
        <div className="grid gap-2">
          {mode === "signin" && (
            <div className="flex justify-end mb-1">
              <Skeleton className="h-4 w-28" />
            </div>
          )}
          <div className="relative">
            <Skeleton className="h-12 w-full" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
          
          {/* Password strength indicator for signup */}
          {mode === "signup" && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-2 w-full rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          )}
        </div>

        {/* Remember me for signin */}
        {mode === "signin" && (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        )}

        {/* Submit Button */}
        <Skeleton className="h-12 w-full mt-2 bg-gradient-to-r from-primary/20 to-primary/30" />
        
        {/* Keyboard shortcut hint */}
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>
    </div>
  );
}