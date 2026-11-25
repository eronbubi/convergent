"use client";

import { useRef, useTransition } from "react";
import { deletePost } from "@/app/actions/posts";
import { TrashIcon } from "@/components/ui/icons";

export function DeletePost({ postId }: { postId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="btn btn-sm btn-outline text-clay-deep">
        <TrashIcon className="size-4" />
        Delete
      </button>
      <dialog ref={dialog} className="search-dialog max-w-[420px] p-6" aria-labelledby="delete-title">
        <h2 id="delete-title" className="font-serif text-[26px] tracking-[-0.01em]">
          Delete this post?
        </h2>
        <p className="mt-2 text-ink-2">The image or clip, its prompt and its copy count are removed for good.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn btn-sm btn-outline" onClick={() => dialog.current?.close()}>
            Keep it
          </button>
          <button
            type="button"
            disabled={pending}
            className="btn btn-sm btn-clay"
            onClick={() => start(() => deletePost(postId))}
          >
            {pending ? "Deleting…" : "Delete post"}
          </button>
        </div>
      </dialog>
    </>
  );
}
