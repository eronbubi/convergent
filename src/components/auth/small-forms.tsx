"use client";

import { useActionState } from "react";
import { requestPasswordReset, resendVerification, updatePassword, updateProfile } from "@/app/actions/auth";
import { FormMessage, PasswordField, SubmitButton } from "@/components/auth/form-bits";

export function ResendForm({ email }: { email?: string }) {
  const [state, action] = useActionState(resendVerification, null);
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="resend-email" className="label">
        Didn’t get it?
      </label>
      <div className="flex gap-2">
        <input id="resend-email" name="email" type="email" required defaultValue={email} autoComplete="email" className="field" />
        <SubmitButton pendingText="Sending…" className="!w-auto shrink-0">
          Resend
        </SubmitButton>
      </div>
      <FormMessage error={state?.error} message={state?.message} />
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state?.fields?.email} className="field" />
      </div>
      <FormMessage error={state?.error} message={state?.message} />
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetForm() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-5">
      <PasswordField label="New password" autoComplete="new-password" showStrength />
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
    </form>
  );
}

export function ProfileForm({ displayName, bio }: { displayName: string; bio: string }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="displayName" className="label">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          maxLength={48}
          defaultValue={state?.fields?.displayName ?? displayName}
          className="field"
        />
      </div>
      <div>
        <label htmlFor="bio" className="label">
          Bio
        </label>
        <textarea id="bio" name="bio" maxLength={280} rows={4} defaultValue={state?.fields?.bio ?? bio} className="field" />
        <p className="hint">Up to 280 characters. Shown on your profile.</p>
      </div>
      <FormMessage error={state?.error} message={state?.message} />
      <SubmitButton pendingText="Saving…" className="sm:!w-auto">
        Save changes
      </SubmitButton>
    </form>
  );
}
