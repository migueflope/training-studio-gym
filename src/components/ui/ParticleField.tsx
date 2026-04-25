"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Simplex Noise GLSL ───
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
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// ─── Vertex Shader: particles cluster around uMouseWorld ───
const vertexShader = `
  ${simplexNoiseGLSL}

  uniform float uTime;
  uniform vec3 uMouseWorld;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aOffset;  // each particle's unique offset within the cloud

  varying float vAlpha;
  varying float vDistFromCenter;

  void main() {
    // Organic micro-movement via simplex noise
    float nx = snoise(vec3(aOffset.x * 2.0, aOffset.y * 2.0, uTime * 0.2 + aPhase));
    float ny = snoise(vec3(aOffset.y * 2.0, aOffset.z * 2.0, uTime * 0.2 + aPhase + 50.0));
    float nz = snoise(vec3(aOffset.z * 2.0, aOffset.x * 2.0, uTime * 0.15 + aPhase + 100.0));

    // Position = mouse world pos + cloud offset + noise
    vec3 pos = uMouseWorld + aOffset + vec3(nx, ny, nz) * 0.3;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    float depth = -mvPos.z;

    // Particles closer to center of cloud are brighter
    float dist = length(aOffset);
    float maxRadius = 2.5;
    vDistFromCenter = dist / maxRadius;
    vAlpha = smoothstep(1.0, 0.0, vDistFromCenter) * 0.95;

    // Pulsing size
    float pulse = 0.85 + 0.3 * sin(uTime * 1.8 + aPhase * 6.28);

    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * pulse * uPixelRatio * (5.0 / max(depth, 0.5));
  }
`;

// ─── Fragment Shader with glow ───
const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying float vAlpha;
  varying float vDistFromCenter;

  void main() {
    float distFromCenter = length(gl_PointCoord - vec2(0.5));
    if (distFromCenter > 0.5) discard;

    // Bright core + soft glow
    float core = smoothstep(0.5, 0.02, distFromCenter);
    float glow = smoothstep(0.5, 0.0, distFromCenter) * 0.5;
    float intensity = core + glow;

    float alpha = intensity * vAlpha;

    // Color: particles near center are brighter/whiter gold
    float colorMix = sin(gl_PointCoord.x * 3.14 + uTime * 0.5) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, colorMix * 0.5 + (1.0 - vDistFromCenter) * 0.3);

    // Extra brightness at the core of the cloud
    color += uColorB * core * 0.2 * (1.0 - vDistFromCenter);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 800 : 3000;
    const CLOUD_RADIUS = isMobile ? 1.8 : 2.2;  // world units

    // ─── Scene Setup ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ─── Geometry ───
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);  // will be overwritten by shader
    const offsets = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Cloud shape: random points inside a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.6) * CLOUD_RADIUS; // pow < 1 = denser center

      offsets[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      offsets[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      offsets[i * 3 + 2] = r * Math.cos(phi) * 0.4; // flatten z for more screen-facing spread

      // Initial positions (will be overridden by shader)
      positions[i * 3] = offsets[i * 3];
      positions[i * 3 + 1] = offsets[i * 3 + 1];
      positions[i * 3 + 2] = offsets[i * 3 + 2];

      sizes[i] = Math.random() * 3.5 + 1.5;
      phases[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    // ─── Colors from palette ───
    const goldPrimary = new THREE.Color(0xd4af37);
    const goldLight = new THREE.Color(0xf4d47a);

    const uniforms = {
      uTime: { value: 0 },
      uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
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

    // ─── Mouse → World Coordinates ───
    const mouseNDC = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3(0, 0, 0);
    const smoothMouseWorld = new THREE.Vector3(0, 0, 0);
    const LERP_FACTOR = 0.06;
    let hasMouseMoved = false;

    // Helper: convert screen mouse to world position on z=0 plane
    const raycaster = new THREE.Raycaster();
    const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();

    const handleMouseMove = (e: MouseEvent) => {
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      hasMouseMoved = true;

      // Project mouse onto z=0 plane in world space
      raycaster.setFromCamera(mouseNDC, camera);
      raycaster.ray.intersectPlane(zPlane, intersectPoint);
      if (intersectPoint) {
        mouseWorld.copy(intersectPoint);
      }
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

      if (isMobile || !hasMouseMoved) {
        // Autonomous floating on mobile or before first mouse move
        mouseWorld.x = Math.sin(elapsed * 0.3) * 2.5;
        mouseWorld.y = Math.cos(elapsed * 0.2) * 1.5;
        mouseWorld.z = 0;
      }

      // Smooth interpolation toward mouse
      smoothMouseWorld.x += (mouseWorld.x - smoothMouseWorld.x) * LERP_FACTOR;
      smoothMouseWorld.y += (mouseWorld.y - smoothMouseWorld.y) * LERP_FACTOR;
      smoothMouseWorld.z += (mouseWorld.z - smoothMouseWorld.z) * LERP_FACTOR;
      uniforms.uMouseWorld.value.copy(smoothMouseWorld);

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
