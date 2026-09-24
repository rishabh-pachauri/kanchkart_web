"use client";

import { useRef, useState, type PointerEvent } from "react";
import { MoveUpRight, RotateCcw } from "lucide-react";
import Link from "next/link";

export function GlassLightStudio() {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty("--light-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--light-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--turn-x", `${(0.5 - y) * 16}deg`);
    event.currentTarget.style.setProperty("--turn-y", `${(x - 0.5) * 24}deg`);
  }

  function reset() {
    scene.current?.removeAttribute("style");
  }

  return (
    <section className="container py-16" aria-labelledby="light-studio-title">
      <div className="glass-studio grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200">
            The beauty of clarity
          </p>
          <h2
            id="light-studio-title"
            className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl"
          >
            Ordinary moments.
            <br />
            <span className="italic text-amber-200">Extraordinary light.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
            A quiet morning. A table for two. Discover glassware that makes the everyday feel
            considered.
          </p>
          <Link
            href="/shop"
            className="focus-ring mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-amber-200/40 px-6 py-3 text-sm text-amber-100 transition hover:bg-white/10"
          >
            Find your everyday glass <MoveUpRight className="h-4 w-4" />
          </Link>
          <p className="mt-8 text-xs text-white/60">
            Move across the glass to bend the light. On touch screens, drag gently.
          </p>
        </div>
        <div
          ref={scene}
          className="glass-scene"
          data-paused={paused}
          onPointerMove={move}
          onPointerLeave={reset}
        >
          <div className="glass-caustics" aria-hidden="true" />
          <div className="glass-dust" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 37 + 7) % 100}%`,
                  top: `${(i * 23 + 11) % 95}%`,
                  animationDelay: `${-i * 0.7}s`
                }}
              />
            ))}
          </div>
          <div className="glass-objects" aria-hidden="true">
            <div className="glass-vessel glass-vessel-tall">
              <span />
            </div>
            <div className="glass-vessel glass-vessel-short">
              <span />
            </div>
            <div className="glass-plinth" />
          </div>
          <span className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.2em] text-white/50">
            An exploration of light & glass
          </span>
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => {
              setPaused(!paused);
              reset();
            }}
            className="focus-ring absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs text-white/80"
          >
            <RotateCcw className="h-3 w-3" />
            {paused ? "Resume effects" : "Pause effects"}
          </button>
        </div>
      </div>
    </section>
  );
}
