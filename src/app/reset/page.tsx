import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/small-forms";
import { PromptToImage } from "@/components/sketch/illustrations";
import { getViewer } from "@/lib/data";

export const metadata: Metadata = { title: "New password" };

export default function ResetPage() {
  return (
    <AuthShell title="Set a new password" art={<PromptToImage className="aspect-[420/400] w-full max-w-[480px]" />}>
      <Suspense fallback={<div className="skeleton h-40 rounded-xl" />}>
        <ResetGate />
      </Suspense>
    </AuthShell>
  );
}

async function ResetGate() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <p className="text-ink-2">
        This reset link has expired.{" "}
        <Link href="/forgot" className="text-ink underline underline-offset-4">
          Request a new one
        </Link>
        .
      </p>
    );
  }
  return <ResetForm />;
}
