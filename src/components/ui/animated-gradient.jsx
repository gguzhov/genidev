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
    color2: "var(--gradient-ice-light)",
    color3: "var(--gradient-ice-signal)",
    rotation: -24,
    proportion: 42,
    scale: 0.34,
    speed: 7,
    distortion: 3,
    swirl: 34,
    swirlIterations: 5,
    softness: 100,
    offset: -180,
    shape: "Edge",
    shapeSize: 62,
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
  radius = "0px",
  style,
  className = "",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameIdRef = useRef(undefined);
  const elapsedRef = useRef(0);
  const lastFrameRef = useRef(undefined);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [contextRevision, setContextRevision] = useState(0);
  const params = useMemo(() => getParams(config), [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleContextLost = (event) => {
      event.preventDefault();
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = undefined;
      lastFrameRef.current = undefined;
      setWebglAvailable(false);
    };
    const handleContextRestored = () => {
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
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const stop = () => {
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = undefined;
      lastFrameRef.current = undefined;
    };

    const animate = (time) => {
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

    const syncAnimation = () => {
      stop();
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
    motionQuery.addEventListener("change", syncAnimation);
    syncAnimation();

    return () => {
      stop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      motionQuery.removeEventListener("change", syncAnimation);
      removeContextListeners();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [contextRevision, params]);

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
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec4 blendColors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edgeBlur) {
  vec3 color1 = c1.rgb * c1.a;
  vec3 color2 = c2.rgb * c2.a;
  vec3 color3 = c3.rgb * c3.a;
  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edgeBlur, mixer);
  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edgeBlur, mixer);
  vec3 blendedColor = mix(color1, color2, r1);
  float blendedOpacity = mix(c1.a, c2.a, r1);
  return vec4(mix(blendedColor, color3, r2), mix(blendedOpacity, c3.a, r2));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = .5 * u_time;
  float noiseScale = .0005 + .006 * u_scale;
  uv -= .5;
  uv *= noiseScale * u_resolution;
  uv = rotate(uv, u_rotation);
  uv /= u_pixelRatio;
  uv += .5;

  float n1 = noise(uv + t);
  float n2 = noise(uv * 2. - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float iterationsNumber = ceil(clamp(u_swirlIterations, 1., 30.));
  for (float i = 1.; i <= 30.; i++) {
    if (i > iterationsNumber) break;
    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);
  float mixer;
  if (u_shape < .5) {
    vec2 shapeUv = uv * (.5 + 3.5 * u_shapeScale);
    float shape = .5 + .5 * sin(shapeUv.x) * cos(shapeUv.y);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 shapeUv = uv * (.25 + 3. * u_shapeScale);
    float f = fract(shapeUv.y);
    float shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float shape = 1. - uv.y;
    shape -= .5;
    shape /= noiseScale * u_resolution.y;
    shape += .5;
    float shapeScaling = .2 * (1. - u_shapeScale);
    mixer = smoothstep(
      .45 - shapeScaling,
      .55 + shapeScaling,
      shape + .3 * (proportion - .5)
    );
  }

  fragColor = blendColors(
    u_color1,
    u_color2,
    u_color3,
    mixer,
    1. - clamp(u_softness, 0., 1.),
    .01 + .01 * u_scale
  );
}`;
