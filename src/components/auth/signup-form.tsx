"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { checkUsername, signUp } from "@/app/actions/auth";
import { FormMessage, PasswordField, SubmitButton } from "@/components/auth/form-bits";
import { CheckIcon } from "@/components/ui/icons";

export function SignupForm() {
  const [state, action] = useActionState(signUp, null);
  const [username, setUsername] = useState(state?.fields?.username ?? "");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");

  // Debounced availability check; the "checking"/"idle" states are set in onChange.
  useEffect(() => {
    const name = username.trim().toLowerCase();
    if (!name) return;
    let live = true;
    const t = setTimeout(async () => {
      const result = await checkUsername(name);
      if (live) setStatus(result);
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [username]);

  return (
    <form action={action} className="space-y-5" noValidate={false}>
      <div>
        <label htmlFor="username" className="label">
          Username
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3">@</span>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            pattern="[a-zA-Z0-9_.]{3,24}"
            value={username}
            onChange={(e) => {
              const v = e.target.value.replace(/\s/g, "");
              setUsername(v);
              setStatus(v ? "checking" : "idle");
            }}
            className="field pl-9"
            aria-describedby="username-hint"
          />
        </div>
        <p id="username-hint" className="hint flex items-center gap-1.5" aria-live="polite">
          {status === "ok" && (
            <>
              <CheckIcon className="size-4 text-olive" /> <span className="text-olive">Available</span>
            </>
          )}
          {status === "taken" && <span className="text-clay-deep">Taken, try another</span>}
          {status === "invalid" && <span>3–24 characters: letters, numbers, dot or underscore</span>}
          {(status === "idle" || status === "checking") && <span>This is how you’re credited on prompts.</span>}
        </p>
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.fields?.email}
          className="field"
        />
      </div>

      <PasswordField autoComplete="new-password" showStrength />

      <FormMessage error={state?.error} />

      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>

      <p className="text-center text-[14.5px] text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          Log in
        </Link>
      </p>
    </form>
  );
}
