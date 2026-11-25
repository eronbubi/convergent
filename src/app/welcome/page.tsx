import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Envelope } from "@/components/sketch/illustrations";

export const metadata: Metadata = { title: "Email confirmed" };

export default function WelcomePage() {
  return (
    <AuthShell
      title="Your email is confirmed"
      intro="Your account is active. Post a clip with its prompt, or look around first."
      art={<Envelope checked className="aspect-[360/280] w-full max-w-[460px]" />}
      caption="all set."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/new" className="btn btn-clay">
          Post your first piece
        </Link>
        <Link href="/#feed" className="btn btn-outline">
          Browse the feed
        </Link>
      </div>
    </AuthShell>
  );
}
