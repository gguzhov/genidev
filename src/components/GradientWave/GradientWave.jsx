import AnimatedGradient from "../ui/animated-gradient";
import "./GradientWave.css";

const iceGradient = {
  preset: "Ice",
  speed: 11,
};

export default function GradientWave() {
  return (
    <div className="gradient-wave" aria-hidden="true">
      <AnimatedGradient
        className="gradient-wave__shader"
        config={iceGradient}
        noise={{ opacity: 0.045, scale: 0.8 }}
        amplitude={0.08}
        mouseReact
      />
      <div className="gradient-wave__veil" />
    </div>
  );
}
