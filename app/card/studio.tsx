"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ThemeName } from "../theme";
import { cardDataUrl, cardPalette, cardSvg } from "./artwork";

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(error || "Could not compile shader");
  }
  return shader;
}

export function Card3D({ theme }: { theme: ThemeName }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = useRef({ x: -0.08, y: -0.28 });
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) { setSupported(false); return; }

    const vertexSource = `
      attribute vec3 aPosition;
      attribute vec2 aUv;
      attribute vec3 aNormal;
      uniform vec2 uRotation;
      uniform float uAspect;
      varying vec2 vUv;
      varying float vLight;
      void main() {
        float cx = cos(uRotation.x), sx = sin(uRotation.x);
        float cy = cos(uRotation.y), sy = sin(uRotation.y);
        vec3 p = vec3(aPosition.x * cy + aPosition.z * sy,
          aPosition.y,
          -aPosition.x * sy + aPosition.z * cy);
        p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
        vec3 n = vec3(aNormal.x * cy + aNormal.z * sy,
          aNormal.y,
          -aNormal.x * sy + aNormal.z * cy);
        n = vec3(n.x, n.y * cx - n.z * sx, n.y * sx + n.z * cx);
        vUv = aUv;
        vLight = 0.76 + 0.24 * max(dot(normalize(n), normalize(vec3(-0.35, 0.5, 1.0))), 0.0);
        // Orthographic projection keeps the artwork square and fits narrow screens.
        float scale = min(0.67, uAspect * 0.58);
        gl_Position = vec4(p.x * scale / uAspect, p.y * scale, -p.z * 0.1, 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      uniform sampler2D uTexture;
      uniform float uTextured;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vLight;
      void main() {
        vec4 color = uTextured > 0.5 ? texture2D(uTexture, vUv) : vec4(uColor, 1.0);
        gl_FragColor = vec4(color.rgb * vLight, color.a);
      }
    `;

    let vertex: WebGLShader | null = null;
    let fragment: WebGLShader | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let frame = 0;
    const textures: WebGLTexture[] = [];
    let alive = true;

    try {
      vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
      fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      if (!program) throw new Error("Could not create WebGL program");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Could not link WebGL program");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      if (!buffer) throw new Error("Could not create WebGL buffer");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const stride = 8 * 4;
      const attrs = [
        ["aPosition", 3, 0], ["aUv", 2, 3 * 4], ["aNormal", 3, 5 * 4],
      ] as const;
      for (const [name, size, offset] of attrs) {
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
      }
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
    } catch {
      setSupported(false);
      return;
    }

    const programRef = program;
    const bufferRef = buffer;
    const vertexRef = vertex;
    const fragmentRef = fragment;
    const rotationUniform = gl.getUniformLocation(programRef, "uRotation");
    const aspectUniform = gl.getUniformLocation(programRef, "uAspect");
    const texturedUniform = gl.getUniformLocation(programRef, "uTextured");
    const colorUniform = gl.getUniformLocation(programRef, "uColor");
    const textureUniform = gl.getUniformLocation(programRef, "uTexture");
    gl.uniform1i(textureUniform, 0);

    const palette = cardPalette(theme);
    const rgb = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    const paper = rgb(palette.paper);
    const edge = rgb(palette.accent).map((value) => value / 255);
    const textureUrls: string[] = [];
    const makeTexture = (svg: string) => {
      const texture = gl.createTexture();
      if (!texture) throw new Error("Could not create texture");
      textures.push(texture);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([...paper, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      const image = new window.Image();
      image.onload = () => {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      };
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      textureUrls.push(url);
      image.src = url;
      return texture;
    };
    const frontTexture = makeTexture(cardSvg(theme, "front", true));
    const backTexture = makeTexture(cardSvg(theme, "back", true));

    const halfDepth = .006;
    const face = (z: number, normal: number) => {
      const vertices = [
      -1.5, -.857, z, normal > 0 ? 0 : 1, 0, 0, 0, normal,
       1.5, -.857, z, normal > 0 ? 1 : 0, 0, 0, 0, normal,
       1.5,  .857, z, normal > 0 ? 1 : 0, 1, 0, 0, normal,
      -1.5, -.857, z, normal > 0 ? 0 : 1, 0, 0, 0, normal,
       1.5,  .857, z, normal > 0 ? 1 : 0, 1, 0, 0, normal,
      -1.5,  .857, z, normal > 0 ? 0 : 1, 1, 0, 0, normal,
      ];
      if (normal > 0) return vertices;
      const vertexAt = (index: number) => vertices.slice(index * 8, index * 8 + 8);
      return [1, 0, 2, 4, 3, 5].flatMap(vertexAt);
    };
    const quad = (a: number[], b: number[], c: number[], d: number[], n: number[]) =>
      [a, b, c, a, c, d].flatMap((point, index) => [...point, index % 3 === 0 ? 0 : 1, index < 3 ? 0 : 1, ...n]);
    const edges = [
      quad([-1.5, -.857, halfDepth], [-1.5, .857, halfDepth], [-1.5, .857, -halfDepth], [-1.5, -.857, -halfDepth], [-1, 0, 0]),
      quad([1.5, -.857, -halfDepth], [1.5, .857, -halfDepth], [1.5, .857, halfDepth], [1.5, -.857, halfDepth], [1, 0, 0]),
      quad([-1.5, .857, halfDepth], [1.5, .857, halfDepth], [1.5, .857, -halfDepth], [-1.5, .857, -halfDepth], [0, 1, 0]),
      quad([-1.5, -.857, -halfDepth], [1.5, -.857, -halfDepth], [1.5, -.857, halfDepth], [-1.5, -.857, halfDepth], [0, -1, 0]),
    ];
    const draw = (vertices: number[], texture?: WebGLTexture) => {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.uniform1f(texturedUniform, texture ? 1 : 0);
      if (texture) gl.bindTexture(gl.TEXTURE_2D, texture);
      else gl.uniform3f(colorUniform, edge[0], edge[1], edge[2]);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);
    };
    const render = () => {
      if (!alive) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(rotationUniform, rotation.current.x, rotation.current.y);
      gl.uniform1f(aspectUniform, canvas.width / canvas.height);
      draw(face(halfDepth, 1), frontTexture);
      draw(face(-halfDepth, -1), backTexture);
      for (const edge of edges) draw(edge);
      frame = requestAnimationFrame(render);
    };
    render();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      textures.forEach((texture) => gl.deleteTexture(texture));
      textureUrls.forEach((url) => URL.revokeObjectURL(url));
      gl.deleteBuffer(bufferRef);
      gl.deleteProgram(programRef);
      gl.deleteShader(vertexRef);
      gl.deleteShader(fragmentRef);
    };
  }, [theme]);

  const drag = useRef<{ x: number; y: number } | null>(null);
  return <div className="card-3d-wrap">
    {supported ? <canvas ref={canvasRef} className="card-3d-canvas" aria-label="Interactive WebGL preview of the Jelly Coffee Lab card" onPointerDown={(event) => { drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!drag.current) return; rotation.current.y += (event.clientX - drag.current.x) * .009; rotation.current.x += (event.clientY - drag.current.y) * .006; drag.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} /> : <Image className="card-3d-fallback" src={cardDataUrl(theme, "front")} width={1050} height={600} unoptimized alt="Jelly Coffee Lab card front" />}
    <div className="card-3d-actions"><div className="card-3d-buttons"><button type="button" onClick={() => { rotation.current.y += Math.PI; }}>flip card ↻</button><button type="button" onClick={() => { rotation.current = { x: -.08, y: -.28 }; }}>reset view</button></div><span>drag to rotate 360°</span></div>
  </div>;
}
