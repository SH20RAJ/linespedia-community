import { db } from "@/db";
import { writings, users } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getPromptByWeek } from "@/config/prompts";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const runtime = "edge";

interface PromptPageProps {
  params: Promise<{ week: string }>;
}

export default async function PromptWeekPage({ params }: PromptPageProps) {
  const { week } = await params;
  const prompt = getPromptByWeek(week);

  if (!prompt) {
    notFound();
  }

  let submissions: any[] = [];
  try {
    // Search database for posts containing the challenge tag array element
    const list = await db
      .select({
        writing: writings,
        author: users,
      })
      .from(writings)
      .innerJoin(users, eq(writings.userId, users.id))
      .where(
        and(
          eq(writings.isDraft, false),
          sql`${writings.tags}::jsonb @> ${JSON.stringify([prompt.tag])}::jsonb`
        )
      )
      .orderBy(desc(writings.createdAt))
      .limit(100);

    submissions = list.map((item) => ({
      ...item.writing,
      author: item.author,
    }));
  } catch (err) {
    console.error("Failed to load prompt submissions on server:", err);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-12">
      {/* Prompt Banner */}
      <div className="border border-border/40 p-8 bg-muted/5 space-y-4 font-mono text-center">
        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 border border-primary/20 uppercase tracking-widest">
          Weekly Writing Prompt ({prompt.week})
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-serif">{prompt.title}</h1>
        
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 border border-border/20 bg-background/50">
            <span className="text-[10px] text-muted-foreground uppercase">Emotion Goal</span>
            <p className="font-bold text-foreground capitalize mt-0.5">{prompt.emotion}</p>
          </div>
          <div className="p-3 border border-border/20 bg-background/50">
            <span className="text-[10px] text-muted-foreground uppercase">Tag Submissions</span>
            <p className="font-bold text-indigo-400 mt-0.5">#{prompt.tag}</p>
          </div>
        </div>

        <div className="p-4 border border-indigo-500/10 bg-indigo-500/5 max-w-xl mx-auto rounded-none text-left">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Constraint</span>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {prompt.constraint}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href={`/create?prompt=${prompt.tag}&emotion=${prompt.emotion}`}
            className={buttonVariants({ size: "sm" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit Your Entry
          </Link>
        </div>
      </div>

      {/* Submissions Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-serif border-b border-border/20 pb-3">
          Challenge Entries ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <div className="text-center py-16 border border-border/20 bg-muted/5 font-mono">
            <p className="text-xs text-muted-foreground">No submissions yet. Be the first to enter the challenge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
