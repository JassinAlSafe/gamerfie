import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton() {
  return (
    <div className="grid gap-6">
      {/* Google Sign In Button Skeleton */}
      <Skeleton className="h-10 w-full" />
      
      {/* Separator */}
      <div className="relative">
        <Skeleton className="h-px w-full" />
        <div className="relative flex justify-center">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        {/* Email */}
        <div className="grid gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Submit Button */}
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}