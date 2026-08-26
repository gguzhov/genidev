import { useEffect, useRef, useState } from "react";
import "./PointerHighlight.css";

export default function PointerHighlight({ children }) {
  const rootRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.7 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      className={`pointer-highlight${isVisible ? " is-visible" : ""}`}
      ref={rootRef}
    >
      <span className="pointer-highlight__content">{children}</span>
      <span className="pointer-highlight__frame" aria-hidden="true">
        <span className="pointer-highlight__corner pointer-highlight__corner--tl" />
        <span className="pointer-highlight__corner pointer-highlight__corner--tr" />
        <span className="pointer-highlight__corner pointer-highlight__corner--br" />
        <span className="pointer-highlight__corner pointer-highlight__corner--bl" />
        <span className="pointer-highlight__cursor" />
      </span>
    </span>
  );
}
