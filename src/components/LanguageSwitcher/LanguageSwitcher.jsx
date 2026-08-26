import { localizedHomePath, projectPath } from "../../lib/projectRouting";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher({ locale, options, label, activeProjectSlug }) {
  return (
    <nav className="language-switcher" aria-label={label}>
      {options.map((option) => {
        const href = activeProjectSlug
          ? projectPath(activeProjectSlug, option.locale)
          : localizedHomePath(option.locale);
        return (
          <a
            href={href}
            lang={option.locale}
            hrefLang={option.locale}
            aria-current={locale === option.locale ? "page" : undefined}
            key={option.locale}
          >
            {option.label}
          </a>
        );
      })}
    </nav>
  );
}
