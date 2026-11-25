"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Text input with a suggestion list.
 * Single mode keeps one value in the input; multi mode turns each entry into a removable chip.
 */
export function SuggestInput({
  id,
  mode,
  value,
  values,
  onChange,
  onValuesChange,
  suggestions,
  placeholder,
  max = 8,
  invalid,
  describedBy,
}: {
  id: string;
  mode: "single" | "multi";
  value?: string;
  values?: string[];
  onChange?: (v: string) => void;
  onValuesChange?: (v: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  max?: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const listId = useId();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = mode === "single" ? (value ?? "") : draft;
  const chosen = useMemo(() => values ?? [], [values]);

  const options = useMemo(() => {
    const q = text.trim().toLowerCase();
    return suggestions
      .filter((s) => !chosen.includes(s))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .filter((s) => mode === "multi" || s !== value)
      .slice(0, 7);
  }, [suggestions, text, chosen, mode, value]);

  const commit = (v: string) => {
    const clean = v.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!clean) return;
    if (mode === "single") {
      onChange?.(clean);
      setOpen(false);
    } else if (!chosen.some((c) => c.toLowerCase() === clean.toLowerCase()) && chosen.length < max) {
      onValuesChange?.([...chosen, clean]);
      setDraft("");
    }
    setActive(0);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || (mode === "multi" && e.key === ",")) {
      if (open && options[active]) {
        e.preventDefault();
        commit(options[active]);
      } else if (mode === "multi" && draft.trim()) {
        e.preventDefault();
        commit(draft);
      } else if (mode === "single") {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && mode === "multi" && !draft && chosen.length) {
      onValuesChange?.(chosen.slice(0, -1));
    }
  };

  const full = mode === "multi" && chosen.length >= max;

  return (
    <div className="relative">
      <div
        className={`field flex h-auto min-h-12 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgb(198_97_63/0.18)] ${invalid ? "border-clay" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        {mode === "multi" &&
          chosen.map((c) => (
            <span key={c} className="inline-flex h-8 items-center gap-1 rounded-full bg-paper-2 pr-1 pl-3 text-[14px] text-ink">
              {c}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onValuesChange?.(chosen.filter((x) => x !== c));
                }}
                className="grid size-6 place-items-center rounded-full text-ink-3 hover:bg-paper-3 hover:text-ink"
                aria-label={`Remove ${c}`}
              >
                <CloseIcon className="size-3.5" />
              </button>
            </span>
          ))}
        <input
          ref={inputRef}
          id={id}
          value={text}
          disabled={full}
          onChange={(e) => {
            if (mode === "single") onChange?.(e.target.value);
            else setDraft(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
            if (mode === "multi" && draft.trim()) commit(draft);
          }}
          onKeyDown={onKey}
          placeholder={full ? "Limit reached" : chosen.length ? "" : placeholder}
          className="h-9 min-w-[8rem] flex-1 bg-transparent px-1 text-[16px] text-ink outline-none placeholder:text-ink-3/80"
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          autoComplete="off"
        />
      </div>
      <AnimatePresence>
        {open && options.length > 0 && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-[0_20px_50px_-20px_rgb(40_30_15/0.35)]"
          >
            {options.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(o);
                }}
                onMouseMove={() => setActive(i)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-[14.5px] ${i === active ? "bg-paper-2 text-ink" : "text-ink-2"}`}
              >
                {o}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
