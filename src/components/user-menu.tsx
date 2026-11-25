"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu({ username, displayName }: { username: string; displayName: string }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const hide = () => ref.current?.hidePopover();

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className="user-menu-trigger rounded-full transition-transform duration-300 hover:-rotate-6"
        aria-label="Account menu"
      >
        <Avatar name={displayName} size={38} />
      </button>
      <div ref={ref} id={id} popover="auto" className="user-menu">
        <div className="px-3 pt-2 pb-3">
          <p className="truncate font-medium text-ink">{displayName}</p>
          <p className="truncate text-[13px] text-ink-3">@{username}</p>
        </div>
        <div className="hairline mx-1" />
        <nav className="flex flex-col py-1.5">
          <Link href={`/u/${username}`} onClick={hide} className="menu-item">
            Your profile
          </Link>
          <Link href="/new" onClick={hide} className="menu-item">
            New post
          </Link>
          <Link href="/settings" onClick={hide} className="menu-item">
            Settings
          </Link>
        </nav>
        <div className="hairline mx-1" />
        <form action="/auth/signout" method="post" className="pt-1.5">
          <button type="submit" className="menu-item w-full text-left text-clay-deep">
            Log out
          </button>
        </form>
      </div>
    </>
  );
}
