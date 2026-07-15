import { Suspense } from "react";
import { ProfileContainer } from "@/components/profile/profile-container";
import { Metadata } from "next";
import { getInitialUserProfile, getInitialWritings } from "@/lib/db-queries";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  let result: any = null;
  try {
    result = await getInitialUserProfile(username);
  } catch (e) {
    console.warn("Could not fetch user metadata", e);
  }

  if (!result) return { title: `@${username}` };

  return {
    title: `${result.displayName || result.username} (@${result.username})`,
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
  let initialWritings: any[] = [];
  try {
    dbUser = await getInitialUserProfile(username);
    if (dbUser) {
      initialWritings = await getInitialWritings({ userId: dbUser.id, limit: 50 });
    }
  } catch (e) {
    console.warn("Error fetching user or writings on server", e);
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
        <ProfileContainer username={username} initialProfile={dbUser} initialWritings={initialWritings} />
      </Suspense>
    </>
  );
}
