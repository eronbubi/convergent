import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { PromptToImage } from "@/components/sketch/illustrations";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      intro="Pick a username, confirm your email, then post the clips you made with code and the prompts behind them."
      art={<PromptToImage className="aspect-[420/400] w-full max-w-[480px]" />}
      caption="prompt in, code out, motion on screen."
    >
      <SignupForm />
    </AuthShell>
  );
}
