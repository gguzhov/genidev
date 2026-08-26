import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./FinalContact.css";

export default function FinalContact({ contact }) {
  const innerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return undefined;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.22 },
    );
    observer.observe(inner);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section className="final-contact" id="contact" aria-labelledby="contact-title">
      <div
        className={`final-contact__inner${isRevealed ? " is-revealed" : ""}`}
        ref={innerRef}
      >
        <div className="final-contact__copy">
          <h2 id="contact-title">{contact.title}</h2>
          <div className="final-contact__actions">
            <a
              className="button button--primary"
              href={contact.href}
              target={contact.target}
              rel={contact.rel}
            >
              {contact.ctaLabel}
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div className="final-contact__visual" aria-hidden="true">
          <figure className="final-contact__cyborg">
            <img
              src="/images/gennady-cyborg-v2.webp"
              alt=""
              width="1120"
              height="1400"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
