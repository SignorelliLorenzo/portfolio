"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  twinklePhase: number;
  twinkleSpeed: number;
  isHub: boolean;
}

interface Pulse {
  from: number;
  to: number;
  start: number;
  duration: number;
}

interface NeuralBackgroundProps {
  intensity?: number;
  maxNodes?: number;
  interactive?: boolean;
  className?: string;
}

export function NeuralBackground({
  intensity = 1,
  maxNodes,
  interactive = true,
  className = "",
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const pulsesRef = useRef<Pulse[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Determine node count based on viewport
  const getNodeCount = () => {
    if (maxNodes) return maxNodes;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return isMobile ? 80 : 150;
  };

  const baseConnectionDistance = 190;
  const hubConnectionDistance = 260;
  const baseConnections = 7;
  const hubConnections = 10;
  const borderConnectionDistance = 140;

  const getBorderConnection = (node: Node, width: number, height: number) => {
    const distLeft = node.x;
    const distRight = width - node.x;
    const distTop = node.y;
    const distBottom = height - node.y;

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) return { x: 0, y: node.y, dist: distLeft };
    if (minDist === distRight) return { x: width, y: node.y, dist: distRight };
    if (minDist === distTop) return { x: node.x, y: 0, dist: distTop };
    return { x: node.x, y: height, dist: distBottom };
  };

  const createPositions = (count: number, width: number, height: number) => {
    if (count <= 0) return [] as Array<{ x: number; y: number }>;
    const aspect = width / Math.max(1, height);
    const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
    const rows = Math.max(1, Math.ceil(count / cols));
    const cellW = width / cols;
    const cellH = height / rows;
    const jitterX = cellW * 0.85;
    const jitterY = cellH * 0.85;

    const indices = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const positions: Array<{ x: number; y: number }> = [];
    for (let n = 0; n < count; n++) {
      const idx = indices[n % indices.length];
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = (col + 0.5) * cellW;
      const cy = (row + 0.5) * cellH;
      const x = Math.max(0, Math.min(width, cx + (Math.random() - 0.5) * jitterX));
      const y = Math.max(0, Math.min(height, cy + (Math.random() - 0.5) * jitterY));
      positions.push({ x, y });
    }
    return positions;
  };

  const getEdges = (nodes: Node[]) => {
    const edges: Array<{ a: number; b: number; dist: number }> = [];
    const edgeSet = new Set<string>();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const maxDist = node.isHub ? hubConnectionDistance : baseConnectionDistance;
      const maxLinks = node.isHub ? hubConnections : baseConnections;
      const nearest: Array<{ j: number; dist: number }> = [];

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = node.x - nodes[j].x;
        const dy = node.y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) continue;

        let insertAt = nearest.length;
        while (insertAt > 0 && nearest[insertAt - 1]!.dist > dist) insertAt--;
        if (insertAt < maxLinks) {
          nearest.splice(insertAt, 0, { j, dist });
          if (nearest.length > maxLinks) nearest.pop();
        }
      }

      for (let k = 0; k < nearest.length; k++) {
        const j = nearest[k]!.j;
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        const key = `${a}-${b}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ a, b, dist: nearest[k]!.dist });
        }
      }
    }

    // Ensure minimum connectivity (avoid isolated nodes)
    const degrees = new Array(nodes.length).fill(0);
    edges.forEach((e) => {
      degrees[e.a] += 1;
      degrees[e.b] += 1;
    });

    for (let i = 0; i < nodes.length; i++) {
      if (degrees[i] > 0) continue;

      let bestJ = -1;
      let bestDist = Number.POSITIVE_INFINITY;

      // Prefer connecting to a hub if possible
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        if (!nodes[j].isHub) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          bestJ = j;
        }
      }

      // If no hubs exist (or none found), connect to nearest node
      if (bestJ === -1) {
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bestDist) {
            bestDist = dist;
            bestJ = j;
          }
        }
      }

      if (bestJ !== -1) {
        const a = Math.min(i, bestJ);
        const b = Math.max(i, bestJ);
        const key = `${a}-${b}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ a, b, dist: bestDist });
          degrees[a] += 1;
          degrees[b] += 1;
        }
      }
    }

    return edges;
  };

  // Initialize nodes
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with DPR scaling for crisp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setDimensions({ width: rect.width, height: rect.height });
    prevSizeRef.current = { width: rect.width, height: rect.height };

    // Initialize nodes
    const nodeCount = getNodeCount();
    const positions = createPositions(nodeCount, rect.width, rect.height);
    nodesRef.current = positions.map(({ x, y }) => {
      const isHub = Math.random() < 0.09;
      const baseRadius = isHub ? 3.8 + Math.random() * 1.4 : 2.2 + Math.random() * 1.1;

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        radius: baseRadius,
        baseRadius,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.6 + Math.random() * 1.2,
        isHub,
      };
    });
  }, [maxNodes]);

  // Handle resize
  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;

      const prev = prevSizeRef.current;
      const nextWidth = rect.width;
      const nextHeight = rect.height;

      if (prev.width > 0 && prev.height > 0 && (prev.width !== nextWidth || prev.height !== nextHeight)) {
        const sx = nextWidth / prev.width;
        const sy = nextHeight / prev.height;

        const nodes = nodesRef.current;
        for (const node of nodes) {
          node.x *= sx;
          node.y *= sy;
          node.vx *= sx;
          node.vy *= sy;
        }

        const desiredCount = getNodeCount();
        if (nodes.length > desiredCount) {
          nodesRef.current = nodes.slice(0, desiredCount);
        } else if (nodes.length < desiredCount) {
          const missing = desiredCount - nodes.length;
          const positions = createPositions(missing, nextWidth, nextHeight);
          nodesRef.current = nodes.concat(
            positions.map(({ x, y }) => {
              const isHub = Math.random() < 0.09;
              const baseRadius = isHub ? 3.8 + Math.random() * 1.4 : 2.2 + Math.random() * 1.1;

              return {
                x,
                y,
                vx: (Math.random() - 0.5) * 0.24,
                vy: (Math.random() - 0.5) * 0.24,
                radius: baseRadius,
                baseRadius,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.6 + Math.random() * 1.2,
                isHub,
              };
            })
          );
        }
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      setDimensions({ width: rect.width, height: rect.height });
      prevSizeRef.current = { width: rect.width, height: rect.height };
    });

    resizeObserver.observe(canvasRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Mouse tracking
  useEffect(() => {
    if (!interactive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement?.parentElement ?? canvas.parentElement;
    if (!parent) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    parent.addEventListener("pointermove", handlePointerMove);
    parent.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      parent.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [interactive]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const mouseInfluenceRadius = 100;
    const mouseForce = 0.15;

    const animate = (timestamp: number) => {
      // FPS cap (~30fps)
      const deltaTime = timestamp - lastFrameTimeRef.current;
      if (deltaTime < 33) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      const t = timestamp * 0.001;
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.7);

      // Clear canvas in device pixels (independent from current transform)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Update node positions
      nodes.forEach((node) => {
        // Apply mouse repulsion
        if (interactive && mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseInfluenceRadius && dist > 0) {
            const force = (1 - dist / mouseInfluenceRadius) * mouseForce;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }

        // Apply velocity with damping
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Bounce off edges
        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
        }
        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(height, node.y));
        }
      });

      // Draw edges (k-nearest + hubs)
      const edges = getEdges(nodes);

      edges.forEach(({ a, b, dist }) => {
        const hubBoost = nodes[a].isHub || nodes[b].isHub ? 1.25 : 1;
        const maxDist = nodes[a].isHub || nodes[b].isHub ? hubConnectionDistance : baseConnectionDistance;
        const closeness = Math.max(0.2, 1 - dist / maxDist);
        const baseAlpha = nodes[a].isHub || nodes[b].isHub ? 0.2 : 0.14;
        const alpha = (baseAlpha + closeness * 0.45) * intensity * breathe * hubBoost;
        const baseWidth = nodes[a].isHub || nodes[b].isHub ? 2.6 : 1.9;
        ctx.lineWidth = baseWidth + closeness * 1.05;
        ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      });

      nodes.forEach((node) => {
        const border = getBorderConnection(node, width, height);
        if (border.dist > borderConnectionDistance) return;

        const closeness = 1 - border.dist / borderConnectionDistance;
        const alpha = (0.12 + closeness * 0.35) * intensity * breathe;
        ctx.lineWidth = 0.9 + closeness * 1.1;
        ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(border.x, border.y);
        ctx.stroke();
      });

      // Pulses along edges
      const pulses = pulsesRef.current;
      if (pulses.length < 10 && edges.length > 0 && Math.random() < 0.08) {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        pulses.push({
          from: edge.a,
          to: edge.b,
          start: timestamp,
          duration: 650 + Math.random() * 500,
        });
      }

      pulsesRef.current = pulses.filter((pulse) => (timestamp - pulse.start) / pulse.duration <= 1);
      pulsesRef.current.forEach((pulse) => {
        const progress = (timestamp - pulse.start) / pulse.duration;
        const from = nodes[pulse.from];
        const to = nodes[pulse.to];
        if (!from || !to) return;

        const px = from.x + (to.x - from.x) * progress;
        const py = from.y + (to.y - from.y) * progress;
        const pulseAlpha = 0.9 * intensity;

        ctx.strokeStyle = `rgba(199, 179, 255, ${pulseAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px - (to.x - from.x) * 0.03, py - (to.y - from.y) * 0.03);
        ctx.lineTo(px + (to.x - from.x) * 0.03, py + (to.y - from.y) * 0.03);
        ctx.stroke();

        ctx.fillStyle = `rgba(199, 179, 255, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();

        if (progress > 0.85) {
          const arrival = (progress - 0.85) / 0.15;
          const ringRadius = to.baseRadius * (1.8 + arrival * 2.5);
          const ringAlpha = 0.6 * (1 - arrival) * intensity;
          ctx.strokeStyle = `rgba(199, 179, 255, ${ringAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(to.x, to.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        const twinkle = (Math.sin(t * node.twinkleSpeed + node.twinklePhase) + 1) / 2;
        const glowRadius = node.baseRadius * 1.55 * (0.97 + twinkle * 0.06);
        const coreRadius = node.baseRadius * (1 + twinkle * 0.04);
        const glowAlpha = 0.08 * intensity * (0.85 + twinkle * 0.15);
        const coreAlpha = (node.isHub ? 0.85 : 0.62) * intensity * (0.85 + twinkle * 0.15);

        // Outer glow
        ctx.fillStyle = `rgba(167, 139, 250, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Core node
        ctx.fillStyle = `rgba(199, 179, 255, ${coreAlpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        if (node.isHub) {
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.55 * intensity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, coreRadius + 3.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, intensity, interactive, prefersReducedMotion]);

  // Render static version for reduced motion
  useEffect(() => {
    if (!prefersReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const nodes = nodesRef.current;

    // Draw static edges (k-nearest + hubs)
    ctx.lineWidth = 0.8;
    const edges = getEdges(nodes);
    edges.forEach(({ a, b, dist }) => {
      const hubBoost = nodes[a].isHub || nodes[b].isHub ? 1.25 : 1;
      const maxDist = nodes[a].isHub || nodes[b].isHub ? hubConnectionDistance : baseConnectionDistance;
      const alpha = (1 - dist / maxDist) * 0.45 * intensity * hubBoost;
      ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    nodes.forEach((node) => {
      const border = getBorderConnection(node, width, height);
      if (border.dist > borderConnectionDistance) return;

      const closeness = 1 - border.dist / borderConnectionDistance;
      const alpha = (0.12 + closeness * 0.35) * intensity;
      ctx.lineWidth = 0.9 + closeness * 1.1;
      ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(border.x, border.y);
      ctx.stroke();
    });

    // Draw static nodes
    nodes.forEach((node) => {
      const glowRadius = node.baseRadius * 2.1;
      const coreRadius = node.baseRadius;
      const glowAlpha = 0.12 * intensity;
      const coreAlpha = (node.isHub ? 0.7 : 0.52) * intensity;

      // Outer glow
      ctx.fillStyle = `rgba(167, 139, 250, ${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Core node
      ctx.fillStyle = `rgba(199, 179, 255, ${coreAlpha})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [dimensions, intensity, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full ${className}`}
      style={{ opacity: intensity * 0.65 }}
    />
  );
}
