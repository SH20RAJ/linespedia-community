import { db } from "@/db";
import { writings, users, reactions, bookmarks, reviews } from "@/db/schema";
import { eq, and, sql, desc, like } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Eye, GitFork } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReactionsSection } from "@/components/feed/reactions";
import { CommentsSection } from "@/components/feed/comments";
import { BookmarkButton } from "@/components/feed/bookmark";
import { ReviewsSection } from "@/components/feed/reviews";
import { QuoteCardModal } from "@/components/feed/quote-card-modal";
import { ZenReadingMode } from "@/components/feed/zen-reading-mode";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdSenseAd } from "@/components/common/adsense-ad";
import Link from "next/link";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchPostBySlug(slug: string) {
  const [exactResult] = await db
    .select({
      writing: writings,
      author: users,
    })
    .from(writings)
    .innerJoin(users, eq(writings.userId, users.id))
    .where(eq(writings.slug, slug));

  if (exactResult) return exactResult;

  // Try fallback query: normalize slug by converting all underscores to hyphens
  const prefix = slug.slice(0, 30);
  const candidates = await db
    .select({
      writing: writings,
      author: users,
    })
    .from(writings)
    .innerJoin(users, eq(writings.userId, users.id))
    .where(like(writings.slug, `${prefix}%`));

  const targetNormalized = slug.toLowerCase().replace(/_/g, "-");
  const matched = candidates.find(
    (c) => c.writing.slug.toLowerCase().replace(/_/g, "-") === targetNormalized
  );
  return matched || null;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPostBySlug(slug);
  if (!result) return { title: "Writing Not Found" };

  const plainText = result.writing.content.replace(/<[^>]*>/g, "").slice(0, 160);
  const emotionOgImages: Record<string, string> = {
    love: "https://linespedia.com/og-love.png",
    sad: "https://linespedia.com/og-sad.png",
    hope: "https://linespedia.com/og-hope.png",
    peace: "https://linespedia.com/og-peace.png",
  };
  const ogImageUrl = emotionOgImages[result.writing.primaryEmotion.toLowerCase()] || "https://linespedia.com/og-main.png";

  return {
    title: `${result.writing.title} | Linespedia`,
    description: plainText,
    openGraph: {
      title: result.writing.title,
      description: plainText,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 1200, alt: `${result.writing.title} on Linespedia` }],
    },
    twitter: {
      card: "summary_large_image",
      title: result.writing.title,
      description: plainText,
      images: [ogImageUrl],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const result = await fetchPostBySlug(slug);

  if (!result) {
    notFound();
  }

  const emotionOgImages: Record<string, string> = {
    love: "https://linespedia.com/og-love.png",
    sad: "https://linespedia.com/og-sad.png",
    hope: "https://linespedia.com/og-hope.png",
    peace: "https://linespedia.com/og-peace.png",
  };
  const ogImageUrl = emotionOgImages[result.writing.primaryEmotion.toLowerCase()] || "https://linespedia.com/og-main.png";

  // Increment views directly in D1/Postgres on load
  await db
    .update(writings)
    .set({ views: result.writing.views + 1 })
    .where(eq(writings.id, result.writing.id));

  // Query Parent writing if any
  let parentWriting = null;
  if (result.writing.parentWritingId) {
    const [p] = await db
      .select({
        title: writings.title,
        slug: writings.slug,
        authorName: users.displayName,
        authorUsername: users.username,
      })
      .from(writings)
      .innerJoin(users, eq(writings.userId, users.id))
      .where(eq(writings.id, result.writing.parentWritingId));
    parentWriting = p || null;
  }

  // Query Child duets if any
  const childDuets = await db
    .select({
      id: writings.id,
      title: writings.title,
      slug: writings.slug,
      authorName: users.displayName,
      authorUsername: users.username,
    })
    .from(writings)
    .innerJoin(users, eq(writings.userId, users.id))
    .where(and(eq(writings.parentWritingId, result.writing.id), eq(writings.isDraft, false)))
    .limit(5);

  // Get aggregated reaction counts
  const dbReactions = await db
    .select({
      count: sql<number>`count(*)`,
      type: reactions.type,
    })
    .from(reactions)
    .where(eq(reactions.writingId, result.writing.id))
    .groupBy(reactions.type);

  const reactionsMap = dbReactions.reduce((acc, curr) => {
    acc[curr.type] = Number(curr.count);
    return acc;
  }, {} as Record<string, number>);

  // Fetch up to 3 related writings (same primaryEmotion, excluding current)
  const related = await db
    .select({
      writing: writings,
      author: users,
    })
    .from(writings)
    .innerJoin(users, eq(writings.userId, users.id))
    .where(
      and(
        eq(writings.primaryEmotion, result.writing.primaryEmotion),
        eq(writings.isDraft, false),
        sql`${writings.id} != ${result.writing.id}`
      )
    )
    .orderBy(desc(writings.publishedAt))
    .limit(3);

  // Query reviews
  const dbReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
      user: users,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.writingId, result.writing.id));

  const totalReviews = dbReviews.length;
  const avgRating = totalReviews > 0
    ? dbReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 5.0;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": result.writing.title,
    "description": result.writing.content.replace(/<[^>]*>/g, "").slice(0, 160),
    "datePublished": result.writing.publishedAt?.toISOString(),
    "dateModified": result.writing.updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": result.author.displayName || result.author.username,
      "url": `https://linespedia.com/profile/${result.author.username}`,
    },
  };

  if (totalReviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": totalReviews,
      "bestRating": "5",
      "worstRating": "1",
    };
    jsonLd.review = dbReviews.map((r) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.user.displayName || r.user.username,
      },
      "datePublished": r.createdAt.toISOString(),
      "reviewBody": r.content || "",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": "5",
        "worstRating": "1",
      },
    }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Schema.org Article metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="space-y-6">
        {/* Post header details */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-[10px] capitalize font-mono py-0.5 px-2 ${getEmotionBadgeStyles(result.writing.primaryEmotion)}`}>
              {result.writing.primaryEmotion}
            </Badge>
            {result.writing.secondaryEmotion && (
              <Badge variant="outline" className={`text-[10px] capitalize font-mono py-0.5 px-2 ${getEmotionBadgeStyles(result.writing.secondaryEmotion)}`}>
                {result.writing.secondaryEmotion}
              </Badge>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{result.writing.title}</h1>

          {parentWriting && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono bg-indigo-950/20 p-2 border border-indigo-500/10 w-fit">
              <GitFork className="h-3.5 w-3.5 text-indigo-400" />
              <span>Duet continuation of</span>
              <Link href={`/post/${parentWriting.slug}`} className="font-bold hover:underline">
                {parentWriting.title}
              </Link>
              <span>by @{parentWriting.authorUsername}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link href={`/profile/${result.author.username}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={result.author.avatar || ""} />
                <AvatarFallback className="text-[10px]">{result.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-wrap items-baseline gap-1.5 text-xs text-muted-foreground font-mono">
              <Link href={`/profile/${result.author.username}`} className="font-bold text-foreground hover:underline">
                {result.author.displayName || result.author.username}
              </Link>
              <span>&middot;</span>
              <span>@{result.author.username}</span>
              <span>&middot;</span>
              <span>
                {formatDistanceToNow(new Date(result.writing.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Post content render */}
        <div
          className="prose prose-sm dark:prose-invert font-mono text-sm leading-relaxed max-w-none pt-4 border-t border-border/20"
          dangerouslySetInnerHTML={{ __html: result.writing.content }}
        />

        {/* Details bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border/20 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {result.writing.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {result.writing.views + 1} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ZenReadingMode
              title={result.writing.title}
              authorName={result.author.displayName || result.author.username}
              content={result.writing.content}
            />
            <QuoteCardModal
              content={result.writing.content}
              title={result.writing.title}
              authorName={result.author.displayName || result.author.username}
              postUrl={`https://linespedia.com/post/${result.writing.slug}`}
              ogImageUrl={ogImageUrl}
            />
            <Link
              href={`/create?duetOf=${result.writing.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-none text-xs font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 h-8 px-3"
            >
              <GitFork className="h-3.5 w-3.5" />
              Duet
            </Link>
            <BookmarkButton writingId={result.writing.id} initialBookmarked={false} />
          </div>
        </div>

        {/* Reactions Section */}
        <ReactionsSection
          writingId={result.writing.id}
          initialReactions={reactionsMap}
          initialUserReaction={null}
        />

        {/* AdSense Article Bottom Slot */}
        <AdSenseAd slot="article-bottom" />

        {/* Tabs for Comments and Reviews & Ratings */}
        <Tabs defaultValue="comments" className="w-full pt-6 border-t border-border/20">
          <TabsList className="grid w-full grid-cols-2 bg-muted/20 font-mono">
            <TabsTrigger value="comments" className="text-xs cursor-pointer">Comments</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs cursor-pointer">Reviews & Ratings</TabsTrigger>
          </TabsList>
          <TabsContent value="comments" className="mt-4 focus-visible:outline-none">
            <CommentsSection writingId={result.writing.id} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-4 focus-visible:outline-none">
            <ReviewsSection writingId={result.writing.id} />
          </TabsContent>
        </Tabs>

        {/* Duet Continuations Section */}
        {childDuets.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border/20 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5" />
              Duet Continuations ({childDuets.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {childDuets.map((item) => (
                <Link
                  key={item.id}
                  href={`/post/${item.slug}`}
                  className="block p-3 border border-emerald-500/20 hover:border-emerald-500/50 transition-colors bg-emerald-950/5 space-y-1.5 hover:bg-emerald-950/10"
                >
                  <h4 className="text-xs font-bold truncate text-foreground">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Continued by @{item.authorUsername}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Writings Section */}
        {related.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border/20 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Writings ({result.writing.primaryEmotion})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.writing.id}
                  href={`/post/${item.writing.slug}`}
                  className="block p-4 border border-border/40 hover:border-border transition-colors bg-muted/5 space-y-2 hover:bg-muted/10"
                >
                  <h4 className="text-xs font-bold truncate text-foreground">{item.writing.title}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">
                    by {item.author.displayName || item.author.username}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
