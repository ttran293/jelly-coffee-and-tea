"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import type { ThemeName } from "../theme";
import { CARD_SIZE, cardDataUrl, cardPalette } from "./artwork";
import { CARD_RECIPES, FEATURED_CARD_INDEX } from "./recipes";
import { playCardFlip, playCardGrab, preloadBark } from "../sound";

const cardWidth = 3;
const cardHeight = 1.8;
const halfWidth = cardWidth / 2;
const halfHeight = cardHeight / 2;
const holeX = -halfWidth + cardWidth * CARD_SIZE.holeInset / CARD_SIZE.width;
const holeY = halfHeight - cardHeight * CARD_SIZE.holeInset / CARD_SIZE.height;
const holeRadius = cardWidth * CARD_SIZE.holeRadius / CARD_SIZE.width;

function cardShape(back = false) {
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth, -halfHeight);
  shape.lineTo(halfWidth, -halfHeight);
  shape.lineTo(halfWidth, halfHeight);
  shape.lineTo(-halfWidth, halfHeight);
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(back ? -holeX : holeX, holeY, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function printedFace(shape: THREE.Shape) {
  const geometry = new THREE.ShapeGeometry(shape, 32);
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < positions.count; index++) {
    uv.setXY(index, (positions.getX(index) + halfWidth) / cardWidth, (positions.getY(index) + halfHeight) / cardHeight);
  }
  uv.needsUpdate = true;
  return geometry;
}

export function Card3D({ theme }: { theme: ThemeName }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = useRef({ x: -0.08, y: -0.28 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const hitCard = useRef<(x: number, y: number) => boolean>(() => false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    void preloadBark().catch(() => {});
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      const fallbackFrame = requestAnimationFrame(() => setSupported(false));
      return () => cancelAnimationFrame(fallbackFrame);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2, 2, 1.2, -1.2, 0.1, 20);
    camera.position.z = 6;
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(-2, 3, 5);
    scene.add(light);

    const stack = new THREE.Group();
    stack.position.y = 0.08;
    scene.add(stack);
    const palette = cardPalette(theme);
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    const loadArt = (recipeIndex: number, side: "front" | "back") => {
      const texture = loader.load(cardDataUrl(theme, CARD_RECIPES[recipeIndex], side, true));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      textures.push(texture);
      return texture;
    };
    const backTexture = loadArt(0, "back");
    const frontShape = cardShape();
    const backShape = cardShape(true);
    const cardMeshes: THREE.Mesh[] = [];
    CARD_RECIPES.forEach((_, index) => {
      const group = new THREE.Group();
      const rank = (index - FEATURED_CARD_INDEX + CARD_RECIPES.length) % CARD_RECIPES.length;
      group.position.set(holeX, holeY, 0.08 - rank * 0.06);
      group.rotation.z = -rank * 0.035;

      const body = new THREE.Mesh(
        new THREE.ExtrudeGeometry(frontShape, { depth: 0.012, bevelEnabled: false, curveSegments: 32 }),
        new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.9 }),
      );
      body.position.set(-holeX, -holeY, -0.006);
      group.add(body);
      cardMeshes.push(body);

      const front = new THREE.Mesh(
        printedFace(frontShape),
        new THREE.MeshBasicMaterial({ map: loadArt(index, "front"), side: THREE.FrontSide }),
      );
      front.position.set(-holeX, -holeY, 0.007);
      group.add(front);
      cardMeshes.push(front);

      const back = new THREE.Mesh(
        printedFace(backShape),
        new THREE.MeshBasicMaterial({ map: backTexture, side: THREE.FrontSide }),
      );
      back.rotation.y = Math.PI;
      back.position.set(-holeX, -holeY, -0.007);
      group.add(back);
      cardMeshes.push(back);

      stack.add(group);
    });

    // The ring stands perpendicular to the cards and threads through every punch hole.
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.014, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0xc6a878, metalness: 0.72, roughness: 0.28 }),
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.set(holeX, holeY + 0.13, 0.035);
    stack.add(ring);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    hitCard.current = (clientX, clientY) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(((clientX - bounds.left) / bounds.width) * 2 - 1, -((clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(cardMeshes, false).length > 0;
    };

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const aspect = width / height;
      const viewHeight = Math.max(2.72, 3.8 / aspect);
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let frame = 0;
    const render = () => {
      stack.rotation.x += (rotation.current.x - stack.rotation.x) * 0.14;
      stack.rotation.y += (rotation.current.y - stack.rotation.y) * 0.14;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      hitCard.current = () => false;
      observer.disconnect();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, [theme]);

  return <div className="card-3d-wrap">
    {supported ? <canvas ref={canvasRef} className="card-3d-canvas" aria-label={`Interactive Three.js book ring with ${CARD_RECIPES.length} recipe cards; ${CARD_RECIPES[FEATURED_CARD_INDEX].title} on top`} onPointerDown={(event) => { const sounding = hitCard.current(event.clientX, event.clientY); drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); if (sounding) playCardGrab(); }} onPointerMove={(event) => {
      if (!drag.current) return;
      rotation.current.y += (event.clientX - drag.current.x) * 0.009;
      rotation.current.x += (event.clientY - drag.current.y) * 0.006;
      drag.current = { x: event.clientX, y: event.clientY };
    }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} /> : <Image className="card-3d-fallback" src={cardDataUrl(theme, CARD_RECIPES[FEATURED_CARD_INDEX], "front")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt={`${CARD_RECIPES[FEATURED_CARD_INDEX].title} recipe card`} />}
    <div className="card-3d-actions"><div className="card-3d-buttons"><button type="button" onClick={() => { rotation.current.y += Math.PI; playCardFlip(); }}>flip stack ↻</button><button type="button" onClick={() => { rotation.current = { x: -0.08, y: -0.28 }; playCardGrab(); }}>reset view</button></div><span>drag to rotate 360°</span></div>
  </div>;
}
