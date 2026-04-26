"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ParticleField — Antigravity-style interactive particle cloud.
 * 
 * Uses Canvas 2D for guaranteed cross-browser rendering (no WebGL shader issues).
 * Particles form a large spherical cloud of small dashes that:
 * - Rotate continuously in 3D
 * - Tilt based on mouse position (parallax)
 * - Are scattered in a spherical distribution (dense center, empty corners)
 * 
 * Colors: gold tones from the site's palette.
 */

interface Particle {
  // Position on the unit sphere
  sx: number;
  sy: number;
  sz: number;
  // Visual properties
  size: number;
  angle: number; // dash rotation angle
  shade: number; // 0 = primary gold, 1 = light gold
  opacity: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 800 : 2500;
    const SPHERE_RADIUS_FACTOR = isMobile ? 0.4 : 0.45; // fraction of viewport min dimension

    // ─── Colors (gold palette) ───
    const COLORS = [
      { r: 212, g: 175, b: 55 },   // #D4AF37 primary gold
      { r: 244, g: 212, b: 122 },  // #F4D47A light gold
      { r: 184, g: 148, b: 36 },   // darker gold
      { r: 255, g: 230, b: 150 },  // pale gold
    ];

    // ─── Create Particles (Fibonacci sphere) ───
    const particles: Particle[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Slight random offset from the sphere surface for organic feel
      const rFactor = 0.9 + Math.random() * 0.2;

      particles.push({
        sx: x * rFactor,
        sy: y * rFactor,
        sz: z * rFactor,
        size: Math.random() * 7 + 3, // dash length in px
        angle: Math.random() * Math.PI * 2,
        shade: Math.floor(Math.random() * COLORS.length),
        opacity: 0.5 + Math.random() * 0.5,
      });
    }

    // ─── Mouse state ───
    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };
    // Mouse position in pixels for sphere center tracking
    const mousePixel = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const smoothMousePixel = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const LERP = 0.05;
    let scrollOpacity = 1;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePixel.x = e.clientX;
      mousePixel.y = e.clientY;
    };

    const handleScroll = () => {
      // Fade from 100% in Hero to 15% in other sections (never fully invisible)
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const MIN_OPACITY = 0.35;
      const fadeProgress = Math.min(1, scrollY / (viewportH * 0.8));
      scrollOpacity = 1 - fadeProgress * (1 - MIN_OPACITY); // 1.0 → 0.35
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // init

    // ─── Resize ───
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ─── 3D Rotation Helpers ───
    function rotateY(x: number, y: number, z: number, angle: number) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { x: x * c + z * s, y, z: -x * s + z * c };
    }

    function rotateX(x: number, y: number, z: number, angle: number) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { x, y: y * c - z * s, z: y * s + z * c };
    }

    // ─── Animation Loop ───
    let animationId: number;
    let startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Skip rendering if fully transparent (performance optimization)
      if (scrollOpacity <= 0) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      // Smooth mouse for tilt
      smoothMouse.x += (mouse.x - smoothMouse.x) * LERP;
      smoothMouse.y += (mouse.y - smoothMouse.y) * LERP;

      // Smooth mouse pixel position for sphere center tracking
      smoothMousePixel.x += (mousePixel.x - smoothMousePixel.x) * LERP;
      smoothMousePixel.y += (mousePixel.y - smoothMousePixel.y) * LERP;

      // Clear
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Sphere center follows the cursor
      const cx = smoothMousePixel.x;
      const cy = smoothMousePixel.y;
      const sphereRadius = Math.min(window.innerWidth, window.innerHeight) * SPHERE_RADIUS_FACTOR;

      // Auto-rotation angles
      const autoRotY = elapsed * 0.15;
      const autoRotX = elapsed * 0.05;

      // Mouse-driven tilt (parallax)
      const mouseRotY = smoothMouse.x * 0.4;
      const mouseRotX = smoothMouse.y * 0.4;

      // Sort particles by depth for proper layering
      const projected: Array<{
        screenX: number;
        screenY: number;
        depth: number;
        p: Particle;
        angle2d: number;
      }> = [];

      for (const p of particles) {
        let { x, y, z } = { x: p.sx, y: p.sy, z: p.sz };

        // Apply auto-rotation
        const r1 = rotateY(x, y, z, autoRotY);
        const r2 = rotateX(r1.x, r1.y, r1.z, autoRotX);

        // Apply mouse parallax tilt
        const r3 = rotateY(r2.x, r2.y, r2.z, mouseRotY);
        const r4 = rotateX(r3.x, r3.y, r3.z, mouseRotX);

        // Simple perspective projection
        const perspective = 3;
        const scale = perspective / (perspective + r4.z);

        const screenX = cx + r4.x * sphereRadius * scale;
        const screenY = cy - r4.y * sphereRadius * scale;

        // Calculate 2D dash angle from the tangent of the sphere rotation
        // The tangent at any point on the sphere is cross(pos, up)
        const tx = -r4.z;
        const tz = r4.x;
        const tLen = Math.sqrt(tx * tx + tz * tz);
        const angle2d = tLen > 0.001 ? Math.atan2(-r4.y * (tz / tLen), tx / tLen * scale) : p.angle;

        projected.push({
          screenX,
          screenY,
          depth: r4.z,
          p,
          angle2d,
        });
      }

      // Sort back to front
      projected.sort((a, b) => a.depth - b.depth);

      // Draw each particle as a small oriented dash
      for (const item of projected) {
        // Depth-based visibility: hide back-facing particles
        const depthNorm = (item.depth + 1) / 2; // 0 = back, 1 = front
        if (depthNorm < 0.25) continue; // skip particles on the back

        const alpha = item.p.opacity * Math.pow(depthNorm, 1.5) * scrollOpacity;
        if (alpha < 0.02) continue;

        const color = COLORS[item.p.shade];
        const dashLength = item.p.size * (0.6 + depthNorm * 0.6);
        const dashWidth = 2;

        ctx.save();
        ctx.translate(item.screenX, item.screenY);
        ctx.rotate(item.angle2d + item.p.angle * 0.3);

        ctx.beginPath();
        ctx.roundRect(-dashLength / 2, -dashWidth / 2, dashLength, dashWidth, dashWidth / 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.fill();

        ctx.restore();
      }
    };

    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
