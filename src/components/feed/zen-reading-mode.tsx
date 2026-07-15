"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, X, Music, Volume2, Sparkles, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface ZenReadingModeProps {
  title: string;
  authorName: string;
  content: string; // HTML content of the poem
}

export function ZenReadingMode({ title, authorName, content }: ZenReadingModeProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isNarrating, setIsNarrating] = React.useState(false);
  const [ambientPlay, setAmbientPlay] = React.useState(false);
  const [speechRate, setSpeechRate] = React.useState(0.9);

  const cleanText = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = content.replace(/<br\s*\/?>/gi, "\n");
    return temp.textContent || temp.innerText || "";
  }, [content]);

  // Audio elements
  const rainAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      // Initialize rain audio loop
      const audio = new Audio("https://archive.org/download/soft-rain-ambient-loop/soft-rain-ambient-loop.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      rainAudioRef.current = audio;
    }

    return () => {
      // Clean up sound on unmount
      if (rainAudioRef.current) {
        rainAudioRef.current.pause();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Sync ambient rain play
  React.useEffect(() => {
    if (!rainAudioRef.current) return;
    if (isOpen && ambientPlay) {
      rainAudioRef.current.play().catch(() => {
        console.warn("Autoplay blocked or audio failed to load");
      });
    } else {
      rainAudioRef.current.pause();
    }
  }, [ambientPlay, isOpen]);

  const handleStartSpeech = () => {
    if (!synthRef.current) return;

    // Cancel current
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    
    // Attempt to set a soft reading voice (e.g. English female if available)
    const voices = synthRef.current.getVoices();
    const desiredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (desiredVoice) {
      utterance.voice = desiredVoice;
    }

    utterance.onend = () => {
      setIsNarrating(false);
    };
    utterance.onerror = () => {
      setIsNarrating(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsNarrating(true);
  };

  const handleToggleNarration = () => {
    if (!synthRef.current) return;
    if (isNarrating) {
      synthRef.current.pause();
      setIsNarrating(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsNarrating(true);
      } else {
        handleStartSpeech();
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmbientPlay(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsNarrating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (!val) handleClose();
      else setIsOpen(true);
    }}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-indigo-500/35 text-indigo-500 hover:bg-indigo-500/10 hover:scale-105 active:scale-95 h-9 px-3 sm:px-4 bg-indigo-500/5 cursor-pointer">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Zen Mode</span>
      </DialogTrigger>
      
      <DialogContent 
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen max-w-none m-0 p-0 border-none bg-slate-950/98 backdrop-blur-md rounded-none text-slate-100 flex flex-col justify-between overflow-hidden z-50"
      >
        {/* Floating animated background aura */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none animate-pulse duration-[8000ms]" />

        {/* Top Controls Header */}
        <div className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between z-10 font-mono text-[10px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="uppercase tracking-widest text-indigo-400">Zen Canvas</span>
            <span>&middot;</span>
            <span className="truncate max-w-[200px]">{title}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Ambient Rain Sound Controls */}
            <button
              onClick={() => setAmbientPlay(!ambientPlay)}
              className={`flex items-center gap-1.5 transition-colors px-2 py-1 border border-white/10 ${
                ambientPlay ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/5" : "text-muted-foreground hover:text-white"
              }`}
            >
              {ambientPlay ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>Rain {ambientPlay ? "On" : "Off"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Immersive Typographic Poem Canvas */}
        <div className="flex-1 overflow-y-auto px-6 py-12 flex items-center justify-center z-10">
          <div className="max-w-xl w-full text-center space-y-8 select-none">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-xs font-mono text-indigo-400/80">
                — {authorName}
              </p>
            </div>

            <div 
              className="font-serif italic text-base md:text-lg leading-loose text-slate-300 whitespace-pre-wrap max-w-lg mx-auto pt-6 border-t border-white/5"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        {/* Bottom Playback Toolbar */}
        <div className="w-full bg-slate-900/40 border-t border-white/5 py-5 z-10">
          <div className="max-w-xl mx-auto px-6 flex items-center justify-between gap-6 font-mono">
            {/* Speed selection */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Speed:</span>
              {[0.75, 0.9, 1.1].map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    setSpeechRate(rate);
                    if (isNarrating) {
                      // Restart narration to apply rate changes instantly
                      handleStartSpeech();
                    }
                  }}
                  className={`px-1.5 py-0.5 border ${
                    speechRate === rate ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 font-bold" : "border-transparent hover:text-slate-100"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Play/Pause Speech Button */}
            <Button
              onClick={handleToggleNarration}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-6 flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-500/10"
            >
              {isNarrating ? (
                <>
                  <Pause className="h-4 w-4 fill-white" />
                  <span>Pause Narrator</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>AI Narrator</span>
                </>
              )}
            </Button>

            {/* Extra status */}
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              SpeechSynthesis Active
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
