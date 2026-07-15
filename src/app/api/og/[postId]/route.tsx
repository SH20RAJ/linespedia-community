import { ImageResponse } from "next/og";
import { db } from "@/db";
import { writings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const { postId } = await props.params;

  try {
    const [row] = await db
      .select({
        writing: writings,
        author: users,
      })
      .from(writings)
      .innerJoin(users, eq(writings.userId, users.id))
      .where(eq(writings.id, postId));

    if (!row) {
      return new Response("Not Found", { status: 404 });
    }

    const { title, content, primaryEmotion } = row.writing;
    const authorName = row.author.displayName || row.author.username;

    // Faint preview of post content (strip tags, truncate)
    const cleanText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180) + (content.replace(/<[^>]*>/g, "").length > 180 ? "..." : "");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#f6f0dd", // Warm book parchment page
            border: "24px solid #3f2e24", // Leather cover outer frame
            padding: "60px 80px",
            fontFamily: "serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid rgba(138, 66, 43, 0.15)", paddingBottom: "20px" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "#8a422b", letterSpacing: "3px" }}>
              LINESPEDIA
            </span>
            <span style={{ fontSize: "18px", textTransform: "uppercase", color: "#8a422b", border: "1px solid rgba(138, 66, 43, 0.3)", padding: "4px 12px", borderRadius: "100px", letterSpacing: "1px" }}>
              {primaryEmotion}
            </span>
          </div>

          {/* Main Book Page Content */}
          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", width: "100%" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#2e251b", margin: "0 0 20px 0", lineHeight: 1.25 }}>
              {title}
            </h1>
            <p style={{ fontSize: "28px", fontStyle: "italic", color: "#4f3c2f", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
              "{cleanText}"
            </p>
          </div>

          {/* Footer Page / Author credit */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(138, 66, 43, 0.1)", paddingTop: "20px", fontSize: "20px", color: "#666" }}>
            <span>Aged Manuscript Archive</span>
            <span style={{ fontStyle: "italic" }}>
              Published by <span style={{ fontWeight: "bold", color: "#2e251b", fontStyle: "normal" }}>@{authorName}</span>
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation failed:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
