import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./FinalContact.css";

export default function FinalContact({ contact }) {
  const innerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return undefined;
    if (isSettled || reducedMotion || typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      setIsSettled(true);
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
  }, [isSettled, reducedMotion]);

  return (
    <section className="final-contact" id="contact" aria-labelledby="contact-title">
      <div
        className={`final-contact__inner${isRevealed ? " is-revealed" : ""}${
          isSettled ? " is-settled" : ""
        }`}
        ref={innerRef}
      >
        <div className="final-contact__copy">
          <h2 id="contact-title">{contact.title}</h2>
          <p className="final-contact__body">{contact.body}</p>
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
          <span className="final-contact__orbit final-contact__orbit--outer" />
          <span
            className="final-contact__orbit final-contact__orbit--inner"
            onAnimationEnd={() => setIsSettled(true)}
          />
          <span className="final-contact__satellite" />
          <figure className="final-contact__portrait">
            <img
              src="/images/gennady-profile.webp"
              alt=""
              width="928"
              height="1152"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
