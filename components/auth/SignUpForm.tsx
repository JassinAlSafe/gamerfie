import { AuthForm } from "@/components/auth/AuthForm";

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  return <AuthForm mode="signup" onSuccess={onSuccess} />;
}
