import { AuthForm } from "@/components/auth/AuthForm";

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  return <AuthForm mode="signin" onSuccess={onSuccess} />;
}
