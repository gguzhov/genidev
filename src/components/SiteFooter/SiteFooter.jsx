import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import "./SiteFooter.css";

export default function SiteFooter({ links }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <img
            src="/images/gennady-profile.webp"
            alt=""
            width="72"
            height="72"
            aria-hidden="true"
          />
          <div>
            <p>Разработано genidev</p>
            <span>Геннадий Гужов · 2026</span>
          </div>
        </div>

        <nav className="site-footer__social" aria-label="Социальные профили">
          {links.map((link) => (
            <a href={link.href} target="_blank" rel="noreferrer" key={link.id}>
              <img
                className={`site-footer__social-icon site-footer__social-icon--${link.id}`}
                src={link.icon}
                alt=""
                width="28"
                height="28"
                aria-hidden="true"
              />
              <span>
                <strong>{link.label}</strong>
                <small>{link.meta}</small>
              </span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          ))}
        </nav>

        <p className="site-footer__legal">
          Информация на сайте не является публичной офертой.
        </p>
      </div>
    </footer>
  );
}
