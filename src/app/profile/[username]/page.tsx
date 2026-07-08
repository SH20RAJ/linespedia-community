import { Suspense } from "react";
import { ProfileContainer } from "@/components/profile/profile-container";
import { Metadata } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  let result: any = null;
  try {
    const [row] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    result = row;
  } catch (e) {
    console.warn("Could not fetch user metadata", e);
  }

  if (!result) return { title: `@${username} | Linespedia` };

  return {
    title: `${result.displayName || result.username} (@${result.username}) | Linespedia`,
    description: result.bio || `Read articles, poetry, and thoughts published by @${result.username} on Linespedia.`,
    alternates: {
      canonical: `/profile/${result.username}`,
    },
    openGraph: {
      title: `${result.displayName || result.username} (@${result.username})`,
      description: result.bio || `Read articles, poetry, and thoughts published by @${result.username} on Linespedia.`,
      images: result.avatar ? [result.avatar] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  let dbUser: any = null;
  try {
    const [row] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    dbUser = row;
  } catch (e) {
    console.warn("Error fetching user for schema generation", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": dbUser?.displayName || username,
      "alternateName": username,
      "description": dbUser?.bio || `Author profile of @${username} on Linespedia.`,
      "image": dbUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      "url": `https://linespedia.com/profile/${username}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading profile...</div>}>
        <ProfileContainer username={username} />
      </Suspense>
    </>
  );
}
