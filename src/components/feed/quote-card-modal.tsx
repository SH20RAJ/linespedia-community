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
  ogImageUrl: string;
}

const THEMES = [
  { 
    name: "Sunset Aura", 
    class: "bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 text-white",
    type: "gradient",
    colors: ["#f97316", "#f43f5e", "#4f46e5"]
  },
  { 
    name: "Midnight Nebula", 
    class: "bg-slate-950 text-slate-100",
    type: "image",
    url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&auto=format&fit=crop&q=80"
  },
  { 
    name: "Emerald Serenity", 
    class: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white",
    type: "gradient",
    colors: ["#059669", "#14b8a6"]
  },
  { 
    name: "Aesthetic Forest", 
    class: "bg-stone-900 text-stone-100",
    type: "image",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80"
  },
  { 
    name: "Vintage Paper", 
    class: "bg-amber-50 text-stone-900",
    type: "image",
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80"
  }
];

export function QuoteCardModal({ content, title, authorName, postUrl, ogImageUrl }: QuoteCardModalProps) {
  const cleanLines = React.useMemo(() => {
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
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [imgTick, setImgTick] = React.useState(0);

  const loadedImagesRef = React.useRef<Record<string, HTMLImageElement>>({});

  // Initialize excerpt on mount
  React.useEffect(() => {
    setExcerpt(initialExcerpt);
  }, [initialExcerpt]);

  // Pre-load all theme images
  React.useEffect(() => {
    THEMES.forEach((t) => {
      if (t.type === "image" && t.url) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = t.url;
        img.onload = () => {
          loadedImagesRef.current[t.name] = img;
          setImgTick(prev => prev + 1); // trigger preview update
        };
      }
    });
  }, []);

  const drawCard = React.useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const theme = THEMES[selectedTheme];

    // Background drawing
    if (theme.type === "image") {
      const img = loadedImagesRef.current[theme.name];
      if (img) {
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      const grad = ctx.createLinearGradient(0, height, width, 0);
      if (theme.colors && theme.colors.length >= 3) {
        grad.addColorStop(0, theme.colors[0]);
        grad.addColorStop(0.5, theme.colors[1]);
        grad.addColorStop(1, theme.colors[2]);
      } else if (theme.colors && theme.colors.length >= 2) {
        grad.addColorStop(0, theme.colors[0]);
        grad.addColorStop(1, theme.colors[1]);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Semi-transparent overlay to ensure text contrast on all backgrounds
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, width, height);

    // Large quotes mark
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.font = 'bold 220px Georgia, serif';
    ctx.fillText("“", 40, 180);

    // Text colors
    let textColor = "#ffffff";
    let secondaryColor = "rgba(255, 255, 255, 0.85)";

    ctx.fillStyle = textColor;
    ctx.font = 'italic 25px Georgia, serif';

    const lines = excerpt.split("\n");
    let startY = 170;
    const lineHeight = 38;
    for (const line of lines) {
      ctx.fillText(line, 90, startY);
      startY += lineHeight;
    }

    // Draw Author name
    ctx.fillStyle = secondaryColor;
    ctx.font = 'normal 18px Georgia, serif';
    ctx.fillText(`— ${authorName}`, 90, startY + 22);

    // Draw branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = 'bold 13px monospace';
    ctx.fillText("linespedia.com", width - 150, height - 35);
  }, [selectedTheme, excerpt, authorName]);

  // Dynamically update preview data URL on change
  React.useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    drawCard(ctx, 800, 500);
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [drawCard, selectedTheme, excerpt, imgTick]);

  const handleCopyText = () => {
    const textToCopy = `"${excerpt}"\n\n— ${authorName}\nRead on Linespedia: ${postUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Excerpt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      canvas.width = 800;
      canvas.height = 500;

      drawCard(ctx, 800, 500);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-quote.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Quote card downloaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate quote card.");
    }
  };

  const handlePinterestShare = () => {
    const description = `"${excerpt.slice(0, 120)}..." — Discover beautiful verses by ${authorName} on Linespedia.`;
    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&media=${encodeURIComponent(ogImageUrl)}&description=${encodeURIComponent(description)}`;
    window.open(pinUrl, "_blank", "width=600,height=500");
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-indigo-500/35 text-indigo-500 hover:bg-indigo-500/10 hover:scale-105 active:scale-95 h-9 px-3 sm:px-4 bg-indigo-500/5 cursor-pointer">
        <Share2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Aesthetic Card</span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 font-mono text-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-indigo-400" />
            CREATE AESTHETIC SNIPPET CARD
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
          {/* Controls Left Column */}
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
                    <span className={`w-3 h-3 rounded-full shrink-0 ${theme.class ? theme.class.split(" ")[0] : "bg-slate-600"}`} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview & Action Buttons Right Column */}
          <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Preview Card</label>
              <div className="border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center aspect-[8/5] w-full relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Card Preview"
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <span className="text-muted-foreground text-[10px]">Generating preview...</span>
                )}
              </div>
            </div>

            {/* Sharing buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button onClick={handleCopyText} variant="outline" className="text-xs border-slate-800 hover:bg-slate-800 w-full">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                Copy Text
              </Button>
              
              <Button onClick={handleDownloadImage} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs w-full">
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>

              <Button
                onClick={handlePinterestShare}
                className="bg-[#bd081c] hover:bg-[#bd081c]/90 text-white text-xs w-full flex items-center justify-center gap-1"
              >
                <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.36-.72-.36-1.77c0-1.66.96-2.9 2.12-2.9 1 0 1.48.75 1.48 1.65 0 1-.64 2.5-.97 3.89-.28 1.17.58 2.12 1.73 2.12 2.08 0 3.68-2.2 3.68-5.37 0-2.8-2.02-4.77-4.9-4.77-3.33 0-5.28 2.5-5.28 5.08 0 1 .39 2.08.88 2.68.1.12.1.22.08.33l-.33 1.34c-.05.2-.18.25-.4.15-1.5-.7-2.43-2.9-2.43-4.66 0-3.8 2.76-7.3 7.97-7.3 4.18 0 7.43 2.98 7.43 6.96 0 4.16-2.62 7.5-6.26 7.5-1.22 0-2.37-.63-2.76-1.37l-.76 2.89c-.28 1.05-1.02 2.37-1.52 3.18C10.13 23.83 11.04 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                </svg>
                Pin
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
