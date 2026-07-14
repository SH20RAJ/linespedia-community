"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GlobalAudioPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    // Lazy-initialize audio object to prevent blocking next.js build/paint
    const audio = new Audio("/liecio-calming-rain-257596.mp3");
    audio.loop = true;
    audio.volume = 0.25; // Calming, low background volume
    audioRef.current = audio;

    // Autoplay attempt on first user interaction (browser policy workaround)
    const startAutoplay = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            cleanupListeners();
          })
          .catch(() => {
            // Autoplay blocked by browser, user must interact with player explicitly
          });
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener("click", startAutoplay);
      window.removeEventListener("keydown", startAutoplay);
    };

    window.addEventListener("click", startAutoplay);
    window.addEventListener("keydown", startAutoplay);

    return () => {
      cleanupListeners();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = null;
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Error playing audio:", err));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={togglePlay}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-md border border-border/40 shadow-lg hover:scale-105 transition-all duration-300"
        title={isPlaying ? "Pause Ambient Rain" : "Play Ambient Rain"}
      >
        {isPlaying ? (
          <Volume2 className="h-4 w-4 animate-pulse text-indigo-400" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
