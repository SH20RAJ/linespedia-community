import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Linespedia",
  description: "Read the Terms of Service for Linespedia to understand user responsibilities, copyright licenses, and platform rules.",
  openGraph: {
    title: "Terms of Service | Linespedia",
    description: "Read the Terms of Service for Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Linespedia",
    description: "Read the Terms of Service for Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 font-sans text-sm leading-relaxed space-y-8 text-foreground/90">
      <div className="space-y-3 border-b border-border/20 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">Terms of Service</h1>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Last updated: July 2026</p>
      </div>

      <p>
        Welcome to Linespedia. By accessing, joining, or posting on our community services, you agree to comply with and be bound by these Terms of Service. Please review them carefully.
      </p>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">1. Account Creation</h2>
        <p>
          To write posts or leave reactions, you must register a secure account. You are responsible for safeguarding your credentials. Any actions executed through your account will be considered your authorized representation.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">2. Content Ownership and License</h2>
        <p>
          You retain full copyright and ownership of the literature, poems, and shayari you publish on Linespedia. However, by publishing content, you grant us a worldwide, non-exclusive, royalty-free, perpetual license to host, display, aggregate, format, and distribute your content across our platform services.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">3. Prohibited Conduct</h2>
        <p>
          You agree not to submit writings or comment threads that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Are abusive, hateful, defamatory, or harassing to other community members.</li>
          <li>Infringe upon third-party intellectual property or copyright licenses.</li>
          <li>Represent unsolicited commercial promotion, spam links, or malicious code scripts.</li>
        </ul>
        <p>
          We reserve the absolute right to remove any post, comments, or suspend user accounts violating these community rules.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">4. Disclaimers and Limitations</h2>
        <p>
          Linespedia is provided "as is" and "as available" without warranty of any kind. We are not liable for lost content, database interruptions, or secondary damages arising out of your platform access or data usage.
        </p>
      </div>
    </div>
  );
}
