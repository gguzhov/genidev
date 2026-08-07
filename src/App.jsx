import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  Menu02Icon,
} from "@hugeicons/core-free-icons";
import LiquidEther from "./components/LiquidEther/LiquidEther";

const navigation = [
  { label: "Работы", href: "#work" },
  { label: "Обо мне", href: "#about" },
  { label: "Контакты", href: "#contact" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <main className="hero" id="work">
      <div className="hero__visual" aria-hidden="true">
        <LiquidEther
          className="hero__ether"
          colors={["#e7eaf1", "#ccd9f4", "#8fabef"]}
          mouseForce={12}
          cursorSize={150}
          isViscous
          viscous={40}
          iterationsViscous={36}
          iterationsPoisson={28}
          resolution={0.5}
          autoDemo={!reducedMotion}
          autoSpeed={0.24}
          autoIntensity={0.95}
          takeoverDuration={0.45}
          autoResumeDelay={3200}
          autoRampDuration={1.4}
        />
      </div>

      <header className="site-header">
        <a className="brand" href="#work" aria-label="Геннадий Гужов — на главную">
          <img className="brand__logo" src="/logo.svg" alt="" aria-hidden="true" />
          <span>Геннадий Гужов</span>
        </a>

        <nav className="desktop-nav" aria-label="Основная навигация">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="header-cta" href="#contact">
          Написать
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </a>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <HugeiconsIcon icon={Menu02Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <nav
          className={`mobile-nav${menuOpen ? " mobile-nav--open" : ""}`}
          id="mobile-navigation"
          aria-label="Мобильная навигация"
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero__content" aria-labelledby="hero-title">
        <p className="availability" id="about">
          <span aria-hidden="true" />
          Открыт к новым проектам
        </p>

        <h1 id="hero-title">
          <span className="hero__title-line">Проектирую и запускаю</span>
          <span className="hero__title-line">цифровые продукты.</span>
        </h1>

        <p className="hero__intro">
          Соединяю продуктовый подход, дизайн и разработку, чтобы превращать идеи в ясные
          и работающие интерфейсы.
        </p>

        <div className="hero__actions" id="contact">
          <a className="button button--primary" href="#work">
            Смотреть работы
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </a>
          <a className="button button--secondary" href="#about">
            Обо мне
          </a>
        </div>
      </section>

      <p className="interaction-note" aria-hidden="true">
        Двигайте курсором
      </p>
    </main>
  );
}
