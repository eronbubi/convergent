"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { FormMessage, PasswordField, SubmitButton } from "@/components/auth/form-bits";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? "/"} />
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state?.fields?.email} className="field" />
      </div>
      <PasswordField autoComplete="current-password" />
      <div className="-mt-2 text-right">
        <Link href="/forgot" className="text-[13.5px] text-ink-3 hover:text-ink">
          Forgot password?
        </Link>
      </div>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
      <p className="text-center text-[14.5px] text-ink-3">
        New here?{" "}
        <Link href="/signup" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          Create an account
        </Link>
      </p>
    </form>
  );
}
