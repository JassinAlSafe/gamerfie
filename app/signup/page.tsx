"use client";

// React and Next.js imports
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Supabase imports
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Type imports
import { isSupabaseError } from '@/types'

// Component imports
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [preferredPlatform, setPreferredPlatform] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: authData.user.id,
            username,
            display_name: displayName,
            date_of_birth: dateOfBirth,
            preferred_platform: preferredPlatform,
          });

        if (profileError) throw profileError;

        toast({
          title: "Sign-up successful!",
          description: "Please check your email to confirm your account.",
          duration: 5000,
        });
        router.push("/signin");
      }
    } catch (error: unknown) {
      const errorMessage = isSupabaseError(error) 
        ? error.message 
        : 'An unexpected error occurred'
      console.error("Sign-up error:", errorMessage);
      toast({
        title: "Sign-up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signUpWithGoogle() {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback/google`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = isSupabaseError(error) 
        ? error.message 
        : 'An unexpected error occurred'
      console.error("Google sign-up error:", errorMessage);
      toast({
        title: "Google sign-up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-[450px] space-y-6 p-8">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your Gamerfie account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account and start tracking
            your gaming journey
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Choose a unique username"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              disabled={isLoading}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              disabled={isLoading}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredPlatform">Preferred Gaming Platform</Label>
            <Select
              disabled={isLoading}
              onValueChange={setPreferredPlatform}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pc">PC</SelectItem>
                <SelectItem value="playstation">PlayStation</SelectItem>
                <SelectItem value="xbox">Xbox</SelectItem>
                <SelectItem value="nintendo">Nintendo</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="w-full"
          onClick={signUpWithGoogle}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.login className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
