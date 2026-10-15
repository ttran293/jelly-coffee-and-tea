"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 720;
const HEIGHT = 400;
const TAU = Math.PI * 2;
const INK = "#424a40";
type Point = { x: number; y: number };
type Box = [number, number, number, number];
type Shape = { d: string; color: string; tone: number; line?: boolean; solid?: boolean; width?: number };
type Part = { id: string; name: string; box: Box; shapes: Shape[]; group: string; pivot: Point; amplitude: number; transform?: { scale: number; x: number; y: number } };
type Bloom = { x: number; y: number; start: number; radius: number };
type RenderPart = Part & { paths: Path2D[]; mask: HTMLCanvasElement; grey: HTMLCanvasElement; painted: HTMLCanvasElement; reveal: HTMLCanvasElement; bloom?: Bloom; done: boolean; angle: number; hover: number };
type Engine = { paint: (id: string) => void; focus: (id: string | null) => void; reset: () => void };

const shape = (d: string, color: string, tone = 0.14): Shape => ({ d, color, tone });
const line = (d: string, width = 1.1): Shape => ({ d, color: INK, tone: 0.85, line: true, width });
const oval = (x: number, y: number, rx: number, ry: number) => `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
const leaf = (x: number, y: number, dx: number, dy: number, wide: number) => {
  const length = Math.hypot(dx, dy);
  const nx = -dy / length * wide;
  const ny = dx / length * wide;
  return `M${x} ${y}C${x + dx * 0.2 + nx} ${y + dy * 0.2 + ny} ${x + dx * 0.7 + nx} ${y + dy * 0.7 + ny} ${x + dx} ${y + dy}C${x + dx * 0.7 - nx} ${y + dy * 0.7 - ny} ${x + dx * 0.2 - nx} ${y + dy * 0.2 - ny} ${x} ${y}Z`;
};

type Flower = { color: string; name: string; size: number; petals: number };

function plant(id: string, x: number, top: number, flower: Flower, trailing = false): Part[] {
  const root = { x: 400 + (x - 400) * 0.04, y: 236 };
  const lean = x - root.x;
  // Leave the glass almost upright, then tip the last stretch back toward center.
  const c1 = { x: root.x + lean * (trailing ? 0.25 : 0.1), y: trailing ? 210 : 178 };
  const c2 = { x: root.x + lean * (trailing ? 0.85 : 1.07), y: trailing ? top - 42 : top + 34 };
  const foliage: Shape[] = [line(`M${root.x} ${root.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x} ${top}`, 1.25)];
  for (let i = 0; i < 5; i++) {
    const t = 0.38 + i * 0.105;
    const u = 1 - t;
    const px = u ** 3 * root.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * x;
    const py = u ** 3 * root.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * top;
    const direction = (i % 2 ? 1 : -1);
    const dx = direction * (15 + i % 3 * 5);
    const dy = -9 - i * 2;
    foliage.push(shape(leaf(px, py, dx, dy, 5 + i % 2 * 2), i % 2 ? "#8aa46d" : "#698c52", 0.21));
    foliage.push(line(`M${px} ${py}Q${px + dx * 0.45} ${py + dy * 0.3} ${px + dx * 0.85} ${py + dy * 0.85}`, 0.65));
  }
  const sway = trailing ? 0.032 : 0.05;
  const left = Math.floor(Math.min(x, root.x) - 40);
  const upper = Math.floor(Math.min(top, c1.y, c2.y) - 38);
  const parts: Part[] = [{ id, name: `${flower.name} stem and leaves`, box: [left, upper, Math.ceil(Math.max(x, root.x) + 40) - left, Math.ceil(Math.max(top, root.y) + 20) - upper], shapes: foliage, group: id, pivot: root, amplitude: sway }];
  const petals: Shape[] = [];
  for (let i = 0; i < flower.petals; i++) {
    const angle = i / flower.petals * TAU + x * 0.09;
    const length = flower.size * (0.94 + Math.sin(i * 2.4) * 0.06);
    petals.push(shape(leaf(x, top, Math.cos(angle) * length, Math.sin(angle) * length, flower.size * (flower.petals <= 6 ? 0.52 : 0.25)), flower.color, 0.09));
  }
  const center = flower.size * 0.23;
  const padding = flower.size + 5;
  petals.push(shape(oval(x, top, center, center), "#bb8b36", 0.7));
  parts.push({ id: `${id}-flower`, name: flower.name, box: [x - padding, top - padding, padding * 2, padding * 2], shapes: petals, group: id, pivot: root, amplitude: sway });
  return parts;
}

// Paths stay as data until the browser mounts; no canvas APIs run during SSR.
const CUP_PARTS: Part[] = [
  { id: "straw", name: "the straw", box: [512, 61, 47, 105], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    shape("M514 160L529 72Q531 63 538 66L554 72L552 79L537 74L522 161Z", "#678551", 0.3),
    line("M533 72L519 153", 0.65),
  ] },
  { id: "glass", name: "the glass", box: [440, 126, 123, 155], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    shape("M444 140L456 263Q457 277 501 278Q542 277 545 263L557 140Z", "#d8e8df", 0.055),
    line("M448 153L459 260Q460 270 481 271M553 154L542 258Q541 267 531 270", 0.6),
  ] },
  { id: "milk", name: "the milk", box: [449, 170, 104, 104], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    shape("M450 176L552 176L542 258Q540 270 501 271Q465 270 461 258Z", "#e3d4ad", 0.08),
  ] },
  { id: "matcha", name: "the matcha", box: [445, 136, 112, 86], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    shape("M448 148Q502 137 554 147L548 204C536 194 527 215 513 207C501 199 495 222 482 210Q466 193 454 206Z", "#86a14d", 0.24),
    line("M450 154Q503 168 551 153", 0.7),
  ] },
  { id: "ice", name: "the ice cubes", box: [461, 117, 83, 54], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    shape("M467 127L490 121L502 142L477 151Z", "#c6ded4", 0.06),
    line("M472 129L488 126L496 140", 0.6),
    shape("M510 120L536 127L538 149L513 145Z", "#c6ded4", 0.06),
    line("M515 125L531 131L532 143", 0.6),
    shape("M488 146L512 140L521 158L498 165Z", "#c6ded4", 0.05),
  ] },
  { id: "rim", name: "the cup rim", box: [440, 128, 122, 32], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    line("M443 140C443 122 559 122 559 140C559 160 443 160 443 140Z", 1.8),
    line("M447 141C450 155 550 156 555 141", 0.8),
  ] },
  { id: "label", name: "the cup’s tea leaf", box: [478, 226, 48, 30], group: "cup", pivot: { x: 502, y: 274 }, amplitude: 0.004, shapes: [
    shape(leaf(501, 248, -16, -18, 7), "#63854e", 0.19),
    shape(leaf(502, 248, 17, -13, 6), "#8ca76a", 0.19),
    line("M499 253L503 240M501 247L490 234M503 245L514 238", 0.7),
  ] },
];

function nestCup(part: Part): Part {
  // Keep the original drawing and hit areas in the same coordinate system.
  const scale = 1.02;
  const x = 405 - 502 * scale;
  const y = 370 - 274 * scale;
  const [left, top, width, height] = part.box;
  const l = Math.floor(left * scale + x);
  const t = Math.floor(top * scale + y);
  return { ...part, transform: { scale, x, y }, amplitude: 0,
    pivot: { x: 405, y: 370 },
    box: [l, t, Math.ceil((left + width) * scale + x) - l, Math.ceil((top + height) * scale + y) - t],
  };
}

// Every stem starts inside the matcha. Back foliage is occluded by the glass;
// two trailing sprigs cross the rim in front, making the shared origin visible.
const BOUQUET: Part[] = [
  ...plant("edge-cream", 292, 118, { color: "#e5ce8a", name: "the left cream daisy", size: 15, petals: 11 }),
  ...plant("coral", 268, 78, { color: "#dc927c", name: "the coral cosmos", size: 22, petals: 6 }),
  ...plant("gold", 302, 46, { color: "#e9bb50", name: "the golden daisy", size: 25, petals: 12 }),
  ...plant("tall-lilac", 248, 58, { color: "#ac97c7", name: "the tall lilac aster", size: 18, petals: 14 }),
  ...plant("cream", 348, 40, { color: "#e5ce8a", name: "the tall cream daisy", size: 26, petals: 13 }),
  ...plant("high-gold", 400, 28, { color: "#e9bb50", name: "the high golden aster", size: 19, petals: 15 }),
  ...plant("rose", 452, 40, { color: "#ce8c9a", name: "the rose cosmos", size: 25, petals: 5 }),
  ...plant("cup-lilac", 552, 58, { color: "#ac97c7", name: "the lilac aster", size: 19, petals: 14 }),
  ...plant("pink", 500, 46, { color: "#d99ab4", name: "the pink daisy", size: 23, petals: 10 }),
  ...plant("high-coral", 532, 80, { color: "#dc927c", name: "the right coral cosmos", size: 20, petals: 6 }),
  ...plant("butter", 508, 118, { color: "#e5c16a", name: "the buttercup", size: 18, petals: 5 }),
  ...plant("blush", 318, 100, { color: "#d99ab4", name: "the blush cosmos", size: 21, petals: 5 }),
  ...plant("apricot", 338, 72, { color: "#e5ac7f", name: "the apricot cosmos", size: 18, petals: 6 }),
  ...plant("lilac", 372, 108, { color: "#ac97c7", name: "the lilac cosmos", size: 20, petals: 6 }),
  ...plant("ivory", 392, 68, { color: "#e5ce8a", name: "the ivory daisy", size: 20, petals: 12 }),
  ...plant("cup-blush", 428, 104, { color: "#d99ab4", name: "the small blush cosmos", size: 17, petals: 6 }),
  ...plant("cup-cream", 462, 74, { color: "#e5ce8a", name: "the cream flower", size: 16, petals: 11 }),
  ...plant("front-lilac", 482, 108, { color: "#ac97c7", name: "the low lilac flower", size: 17, petals: 6 }),
  ...plant("front-coral", 340, 148, { color: "#dc927c", name: "the low coral flower", size: 15, petals: 6 }),
  ...plant("front-cream", 378, 138, { color: "#e5ce8a", name: "the low cream daisy", size: 13, petals: 10 }),
  ...plant("peach", 460, 146, { color: "#e5ac7f", name: "the small peach daisy", size: 16, petals: 9 }),
  ...plant("cup-foot", 418, 132, { color: "#e9bb50", name: "the tiny golden daisy", size: 11, petals: 10 }),
];
const PARTS: Part[] = [
  ...BOUQUET.filter((part) => !part.id.endsWith("-flower")),
  ...CUP_PARTS.map(nestCup),
  ...BOUQUET.filter((part) => part.id.endsWith("-flower")),
  ...plant("cup-left", 338, 276, { color: "#e5ce8a", name: "the trailing cream daisy", size: 15, petals: 12 }, true),
  ...plant("cup-right", 468, 284, { color: "#d99ab4", name: "the trailing pink cosmos", size: 16, petals: 5 }, true),
  { id: "fallen-petals", name: "the fallen petals", box: [236, 348, 300, 48], group: "petals", pivot: { x: 405, y: 370 }, amplitude: 0, shapes: [
    shape(leaf(287, 376, 16, -8, 6), "#d99ab4", 0.12),
    shape(leaf(321, 369, 9, 4, 4), "#e5ce8a", 0.12),
    shape(leaf(478, 372, 18, -5, 6), "#d99ab4", 0.12),
    shape(leaf(252, 380, 14, -5, 5), "#e9bb50", 0.12),
    shape(leaf(356, 386, -11, 2, 5), "#dc927c", 0.12),
    shape(leaf(424, 384, 12, -3, 4), "#ac97c7", 0.12),
    shape(leaf(516, 378, -14, -6, 5), "#e5ac7f", 0.12),
  ] },
];

function surface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function makePart(part: Part, index: number): RenderPart {
  const [left, top, width, height] = part.box;
  const grey = surface(width * 2, height * 2);
  const painted = surface(width * 2, height * 2);
  const mask = surface(width * 2, height * 2);
  const tone = surface(width, height);
  const greys = grey.getContext("2d")!;
  const paints = painted.getContext("2d")!;
  const masks = mask.getContext("2d")!;
  const tones = tone.getContext("2d", { willReadFrequently: true })!;
  greys.setTransform(2, 0, 0, 2, -left * 2, -top * 2);
  paints.setTransform(2, 0, 0, 2, -left * 2, -top * 2);
  masks.setTransform(2, 0, 0, 2, -left * 2, -top * 2);
  tones.translate(-left, -top);
  const paths = part.shapes.map((item) => {
    const path = new Path2D(item.d);
    if (!part.transform) return path;
    const { scale, x, y } = part.transform;
    const transformed = new Path2D();
    transformed.addPath(path, { a: scale, d: scale, e: x, f: y });
    return transformed;
  });
  part.shapes.forEach((item, i) => {
    const p = paths[i];
    if (!item.line) {
      masks.fill(p);
      // Knock out overlapping shapes without introducing a paper-colored fill.
      // The page's own gradient stays visible through every unpainted area.
      paints.globalCompositeOperation = "destination-out";
      paints.fillStyle = "#000";
      paints.fill(p);
      paints.globalCompositeOperation = "source-over";
      paints.save();
      paints.clip(p);
      paints.globalAlpha = item.solid ? 1 : 0.68;
      paints.fillStyle = item.color;
      paints.fill(p);
      // Transparent pigment pools toward one edge, under the original ink.
      const wash = paints.createRadialGradient(left + width * 0.2, top + height * 0.15, 0, left + width * 0.5, top + height * 0.5, Math.max(width, height));
      wash.addColorStop(0, "#ffffff70");
      wash.addColorStop(0.6, "#ffffff00");
      wash.addColorStop(1, "#34432c30");
      paints.fillStyle = wash;
      paints.fillRect(left, top, width, height);
      paints.restore();
      const shade = tones.createLinearGradient(left, top, left + width, top + height);
      const light = Math.round(Math.max(0.015, item.tone * 0.45) * 255);
      const dark = Math.round(Math.min(1, item.tone * 1.7) * 255);
      shade.addColorStop(0, `rgb(${light},${light},${light})`);
      shade.addColorStop(1, `rgb(${dark},${dark},${dark})`);
      tones.fillStyle = shade;
      tones.fill(p);
    }
    tones.strokeStyle = "#bebebe";
    tones.lineWidth = item.width ?? 1.15;
    tones.lineJoin = tones.lineCap = "round";
    tones.stroke(p);
    if (item.solid) {
      greys.fillStyle = paints.fillStyle = INK;
      greys.fill(p);
      paints.fill(p);
    }
  });
  // Sample an unscaled raster. DPR is used only when drawing sprites, never
  // when deciding whether a point belongs to a shape.
  const pixels = tones.getImageData(0, 0, width, height).data;
  let seed = 9137 + index * 719;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  greys.fillStyle = paints.fillStyle = INK;
  greys.globalAlpha = paints.globalAlpha = 0.82;
  greys.beginPath();
  paints.beginPath();
  for (let y = 0.5; y < height; y += 1.12) {
    for (let x = 0.5; x < width; x += 1.12) {
      const px = Math.max(0, Math.min(width - 1, x + (random() - 0.5) * 1.1));
      const py = Math.max(0, Math.min(height - 1, y + (random() - 0.5) * 1.1));
      const offset = (Math.floor(py) * width + Math.floor(px)) * 4;
      if (!pixels[offset + 3] || random() > pixels[offset] / 255 * pixels[offset + 3] / 255) continue;
      const radius = 0.31 + random() * 0.37;
      const dx = left + px;
      const dy = top + py;
      greys.moveTo(dx + radius, dy);
      greys.arc(dx, dy, radius, 0, TAU);
      paints.moveTo(dx + radius, dy);
      paints.arc(dx, dy, radius, 0, TAU);
    }
  }
  greys.fill();
  paints.fill();
  return { ...part, paths, mask, grey, painted, reveal: surface(width * 2, height * 2), done: false, angle: 0, hover: 0 };
}

export function MatchaGarden() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [painted, setPainted] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !stage) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hitContext = surface(1, 1).getContext("2d")!;
    const parts = PARTS.map(makePart);
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = false;
    let lastTime = 0;
    let pointer: Point | null = null;
    let focused: string | null = null;
    let active: string | null = null;
    let ripples: { start: number; color: string }[] = [];

    const requestDraw = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const setActive = (id: string | null) => {
      if (id === active) return;
      active = id;
      stage.style.cursor = id ? "pointer" : "default";
    };
    const hit = (point: Point) => {
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        const [x, y, w, h] = part.box;
        if (point.x < x - 4 || point.x > x + w + 4 || point.y < y - 4 || point.y > y + h + 4) continue;
        for (let j = part.paths.length - 1; j >= 0; j--) {
          const item = part.shapes[j];
          hitContext.lineWidth = Math.max(7, item.width ?? 1);
          if (item.line ? hitContext.isPointInStroke(part.paths[j], point.x, point.y) : hitContext.isPointInPath(part.paths[j], point.x, point.y)) return { part, point };
        }
      }
      return null;
    };
    const paintPart = (part: RenderPart, point: Point) => {
      if (part.done || part.bloom) { requestDraw(); return; }
      const [x, y, w, h] = part.box;
      const radius = Math.max(...[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy]) => Math.hypot(cx - point.x, cy - point.y))) * 1.3;
      if (motion.matches) part.done = true;
      else part.bloom = { ...point, start: performance.now(), radius };
      if (part.id.endsWith("-flower") && !motion.matches) {
        ripples.push({ start: performance.now(), color: part.shapes[0].color });
        ripples = ripples.slice(-5);
      }
      setPainted((current) => [...current, part.id]);
      requestDraw();
    };
    const reveal = (part: RenderPart, time: number) => {
      if (!part.bloom) return;
      const bloom = part.bloom;
      const progress = Math.min(1, (time - bloom.start) / 1500);
      if (progress >= 1 || motion.matches) { part.done = true; part.bloom = undefined; return; }
      const [x, y, w, h] = part.box;
      const layer = part.reveal.getContext("2d")!;
      layer.setTransform(1, 0, 0, 1, 0, 0);
      layer.clearRect(0, 0, w * 2, h * 2);
      layer.globalCompositeOperation = "source-over";
      layer.drawImage(part.painted, 0, 0);
      layer.globalCompositeOperation = "destination-in";
      layer.setTransform(2, 0, 0, 2, -x * 2, -y * 2);
      const radius = Math.max(0.01, bloom.radius * (1 - Math.pow(1 - progress, 2)));
      const wash = layer.createRadialGradient(bloom.x, bloom.y, radius * 0.65, bloom.x, bloom.y, radius);
      wash.addColorStop(0, "#000");
      wash.addColorStop(1, "#0000");
      layer.fillStyle = wash;
      layer.fillRect(x, y, w, h);
      layer.globalCompositeOperation = "source-over";
    };
    function draw(time: number) {
      frame = 0;
      if (!context || !width || !height) return;
      const dt = Math.min(0.05, lastTime ? (time - lastTime) / 1000 : 1 / 60);
      lastTime = time;
      context.setTransform(dpr * width / WIDTH, 0, 0, dpr * height / HEIGHT, 0, 0);
      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.globalAlpha = 1;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        let hash = 2166136261;
        for (let c = 0; c < part.group.length; c++) hash = Math.imul(hash ^ part.group.charCodeAt(c), 16777619);
        const unit = (hash >>> 0) / 4294967296;
        const gust = ((hash >>> 8) % 1000) / 1000;
        const hoveredGroup = active?.endsWith("-flower") ? active.slice(0, -"-flower".length) : active;
        const hovering = Boolean(part.amplitude) && hoveredGroup === part.group;
        part.hover += ((hovering ? 1 : 0) - part.hover) * (1 - Math.exp(-dt * 2.5));
        const reach = part.amplitude * (1 + part.hover * 0.16);
        let target = Math.sin(time * (0.00036 + gust * 0.00028) + unit * TAU) * reach;
        target += Math.sin(time * (0.00014 + unit * 0.00012) + gust * TAU) * reach * 0.28;
        if (motion.matches) target = 0;
        part.angle += (target - part.angle) * (1 - Math.exp(-dt * 6));
        reveal(part, time);
        const [x, y, w, h] = part.box;
        context.save();
        context.translate(part.pivot.x, part.pivot.y);
        context.rotate(part.angle);
        context.translate(-part.pivot.x, -part.pivot.y);
        // Occlude earlier ink while revealing the live page background below.
        context.globalCompositeOperation = "destination-out";
        context.drawImage(part.mask, x, y, w, h);
        context.globalCompositeOperation = "source-over";
        context.drawImage(part.done ? part.painted : part.grey, x, y, w, h);
        if (part.bloom) context.drawImage(part.reveal, x, y, w, h);
        if (focused === part.id) {
          context.strokeStyle = "#798b62";
          context.lineWidth = 1;
          context.setLineDash([2, 4]);
          for (let j = 0; j < part.paths.length; j++) if (!part.shapes[j].line) context.stroke(part.paths[j]);
        }
        context.restore();
      }
      // Painting a bloom answers at the shared source: the surface of the tea.
      ripples = ripples.filter((ripple) => time - ripple.start < 1600);
      context.save();
      context.beginPath();
      context.ellipse(404, 234, 53, 12, 0, 0, TAU);
      context.clip();
      for (const ripple of ripples) {
        const progress = Math.max(0, (time - ripple.start) / 1600);
        context.globalAlpha = (1 - progress) * 0.65;
        context.strokeStyle = ripple.color;
        context.lineWidth = 1.1;
        context.beginPath();
        context.ellipse(404, 234, 5 + progress * 59, 2 + progress * 13, 0, 0, TAU);
        context.stroke();
      }
      context.restore();
      if (!motion.matches) requestDraw();
    }
    const locate = (event: MouseEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) / rect.width * WIDTH, y: (event.clientY - rect.top) / rect.height * HEIGHT };
    };
    const onMove = (event: PointerEvent) => {
      pointer = locate(event);
      setActive(hit(pointer)?.part.id ?? null);
      requestDraw();
    };
    const onLeave = () => { pointer = null; setActive(null); requestDraw(); };
    const onClick = (event: MouseEvent) => {
      const target = hit(locate(event));
      if (target) paintPart(target.part, target.point);
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      requestDraw();
    };
    const syncMotion = () => { lastTime = 0; requestDraw(); };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
      else requestDraw();
    };
    const observer = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { lastTime = 0; requestDraw(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(stage);
    intersection.observe(stage);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    motion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", visibility);
    engineRef.current = {
      paint: (id) => {
        const part = parts.find((item) => item.id === id);
        if (part) { const [x, y, w, h] = part.box; paintPart(part, { x: x + w / 2, y: y + h / 2 }); }
      },
      focus: (id) => { focused = id; setActive(id); requestDraw(); },
      reset: () => { for (const part of parts) { part.done = false; part.bloom = undefined; } ripples = []; setPainted([]); requestDraw(); },
    };
    resize();
    return () => {
      engineRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <figure className="matcha-garden" aria-label="A paintable flower garden growing from a glass of matcha">
    <div className="matcha-garden__stage" ref={stageRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="matcha-garden__targets" role="group" aria-label="Paint individual parts of the illustration">
        {PARTS.map((part) => <button key={part.id} type="button" className="matcha-garden__target" style={{ left: `${(part.box[0] + part.box[2] / 2) / WIDTH * 100}%`, top: `${(part.box[1] + part.box[3] / 2) / HEIGHT * 100}%` }} aria-label={`Paint ${part.name}`} aria-pressed={painted.includes(part.id)} onFocus={() => engineRef.current?.focus(part.id)} onBlur={() => engineRef.current?.focus(null)} onClick={() => engineRef.current?.paint(part.id)}><span aria-hidden="true">+</span></button>)}
      </div>
    </div>
    <figcaption className="matcha-garden__caption"><button type="button" onClick={() => engineRef.current?.reset()} disabled={!painted.length}>start over ↺</button></figcaption>
    <span className="matcha-garden__status" aria-live="polite">{painted.length ? `${painted.length} ${painted.length === 1 ? "part" : "parts"} painted. Each part keeps its own color.` : "An unpainted ink drawing. Tab to a part and press Enter to paint it."}</span>
  </figure>;
}
