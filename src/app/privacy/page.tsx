export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 font-mono text-sm leading-relaxed space-y-6">
      <h1 className="text-xl font-bold tracking-tight border-b border-border/20 pb-4">Privacy Policy</h1>
      <p>Last updated: July 2026</p>
      <p>
        At Linespedia, we respect your privacy and are committed to protecting the personal data you share with us.
      </p>
      <p>
        <strong>1. Data We Collect</strong><br />
        We collect your email address, username, profile metadata, and published content when you register and interact with our services.
      </p>
      <p>
        <strong>2. How We Use Data</strong><br />
        We use your data to authenticate your account, customize your experience, process reactions, and notify you of interactions.
      </p>
      <p>
        <strong>3. Third-party Authentication</strong><br />
        We use Stack Auth (Hexclave) for secure authentication and identity management. Your credentials are secure and never exposed to our servers.
      </p>
    </div>
  );
}
