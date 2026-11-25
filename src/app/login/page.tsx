import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { PromptToImage } from "@/components/sketch/illustrations";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell
      title="Welcome back"
      art={<PromptToImage className="aspect-[420/400] w-full max-w-[480px]" />}
      caption="your prompts are where you left them."
    >
      <Suspense fallback={<LoginForm />}>
        <LoginWithNext searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginWithNext({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
  return <LoginForm next={next} />;
}
