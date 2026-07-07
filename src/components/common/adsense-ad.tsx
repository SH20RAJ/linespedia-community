"use client";

import * as React from "react";

interface AdSenseAdProps {
  slot?: string;
  format?: string;
  style?: React.CSSProperties;
}

export function AdSenseAd({ slot = "default", format = "auto", style = { display: "block" } }: AdSenseAdProps) {
  React.useEffect(() => {
    try {
      // Safely push advertisement to Google AdSense global array
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push rejected (Ads blocker active or script loading delay)");
    }
  }, []);

  return (
    <div className="w-full bg-muted/5 border border-border/10 p-3 font-mono text-[9px] text-muted-foreground/60 text-center select-none space-y-1">
      <div className="text-right uppercase tracking-widest text-[8px] opacity-75">Advertisement</div>
      <div className="flex justify-center items-center min-h-[90px] bg-slate-950/30 border border-dashed border-border/30">
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client="ca-pub-1828915420581549"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
