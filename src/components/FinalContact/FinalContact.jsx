import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import "./FinalContact.css";

export default function FinalContact({ contact }) {
  return (
    <section className="final-contact" id="contact" aria-labelledby="contact-title">
      <div className="final-contact__inner">
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
          <span className="final-contact__orbit final-contact__orbit--inner" />
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
