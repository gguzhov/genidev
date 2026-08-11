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
import { career, contact, hero, problems, projects } from "./content/siteContent";
import useProjectRoute from "./hooks/useProjectRoute";
import useReducedMotion from "./hooks/useReducedMotion";

const navigation = [
  {
    label: "Задачи",
    href: "#problems",
    ariaLabel: "Перейти к бизнес-задачам",
  },
  {
    label: "Опыт",
    href: "#career",
    ariaLabel: "Перейти к карьерному пути",
  },
  {
    label: "Проекты",
    href: "#projects",
    ariaLabel: "Перейти к проектам",
  },
  {
    label: "Связаться",
    href: "#contact",
    ariaLabel: "Перейти к контактам",
  },
];

const navigationCta = {
  ...hero.cta,
  label: "Связаться",
};

export function App() {
  const reducedMotion = useReducedMotion();
  const { activeProject, openProject, closeProject } = useProjectRoute(projects);

  const openContact = () => {
    window.open(hero.cta.href, hero.cta.target, "noopener,noreferrer");
  };

  return (
    <>
      <CardNav items={navigation} cta={navigationCta} />
      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__inner">
            <div className="hero__copy">
              <h1 id="hero-title">
                <span className="hero__title-line">{hero.title}</span>
              </h1>
              <p className="hero__promise">{hero.promise}</p>
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
        <FinalContact contact={contact} />
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
