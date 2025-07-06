"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuthOptimized";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Target, 
  ChevronRight, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Heart
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuthState();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Check if this is a first-time user
  const isNewUser = searchParams.get("new") === "true";

  useEffect(() => {
    // If user is not loading and not authenticated, redirect to signup
    if (!isLoading && !user) {
      router.push("/signup");
      return;
    }

    // If user exists, check if they actually need onboarding
    if (!isLoading && user) {
      const onboardedStatus = (user as any)?.profile?.settings?.onboarded;
      const hasCompletedOnboarding = onboardedStatus === true;
      const isExplicitlyNotOnboarded = onboardedStatus === false;
      
      // Only show welcome page if user is explicitly not onboarded AND URL indicates new user
      if (hasCompletedOnboarding || !isExplicitlyNotOnboarded || !isNewUser) {
        router.push("/");
        return;
      }
    }
  }, [user, isLoading, isNewUser, router]);

  const features = [
    {
      icon: Gamepad2,
      title: "Track Your Games",
      description: "Build your gaming library, rate games, and track your progress across all platforms.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Users,
      title: "Connect with Friends",
      description: "Find fellow gamers, share achievements, and see what your friends are playing.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Trophy,
      title: "Earn Achievements",
      description: "Complete challenges, unlock badges, and showcase your gaming accomplishments.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Target,
      title: "Set Gaming Goals",
      description: "Create personal challenges, track completion rates, and level up your gaming.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const steps = [
    {
      title: "Welcome to GameVault!",
      subtitle: "Your ultimate gaming companion awaits",
      content: (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome, {user?.profile?.display_name || user?.profile?.username || "Gamer"}! 🎮
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've successfully joined the GameVault community. Let's get you set up for an amazing gaming experience.
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Email Verified
          </Badge>
        </div>
      )
    },
    {
      title: "Discover What You Can Do",
      subtitle: "GameVault is packed with features to enhance your gaming",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
            >
              <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "You're All Set!",
      subtitle: "Time to start your gaming journey",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Ready to Game! 🚀</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your account is set up and ready. Start building your gaming library, connecting with friends, and tracking your progress.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Button 
              onClick={() => handleComplete()}
              disabled={isCompleting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isCompleting ? (
                <Icons.logo className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Enter GameVault
            </Button>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Mark user as onboarded
      const supabase = createClient();
      const currentSettings = (user as any)?.profile?.settings || {};
      await supabase
        .from('profiles')
        .update({ 
          settings: { 
            ...currentSettings, 
            onboarded: true,
            welcome_completed_at: new Date().toISOString()
          } 
        })
        .eq('id', user?.id);

      toast({
        title: "Welcome to GameVault! 🎉",
        description: "Let's start building your gaming library!",
      });

      // Redirect to main dashboard
      router.push("/?welcome=true");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Welcome anyway!",
        description: "Let's get you started with GameVault.",
        variant: "default",
      });
      router.push("/");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <Icons.logo className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or not a new user
  if (!user || !isNewUser) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Skip button */}
      <div className="absolute top-6 right-6 z-10">
        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
          Skip Welcome
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "bg-purple-500 w-8"
                      : index < currentStep
                      ? "bg-purple-500/60"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main content card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-muted-foreground">
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="mb-8">
              {currentStepData.content}
            </div>

            {/* Navigation */}
            {currentStep < steps.length - 1 && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSkip} size="sm">
                    Skip
                  </Button>
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
          <div className="text-center">
            <Icons.logo className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-muted-foreground">Loading welcome...</p>
          </div>
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}