"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sparkles, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";

const STYLES = [
  {
    id: "gothic",
    name: "Gothic Melancholy (Edgar Allan Poe)",
    desc: "Haunting, dark, filled with shadows, ravens, and pallid sorrow.",
    prefixes: ["Amidst the midnight drear, ", "Upon the velvet shadow, ", "Within the tomb of silence, "],
    synonyms: {
      sad: "melancholy",
      dark: "tenebrous",
      ghost: "phantom",
      cry: "lament",
      beautiful: "hauntingly fair",
      dead: "departed",
      night: "midnight hour",
      wind: "chill autumn gale",
      heart: "heavy soul",
    },
    suffixes: [", in the shadow of the raven.", ", forevermore.", ", where the lost ones weep."]
  },
  {
    id: "shakespearean",
    name: "Shakespearean Bard (Sonnet)",
    desc: "Rich Elizabethan Old-English with sonnet structure, iambic feel, and courtly love.",
    prefixes: ["Hark! ", "Soft! What light yonder breaks? ", "Lo, "],
    synonyms: {
      you: "thou",
      your: "thy",
      are: "art",
      has: "hath",
      have: "hast",
      do: "doth",
      does: "doth",
      beautiful: "beauteous",
      love: "devotion",
      know: "wot",
      think: "deem",
    },
    suffixes: [", by my troth.", ", as a summer's day.", ", thee I swear."]
  },
  {
    id: "mystic",
    name: "Mystic Sufi (Rumi)",
    desc: "Spiritual, whirling dervish style of divine longing, flames, wine, and tavern flutes.",
    prefixes: ["O seeker! ", "Behind the veil of the eye, ", "In the tavern of the soul, "],
    synonyms: {
      god: "the Beloved",
      love: "divine ecstasy",
      drunk: "intoxicated with truth",
      silent: "silent flute",
      sad: "longing for the home",
      heart: "sacred jar",
      world: "illusion",
    },
    suffixes: [", whirl in ecstasy.", ", the Beloved is here.", ", return to the source."]
  },
  {
    id: "nature",
    name: "Transcendentalist Nature (Whitman)",
    desc: "Earthy, democratic, singing the body electric, referencing leaves, soil, and wild winds.",
    prefixes: ["I celebrate myself, ", "Out of the cradle endlessly rocking, ", "Lo! The grass underfoot: "],
    synonyms: {
      life: "cosmic surge",
      beautiful: "wildly sublime",
      body: "vessel of clay",
      wind: "unregulated wind",
      city: "marketplace of noise",
      sky: "limitless dome",
    },
    suffixes: [", I sing.", ", loose and free.", ", with the grass I emerge."]
  }
];

export function StyleImprover() {
  const [inputText, setInputText] = React.useState("");
  const [outputText, setOutputText] = React.useState("");
  const [selectedStyle, setSelectedStyle] = React.useState("gothic");
  const [copied, setCopied] = React.useState(false);
  const [transforming, setTransforming] = React.useState(false);

  const handleTransform = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some draft text to improve.");
      return;
    }

    setTransforming(true);
    setTimeout(() => {
      try {
        const style = STYLES.find((s) => s.id === selectedStyle);
        if (!style) throw new Error("Style not found");

        const lines = inputText.split("\n").map((l) => l.trim()).filter(Boolean);
        const transformedLines = lines.map((line, idx) => {
          let modified = line;
          
          // Apply synonyms
          Object.entries(style.synonyms).forEach(([word, replacement]) => {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            modified = modified.replace(regex, replacement);
          });

          // Apply prefix to the first line
          if (idx === 0) {
            const pref = style.prefixes[Math.floor(Math.random() * style.prefixes.length)];
            modified = pref + modified;
          }

          // Apply suffix to the last line or every few lines
          if (idx === lines.length - 1) {
            const suff = style.suffixes[Math.floor(Math.random() * style.suffixes.length)];
            // Strip punctuation if any, before adding suffix
            modified = modified.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") + suff;
          }

          // Capitalize first letter of each line for poetic structure
          return modified.charAt(0).toUpperCase() + modified.slice(1);
        });

        setOutputText(transformedLines.join("\n"));
        toast.success("Text styled successfully!");
      } catch (e) {
        toast.error("Failed to style text.");
      } finally {
        setTransforming(false);
      }
    }, 600);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast.success("Styled text copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStyleDesc = STYLES.find((s) => s.id === selectedStyle)?.desc || "";

  return (
    <div className="border border-border/40 p-5 bg-muted/5 space-y-6 font-mono text-xs text-slate-300">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          Style Improver
        </h3>
        <p className="text-[10px] text-muted-foreground">
          Transform your draft lines to mimic historical literary giants using rule-based aesthetic style matrices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input area */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Target Style</label>
            <Select value={selectedStyle} onValueChange={(val) => { if (val) setSelectedStyle(val); }}>
              <SelectTrigger className="bg-slate-950 border-slate-800 rounded-none h-8 text-[11px]">
                <SelectValue placeholder="Choose style" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 font-mono text-xs">
                {STYLES.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs focus:bg-slate-800">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-start gap-1.5 text-[9px] text-muted-foreground leading-normal mt-1">
              <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>{currentStyleDesc}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Your Poetry / Draft lines</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-slate-950 border-slate-800 rounded-none min-h-[160px] text-xs leading-relaxed focus-visible:ring-indigo-500"
              placeholder="Enter your rough verses here (e.g. 'beautiful night, you are silent, my heart is sad...')"
            />
          </div>

          <Button
            onClick={handleTransform}
            disabled={transforming}
            className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-none"
          >
            {transforming ? "Styling Draft..." : "Transform Style"}
          </Button>
        </div>

        {/* Output area */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5 flex-1 flex flex-col">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Styled Masterpiece</label>
            <div className="flex-1 bg-slate-950 border border-slate-800 p-4 font-serif italic text-sm leading-loose whitespace-pre-wrap select-all min-h-[200px]">
              {outputText || <span className="font-mono text-xs not-italic text-muted-foreground">Your transformed poetry will appear here...</span>}
            </div>
          </div>

          {outputText && (
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full text-xs border-slate-800 hover:bg-slate-800 rounded-none flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Transformed Verses"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
