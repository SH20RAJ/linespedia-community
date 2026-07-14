import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Sparkles, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Products | Linespedia",
  description: "Explore our premium reading platforms and extensive literary archives: Storix and Linespedia Library.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-12">
      <div className="text-center space-y-3 pb-8 border-b border-border/20">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Our Products</h1>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Premium reading platforms & literary archives</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product 1: Storix */}
        <div className="border border-border/40 p-6 bg-muted/5 space-y-4 font-mono flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500 animate-pulse" />
                Storix / Wify
              </h2>
              <span className="text-[10px] bg-pink-500/10 text-pink-500 font-bold px-2 py-0.5 border border-pink-500/20">Swipe Stories</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Experience immersive text stories through a seamless swipe interface. Premium stories for the modern age.
            </p>
          </div>
          <a
            href="https://storix.linespedia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline pt-4"
          >
            Visit Storix <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Product 2: Library */}
        <div className="border border-border/40 p-6 bg-muted/5 space-y-4 font-mono flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Linespedia Library
              </h2>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-bold px-2 py-0.5 border border-indigo-500/20">Literary Archive</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discover curated shayari, poems, quotes, captions, writer pages, meanings, and shareable poetic lines on Linespedia.
            </p>
          </div>
          <a
            href="https://library.linespedia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline pt-4"
          >
            Visit Library <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
