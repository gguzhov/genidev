import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import "./FinalContact.css";

export default function FinalContact({ contact, cta }) {
  return (
    <section className="final-contact" id="contact" aria-labelledby="contact-title">
      <div className="final-contact__inner">
        <p className="section__eyebrow">Обсудить задачу</p>
        <h2 id="contact-title">{contact.title}</h2>
        <div className="final-contact__actions">
          <a
            className="button button--primary"
            href={contact.href}
            target={contact.target}
            rel={contact.rel}
          >
            {cta.label}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </a>
          <p>
            <a href={contact.href} target={contact.target} rel={contact.rel}>
              {contact.handle}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
