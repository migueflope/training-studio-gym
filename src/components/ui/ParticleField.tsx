"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Vertex Shader ───
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute vec3 aBasePosition;

  varying float vAlpha;
  varying float vAngle;

  void main() {
    // 1. Initial position on the sphere
    vec3 pos = aBasePosition;

    // 2. Base rotation of the sphere (auto-rotation)
    float timeRotY = uTime * 0.15;
    float timeRotX = uTime * 0.05;
    
    mat3 rotY = mat3(
      cos(timeRotY), 0.0, sin(timeRotY),
      0.0, 1.0, 0.0,
      -sin(timeRotY), 0.0, cos(timeRotY)
    );
    
    mat3 rotX = mat3(
      1.0, 0.0, 0.0,
      0.0, cos(timeRotX), -sin(timeRotX),
      0.0, sin(timeRotX), cos(timeRotX)
    );

    pos = rotY * rotX * pos;

    // 3. Parallax tilt based on mouse (normalized -1 to 1)
    // The sphere tilts slightly to look at the mouse
    float targetTiltY = uMouse.x * 0.5;
    float targetTiltX = uMouse.y * 0.5;

    mat3 mouseRotY = mat3(
      cos(targetTiltY), 0.0, sin(targetTiltY),
      0.0, 1.0, 0.0,
      -sin(targetTiltY), 0.0, cos(targetTiltY)
    );

    mat3 mouseRotX = mat3(
      1.0, 0.0, 0.0,
      0.0, cos(targetTiltX), -sin(targetTiltX),
      0.0, sin(targetTiltX), cos(targetTiltX)
    );

    pos = mouseRotY * mouseRotX * pos;

    // 4. Calculate local tangent for the dash rotation (flow direction)
    // The particles flow around the sphere, so the dash should follow the longitude/latitude
    // A simple approximation is the screen-space tangent of rotation
    vec3 tangent = cross(pos, vec3(0.0, 1.0, 0.0));
    if (length(tangent) < 0.01) tangent = vec3(1.0, 0.0, 0.0);
    tangent = normalize(tangent);

    // Project to screen
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    
    // Safely calculate angle
    vec4 tangentMv = modelViewMatrix * vec4(pos + tangent, 1.0);
    vec2 screenDir = tangentMv.xy - mvPos.xy;
    if (length(screenDir) > 0.001) {
      vAngle = atan(screenDir.y, screenDir.x);
    } else {
      vAngle = 0.0;
    }

    gl_Position = projectionMatrix * mvPos;

    // Depth fading (hide particles on the back of the sphere)
    float depthNormalized = (mvPos.z + 12.0) / 8.0; 
    
    // Smooth fade out
    vAlpha = smoothstep(0.2, 0.8, depthNormalized) * 2.0; // Boosted alpha

    // Make points large enough
    gl_PointSize = aSize * uPixelRatio * (40.0 / -mvPos.z);
  }
`;

// ─── Fragment Shader ───
const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  
  varying float vAlpha;
  varying float vAngle;

  void main() {
    vec2 pt = gl_PointCoord - vec2(0.5);

    // Rotate point coord by vAngle for the dash effect
    float s = sin(-vAngle);
    float c = cos(-vAngle);
    mat2 rot = mat2(c, -s, s, c);
    pt = rot * pt;

    // Gentle stretch for a soft dash (less aggressive than before so it doesn't clip)
    pt.x *= 1.0;
    pt.y *= 2.0; 

    float distFromCenter = length(pt);
    
    if (distFromCenter > 0.5) discard;

    // Smooth soft particle
    float intensity = smoothstep(0.5, 0.1, distFromCenter);

    float alpha = intensity * vAlpha;

    // Mix colors based on position
    vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 0.5, abs(pt.x)));

    // Extra glow
    color += uColorB * smoothstep(0.3, 0.0, distFromCenter) * 0.8;

    gl_FragColor = vec4(color, alpha);
  }
`;

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 2000 : 5500;
    const SPHERE_RADIUS = 4.5;

    // ─── Scene Setup ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent
    container.appendChild(renderer.domElement);

    // ─── Geometry (Fibonacci Sphere Distribution) ───
    const geometry = new THREE.BufferGeometry();
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Uniform distribution on a sphere
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y

      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Add a slight noise/thickness to the shell
      const r = SPHERE_RADIUS + (Math.random() * 0.4 - 0.2);

      basePositions[i * 3] = x * r;
      basePositions[i * 3 + 1] = y * r;
      basePositions[i * 3 + 2] = z * r;

      sizes[i] = Math.random() * 4.0 + 3.0; // Larger particles
    }

    geometry.setAttribute("aBasePosition", new THREE.BufferAttribute(basePositions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    // Colors from palette
    const goldPrimary = new THREE.Color(0xd4af37);
    const goldLight = new THREE.Color(0xf4d47a);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
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

    // ─── Mouse Tracking (Smooth Lerp) ───
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };
    const LERP_FACTOR = 0.05;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized coordinates: -1 to 1
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
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

      uniforms.uTime.value = clock.getElapsedTime();

      // Smooth mouse interpolation for the tilt effect
      currentMouse.x += (targetMouse.x - currentMouse.x) * LERP_FACTOR;
      currentMouse.y += (targetMouse.y - currentMouse.y) * LERP_FACTOR;
      uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);

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
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
