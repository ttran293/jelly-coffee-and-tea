"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SIDES = 14;

export function HeroCup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.6, 1.6, 2.42, -1.82, 0.1, 20);
    camera.position.set(3, 2.3, 6.5);
    camera.lookAt(0, 0.3, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xa7c8ac, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    key.position.set(-3, 5, 5);
    scene.add(key);
    const rimLight = new THREE.DirectionalLight(0xd7f4ff, 1.2);
    rimLight.position.set(3, 2, -4);
    scene.add(rimLight);

    const cup = new THREE.Group();
    cup.rotation.y = -0.3;
    scene.add(cup);
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], position: [number, number, number], order = 0) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.renderOrder = order;
      cup.add(mesh);
      return mesh;
    };
    const solid = (color: number, roughness = 0.58) => new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
    const clear = (color: number, opacity: number, roughness = 0.17) => new THREE.MeshPhysicalMaterial({
      color, roughness, metalness: 0, transparent: true, opacity, depthWrite: false,
      side: THREE.DoubleSide, flatShading: true, clearcoat: 0.8, clearcoatRoughness: 0.1,
    });

    const textures: THREE.Texture[] = [];
    const speckled = (base: string, highlight: string, shadow: string) => {
      const surface = document.createElement("canvas");
      surface.width = surface.height = 128;
      const context = surface.getContext("2d");
      if (!context) return null;
      context.fillStyle = base;
      context.fillRect(0, 0, 128, 128);
      for (let row = 3; row < 128; row += 7) {
        for (let column = 3; column < 128; column += 7) {
          context.fillStyle = (row + column) % 3 === 0 ? highlight : shadow;
          context.beginPath();
          context.arc(column + (row % 2), row, 0.7, 0, Math.PI * 2);
          context.fill();
        }
      }
      const texture = new THREE.CanvasTexture(surface);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      textures.push(texture);
      return texture;
    };
    const milkTexture = speckled("#e8d7b5", "rgba(255,255,243,.35)", "rgba(161,130,95,.12)");
    const matchaTexture = speckled("#536f24", "rgba(190,217,123,.34)", "rgba(27,65,24,.22)");
    const textured = (map: THREE.Texture | null, fallback: number, roughness: number) =>
      new THREE.MeshStandardMaterial({ color: map ? 0xffffff : fallback, map, roughness, flatShading: true });

    // Opaque liquid gives the cup a clear silhouette against the pale page.
    add(new THREE.CylinderGeometry(0.69, 0.48, 1.59, SIDES), textured(milkTexture, 0xe8d7b5, 0.67), [0, -0.35, 0]);
    add(new THREE.CylinderGeometry(0.745, 0.69, 0.55, SIDES), textured(matchaTexture, 0x536f24, 0.65), [0, 0.75, 0]);
    add(new THREE.CylinderGeometry(0.745, 0.745, 0.018, SIDES), solid(0x73923a, 0.46), [0, 1.03, 0]);
    const surfaceHighlight = add(new THREE.TorusGeometry(0.744, 0.018, 3, SIDES), clear(0xb6ce72, 0.62), [0, 1.04, 0], 3);
    surfaceHighlight.rotation.x = Math.PI / 2;

    // A broad faceted edge suggests matcha folding into milk without thin drips.
    const lowerEdge = [0.31, 0.22, -0.07, -0.18, 0.12, 0.3, 0.2, 0.05, -0.12, 0.13, 0.28, 0.08, -0.15, 0.19];
    const skirtVertices: number[] = [];
    const skirtIndices: number[] = [];
    for (let index = 0; index <= SIDES; index++) {
      const angle = index / SIDES * Math.PI * 2;
      const y = lowerEdge[index % SIDES];
      const radius = 0.49 + (y + 1.15) / 1.59 * 0.2 + 0.025;
      skirtVertices.push(Math.sin(angle) * 0.715, 0.51, Math.cos(angle) * 0.715);
      skirtVertices.push(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
      if (index < SIDES) {
        const start = index * 2;
        skirtIndices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
      }
    }
    const skirtGeometry = new THREE.BufferGeometry();
    skirtGeometry.setAttribute("position", new THREE.Float32BufferAttribute(skirtVertices, 3));
    skirtGeometry.setIndex(skirtIndices);
    skirtGeometry.computeVertexNormals();
    add(skirtGeometry, new THREE.MeshStandardMaterial({ color: 0x668335, roughness: 0.63, side: THREE.DoubleSide, flatShading: true }), [0, 0, 0]);

    // Angular, semi-clear cubes show through the matcha and the milk.
    const iceBody = [0xb0cb8d, 0xd0e3b3, 0x9fbf7b, 0xe1eccb, 0xb8d597, 0xc6dba7].map((color) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.2, transparent: true, opacity: 0.86, flatShading: true }));
    const ice: Array<[number, number, number, number, number, number, number]> = [
      [-0.38, 1.13, 0.17, 0.46, 0.42, 0.49, 0.34],
      [0.26, 1.16, 0.2, 0.5, 0.4, 0.45, -0.43],
      [-0.02, 1.28, -0.31, 0.46, 0.46, 0.43, 0.22],
      [-0.27, 0.68, 0.32, 0.38, 0.34, 0.39, -0.35],
      [0.29, 0.58, 0.28, 0.37, 0.4, 0.38, 0.45],
      [0.06, -0.13, 0.34, 0.29, 0.33, 0.31, -0.2],
    ];
    ice.forEach(([x, y, z, width, height, depth, angle]) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const cube = add(geometry, iceBody, [x, y, z], 4);
      cube.rotation.set(angle, angle * 0.8, angle * 0.5);
    });

    // A very light shell and brighter rolled edges read as clear plastic.
    const cupPlastic = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vNormal; varying vec3 vView; void main() { vec4 viewPosition = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = normalize(-viewPosition.xyz); gl_Position = projectionMatrix * viewPosition; }`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main() { float edge = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0); gl_FragColor = vec4(0.62, 0.75, 0.69, 0.05 + edge * 0.42); }`,
    });
    add(new THREE.CylinderGeometry(0.8, 0.5, 2.26, SIDES, 1, true), cupPlastic, [0, 0, 0], 6);
    add(new THREE.CylinderGeometry(0.805, 0.505, 1.65, SIDES, 1, true, -0.45, 0.55), clear(0xffffff, 0.1, 0.08), [0, 0.1, 0], 7);
    add(new THREE.CylinderGeometry(0.5, 0.5, 0.055, SIDES), clear(0xdff1e9, 0.56), [0, -1.15, 0], 6);
    const ring = (radius: number, tube: number, y: number, opacity: number) => {
      const mesh = add(new THREE.TorusGeometry(radius, tube, 4, SIDES), clear(0xacc6b8, opacity), [0, y, 0], 7);
      mesh.rotation.x = Math.PI / 2;
    };
    ring(0.8, 0.058, 1.13, 0.94);
    ring(0.5, 0.025, -1.13, 0.67);

    const straw = add(new THREE.CylinderGeometry(0.048, 0.048, 1.63, 7), solid(0x476a29, 0.33), [0.35, 1.53, -0.2], 3);
    straw.rotation.z = -0.2;

    const bead = clear(0xf9ffff, 0.68, 0.08);
    for (const [x, y, z, size] of [[-0.48, -0.38, 0.43, 0.04], [0.41, -0.12, 0.48, 0.026], [-0.28, 0.18, 0.63, 0.025], [0.5, 0.42, 0.47, 0.038], [-0.53, -0.72, 0.25, 0.027]]) {
      add(new THREE.IcosahedronGeometry(size, 0), bead, [x, y, z], 7);
    }

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -2.12 * aspect;
      camera.right = 2.12 * aspect;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    const tick = (time: number) => {
      if (last) cup.rotation.y += Math.min((time - last) / 1000, 0.05) * 0.36;
      last = time;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    const syncMotion = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (motion.matches) renderer.render(scene, camera);
      else frame = requestAnimationFrame(tick);
    };
    motion.addEventListener("change", syncMotion);
    syncMotion();

    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", syncMotion);
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, []);

  return <figure className="hero-cup" role="img" aria-label="A rotating low-poly matcha latte in a transparent plastic cup with visible ice"><canvas ref={canvasRef} aria-hidden="true" /></figure>;
}
