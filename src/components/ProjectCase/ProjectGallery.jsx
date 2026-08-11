import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

export default function ProjectGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!images?.length) return null;

  const resolvedIndex = Math.min(activeIndex, images.length - 1);
  const activeImage = images[resolvedIndex];
  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div className="project-gallery" aria-roledescription="карусель" aria-label={title}>
      <figure className="project-gallery__frame" key={activeImage.src}>
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          width={activeImage.width}
          height={activeImage.height}
          loading="lazy"
          decoding="async"
        />
        <figcaption>{activeImage.caption ?? activeImage.alt}</figcaption>
      </figure>

      <div className="project-gallery__controls">
        <p aria-live="polite">
          {String(resolvedIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </p>
        <div>
          <button type="button" onClick={showPrevious} aria-label="Предыдущий кадр">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button type="button" onClick={showNext} aria-label="Следующий кадр">
            <HugeiconsIcon icon={ArrowRight02Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
