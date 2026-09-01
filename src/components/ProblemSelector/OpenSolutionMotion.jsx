import { Player } from "@remotion/player";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SIGNAL_PATH = "M 22 80 C 210 46, 360 102, 542 72 S 886 44, 1178 74";

export function OpenSolutionSignal() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const travelEnd = durationInFrames - 24;
  const pulseX = interpolate(frame, [0, travelEnd, durationInFrames - 1], [28, 1168, 1194], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const pulseOpacity = interpolate(
    frame,
    [0, 12, travelEnd - 12, durationInFrames - 1],
    [0, 0.95, 0.95, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const glowScale = interpolate(
    Math.sin((frame / durationInFrames) * Math.PI * 6),
    [-1, 1],
    [0.78, 1.12],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 128"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="open-solution-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fb8ff" stopOpacity="0" />
            <stop offset="0.42" stopColor="#6da1ff" stopOpacity="0.72" />
            <stop offset="0.72" stopColor="#195ee8" stopOpacity="1" />
            <stop offset="1" stopColor="#c3dcff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="open-solution-pulse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="0.18" stopColor="#8fc7ff" stopOpacity="0.92" />
            <stop offset="1" stopColor="#195ee8" stopOpacity="0" />
          </radialGradient>
          <filter id="open-solution-blur" x="-80%" y="-160%" width="260%" height="420%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <path
          d={SIGNAL_PATH}
          fill="none"
          stroke="#123d9c"
          strokeOpacity="0.18"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={SIGNAL_PATH}
          fill="none"
          pathLength="1200"
          stroke="url(#open-solution-beam)"
          strokeDasharray="270 930"
          strokeDashoffset={interpolate(frame, [0, durationInFrames - 1], [280, -920], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
          })}
          strokeLinecap="round"
          strokeWidth="2.4"
          vectorEffect="non-scaling-stroke"
        />

        {[120, 336, 562, 796, 1018].map((x, index) => {
          const distance = Math.abs(pulseX - x);
          const nodeStrength = interpolate(distance, [0, 135], [1, 0.18], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = 73 + Math.sin(index * 1.7) * 13;

          return (
            <g key={x} opacity={nodeStrength}>
              <circle cx={x} cy={y} r="3.1" fill="#ffffff" />
              <circle cx={x} cy={y} r="8" fill="none" stroke="#619cff" strokeWidth="1" />
            </g>
          );
        })}

        <ellipse
          cx={pulseX}
          cy={74 + Math.sin(frame / 19) * 5}
          rx={48 * glowScale}
          ry={20 * glowScale}
          fill="url(#open-solution-pulse)"
          filter="url(#open-solution-blur)"
          opacity={pulseOpacity * 0.72}
        />
        <circle
          cx={pulseX}
          cy={74 + Math.sin(frame / 19) * 5}
          r="3.2"
          fill="#ffffff"
          opacity={pulseOpacity}
        />
      </svg>
    </AbsoluteFill>
  );
}

export default function OpenSolutionMotion() {
  return (
    <Player
      component={OpenSolutionSignal}
      durationInFrames={180}
      compositionWidth={1200}
      compositionHeight={128}
      fps={30}
      autoPlay
      loop
      acknowledgeRemotionLicense
      controls={false}
      clickToPlay={false}
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    />
  );
}
