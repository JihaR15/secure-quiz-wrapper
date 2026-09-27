"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import { cn } from "@/lib/utils";

/**
 * React Bits — Threads (https://reactbits.dev/backgrounds/threads)
 * Adapted from the original React Bits component: TypeScript, prop-driven
 * uniforms, a static fallback when WebGL is unavailable, reduced-motion
 * support, and a lower render budget on coarse-pointer devices.
 */

const vertexShader = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  float line_strength = 1.0;
  for (int i = 0; i < u_line_count; i++) {
      float p = float(i) / float(u_line_count);
      line_strength *= (1.0 - lineFn(
          uv,
          u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
          p,
          (PI * 1.0) * p,
          uMouse,
          iTime,
          uAmplitude,
          uDistance
      ));
  }

  float colorVal = 1.0 - line_strength;
  gl_FragColor = vec4(uColor * colorVal, colorVal);
}
`;

type ThreadsProps = {
  /** Linear RGB triple, 0-1. Defaults to white; pass [0,0,0] on light backgrounds. */
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  speed?: number;
  enableMouseInteraction?: boolean;
  className?: string;
};

const DESKTOP_RENDER_BUDGET = 1920;
const MOBILE_RENDER_BUDGET = 1100;

export function Threads({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  speed = 1,
  enableMouseInteraction = true,
  className,
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest props in a ref so uniform updates never rebuild the context.
  // Declared before the init effect so init always reads the current values.
  const propsRef = useRef({ color, amplitude, distance, speed, enableMouseInteraction });
  useEffect(() => {
    propsRef.current = { color, amplitude, distance, speed, enableMouseInteraction };
  }, [color, amplitude, distance, speed, enableMouseInteraction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const coarsePointer =
      typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // If WebGL is unavailable the Renderer throws; the gradient layer underneath
    // is already painted, so simply skipping the canvas is the whole fallback.
    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, dpr: 1 });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Color(gl.canvas.width, gl.canvas.height, 1) },
        uColor: { value: new Color(...propsRef.current.color) },
        uAmplitude: { value: propsRef.current.amplitude },
        uDistance: { value: propsRef.current.distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // The fragment shader evaluates Perlin noise per pixel for every line, so
    // cost scales with rendered pixels. Cap the internal buffer instead of the
    // display size — the effect is soft enough that downscaling is invisible.
    const budget = coarsePointer ? MOBILE_RENDER_BUDGET : DESKTOP_RENDER_BUDGET;
    const maxDpr = coarsePointer ? 1.5 : 2;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      const baseDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const longestSide = Math.max(clientWidth, clientHeight) * baseDpr;
      const dpr = longestSide > budget ? (baseDpr * budget) / longestSide : baseDpr;
      renderer.dpr = dpr;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = gl.canvas.width;
      program.uniforms.iResolution.value.g = gl.canvas.height;
      program.uniforms.iResolution.value.b = gl.canvas.width / gl.canvas.height;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse = [
        (event.clientX - rect.left) / rect.width,
        1.0 - (event.clientY - rect.top) / rect.height,
      ];
    };
    const handlePointerLeave = () => {
      targetMouse = [0.5, 0.5];
    };
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // Only burn GPU while the canvas is on screen and the tab is foregrounded.
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    let frame = 0;
    const draw = (time: number) => {
      const { color, amplitude, distance, enableMouseInteraction } = propsRef.current;

      program.uniforms.uColor.value.set(...color);
      program.uniforms.uAmplitude.value = amplitude;
      program.uniforms.uDistance.value = distance;

      if (enableMouseInteraction) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      program.uniforms.iTime.value = time;
      renderer.render({ scene: mesh });
    };

    if (reducedMotion) {
      // Render a single representative frame, then leave the GPU alone.
      draw(4);
    } else {
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!isVisible || document.hidden) return;
        draw((now * 0.001 * propsRef.current.speed) % 100000);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div aria-hidden className={cn("relative size-full", className)}>
      {/* Always painted: this is the WebGL-less fallback, not a loading state. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_60%_40%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]" />
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
