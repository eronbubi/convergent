import Link from "next/link";
import { getViewer } from "@/lib/data";
import { PlusIcon } from "@/components/ui/icons";
import { UserMenu } from "@/components/user-menu";

export async function HeaderAuth() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <>
        <Link href="/login" className="btn btn-sm hidden text-ink-2 hover:text-ink sm:inline-flex">
          Log in
        </Link>
        <Link href="/signup" className="btn btn-sm btn-primary">
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/new" className="btn btn-sm btn-clay">
        <PlusIcon className="-ml-1 size-4" />
        <span className="hidden sm:inline">Post</span>
      </Link>
      <UserMenu username={viewer.username} displayName={viewer.displayName} />
    </>
  );
}

export function HeaderAuthFallback() {
  return <span className="block h-9 w-[150px] rounded-full skeleton opacity-60" aria-hidden />;
}
