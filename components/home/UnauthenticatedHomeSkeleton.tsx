"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function UnauthenticatedHomeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="flex flex-col">
        {/* Hero Section Skeleton */}
        <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center py-8 sm:py-12 lg:py-16 xl:py-20 relative px-4 sm:px-6">
          <div className="space-y-8 relative z-10 max-w-6xl mx-auto">
            {/* Badge skeleton */}
            <div className="flex justify-center">
              <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
            </div>
            
            {/* Main headline skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-16 sm:h-20 lg:h-24 w-full max-w-4xl mx-auto bg-gradient-to-r from-purple-500/20 to-cyan-500/20" />
              <Skeleton className="h-6 w-3/4 mx-auto bg-white/10" />
              <Skeleton className="h-6 w-2/3 mx-auto bg-white/10" />
            </div>

            {/* CTA buttons skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Skeleton className="h-14 w-48 rounded-lg bg-purple-500/20" />
              <Skeleton className="h-14 w-40 rounded-lg bg-white/10" />
            </div>

            {/* Stats section skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-3">
                    <Skeleton className="h-8 w-8 rounded bg-white/20" />
                    <Skeleton className="h-8 w-16 bg-white/20" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section Skeleton */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Section header */}
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-64 mx-auto bg-white/20" />
              <Skeleton className="h-6 w-96 mx-auto bg-white/10" />
            </div>

            {/* Features grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded bg-white/20" />
                    <Skeleton className="h-6 w-32 bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Game Showcase Section Skeleton */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Section header */}
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-48 mx-auto bg-white/20" />
              <Skeleton className="h-6 w-80 mx-auto bg-white/10" />
            </div>

            {/* Game grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10">
                    <Skeleton className="w-full h-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section Skeleton */}
        <section className="py-16 px-4 sm:px-6">
          <Card className="max-w-4xl mx-auto p-8 lg:p-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20 text-center">
            <div className="space-y-6">
              <Skeleton className="h-12 w-80 mx-auto bg-white/20" />
              <Skeleton className="h-6 w-96 mx-auto bg-white/10" />
              <Skeleton className="h-14 w-48 mx-auto rounded-lg bg-white/20" />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

export function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
      </div>
    </div>
  );
}