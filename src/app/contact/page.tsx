import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Linespedia",
  description: "Get in touch with the Linespedia support, feedback, and collaboration teams. We would love to hear your thoughts.",
  openGraph: {
    title: "Contact Us | Linespedia",
    description: "Get in touch with the Linespedia support, feedback, and collaboration teams.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Linespedia",
    description: "Get in touch with the Linespedia support, feedback, and collaboration teams.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 font-sans text-sm leading-relaxed space-y-8 text-foreground/90">
      <div className="space-y-3 border-b border-border/20 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">Contact Us</h1>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Help, feedback, and collaboration inquiries</p>
      </div>

      <p>
        Have questions, suggestions, or general feedback about the writing platform? We would love to hear from you. The Linespedia community thrives on collaboration and continuous user input.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="border border-border/40 p-5 space-y-2 bg-muted/5 font-mono">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Email Support</h2>
          <p className="text-[11px] text-muted-foreground">For account inquiries, bug reports, and database issues:</p>
          <p className="text-xs font-bold pt-2">
            <a href="mailto:support@linespedia.com" className="underline hover:text-primary">
              support@linespedia.com
            </a>
          </p>
        </div>

        <div className="border border-border/40 p-5 space-y-2 bg-muted/5 font-mono">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Developer Logs & Source</h2>
          <p className="text-[11px] text-muted-foreground">Explore, contribute, or open code issues on Github repository:</p>
          <p className="text-xs font-bold pt-2">
            <a href="https://github.com/SH20RAJ/linespedia-community" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              SH20RAJ/linespedia-community
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
