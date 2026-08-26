import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

export default function ProjectGallery({ images, title, ui }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const scrollFrameRef = useRef();
  const reducedMotion = useReducedMotion();
  const imageCount = images?.length ?? 0;
  const resolvedIndex = Math.min(activeIndex, Math.max(0, imageCount - 1));
  const showSlide = (nextIndex) => {
    const track = trackRef.current;
    const slides = track?.querySelectorAll(".project-gallery__slide");
    const resolved = (nextIndex + imageCount) % imageCount;
    const slide = slides?.[resolved];
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
    setActiveIndex(resolved);
  };

  const updateActiveSlide = () => {
    if (scrollFrameRef.current !== undefined) return;
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = undefined;
      const track = trackRef.current;
      const slides = [...(track?.querySelectorAll(".project-gallery__slide") ?? [])];
      if (!track || !slides.length) return;
      const closest = slides.reduce((best, slide, index) => (
        Math.abs(slide.offsetLeft - track.scrollLeft)
          < Math.abs(slides[best].offsetLeft - track.scrollLeft)
          ? index
          : best
      ), 0);
      setActiveIndex(closest);
    });
  };

  useEffect(() => () => {
    if (scrollFrameRef.current !== undefined) cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  if (!imageCount) return null;

  return (
    <div
      className="project-gallery"
      aria-roledescription={ui.carousel}
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showSlide(resolvedIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          showSlide(resolvedIndex + 1);
        }
      }}
    >
      <div className="project-gallery__track" ref={trackRef} onScroll={updateActiveSlide} tabIndex="0">
        {images.map((image, index) => (
          <figure
            className="project-gallery__slide"
            aria-label={`${index + 1}: ${image.caption ?? image.alt}`}
            aria-current={resolvedIndex === index ? "true" : undefined}
            key={image.src}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{image.caption ?? image.alt}</figcaption>
          </figure>
        ))}
      </div>

      <div className="project-gallery__controls">
        <p aria-live="polite">
          {String(resolvedIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </p>
      </div>

      <div className="project-gallery__dots" aria-label={ui.case.gallery}>
        {images.map((image, index) => (
          <button
            type="button"
            aria-label={`${index + 1}: ${image.caption ?? image.alt}`}
            aria-current={resolvedIndex === index ? "true" : undefined}
            onClick={() => showSlide(index)}
            key={image.src}
          />
        ))}
      </div>
    </div>
  );
}
