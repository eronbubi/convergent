"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { lockScroll } from "@/components/smooth-scroll";
import { Avatar } from "@/components/ui/avatar";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { formatCount, plural } from "@/lib/format";
import { TAGS, tagLabel } from "@/lib/tags";
import type { PersonResult, Post, TagCount } from "@/lib/types";

type Results = { people: PersonResult[]; tags: TagCount[]; posts: Post[] };
type Item = { key: string; href: string };

const empty: Results = { people: [], tags: [], posts: [] };

export function SearchDialog() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>(empty);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const open = useCallback(() => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.showModal();
    lockScroll(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // ⌘K / Ctrl+K and "/" open search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable=true]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onQueryChange = (value: string) => {
    setQ(value);
    setActive(0);
    if (value.trim()) setLoading(true);
    else {
      setResults(empty);
      setLoading(false);
    }
  };

  // Debounced live search. Loading/empty states are set in onQueryChange.
  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (res.ok) {
          setResults(await res.json());
          setActive(0);
        }
      } catch {
        /* aborted or offline */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const items: Item[] = useMemo(() => {
    const term = q.trim();
    if (!term) return TAGS.slice(0, 8).map((t) => ({ key: `tag:${t.slug}`, href: `/tag/${t.slug}` }));
    return [
      ...results.people.map((p) => ({ key: `u:${p.username}`, href: `/u/${p.username}` })),
      ...results.tags.map((t) => ({ key: `tag:${t.tag}`, href: `/tag/${t.tag}` })),
      ...results.posts.map((p) => ({ key: `p:${p.id}`, href: `/p/${p.id}` })),
      { key: "all", href: `/search?q=${encodeURIComponent(term)}` },
    ];
  }, [q, results]);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) go(item.href);
      else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  // Scroll the active row into view inside the list.
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  // Option attributes for the row at position `i` in `items`.
  const opt = (i: number) => ({
    id: `${listId}-${i}`,
    role: "option" as const,
    "aria-selected": active === i,
    "data-active": active === i,
    onMouseMove: () => setActive(i),
  });

  const term = q.trim();
  const tagsAt = results.people.length;
  const postsAt = tagsAt + results.tags.length;
  const nothing = term && !loading && !results.people.length && !results.tags.length && !results.posts.length;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group hidden h-10 w-full max-w-[420px] items-center gap-3 rounded-full border border-line bg-card/70 pr-2 pl-4 text-left text-[14px] text-ink-3 transition-colors duration-200 hover:border-line-strong hover:text-ink-2 md:flex"
      >
        <SearchIcon className="size-[18px] shrink-0" />
        <span className="flex-1 truncate">Search posts, people, tags</span>
        <kbd className="rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-3">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className="grid size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink md:hidden"
      >
        <SearchIcon className="size-5" />
      </button>

      <dialog
        ref={dialogRef}
        className="search-dialog"
        aria-label="Search"
        onClose={() => {
          lockScroll(false);
          onQueryChange("");
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <SearchIcon className="size-5 shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search posts, people, tags"
            className="h-16 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-3"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items.length ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <span className="size-4 animate-spin rounded-full border-2 border-line border-t-clay" />}
          <button
            type="button"
            onClick={close}
            className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink"
            aria-label="Close search"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <div id={listId} role="listbox" className="max-h-[min(60vh,560px)] overflow-y-auto p-2" data-lenis-prevent>
          {!term && (
            <div className="px-3 pt-3 pb-2">
              <p className="eyebrow mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.slice(0, 8).map((t, i) => (
                  <button
                    {...opt(i)}
                    onClick={() => go(`/tag/${t.slug}`)}
                    key={t.slug}
                    type="button"
                    className="search-chip rounded-full border border-line px-3 py-1.5 text-[14px] text-ink-2 transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.people.length > 0 && (
            <Group label="People">
              {results.people.map((p, i) => (
                <button {...opt(i)} onClick={() => go(`/u/${p.username}`)} key={p.username} type="button" className="search-row">
                  <Avatar name={p.displayName} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{p.displayName}</span>
                    <span className="block truncate text-[13px] text-ink-3">
                      @{p.username} · {p.postCount} {plural(p.postCount, "post")}
                    </span>
                  </span>
                </button>
              ))}
            </Group>
          )}

          {results.tags.length > 0 && (
            <Group label="Tags">
              {results.tags.map((t, i) => (
                <button {...opt(tagsAt + i)} onClick={() => go(`/tag/${t.tag}`)} key={t.tag} type="button" className="search-row">
                  <span className="grid size-[34px] place-items-center rounded-full bg-paper-2 font-serif text-[18px] text-ink-2">
                    #
                  </span>
                  <span className="flex-1 font-medium text-ink">{tagLabel(t.tag)}</span>
                  <span className="tnum text-[13px] text-ink-3">
                    {t.count} {plural(t.count, "post")}
                  </span>
                </button>
              ))}
            </Group>
          )}

          {results.posts.length > 0 && (
            <Group label="Posts">
              {results.posts.map((p, i) => (
                <button {...opt(postsAt + i)} onClick={() => go(`/p/${p.id}`)} key={p.id} type="button" className="search-row">
                  <span className="relative size-[46px] shrink-0 overflow-hidden rounded-lg bg-paper-2">
                    <Image
                      src={p.posterUrl}
                      alt=""
                      fill
                      sizes="46px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{p.title}</span>
                    <span className="block truncate text-[13px] text-ink-3">
                      {p.promptEngineer} · {p.modelUsed}
                    </span>
                  </span>
                  <span className="tnum text-[13px] text-ink-3">{formatCount(p.copyCount)} copies</span>
                </button>
              ))}
            </Group>
          )}

          {nothing && (
            <p className="px-4 py-10 text-center text-ink-3">
              Nothing matches <span className="text-ink">“{term}”</span>.
            </p>
          )}

          {term && (
            <div className="mt-1 border-t border-line pt-1">
              <button
                {...opt(items.length - 1)}
                onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
                type="button"
                className="search-row text-ink-2"
              >
                <span className="grid size-[34px] place-items-center">
                  <SearchIcon className="size-4" />
                </span>
                <span className="flex-1">
                  See all results for <span className="font-medium text-ink">“{term}”</span>
                </span>
                <kbd className="font-mono text-[11px] text-ink-3">↵</kbd>
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1.5">
      <p className="eyebrow px-3 pt-2 pb-1.5">{label}</p>
      {children}
    </div>
  );
}
