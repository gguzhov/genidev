import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import "./SiteFooter.css";

export default function SiteFooter({ links, ui }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <img
            src="/images/genidev-avatar.webp"
            alt=""
            width="72"
            height="72"
            aria-hidden="true"
          />
          <p>{ui.footerIdentity}</p>
        </div>

        <nav className="site-footer__social" aria-label={ui.footerNav}>
          {links.map((link) => (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              key={link.id}
              aria-label={`${link.label}: ${link.meta}`}
            >
              <img
                className={`site-footer__social-icon site-footer__social-icon--${link.id}`}
                src={link.icon}
                alt=""
                width="28"
                height="28"
                aria-hidden="true"
              />
              <span>{link.meta}</span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
