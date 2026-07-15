import { db } from "@/db";
import { writings, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "edge";

export default async function PoemOfTheDayEmbed() {
  let writing: any = null;
  let author: any = null;
  try {
    const [row] = await db
      .select({
        writing: writings,
        author: users,
      })
      .from(writings)
      .innerJoin(users, eq(writings.userId, users.id))
      .where(eq(writings.isDraft, false))
      .orderBy(desc(writings.views))
      .limit(1);
    
    if (row) {
      writing = row.writing;
      author = row.author;
    }
  } catch (err) {
    console.error("Embed load failed:", err);
  }

  if (!writing) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground font-mono">
        No featured poem today.
      </div>
    );
  }

  const plainText = writing.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160) + (writing.content.replace(/<[^>]*>/g, "").length > 160 ? "..." : "");

  return (
    <div className="p-5 border border-border/40 bg-background/95 max-w-sm mx-auto font-sans rounded-none text-left space-y-4 shadow-sm select-none">
      <div className="flex items-center justify-between border-b border-border/10 pb-2 text-[10px] text-muted-foreground font-mono">
        <span className="font-bold uppercase tracking-widest text-primary">Poem of the Day</span>
        <span className="capitalize">{writing.primaryEmotion}</span>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground leading-snug">{writing.title}</h3>
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          "{plainText}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/10 text-[9px] text-muted-foreground font-mono">
        <span>by @{author.username}</span>
        <a 
          href={`https://linespedia.com/post/${writing.slug}?utm_source=embed&utm_medium=widget&utm_campaign=${writing.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary hover:underline"
        >
          Read Full &rarr;
        </a>
      </div>
    </div>
  );
}
