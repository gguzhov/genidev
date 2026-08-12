import AnimatedGradient from "../ui/animated-gradient";
import "./GradientWave.css";

const iceGradient = {
  preset: "Ice",
  speed: 7,
};

export default function GradientWave() {
  return (
    <div className="gradient-wave" aria-hidden="true">
      <AnimatedGradient
        className="gradient-wave__shader"
        config={iceGradient}
        noise={{ opacity: 0.08, scale: 0.7 }}
      />
      <div className="gradient-wave__veil" />
    </div>
  );
}
