import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Linespedia",
  description: "Read the Privacy Policy for Linespedia to understand how we protect, collect, and use your personal information safely.",
  openGraph: {
    title: "Privacy Policy | Linespedia",
    description: "Read the Privacy Policy for Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Linespedia",
    description: "Read the Privacy Policy for Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 font-sans text-sm leading-relaxed space-y-8 text-foreground/90">
      <div className="space-y-3 border-b border-border/20 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Last updated: July 2026</p>
      </div>

      <p>
        At Linespedia, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy details how we collect, handle, secure, and use your personal information when you use our community services.
      </p>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">1. Information We Collect</h2>
        <p>
          We collect personal data that you provide directly to us when registering, creating profiles, or writing posts. This includes:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account Data:</strong> Email address, usernames, passwords, display names, and avatars.</li>
          <li><strong>Content Submissions:</strong> Writings, reactions, bookmark folders, and comments.</li>
          <li><strong>Log Data:</strong> IP address, browser user-agents, request timestamps, and referrer URLs.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">2. How We Use Your Information</h2>
        <p>
          Your data is used to provide, improve, and secure our social community platform. Specifically:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>To authenticate and manage your platform access.</li>
          <li>To process user-specific writing feeds, reactions, and bookmark actions.</li>
          <li>To distribute notifications for followers, likes, reviews, and mentions.</li>
          <li>To detect, prevent, and address security incidents or violating conduct.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">3. Authentication and Security</h2>
        <p>
          We leverage Stack Auth (Hexclave) as our secure cloud identity and authentication provider. Your account password and credentials are encrypted and stored safely on Stack Auth server networks, and are never transmitted to or processed directly by our servers.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">4. Data Retention and Deletion</h2>
        <p>
          We retain your personal data for as long as your account remains active. You can request database cleanup or permanent deletion of your profile details, publications, and comment logs by visiting your settings page or by contacting us.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">5. Third-Party Advertising and Cookies (Google AdSense)</h2>
        <p>
          We partner with Google AdSense to serve advertisements on our platform. To make sure you see relevant advertisements:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Third-party vendors, including Google, use cookies to serve advertisements based on your prior visits to Linespedia or other websites on the Internet.</li>
          <li>Google's use of advertising cookies (such as the DoubleClick cookie) enables it and its partners to serve personalized ads to you based on your visit history.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">6. Opting Out of Personalized Ads</h2>
        <p>
          You have full control over cookie tracking and personalized advertising choices:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>You can opt out of Google's personalized advertising settings by visiting the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline text-indigo-400">Google Ads Settings</a> page.</li>
          <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" className="underline text-indigo-400">AboutAds info</a> page.</li>
          <li>You can configure your browser to reject all cookies or block third-party trackers. Note that some site features may operate with reduced convenience as a result.</li>
        </ul>
      </div>
    </div>
  );
}
