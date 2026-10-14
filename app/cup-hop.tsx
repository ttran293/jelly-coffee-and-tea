"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "running" | "over";
type Cup = { x: number; passed: boolean };

const WIDTH = 640;
const HEIGHT = 180;
const GROUND = 166;
const DOG_X = 52;
const DOG_HEIGHT = 68;
const CUP_WIDTH = 54;
const DOG_ART = [
  "           __",
  "      (___()'`;",
  "      /,    /`",
  '      \\\\"--\\\\',
];
const CUP_ART = [
  "    |",
  "  _____",
  " |     |",
  " |     |",
  " |     |",
  "  \\___/",
];

export function CupHop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !stage || !ctx) return;

    let gamePhase: Phase = "idle";
    let dogY = 0;
    let velocity = 0;
    let cups: Cup[] = [];
    let elapsed = 0;
    let spawnIn = 1.1;
    let points = 0;
    let lastTime = 0;
    let frame = 0;

    const start = () => {
      gamePhase = "running";
      dogY = 0;
      velocity = 0;
      cups = [{ x: WIDTH - 70, passed: false }];
      elapsed = 0;
      spawnIn = 1.65;
      points = 0;
      setScore(0);
      setPhase("running");
    };

    actionRef.current = () => {
      if (gamePhase !== "running") {
        start();
        return;
      }
      if (dogY === 0) velocity = -320;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "ArrowUp") return;
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, button, a, [contenteditable='true']") && !stage.closest(".cup-hop")?.contains(target)) return;
      const bounds = stage.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      event.preventDefault();
      if (!event.repeat) actionRef.current();
    };
    window.addEventListener("keydown", onKeyDown);

    const pixel = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    };

    const drawDog = (y: number, ink: string) => {
      ctx.font = '600 16px "IBM Plex Mono", Consolas, monospace';
      ctx.textBaseline = "top";
      ctx.fillStyle = ink;
      DOG_ART.forEach((line, index) => ctx.fillText(line, DOG_X, Math.round(y) + index * 17));
    };

    const drawCup = (x: number, ink: string) => {
      const y = GROUND - 66;
      ctx.font = '600 11px "IBM Plex Mono", Consolas, monospace';
      ctx.textBaseline = "top";
      ctx.fillStyle = ink;
      CUP_ART.forEach((line, index) => ctx.fillText(line, Math.round(x), y + index * 11));
    };

    const draw = (time: number) => {
      const dt = Math.min((time - (lastTime || time)) / 1000, 0.04);
      lastTime = time;
      const styles = getComputedStyle(stage);
      const background = styles.getPropertyValue("--panel").trim();
      const ink = styles.getPropertyValue("--ink").trim();
      const muted = styles.getPropertyValue("--line").trim();

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      pixel(0, GROUND, WIDTH, 2, ink);
      for (let x = 0; x < WIDTH; x += 22) pixel(x, GROUND + 10, 10, 2, muted);

      if (gamePhase === "running") {
        elapsed += dt;
        velocity += 520 * dt;
        dogY = Math.min(0, dogY + velocity * dt);
        if (dogY === 0) velocity = 0;
        const speed = Math.min(310, 190 + elapsed * 7);
        cups.forEach((cup) => {
          cup.x -= speed * dt;
          if (!cup.passed && cup.x + CUP_WIDTH < DOG_X + 40) {
            cup.passed = true;
            points += 1;
            setScore(points);
            try {
              const record = Math.max(points, Number(localStorage.getItem("jelly-cup-hop-best")) || 0);
              localStorage.setItem("jelly-cup-hop-best", String(record));
              setBest(record);
            } catch { setBest((current) => Math.max(current, points)); }
          }
          if (cup.x + 9 < DOG_X + 104 && cup.x + 44 > DOG_X + 54 && dogY > -18) {
            gamePhase = "over";
            setPhase("over");
          }
        });
        cups = cups.filter((cup) => cup.x > -CUP_WIDTH);
        spawnIn -= dt;
        if (spawnIn <= 0) {
          cups.push({ x: WIDTH + 15, passed: false });
          spawnIn = Math.max(1.15, 1.75 - elapsed * 0.012) + Math.random() * 0.5;
        }
      }

      if (gamePhase === "idle") drawCup(WIDTH - 130, ink);
      for (const cup of cups) drawCup(cup.x, ink);
      drawDog(GROUND - DOG_HEIGHT + dogY + (gamePhase === "idle" ? Math.round(Math.sin(time / 260) * 2) : 0), ink);
      frame = requestAnimationFrame(draw);
    };

    const bestFrame = requestAnimationFrame(() => {
      try { setBest(Number(localStorage.getItem("jelly-cup-hop-best")) || 0); } catch { /* Storage is optional. */ }
    });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(bestFrame);
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      actionRef.current = () => {};
    };
  }, []);

  return <section className="cup-hop" aria-labelledby="cup-hop-title">
    <div className="cup-hop-heading"><div><span className="section-label">PUP.EXE / A LITTLE BREAK</span><h2 id="cup-hop-title">cup hop</h2><p>Help Jelly jump over the drinks. One more cup?</p></div><div className="cup-hop-score" aria-live="polite"><span>SCORE <strong>{String(score).padStart(3, "0")}</strong></span><span>BEST <strong>{String(best).padStart(3, "0")}</strong></span></div></div>
    <div className="cup-hop-stage" ref={stageRef}><canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="ASCII dog jumping over drink cups" role="img" onPointerDown={() => actionRef.current()} /><div className="cup-hop-message" aria-live="polite">{phase === "idle" ? "READY, JELLY?" : phase === "over" ? "OOPS! SPILLED ONE." : ""}</div></div>
    <div className="cup-hop-controls"><span>SPACE / ↑ / TAP TO JUMP<br /><a href="https://www.asciiart.eu/art/d350134f132151b7" target="_blank" rel="noreferrer">dog art by Joan G. Stark (jgs)</a></span><button type="button" onClick={() => actionRef.current()}>{phase === "idle" ? "start hopping →" : phase === "over" ? "try again ↻" : "jump ↑"}</button></div>
  </section>;
}
