export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 font-mono text-sm leading-relaxed space-y-6">
      <h1 className="text-xl font-bold tracking-tight border-b border-border/20 pb-4">Contact Us</h1>
      <p>
        Have questions, feedback, or suggestions? We would love to hear from you.
      </p>
      <p>
        Email: <a href="mailto:support@linespedia.com" className="underline hover:text-foreground">support@linespedia.com</a>
      </p>
      <p>
        GitHub: <a href="https://github.com/SH20RAJ/linespedia-community" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">SH20RAJ/linespedia-community</a>
      </p>
    </div>
  );
}
