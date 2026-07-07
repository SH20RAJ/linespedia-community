import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, Mail, Compass, HelpCircle, FileText } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-12 text-slate-300">
      {/* Title & Introduction */}
      <div className="space-y-4 text-center pb-8 border-b border-border/20">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
          About Linespedia
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground font-mono leading-relaxed">
          A dedicated, distraction-free typography oasis celebrating literature, poetry, and raw emotional resonance.
        </p>
      </div>

      {/* Grid of Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-border/40 p-6 bg-muted/5 space-y-3 font-mono">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" />
            1. Our Vision & Mission
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Linespedia is designed purely for writers, poets, and readers who value beautiful words. By stripping away transient video clips, algorithmic noise, and sensory overload, we provide a clean, typographic canvas where thoughts carry their true weight.
          </p>
        </div>

        <div className="border border-border/40 p-6 bg-muted/5 space-y-3 font-mono">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            2. Emotional Wavebands
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Our platform organizes literature around emotional wavelengths. Users catalog writings by primary feelings like <em>Love, Sadness, Hope, Peace, Motivation, and Nostalgia</em>. This allows readers to find exactly the words that resonate with their current frame of mind.
          </p>
        </div>

        <div className="border border-border/40 p-6 bg-muted/5 space-y-3 font-mono">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            3. Interactive Writing Suite
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            From our client-side **Style Improver** that shifts drafts to match literary legends, to the HTML5 **Quote Card Generator** and interactive **Poetic Duet** continuation chains, Linespedia turns creative writing into an immersive, collaborative experience.
          </p>
        </div>

        <div className="border border-border/40 p-6 bg-muted/5 space-y-3 font-mono">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            4. Content & Moderation Standards
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            We hold our community to strict, family-friendly safety standards. All user-generated content, comments, and reviews are audited continuously by our admin team using a custom moderation console to prevent spam, plagiarism, or unsafe material.
          </p>
        </div>
      </div>

      {/* AdSense Compliance & Content Quality block */}
      <div className="border border-border/40 p-8 bg-muted/5 space-y-6 rounded-none">
        <h2 className="text-lg font-serif font-bold text-slate-100 tracking-tight flex items-center gap-2 border-b border-border/10 pb-3">
          <FileText className="h-5 w-5 text-indigo-400" />
          AdSense & Monetization Disclosures
        </h2>
        
        <div className="space-y-4 text-xs font-mono leading-relaxed text-slate-300">
          <p>
            To fund secure cloud hosting, real-time database transactions, and ongoing engineering, Linespedia displays minimal, non-intrusive advertisements served through Google AdSense. We prioritize user experience and make sure ads never disrupt the reading layout.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 uppercase tracking-wide">Originality & Copyright Compliance</h3>
            <p>
              We host a blend of community-contributed contemporary poetry and curated historical literature. All historical poems are verified as public domain in accordance with standard copyright laws. Community contributors retain the ownership of their submissions under the platform's <Link href="/terms" className="underline hover:text-indigo-400">Terms of Service</Link>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 uppercase tracking-wide">Privacy & Cookie Management</h3>
            <p>
              Third-party vendors, including Google, use cookies to serve personalized ads based on a user's prior visits. You can read our comprehensive <Link href="/privacy" className="underline hover:text-indigo-400">Privacy Policy</Link> to learn how to manage these options or opt-out of cookie tracking at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Support info */}
      <div className="text-center space-y-4 font-mono py-6 border-t border-border/20">
        <div className="flex justify-center gap-2 text-xs">
          <Link href="/privacy" className="underline hover:text-slate-100">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="underline hover:text-slate-100">Terms of Service</Link>
          <span>&middot;</span>
          <Link href="/contact" className="underline hover:text-slate-100">Contact Us</Link>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Questions or feedback? Reach out directly via email to <a href="mailto:support@linespedia.com" className="underline text-indigo-400">support@linespedia.com</a>.
        </p>
      </div>
    </div>
  );
}
