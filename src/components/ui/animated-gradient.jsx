import { useEffect, useMemo, useRef, useState } from "react";
import "./animated-gradient.css";

const PatternShapes = {
  Checks: 0,
  Stripes: 1,
  Edge: 2,
};

const TARGET_FRAME_MS = 1000 / 30;
const DEFAULT_CONFIG = Object.freeze({ preset: "Ice" });

const presets = {
  Ice: {
    color1: "var(--gradient-ice-base)",
    color2: "var(--gradient-ice-signal)",
    color3: "var(--gradient-ice-light)",
    rotation: -50,
    proportion: 48,
    scale: 0.14,
    speed: 7,
    distortion: 1,
    swirl: 50,
    swirlIterations: 16,
    softness: 58,
    offset: -299,
    shape: "Checks",
    shapeSize: 45,
  },
};

function getParams(config) {
  if (config.preset === "custom") {
    return {
      color1: config.color1,
      color2: config.color2,
      color3: config.color3,
      rotation: config.rotation ?? 0,
      proportion: config.proportion ?? 35,
      scale: config.scale ?? 1,
      speed: config.speed ?? 25,
      distortion: config.distortion ?? 12,
      swirl: config.swirl ?? 80,
      swirlIterations: config.swirlIterations ?? 10,
      softness: config.softness ?? 100,
      offset: config.offset ?? 0,
      shape: config.shape ?? "Checks",
      shapeSize: config.shapeSize ?? 10,
    };
  }

  const preset = presets[config.preset] ?? presets.Ice;
  return { ...preset, speed: config.speed ?? preset.speed };
}

function resolveColor(value, element) {
  if (!value?.startsWith("var(")) return value;
  const token = value.slice(4, -1).trim();
  return getComputedStyle(element).getPropertyValue(token).trim();
}

function hexToRgba(value) {
  const hex = value.trim();
  if (hex.startsWith("rgb")) {
    const parts = hex.match(/[\d.]+/g)?.map(Number) ?? [];
    return [
      (parts[0] ?? 0) / 255,
      (parts[1] ?? 0) / 255,
      (parts[2] ?? 0) / 255,
      parts[3] ?? 1,
    ];
  }

  const compact = hex.replace("#", "");
  const expanded = compact.length === 3
    ? compact.split("").map((character) => character.repeat(2)).join("")
    : compact;
  const red = Number.parseInt(expanded.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expanded.slice(4, 6), 16) / 255;
  const alpha = expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1;
  return [red, green, blue, alpha];
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export default function AnimatedGradient({
  config = DEFAULT_CONFIG,
  noise = { opacity: 0.08, scale: 0.7 },
  amplitude = 0.065,
  mouseReact = true,
  radius = "0px",
  style,
  className = "",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameIdRef = useRef(undefined);
  const elapsedRef = useRef(0);
  const lastFrameRef = useRef(undefined);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [contextRevision, setContextRevision] = useState(0);
  const params = useMemo(() => getParams(config), [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let contextLost = false;
    const handleContextLost = (event) => {
      event.preventDefault();
      contextLost = true;
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = undefined;
      lastFrameRef.current = undefined;
      setWebglAvailable(false);
    };
    const handleContextRestored = () => {
      contextLost = false;
      setWebglAvailable(true);
      setContextRevision((revision) => revision + 1);
    };
    const removeContextListeners = () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: true,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    if (!gl) {
      setWebglAvailable(false);
      return removeContextListeners;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) {
      setWebglAvailable(false);
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      removeContextListeners();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return undefined;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglAvailable(false);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      removeContextListeners();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return undefined;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      setWebglAvailable(false);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      removeContextListeners();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return undefined;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = Object.fromEntries(
      [
        "u_time",
        "u_resolution",
        "u_pixelRatio",
        "u_scale",
        "u_rotation",
        "u_color1",
        "u_color2",
        "u_color3",
        "u_proportion",
        "u_softness",
        "u_shape",
        "u_shapeScale",
        "u_distortion",
        "u_swirl",
        "u_swirlIterations",
        "u_mouse",
        "u_amplitude",
      ].map((name) => [name, gl.getUniformLocation(program, name)]),
    );

    const colors = [params.color1, params.color2, params.color3]
      .map((color) => hexToRgba(resolveColor(color, container)));

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      if (contextLost || gl.isContextLost?.()) return;
      const speed = (params.speed / 100) * 5;
      gl.uniform1f(uniforms.u_time, elapsedRef.current * speed + params.offset * 0.01);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_pixelRatio, Math.min(window.devicePixelRatio || 1, 1.5));
      gl.uniform1f(uniforms.u_scale, params.scale);
      gl.uniform1f(uniforms.u_rotation, (params.rotation * Math.PI) / 180);
      gl.uniform4fv(uniforms.u_color1, colors[0]);
      gl.uniform4fv(uniforms.u_color2, colors[1]);
      gl.uniform4fv(uniforms.u_color3, colors[2]);
      gl.uniform1f(uniforms.u_proportion, params.proportion / 100);
      gl.uniform1f(uniforms.u_softness, params.softness / 100);
      gl.uniform1f(uniforms.u_shape, PatternShapes[params.shape]);
      gl.uniform1f(uniforms.u_shapeScale, params.shapeSize / 100);
      gl.uniform1f(uniforms.u_distortion, params.distortion / 50);
      gl.uniform1f(uniforms.u_swirl, params.swirl / 100);
      gl.uniform1f(
        uniforms.u_swirlIterations,
        params.swirl === 0 ? 0 : params.swirlIterations,
      );
      gl.uniform2f(uniforms.u_mouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uniforms.u_amplitude, amplitude);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const stop = () => {
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = undefined;
      lastFrameRef.current = undefined;
    };

    const animate = (time) => {
      if (contextLost || gl.isContextLost?.()) {
        stop();
        return;
      }
      if (lastFrameRef.current === undefined) {
        lastFrameRef.current = time;
      } else {
        const delta = time - lastFrameRef.current;
        if (delta < TARGET_FRAME_MS) {
          frameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        elapsedRef.current += Math.min(delta / 1000, 0.1);
        lastFrameRef.current = time - (delta % TARGET_FRAME_MS);
        draw();
      }
      frameIdRef.current = requestAnimationFrame(animate);
    };

    let pointerAttached = false;
    const resetPointer = () => {
      mouseRef.current = { x: 0.5, y: 0.5 };
    };
    const handlePointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      mouseRef.current = {
        x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
        y: Math.max(0, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height)),
      };
    };
    const syncPointerReaction = () => {
      const shouldAttach = mouseReact && hoverQuery.matches && !motionQuery.matches;
      if (shouldAttach === pointerAttached) return;
      pointerAttached = shouldAttach;
      if (pointerAttached) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
      } else {
        window.removeEventListener("pointermove", handlePointerMove);
        resetPointer();
        draw();
      }
    };

    const syncAnimation = () => {
      stop();
      if (contextLost || gl.isContextLost?.()) return;
      draw();
      if (document.visibilityState === "visible" && !motionQuery.matches) {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(container);
    document.addEventListener("visibilitychange", syncAnimation);
    const handleMotionPreference = () => {
      syncPointerReaction();
      syncAnimation();
    };
    motionQuery.addEventListener("change", handleMotionPreference);
    hoverQuery.addEventListener("change", syncPointerReaction);
    syncPointerReaction();
    syncAnimation();

    return () => {
      stop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      motionQuery.removeEventListener("change", handleMotionPreference);
      hoverQuery.removeEventListener("change", syncPointerReaction);
      window.removeEventListener("pointermove", handlePointerMove);
      resetPointer();
      removeContextListeners();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [amplitude, contextRevision, mouseReact, params]);

  return (
    <div
      ref={containerRef}
      className={`animated-gradient ${className}`.trim()}
      style={{ borderRadius: radius, ...style }}
      data-webgl={webglAvailable ? "available" : "fallback"}
      aria-hidden="true"
    >
      <div className="animated-gradient__fallback" />
      <canvas ref={canvasRef} className="animated-gradient__canvas" />
      {noise?.opacity > 0 && (
        <div
          className="animated-gradient__noise"
          style={{
            "--gradient-noise-opacity": noise.opacity / 2,
            "--gradient-noise-size": `${(noise.scale ?? 1) * 200}px`,
          }}
        />
      )}
    </div>
  );
}

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;
uniform vec2 u_mouse;
uniform float u_amplitude;
out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
  vec3 color1 = c1.rgb * c1.a;
  vec3 color2 = c2.rgb * c2.a;
  vec3 color3 = c3.rgb * c3.a;
  float r1 = smoothstep(0.0 + 0.35 * edgesWidth, 0.7 - 0.35 * edgesWidth + 0.5 * edge_blur, mixer);
  float r2 = smoothstep(0.3 + 0.35 * edgesWidth, 1.0 - 0.35 * edgesWidth + edge_blur, mixer);
  vec3 blended_color_2 = mix(color1, color2, r1);
  float blended_opacity_2 = mix(c1.a, c2.a, r1);
  vec3 c = mix(blended_color_2, color3, r2);
  float o = mix(blended_opacity_2, c3.a, r2);
  return vec4(c, o);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = 0.5 * u_time;
  float noise_scale = .0005 + .006 * u_scale;

  uv -= 0.5;
  uv *= noise_scale * u_resolution;
  uv = rotate(uv, u_rotation * 0.5 * PI);
  uv /= u_pixelRatio;
  uv += 0.5;
  uv += (u_mouse - vec2(0.5)) * u_amplitude;

  float n1 = noise(uv * 1.0 + t);
  float n2 = noise(uv * 2.0 - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
  for (float i = 1.; i <= iterations_number; i++) {
    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.0 * uv.x);
  }

  float proportion = clamp(u_proportion, 0.0, 1.0);
  float shape = 0.0;
  float mixer = 0.0;

  if (u_shape < 0.5) {
    vec2 checks_shape_uv = uv * (0.5 + 3.5 * u_shapeScale);
    shape = 0.5 + 0.5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
    mixer = shape + 0.48 * sign(proportion - 0.5) * pow(abs(proportion - 0.5), 0.5);
  } else if (u_shape < 1.5) {
    vec2 stripes_shape_uv = uv * (0.25 + 3.0 * u_shapeScale);
    float f = fract(stripes_shape_uv.y);
    shape = smoothstep(0.0, 0.55, f) * smoothstep(1.0, 0.45, f);
    mixer = shape + 0.48 * sign(proportion - 0.5) * pow(abs(proportion - 0.5), 0.5);
  } else {
    float sh = 1.0 - uv.y;
    sh -= 0.5;
    sh /= noise_scale * u_resolution.y;
    sh += 0.5;
    float shape_scaling = 0.2 * (1.0 - u_shapeScale);
    shape = smoothstep(0.45 - shape_scaling, 0.55 + shape_scaling, sh + 0.3 * (proportion - 0.5));
    mixer = shape;
  }

  vec4 color_mix = blend_colors(
    u_color1,
    u_color2,
    u_color3,
    mixer,
    1.0 - clamp(u_softness, 0.0, 1.0),
    0.01 + 0.01 * u_scale
  );
  fragColor = vec4(color_mix.rgb, color_mix.a);
}`;
