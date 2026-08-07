import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CardNav from "./components/CardNav/CardNav";
import CareerTimeline from "./components/CareerTimeline/CareerTimeline";
import LiquidEther from "./components/LiquidEther/LiquidEther";
import ProblemSelector from "./components/ProblemSelector/ProblemSelector";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import { career, hero, identity, problems } from "./content/siteContent";
import useReducedMotion from "./hooks/useReducedMotion";

const navigation = [
  {
    label: "Разделы",
    links: [
      { label: "Задачи", href: "#problems", ariaLabel: "Перейти к бизнес-задачам" },
      { label: "Путь", href: "#career", ariaLabel: "Перейти к карьерному пути" },
      { label: "Разработки", href: "#projects", ariaLabel: "Перейти к разработкам" },
    ],
  },
  {
    label: "Связаться",
    links: [
      {
        label: "Telegram · @gguzhov",
        href: hero.cta.href,
        ariaLabel: "Написать Геннадию в Telegram",
        target: hero.cta.target,
        rel: hero.cta.rel,
      },
    ],
  },
];

export function App() {
  const reducedMotion = useReducedMotion();

  const openContact = () => {
    window.open(hero.cta.href, hero.cta.target, "noopener,noreferrer");
  };

  return (
    <>
      <CardNav items={navigation} cta={hero.cta} />
      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
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

          <div className="hero__inner">
            <div className="hero__copy">
              <p className="hero__identity">{identity}</p>
              <h1 id="hero-title">
                <span className="hero__title-line">{hero.title}</span>
              </h1>
              <p className="hero__intro">{hero.description}</p>
              <a
                className="button button--primary"
                href={hero.cta.href}
                target={hero.cta.target}
                rel={hero.cta.rel}
              >
                {hero.cta.label}
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </a>
            </div>

            <ProfileCard
              avatarUrl="/images/gennady-profile.webp"
              name="Геннадий Гужов"
              title="Разработчик цифровых и AI-продуктов"
              handle="gguzhov"
              onContactClick={openContact}
            />
          </div>
        </section>

        <ProblemSelector problems={problems} sectionId="problems" />
        <CareerTimeline items={career} />
      </main>
    </>
  );
}
