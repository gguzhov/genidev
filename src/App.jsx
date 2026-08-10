import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CardNav from "./components/CardNav/CardNav";
import CareerTimeline from "./components/CareerTimeline/CareerTimeline";
import FinalContact from "./components/FinalContact/FinalContact";
import ProblemSelector from "./components/ProblemSelector/ProblemSelector";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import ProjectCase from "./components/ProjectCase/ProjectCase";
import ProjectMarketplace from "./components/ProjectMarketplace/ProjectMarketplace";
import WorkSequence from "./components/WorkSequence/WorkSequence";
import { career, contact, hero, identity, problems, projects } from "./content/siteContent";
import useProjectRoute from "./hooks/useProjectRoute";
import useReducedMotion from "./hooks/useReducedMotion";

const navigation = [
  {
    label: "Разделы",
    links: [
      { label: "Задачи", href: "#problems", ariaLabel: "Перейти к бизнес-задачам" },
      { label: "Путь", href: "#career", ariaLabel: "Перейти к карьерному пути" },
      { label: "Разработки", href: "#projects", ariaLabel: "Перейти к разработкам" },
      { label: "Контакт", href: "#contact", ariaLabel: "Перейти к контактам" },
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
  const { activeProject, openProject, closeProject } = useProjectRoute(projects);

  const openContact = () => {
    window.open(hero.cta.href, hero.cta.target, "noopener,noreferrer");
  };

  return (
    <>
      <CardNav items={navigation} cta={hero.cta} />
      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__inner">
            <div className="hero__copy">
              <h1 id="hero-title">
                <span className="hero__title-line">{identity}</span>
              </h1>
              <p className="hero__promise">{hero.promise}</p>
              <p className="hero__description">{hero.description}</p>
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
              onContactClick={openContact}
            />

            <div className="hero__sequence">
              <WorkSequence items={hero.sequence} reducedMotion={reducedMotion} />
            </div>
          </div>
        </section>

        <ProblemSelector problems={problems} sectionId="problems" />
        <CareerTimeline items={career} />
        <ProjectMarketplace projects={projects} onOpenProject={openProject} />
        <FinalContact contact={contact} cta={hero.cta} />
      </main>
      {activeProject && (
        <ProjectCase
          project={activeProject}
          projects={projects}
          onClose={closeProject}
          onOpenProject={openProject}
        />
      )}
    </>
  );
}
