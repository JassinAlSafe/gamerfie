import { PasswordResetInstructions } from "@/components/auth/PasswordResetInstructions";

export default function PasswordResetSetupPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Password Reset Setup</h1>
        <p className="text-muted-foreground">
          Complete these steps in your Supabase dashboard to fix password reset functionality.
        </p>
      </div>
      <PasswordResetInstructions />
    </div>
  );
}