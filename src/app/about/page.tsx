import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Linespedia",
  description: "Learn more about the vision, community, and values of Linespedia - a writing-first social platform organized by emotions.",
  openGraph: {
    title: "About Us | Linespedia",
    description: "Learn more about the vision, community, and values of Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Linespedia",
    description: "Learn more about the vision, community, and values of Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 font-sans text-sm leading-relaxed space-y-8 text-foreground/90">
      <div className="space-y-3 border-b border-border/20 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">About Linespedia</h1>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Our vision, core values, and community guidelines</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">1. Our Vision</h2>
        <p>
          Linespedia is a writing-first social network designed to celebrate raw emotional expression and typography. In a digital landscape dominated by fast-paced media, transient video clips, and algorithmic noise, we offer a serene oasis—a canvas built purely for writers, poets, essayists, and thinkers.
        </p>
        <p>
          We believe that language is the ultimate vehicle for human connection. By focusing on typography, layout, and emotion-driven categorization, we seek to return dignity and beauty to digital reading and publishing.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">2. Categorization by Emotions</h2>
        <p>
          Unlike traditional networks organized around hashtags or topical domains, Linespedia filters the world through emotional currents. Users tag writings with primary feelings—such as <em>Love, Sad, Hope, Peace, Motivation, Nostalgia, Dream, and Gratitude</em>—allowing readers to tune in directly to the emotional wavelength they wish to experience.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">3. Distraction-Free Typography</h2>
        <p>
          Every pixel of Linespedia is crafted to maximize reading focus. Our custom-tailored editor is based on TipTap, supporting offline autosaving drafts so you never lose your creative spark. We avoid heavy layouts, ad banners, and intrusive banners, ensuring that your lines remain the primary focus.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">4. Who We Are</h2>
        <p>
          We are a collective of writers, designers, and developers who value literature, deep connections, and clean interfaces. Linespedia is built for the quiet creators and the empathetic observers. We welcome you to find your space here.
        </p>
      </div>
    </div>
  );
}
