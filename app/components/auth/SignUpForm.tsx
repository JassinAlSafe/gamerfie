"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Monitor, Gamepad, Smartphone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Google icon component
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    />
  </svg>
);

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
    dateOfBirth: "",
    preferredPlatform: "",
  });

  const router = useRouter();
  const { toast } = useToast();
  const { signUp, signOut, error } = useAuthStore();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await signUp(
        formData.email,
        formData.password,
        formData.username
      );

      if (response.error) throw response.error;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });

      router.push("/signin");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signUpWithGoogle() {
    setIsLoading(true);
    try {
      // TODO: Implement Google sign-in using the auth store
      toast({
        title: "Not implemented",
        description: "Google sign-in will be available soon",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={signUpWithGoogle}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input-custom"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            placeholder="Choose a unique username"
            type="text"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            disabled={isLoading}
            value={formData.username}
            onChange={handleInputChange}
            required
            className="input-custom"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="displayName" className="text-sm font-medium">
            Display Name
          </Label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="Enter your display name"
            type="text"
            autoCapitalize="words"
            autoComplete="name"
            disabled={isLoading}
            value={formData.displayName}
            onChange={handleInputChange}
            required
            className="input-custom"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            placeholder="Create a secure password"
            type="password"
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect="off"
            disabled={isLoading}
            value={formData.password}
            onChange={handleInputChange}
            required
            className="input-custom"
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters long
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium">
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            disabled={isLoading}
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
            className="input-custom"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="preferredPlatform" className="text-sm font-medium">
            Gaming Platform
          </Label>
          <Select
            name="preferredPlatform"
            disabled={isLoading}
            onValueChange={(value) =>
              handleInputChange({
                target: { name: "preferredPlatform", value },
              } as any)
            }
            required
          >
            <SelectTrigger className="input-custom">
              <SelectValue placeholder="Select your preferred platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pc">
                <span className="flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  PC Gaming
                </span>
              </SelectItem>
              <SelectItem value="playstation">
                <span className="flex items-center">
                  <Gamepad className="mr-2 h-4 w-4" />
                  PlayStation
                </span>
              </SelectItem>
              <SelectItem value="xbox">
                <span className="flex items-center">
                  <Gamepad className="mr-2 h-4 w-4" />
                  Xbox
                </span>
              </SelectItem>
              <SelectItem value="nintendo">
                <span className="flex items-center">
                  <Gamepad className="mr-2 h-4 w-4" />
                  Nintendo
                </span>
              </SelectItem>
              <SelectItem value="mobile">
                <span className="flex items-center">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile Gaming
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full mt-6" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </div>
  );
}
