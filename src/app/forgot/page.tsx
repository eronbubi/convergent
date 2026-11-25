import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/small-forms";
import { Envelope } from "@/components/sketch/illustrations";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthShell
      title="Reset your password"
      intro="Enter the email you signed up with and we’ll send you a link to set a new password."
      art={<Envelope className="aspect-[360/280] w-full max-w-[460px]" />}
    >
      <ForgotForm />
      <p className="mt-6 text-[14.5px] text-ink-3">
        Remembered it?{" "}
        <Link href="/login" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
