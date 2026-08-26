import assert from "node:assert/strict";
import test from "node:test";
import { career, contact, hero, problems, projects } from "../src/content/siteContent.js";
import { projectPath, projectSlugFromPath } from "../src/lib/projectRouting.js";

test("publishes the approved positioning and six business capabilities", () => {
  assert.equal(
    hero.title,
    "Геннадий Гужов",
  );
  assert.deepEqual(hero.nameLines, ["Геннадий", "Гужов"]);
  assert.equal(hero.role, "Fullstack-разработчик цифровых и AI-продуктов");
  assert.equal("description" in hero, false);
  assert.equal(
    hero.promise,
    "Создаю сервисы, связываю разрозненные процессы в системы и довожу решения до запуска, где их ценность можно измерить.",
  );
  assert.equal(hero.sequence, undefined);
  assert.equal(hero.cta.label, "Обсудить задачу");
  assert.equal(hero.cta.href, "https://t.me/gguzhov");
  assert.equal(hero.cta.target, "_blank");
  assert.equal(hero.cta.rel, "noreferrer");
  assert.equal(contact.target, "_blank");
  assert.equal(contact.rel, "noreferrer");
  assert.deepEqual(problems.map(({ id }) => id), ["marketing", "sales", "management", "operations", "ai-infrastructure", "enablement"]);
  for (const problem of problems) {
    assert.match(problem.icon, /^\/images\/capabilities\/.+\.webp$/);
    assert.equal(problem.solutions.length, 4);
    assert.equal(problem.actions, undefined);
    assert.equal(problem.outcomes, undefined);
    assert.equal(problem.situation, undefined);
    for (const solution of problem.solutions.slice(0, 3)) {
      assert.ok(solution.title.length > 4);
      assert.ok(solution.project.length > 7);
      assert.ok(solution.effect.length > 7);
    }
    assert.equal(problem.solutions.at(-1).title, "И другое цифровое решение");
  }
});

test("keeps the approved career sequence", () => {
  assert.deepEqual(career.map(({ year }) => year), ["2021–2024", "2024", "2021–2025", "2025–наст. время", "Постоянно"]);
  assert.match(career[1].title, /DATONIKS/i);
  assert.match(career[2].title, /LSE/i);
  assert.match(career[3].title, /больница №15/i);
});

test("ships complete project cases without a role field", () => {
  assert.deepEqual(projects.map(({ slug }) => slug), [
    "ostrov-zdoroviya",
    "ilonmask-vpn",
    "datoniks",
    "wedding-vote",
  ]);
  for (const project of projects) {
    assert.ok(project.challenge.length > 80);
    assert.equal(project.solution.length, 4);
    assert.equal(project.metrics.length, 4);
    assert.ok(project.benefit.length > 80);
    assert.equal(project.technical, undefined);
    assert.equal(project.skills, undefined);
    assert.equal("role" in project, false);
  }
});

test("maps project routes in both directions", () => {
  assert.equal(projectPath("ostrov-zdoroviya"), "/projects/ostrov-zdoroviya");
  assert.equal(projectSlugFromPath("/projects/ilonmask-vpn"), "ilonmask-vpn");
  assert.equal(projectSlugFromPath("/projects/ostrov-zdoroviya/"), "ostrov-zdoroviya");
  assert.equal(projectSlugFromPath("/projects/%20"), null);
  assert.equal(projectSlugFromPath("/not-projects/ostrov-zdoroviya"), null);
  assert.equal(projectSlugFromPath("/projects/unknown/extra"), null);
  assert.equal(projectSlugFromPath("/"), null);
});
