import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CardNav from "./components/CardNav/CardNav";
import CareerTimeline from "./components/CareerTimeline/CareerTimeline";
import FinalContact from "./components/FinalContact/FinalContact";
import GradientWave from "./components/GradientWave/GradientWave";
import LanguageSwitcher from "./components/LanguageSwitcher/LanguageSwitcher";
import ProblemSelector from "./components/ProblemSelector/ProblemSelector";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import ProjectCase from "./components/ProjectCase/ProjectCase";
import ProjectMarketplace from "./components/ProjectMarketplace/ProjectMarketplace";
import SiteFooter from "./components/SiteFooter/SiteFooter";
import { getSiteContent } from "./content/siteContent";
import useProjectRoute from "./hooks/useProjectRoute";

export function App({ locale = "ru" }) {
  const { career, contact, hero, problems, projects, socialLinks, sectionCopy, navigation, ui } =
    getSiteContent(locale);
  const navigationCta = { ...hero.cta, label: locale === "en" ? "Contact" : "Связаться" };
  const { activeProject, openProject, closeProject } = useProjectRoute(projects);

  return (
    <>
      <GradientWave />
      <CardNav items={navigation} cta={navigationCta} locale={locale} ui={ui} />
      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__inner">
            <div className="hero__stage">
              <h1 className="hero__name" id="hero-title" aria-label={hero.title}>
                {hero.nameLines.map((line, lineIndex) => (
                  <span className="hero__name-line" key={line} aria-hidden="true">
                    {line.split("").map((character, letterIndex) => (
                      <span
                        className="hero__letter"
                        key={`${character}-${letterIndex}`}
                        style={{ "--letter-index": letterIndex, "--line-index": lineIndex }}
                      >
                        {character}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              <div className="hero__portrait">
                <ProfileCard
                  avatarUrl="/images/gennady-profile.webp"
                  name={hero.title}
                  profileLabel={ui.profileLabel}
                  showContact={false}
                  variant="capsule"
                />
              </div>
            </div>

            <div className="hero__footer">
              <p className="hero__role">{hero.role}</p>
              <a className="hero__scroll" href="#problems" aria-label={ui.scrollToCapabilities}>
                <span className="hero__scroll-icon" aria-hidden="true">
                  <HugeiconsIcon icon={ArrowDown01Icon} size={30} strokeWidth={1.8} />
                </span>
              </a>
            </div>
          </div>
        </section>

        <ProblemSelector problems={problems} sectionId="problems" copy={sectionCopy.problems} ui={ui} />
        <CareerTimeline items={career} copy={sectionCopy.career} />
        <ProjectMarketplace projects={projects} onOpenProject={openProject} copy={sectionCopy.marketplace} ui={ui} />
        <FinalContact contact={contact} />
      </main>
      <SiteFooter links={socialLinks} ui={ui} />
      {activeProject && (
        <ProjectCase
          project={activeProject}
          projects={projects}
          onClose={closeProject}
          onOpenProject={openProject}
          ui={ui}
          locale={locale}
          languageSwitcher={
            <LanguageSwitcher
              locale={locale}
              options={ui.languageSwitch}
              label={ui.languageSwitchLabel}
              activeProjectSlug={activeProject.slug}
            />
          }
        />
      )}
    </>
  );
}
