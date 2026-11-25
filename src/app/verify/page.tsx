import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendForm } from "@/components/auth/small-forms";
import { Envelope } from "@/components/sketch/illustrations";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyPage({ searchParams }: PageProps<"/verify">) {
  return (
    <Suspense fallback={null}>
      <VerifyView searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyView({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email : undefined;
  const linkError = sp.error === "link";
  const unconfirmed = sp.unconfirmed === "1";

  const title = linkError ? "That link didn’t work" : unconfirmed ? "Confirm your email first" : "Check your inbox";
  const intro = linkError ? (
    <p>The confirmation link has expired or was already used. Request a new one below.</p>
  ) : (
    <p>
      We sent a confirmation link to{" "}
      {email ? <span className="font-medium text-ink">{email}</span> : "your email address"}. Open it to activate your
      account, then you can post.
    </p>
  );

  return (
    <AuthShell title={title} intro={intro} art={<Envelope className="aspect-[360/280] w-full max-w-[460px]" />} caption="the link is valid for 24 hours.">
      <div className="space-y-8">
        <ResendForm email={email} />
        <p className="text-[14.5px] text-ink-3">
          Wrong address?{" "}
          <Link href="/signup" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            Sign up again
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
