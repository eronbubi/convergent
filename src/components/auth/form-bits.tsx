"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText, className = "" }: { children: React.ReactNode; pendingText: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn btn-primary w-full ${className}`}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {(error || message) && (
        <motion.p
          key={error ?? message}
          role={error ? "alert" : "status"}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`overflow-hidden text-[14px] ${error ? "text-clay-deep" : "text-olive"}`}
        >
          <span className="block pt-1">{error ?? message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function PasswordField({
  name = "password",
  label = "Password",
  autoComplete,
  showStrength = false,
}: {
  name?: string;
  label?: string;
  autoComplete: string;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const score = strength(value);

  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="field pr-20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 h-8 -translate-y-1/2 rounded-lg px-2.5 text-[13px] text-ink-3 hover:bg-paper-2 hover:text-ink"
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {showStrength && (
        <div className="mt-2.5 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i < score ? ["var(--clay)", "var(--kraft)", "var(--olive)", "var(--olive)"][score - 1] : "var(--line)" }}
              />
            ))}
          </div>
          <span className="w-16 text-right text-[12.5px] text-ink-3">
            {value ? ["Too short", "Weak", "Okay", "Good", "Strong"][score] : "8+ chars"}
          </span>
        </div>
      )}
    </div>
  );
}

function strength(pw: string): number {
  if (pw.length < 8) return 0;
  let s = 1;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
