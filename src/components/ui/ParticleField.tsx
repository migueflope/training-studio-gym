"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  // Rest position on the unit sphere
  sx: number;
  sy: number;
  sz: number;
  // Screen-space displacement from rest (pixels) and velocity
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  // Visual properties
  size: number;
  angle: number;
  shade: number;
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
    const SPHERE_RADIUS_FACTOR = isMobile ? 0.4 : 0.45;

    // Repulsion / spring tuning — matches the antigravity.google feel
    const REPEL_RADIUS = isMobile ? 130 : 200;
    const REPEL_STRENGTH = 2200;
    const SPRING = 0.045;
    const DAMPING = 0.86;
    const MAX_OFFSET = 260;

    const COLORS = [
      { r: 212, g: 175, b: 55 },
      { r: 244, g: 212, b: 122 },
      { r: 184, g: 148, b: 36 },
      { r: 255, g: 230, b: 150 },
    ];

    const particles: Particle[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const rFactor = 0.9 + Math.random() * 0.2;

      particles.push({
        sx: x * rFactor,
        sy: y * rFactor,
        sz: z * rFactor,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        size: Math.random() * 7 + 3,
        angle: Math.random() * Math.PI * 2,
        shade: Math.floor(Math.random() * COLORS.length),
        opacity: 0.5 + Math.random() * 0.5,
      });
    }

    // Cursor in pixel coordinates. Off-screen sentinel disables repulsion until the user moves.
    const mouse = { x: -10000, y: -10000, active: false };
    // Smoothed cursor used for the sphere center so it trails the pointer instead of snapping.
    const sphereCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const CENTER_LERP = 0.06;
    let scrollOpacity = 1;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -10000;
      mouse.y = -10000;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const MIN_OPACITY = 0.35;
      const fadeProgress = Math.min(1, scrollY / (viewportH * 0.8));
      scrollOpacity = 1 - fadeProgress * (1 - MIN_OPACITY);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

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

    let animationId: number;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      if (scrollOpacity <= 0) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Sphere center trails the cursor with a slow lerp.
      // When the cursor hasn't moved yet (or has left the window) it eases back to the viewport center.
      const targetX = mouse.active ? mouse.x : window.innerWidth / 2;
      const targetY = mouse.active ? mouse.y : window.innerHeight / 2;
      sphereCenter.x += (targetX - sphereCenter.x) * CENTER_LERP;
      sphereCenter.y += (targetY - sphereCenter.y) * CENTER_LERP;
      const cx = sphereCenter.x;
      const cy = sphereCenter.y;
      const sphereRadius = Math.min(window.innerWidth, window.innerHeight) * SPHERE_RADIUS_FACTOR;

      const autoRotY = elapsed * 0.12;
      const autoRotX = elapsed * 0.04;

      const repelR2 = REPEL_RADIUS * REPEL_RADIUS;

      const projected: Array<{
        screenX: number;
        screenY: number;
        depth: number;
        p: Particle;
        angle2d: number;
        scale: number;
      }> = [];

      for (const p of particles) {
        const r1 = rotateY(p.sx, p.sy, p.sz, autoRotY);
        const r2 = rotateX(r1.x, r1.y, r1.z, autoRotX);

        const perspective = 3;
        const scale = perspective / (perspective + r2.z);

        const restX = cx + r2.x * sphereRadius * scale;
        const restY = cy - r2.y * sphereRadius * scale;

        // Repel from cursor (screen-space physics on the offset)
        if (mouse.active) {
          const curX = restX + p.ox;
          const curY = restY + p.oy;
          const dx = curX - mouse.x;
          const dy = curY - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < repelR2 && d2 > 1) {
            const d = Math.sqrt(d2);
            const falloff = 1 - d / REPEL_RADIUS;
            const force = (REPEL_STRENGTH * falloff * falloff) / d;
            p.vx += dx * force * 0.016;
            p.vy += dy * force * 0.016;
          }
        }

        // Spring back to rest + damping
        p.vx -= p.ox * SPRING;
        p.vy -= p.oy * SPRING;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.ox += p.vx;
        p.oy += p.vy;

        // Clamp displacement so nothing flies off the screen
        const offMag2 = p.ox * p.ox + p.oy * p.oy;
        if (offMag2 > MAX_OFFSET * MAX_OFFSET) {
          const m = MAX_OFFSET / Math.sqrt(offMag2);
          p.ox *= m;
          p.oy *= m;
        }

        // Dash orientation follows the tangent of the sphere's rotation,
        // tilted toward the velocity vector when the particle is being pushed.
        const tx = -r2.z;
        const tz = r2.x;
        const tLen = Math.sqrt(tx * tx + tz * tz);
        let angle2d =
          tLen > 0.001
            ? Math.atan2(-r2.y * (tz / tLen), (tx / tLen) * scale)
            : p.angle;
        const speed2 = p.vx * p.vx + p.vy * p.vy;
        if (speed2 > 0.5) {
          const blend = Math.min(1, speed2 / 40);
          angle2d = angle2d * (1 - blend) + Math.atan2(p.vy, p.vx) * blend;
        }

        projected.push({
          screenX: restX + p.ox,
          screenY: restY + p.oy,
          depth: r2.z,
          p,
          angle2d,
          scale,
        });
      }

      projected.sort((a, b) => a.depth - b.depth);

      for (const item of projected) {
        const depthNorm = (item.depth + 1) / 2;
        if (depthNorm < 0.25) continue;

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

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
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
