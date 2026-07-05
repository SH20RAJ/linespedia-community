"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Copy, Check, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteCardModalProps {
  content: string;
  title: string;
  authorName: string;
  postUrl: string;
}

const THEMES = [
  { name: "Sunset Aura", class: "bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 text-white" },
  { name: "Midnight Glass", class: "bg-slate-950 border border-white/10 text-slate-100 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-tr before:from-violet-500/20 before:to-transparent" },
  { name: "Emerald Serenity", class: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white" },
  { name: "Minimalist Soft", class: "bg-muted/30 border border-border/50 text-foreground" },
  { name: "Cyberpunk Glow", class: "bg-black border border-pink-500/30 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)] font-mono" },
];

export function QuoteCardModal({ content, title, authorName, postUrl }: QuoteCardModalProps) {
  const cleanLines = React.useMemo(() => {
    // Basic text extraction without requiring browser DOM APIs during SSR compilation
    if (typeof window === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = content.replace(/<br\s*\/?>/gi, "\n");
    return temp.textContent || temp.innerText || "";
  }, [content]);

  const initialExcerpt = React.useMemo(() => {
    const lines = cleanLines.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.slice(0, 4).join("\n");
  }, [cleanLines]);

  const [excerpt, setExcerpt] = React.useState("");
  const [selectedTheme, setSelectedTheme] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const cardRef = React.useRef<HTMLDivElement>(null);

  // Initialize excerpt safely on mount to prevent hydration mismatch
  React.useEffect(() => {
    setExcerpt(initialExcerpt);
  }, [initialExcerpt]);

  const handleCopyText = () => {
    const textToCopy = `"${excerpt}"\n\n— ${authorName}\nRead on Linespedia: ${postUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Excerpt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      const width = 800;
      const height = 500;
      canvas.width = width;
      canvas.height = height;

      const theme = THEMES[selectedTheme];
      if (theme.name === "Sunset Aura") {
        const grad = ctx.createLinearGradient(0, height, width, 0);
        grad.addColorStop(0, "#f97316");
        grad.addColorStop(0.5, "#f43f5e");
        grad.addColorStop(1, "#4f46e5");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (theme.name === "Midnight Glass") {
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, width, height);
        const grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width);
        grad.addColorStop(0, "rgba(139, 92, 246, 0.15)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (theme.name === "Emerald Serenity") {
        const grad = ctx.createLinearGradient(0, height, width, 0);
        grad.addColorStop(0, "#059669");
        grad.addColorStop(1, "#14b8a6");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (theme.name === "Cyberpunk Glow") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.font = 'bold 180px Georgia, serif';
      ctx.fillText("“", 50, 180);

      let textColor = "#ffffff";
      let secondaryColor = "rgba(255, 255, 255, 0.7)";
      if (theme.name === "Minimalist Soft") {
        textColor = "#ffffff";
        secondaryColor = "rgba(255, 255, 255, 0.6)";
      } else if (theme.name === "Cyberpunk Glow") {
        textColor = "#ec4899";
        secondaryColor = "rgba(236, 72, 153, 0.7)";
      }

      ctx.fillStyle = textColor;
      ctx.font = 'italic 26px Georgia, serif';
      if (theme.name === "Cyberpunk Glow") {
        ctx.font = '22px Courier New, monospace';
      }

      const lines = excerpt.split("\n");
      let startY = 180;
      const lineHeight = 40;
      for (const line of lines) {
        ctx.fillText(line, 100, startY);
        startY += lineHeight;
      }

      ctx.fillStyle = secondaryColor;
      ctx.font = 'normal 20px Georgia, serif';
      if (theme.name === "Cyberpunk Glow") {
        ctx.font = '16px Courier New, monospace';
      }
      ctx.fillText(`— ${authorName}`, 100, startY + 20);

      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      if (theme.name === "Cyberpunk Glow") {
        ctx.fillStyle = "rgba(236, 72, 153, 0.5)";
      }
      ctx.font = 'bold 14px monospace';
      ctx.fillText("linespedia.com", width - 180, height - 50);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-quote.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Quote card downloaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate quote card.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-none text-xs font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 h-8 px-3">
        <Share2 className="h-3.5 w-3.5" />
        Aesthetic Card
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 font-mono text-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-indigo-400" />
            CREATE AESTHETIC SNIPPET CARD
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Snippet Text</label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs min-h-[140px] text-slate-300 focus-visible:ring-indigo-500"
                placeholder="Paste the verses or lines you want to share..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Choose Theme</label>
              <div className="grid grid-cols-1 gap-2">
                {THEMES.map((theme, idx) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(idx)}
                    className={`text-left p-2 border transition-all text-[10px] truncate flex items-center gap-2 ${
                      selectedTheme === idx ? "border-indigo-500 bg-slate-800 font-bold" : "border-slate-800 hover:border-slate-700 bg-slate-950"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full shrink-0 ${theme.class.split(" ")[0]} ${theme.class.includes("gradient") ? theme.class : "bg-slate-700"}`} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Preview Card</label>
              <div
                ref={cardRef}
                className={`w-full aspect-[8/5] p-6 relative overflow-hidden flex flex-col justify-between select-none ${THEMES[selectedTheme].class}`}
              >
                <div className="absolute left-4 top-2 text-white/5 text-8xl font-serif leading-none">
                  “
                </div>

                <div className="space-y-3 z-10">
                  <p className="font-serif italic text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {excerpt || "Select your favorite lines..."}
                  </p>
                  <p className="font-serif text-xs opacity-80">
                    — {authorName}
                  </p>
                </div>

                <div className="flex justify-between items-center z-10 opacity-70 text-[9px] font-mono">
                  <span>linespedia.com</span>
                  <span className="truncate max-w-[120px]">{title}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopyText} variant="outline" className="flex-1 text-xs border-slate-800 hover:bg-slate-800">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                Copy Text
              </Button>
              <Button onClick={handleDownloadImage} disabled={downloading} className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="h-3.5 w-3.5 mr-1" />
                {downloading ? "Generating..." : "Download Card"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
