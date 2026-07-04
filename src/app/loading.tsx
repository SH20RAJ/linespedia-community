export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center font-mono space-y-4">
      <div className="flex gap-1.5 items-center justify-center">
        <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-bounce" />
      </div>
      <p className="text-[10px] tracking-widest text-muted-foreground uppercase">loading lines</p>
    </div>
  );
}
