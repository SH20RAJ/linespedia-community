import { Suspense } from "react";
import { LanguageContainer } from "@/components/feed/language-container";
import { Metadata } from "next";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  hi: "Hindi",
  ur: "Urdu",
  fr: "French",
  bn: "Bangla",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  ar: "Arabic",
  de: "German",
};

interface LanguagePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LanguagePageProps): Promise<Metadata> {
  const { lang } = await params;
  const name = LANG_NAMES[lang] || lang;
  return {
    title: `${name} Writings | Linespedia`,
    description: `Read and feel poems, shayari, quotes, and thoughts written in ${name}.`,
  };
}

export default async function LanguagePage({ params }: LanguagePageProps) {
  const { lang } = await params;

  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading language feed...</div>}>
      <LanguageContainer lang={lang} />
    </Suspense>
  );
}
