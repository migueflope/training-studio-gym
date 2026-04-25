"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Simplex Noise GLSL (embedded to avoid external dependency) ───
const simplexNoiseGLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// ─── Vertex Shader ───
const vertexShader = `
  ${simplexNoiseGLSL}

  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Organic floating motion via layered simplex noise
    float noiseX = snoise(vec3(pos.x * 0.3, pos.y * 0.3, uTime * 0.15 + aPhase));
    float noiseY = snoise(vec3(pos.y * 0.3, pos.x * 0.3, uTime * 0.15 + aPhase + 100.0));
    float noiseZ = snoise(vec3(pos.z * 0.3, pos.x * 0.3, uTime * 0.12 + aPhase + 200.0));

    pos.x += noiseX * 0.4;
    pos.y += noiseY * 0.4;
    pos.z += noiseZ * 0.2;

    // Mouse repulsion (in normalized screen coords)
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vec4 projected = projectionMatrix * mvPos;
    vec2 screenPos = projected.xy / projected.w; // -1 to 1

    vec2 mouseDir = screenPos - uMouse;
    float mouseDist = length(mouseDir);
    float mouseInfluence = smoothstep(uMouseRadius, 0.0, mouseDist);

    // Push particles away from cursor
    pos.x += normalize(mouseDir).x * mouseInfluence * 1.2;
    pos.y += normalize(mouseDir).y * mouseInfluence * 1.2;

    // Recalculate after displacement
    vec4 finalMvPos = modelViewMatrix * vec4(pos, 1.0);

    // Depth-based alpha fade — much brighter now
    float depth = -finalMvPos.z;
    vAlpha = smoothstep(14.0, 1.5, depth) * 1.0;

    // Pulsing size — bigger pulse range
    float pulse = 0.85 + 0.35 * sin(uTime * 1.5 + aPhase * 6.28);

    gl_Position = projectionMatrix * finalMvPos;
    gl_PointSize = aSize * pulse * uPixelRatio * (6.0 / depth);
  }
`;

// ─── Fragment Shader (with glow halo) ───
const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying float vAlpha;

  void main() {
    float distFromCenter = length(gl_PointCoord - vec2(0.5));
    if (distFromCenter > 0.5) discard;

    // Bright core
    float core = smoothstep(0.5, 0.05, distFromCenter);
    // Soft outer glow halo
    float glow = smoothstep(0.5, 0.0, distFromCenter) * 0.6;
    // Combined intensity
    float intensity = core + glow;

    float alpha = intensity * vAlpha;

    // Color oscillation between gold tones
    float colorMix = sin(gl_PointCoord.x * 3.14 + uTime * 0.5) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, colorMix * 0.4);

    // Brighten the core even more
    color += uColorB * core * 0.3;

    gl_FragColor = vec4(color, alpha);
  }
`;

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 1200 : 4500;

    // ─── Scene Setup ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    container.appendChild(renderer.domElement);

    // ─── Geometry ───
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread particles in a large volume
      positions[i * 3] = (Math.random() - 0.5) * 16;     // x — wider
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12; // y — taller
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;  // z — less depth so more are visible

      sizes[i] = Math.random() * 4.5 + 1.5; // bigger particles
      phases[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    // ─── Material (custom shaders) ───
    // Colors from the site's palette
    const goldPrimary = new THREE.Color(0xd4af37);    // --color-primary
    const goldLight = new THREE.Color(0xf4d47a);      // gradient gold light

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(9999, 9999) }, // offscreen initially
      uMouseRadius: { value: isMobile ? 0.0 : 0.35 },   // disable on mobile
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColorA: { value: goldPrimary },
      uColorB: { value: goldLight },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ─── Mouse Tracking with Lerp ───
    const mouse = { x: 9999, y: 9999 };
    const smoothMouse = { x: 9999, y: 9999 };
    const LERP_FACTOR = 0.06;

    const handleMouseMove = (e: MouseEvent) => {
      // Convert to normalized device coords (-1 to 1)
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // ─── Resize Handler ───
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    window.addEventListener("resize", handleResize);

    // ─── Animation Loop ───
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Smooth mouse interpolation (lerp)
      smoothMouse.x += (mouse.x - smoothMouse.x) * LERP_FACTOR;
      smoothMouse.y += (mouse.y - smoothMouse.y) * LERP_FACTOR;
      uniforms.uMouse.value.set(smoothMouse.x, smoothMouse.y);

      // Gentle rotation for organic feel
      points.rotation.y = elapsed * 0.02;
      points.rotation.x = Math.sin(elapsed * 0.015) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
