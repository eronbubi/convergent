import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal } from "@/components/motion";
import { DeletePost } from "@/components/post/delete-post";
import { PostCard } from "@/components/post/post-card";
import { Clip } from "@/components/post/clip";
import { PromptBlock } from "@/components/post/prompt-block";
import { ShareButton } from "@/components/post/share-button";
import { Arrow } from "@/components/sketch/doodles";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { TagChip } from "@/components/ui/tag-chip";
import { getPost, getRelated, getViewer } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { tagLabel } from "@/lib/tags";

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Post not found" };
  const image = post.posterUrl;
  return {
    title: post.title,
    description: `${post.modelUsed} · prompt by ${post.promptEngineer}. ${post.prompt.slice(0, 140)}`,
    openGraph: {
      images: [{ url: image, width: post.width, height: post.height }],
      videos: [{ url: post.mediaUrl, width: post.width, height: post.height }],
    },
  };
}

export default function PostPage({ params }: PageProps<"/p/[id]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostView params={params} />
    </Suspense>
  );
}

async function PostView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, viewer] = await Promise.all([getPost(id), getViewer()]);
  if (!post) notFound();

  const isOwner = viewer?.id === post.authorId;
  const engineerIsAuthor = post.engineerUsername === post.authorUsername;

  return (
    <article className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">
      <Link href="/#feed" className="group inline-flex items-center gap-2 text-[14px] text-ink-3 hover:text-ink">
        <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Feed
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Media stays in view while the details scroll past */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
            <Reveal y={20}>
              <div className="relative overflow-hidden rounded-[20px] bg-paper-2 shadow-[0_40px_80px_-50px_rgb(40_30_15/0.6)]">
                <span className="skeleton absolute inset-0" aria-hidden />
                <div className="relative">
                  <Clip post={post} fit="natural" mode="player" priority sizes="(min-width: 1024px) 58vw, 100vw" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.05}>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <TagChip key={t} tag={t} />
              ))}
            </div>
            <h1 className="mt-5 font-serif text-[clamp(2.4rem,4.4vw,4rem)] leading-[1.02] tracking-[-0.03em] text-ink text-balance">
              {post.title}
            </h1>
            <p className="mt-4 text-[15px] text-ink-3">
              Posted by{" "}
              <Link href={`/u/${post.authorUsername}`} className="text-ink-2 hover:text-ink">
                {post.authorDisplayName}
              </Link>{" "}
              on {formatDate(post.createdAt)}
            </p>
          </Reveal>

          <Reveal className="mt-9" delay={0.12}>
            <PromptBlock postId={post.id} prompt={post.prompt} copyCount={post.copyCount} />
          </Reveal>

          <dl className="mt-10">
            <Reveal as="div" className="border-t border-line py-6">
              <dt className="eyebrow">Model used</dt>
              <dd className="mt-2 font-serif text-[30px] leading-tight tracking-[-0.02em] text-ink">{post.modelUsed}</dd>
            </Reveal>

            {post.recommendedModels.length > 0 && (
              <Reveal as="div" className="border-t border-line py-6">
                <dt className="eyebrow">Recommended models for this prompt</dt>
                <dd className="mt-4">
                  <ul className="space-y-3">
                    {post.recommendedModels.map((m, i) => (
                      <li key={m} className="flex items-center gap-3 text-[17px] text-ink">
                        <Arrow
                          from={[3, 12]}
                          to={[34, 12]}
                          bend={i % 2 ? 6 : -6}
                          width={40}
                          height={24}
                          seed={i * 7 + 3}
                          delay={0.15 + i * 0.12}
                          className="w-7 shrink-0 text-clay"
                          strokeWidth={1.6}
                        />
                        {m}
                      </li>
                    ))}
                  </ul>
                </dd>
              </Reveal>
            )}

            <Reveal as="div" className="border-t border-line py-6">
              <dt className="eyebrow">Prompt engineer</dt>
              <dd className="mt-3 flex items-center gap-3">
                <Avatar name={post.promptEngineer} size={44} />
                <div>
                  {post.engineerUsername ? (
                    <Link href={`/u/${post.engineerUsername}`} className="text-[17px] font-medium text-ink link-underline">
                      {post.promptEngineer}
                    </Link>
                  ) : (
                    <p className="text-[17px] font-medium text-ink">{post.promptEngineer}</p>
                  )}
                  <p className="text-[13.5px] text-ink-3">
                    {engineerIsAuthor ? "Wrote the prompt and posted it" : `Credited by ${post.authorDisplayName}`}
                  </p>
                </div>
              </dd>
            </Reveal>

            <Reveal as="div" className="flex items-center justify-between gap-3 border-t border-line py-6">
              <dt className="sr-only">Actions</dt>
              <dd className="flex flex-wrap gap-2">
                <ShareButton title={post.title} />
                {isOwner && <DeletePost postId={post.id} />}
              </dd>
              <span className="text-[13px] text-ink-3">
                Clip · {post.width}×{post.height}
              </span>
            </Reveal>
          </dl>
        </div>
      </div>

      <Suspense fallback={null}>
        <Related id={post.id} />
      </Suspense>
    </article>
  );
}

async function Related({ id }: { id: string }) {
  const post = await getPost(id);
  if (!post) return null;
  const related = await getRelated(post, 6);
  if (related.length === 0) return null;
  return (
    <section className="mt-32" aria-labelledby="related-title">
      <Reveal className="mb-10 flex items-end justify-between border-t border-line pt-6">
        <h2 id="related-title" className="font-serif text-[clamp(2rem,3.4vw,3rem)] leading-none tracking-[-0.02em]">
          More in {tagLabel(post.tags[0])}
        </h2>
        <Link href={`/tag/${post.tags[0]}`} className="text-[14px] text-ink-2 hover:text-ink">
          See all
        </Link>
      </Reveal>
      <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function PostSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-10" aria-hidden>
      <div className="skeleton aspect-[4/5] rounded-[20px] lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="skeleton h-8 w-40 rounded-full" />
        <div className="skeleton h-16 w-full rounded-lg" />
        <div className="skeleton h-64 w-full rounded-[18px]" />
      </div>
    </div>
  );
}
