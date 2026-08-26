const englishProblems = [
  {
    id: "marketing",
    title: "Marketing",
    solutions: [
      ["A content plan from customer questions", "Customer questions → ideas → plan → publishing", "AI collects customer questions and search queries, suggests topics and prepares a publishing plan.", "The team knows what to publish and why customers need it."],
      ["Short videos from one recording", "Recording → short videos → publishing", "The system selects strong clips, edits them and adds captions and covers.", "One recording supplies content for several channels."],
      ["From advertising to a sale", "Ad → lead → deal → payment", "A dashboard connects spend, leads, CRM and payments and shows the result of every campaign.", "You see which ads create sales and which waste budget."],
      ["Any other digital solution", "", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "management",
    title: "Management",
    solutions: [
      ["A digital twin of your business", "Request → work → deadline → result", "The system shows the real process, team load, queues and bottlenecks.", "You see where the business loses time and what an improvement will change."],
      ["CRM and ERP for your industry", "Customer → order → invoice → stock", "One system connects customers, documents, money, inventory and the rules of your business.", "Spreadsheets, chats and manual checks become one process."],
      ["A dashboard for leaders", "Plan → actual → deviation → action", "The dashboard combines money, deadlines, workload and risks and highlights where a decision is needed.", "Problems appear before they become delays or losses."],
      ["Any other digital solution", "", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "sales",
    title: "Sales",
    solutions: [
      ["CRM that moves every deal forward", "Lead → call → proposal → deal", "The system gathers enquiries, sets the next step and prepares information for calls and proposals.", "The rep works with the customer while CRM keeps the deal from disappearing."],
      ["AI reviews every conversation", "Call → transcript → score → feedback", "AI reviews calls and chats against your method and finds missed questions and objections.", "A manager sees the quality of the whole team, not a few calls."],
      ["A knowledge base for sales", "Question → search → answer → source", "Private AI search finds answers in products, policies and contracts and cites the source.", "Salespeople answer faster without waiting for an internal expert."],
      ["Any other digital solution", "", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "operations",
    title: "Operations",
    solutions: [
      ["Purchasing under control", "Request → approval → order → delivery", "The system collects quotes, compares terms and tracks the order and delivery dates.", "Buyers handle exceptions while statuses and risks stay visible."],
      ["Documents without manual entry", "Document → validation → approval → ERP", "AI reads an invoice or act, verifies the contract and amount and sends approved data to accounting.", "People review exceptions instead of retyping documents."],
      ["No request gets lost", "Request → owner → deadline → result", "A digital dispatcher accepts each request, assigns an owner and tracks the deadline and result.", "Every request has an owner, status and clear deadline."],
      ["Any other digital solution", "", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "ai-infrastructure",
    title: "AI infrastructure",
    solutions: [
      ["Private AI inside the company", "Data → model → access → control", "I deploy models, search, permissions and logs inside company infrastructure.", "Corporate data stays inside a controlled environment."],
      ["AI search across company documents", "Documents → search → answer → source", "The system searches policies, conversations, CRM and files and supports answers with sources.", "Employees find answers quickly and can verify the source."],
      ["AI agents for routine work", "Event → action → review → log", "AI agents work with CRM, ERP and internal services under defined rules and permissions.", "Routine work runs automatically while important actions remain controlled."],
      ["Any other digital solution", "", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "enablement",
    title: "Training and enablement",
    solutions: [
      ["Find the right tasks for AI", "Interviews → processes → economics → plan", "I review the team’s work, calculate the cost of manual operations and select valuable automation opportunities.", "The company gets a prioritised AI project plan."],
      ["Test AI on a real task", "Task → prototype → test → metric → decision", "I build a working pilot with employees and test it on the real process and its exceptions.", "You know what to scale, improve or stop."],
      ["Train employees to work with AI", "Role → practice → standard → control", "I train the team on its own documents and tasks and establish reusable scenarios and quality rules.", "Employees use AI consistently, safely and productively."],
      ["Any other digital solution", "", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
];

const englishProblemsById = Object.fromEntries(
  englishProblems.map((problem) => [problem.id, problem]),
);

const englishCareer = [
  ["2021–2024", "China sourcing and logistics", "I found demand and suppliers, modelled the economics and ran deliveries—from retail goods to equipment for Soldvig PRO.", "₽3M earned from my own supply operations"],
  ["2024", "DATONIKS · investment venture", "I packaged a modular data centre as an investment product: market research, positioning, financial model, business plan and pitch.", "Looking for an investment partner to launch the series"],
  ["2025", "HSE · Digital Product Management", "I combined product strategy, research, economics and analytics in a dual-degree programme.", "Two degrees: HSE and University of London"],
  ["2025", "Moscow City Hospital No. 15 · analyst", "I translated clinical workflows and doctors’ requirements into BI and AI tools for daily work.", "32 → 80 automated checks per day"],
  ["2026", "Digital and AI products", "I lead commissioned products from the business problem and economics through development, launch and analytics.", "Four launched products—from healthcare to EventTech"],
];

const projectEnglish = {
  "ostrov-zdoroviya": {
    tags: ["Medtech", "Web", "AI"],
    summary: "A clinic platform combining the website, CMS, AI assistant, acquisition funnel and analytics.",
    deliveredAt: "July 2026",
    challengeLabel: "Business problem",
    challenge: "The clinic needed more than another medical catalogue: it needed a digital entry point into premium personalised care. Patients had to find the right doctor, programme or service and reach booking quickly, while staff needed to keep every offer current.",
    solution: [
      { label: "Product and functionality", text: "Rebuilt the customer journey and created doctor, service, check-up, infusion and Light Life programme sections." },
      { label: "AI and content", text: "Built the RAG-based Asclepius assistant and generated on-brand imagery for service cards in one visual system." },
      { label: "Business and marketing", text: "Connected campaigns, focused landing journeys and analytics to track the path from intent to booking." },
      { label: "Infrastructure and operations", text: "Built an approachable CMS and a separate review flow for changes before publication." },
    ],
    benefit: "The website became an operating system for the clinic: patients move from intent to booking through a clear journey, staff update doctors, services, check-ups and infusions themselves, and the AI assistant answers from current clinic knowledge. Campaigns lead into focused journeys and analytics shows what happens after the click.",
    metrics: ["+72% visits in one month", "4 bookings from first campaigns", "Content updates without a developer", "AI answers from clinic knowledge"],
  },
  "ilonmask-vpn": {
    tags: ["Network", "Web", "Automation"],
    summary: "A subscription VPN product with an account, payments, Telegram bot and automated access delivery.",
    deliveredAt: "May 2026",
    challengeLabel: "Development brief",
    challenge: "The client needed a landing page for people unfamiliar with VPNs, a Telegram bot and one clear user journey. The system had to connect the website, VPN control panel and database, then automate registration, payment, access, instructions, notifications, referrals and analytics.",
    solution: [
      { label: "Product and interface", text: "Designed the path from first visit to a connected device and built the customer account with instructions." },
      { label: "Service automation", text: "Connected the database, payment gateway and VPN panel so access is created and renewed automatically." },
      { label: "Communications and growth", text: "Added email codes, Telegram bot, notifications, promo codes and a referral programme." },
      { label: "Infrastructure and analytics", text: "Built an admin panel for users, payments, subscriptions and acquisition channels." },
    ],
    benefit: "A customer registers, pays and connects without an administrator, while the client manages subscriptions and sees the funnel without reconciling separate systems.",
    metrics: ["300+ registrations per month", "100+ paying customers", "Payment and access are automatic", "Account, Telegram and email connected"],
  },
  datoniks: {
    tags: ["Telecom", "Data centre"],
    summary: "An investment concept for serial modular data-centre production based on a deployed engineering solution.",
    deliveredAt: "June 2025",
    challengeLabel: "Business problem",
    challenge: "A conventional data centre requires lengthy design and capital construction. Businesses and public-sector customers need a repeatable format that can be assembled in advance, delivered to site and commissioned faster.",
    solution: [
      { label: "Market and positioning", text: "Researched demand and prefab data-centre use cases across telecom, industry and government." },
      { label: "Product concept", text: "Defined a repeatable 40HC modular data centre with integrated engineering subsystems." },
      { label: "Project economics", text: "Built the business plan, financial model and investor pitch for serial production." },
      { label: "Investment readiness", text: "Prepared the negotiation package and continue looking for a partner to launch the series." },
    ],
    benefit: "The modular format moves most engineering work into production: the customer receives a preassembled facility that is easier to deliver, scale and commission than a capital data centre.",
    metrics: ["Facility operating in Irkutsk", "40HC · 10 racks × 12 kW", "Business plan, pitch and model ready", "Seeking an investment partner"],
  },
  "wedding-vote": {
    tags: ["EventTech", "Web", "Realtime"],
    summary: "A wedding interaction where guests vote by QR code and the shared screen updates in real time.",
    deliveredAt: "August 2026",
    challengeLabel: "Brief",
    challenge: "The wedding needed more than a conventional game: every guest had to join by QR code, connect a vote with an amount and see the shared result change live in the room.",
    solution: [
      { label: "Guest journey", text: "Built QR onboarding with a name, side selection, amount and a direct SBP payment step." },
      { label: "Shared screen", text: "Built live totals, percentages, timer, notifications, winner reveal and podium." },
      { label: "Host console", text: "Added round controls, pause, finish, history and a separate protected console." },
      { label: "Reliability", text: "Configured PostgreSQL, migrations, duplicate-vote protection and automated GitHub deployment." },
    ],
    benefit: "Guests join from their phones, the host runs the game from one console, and the room sees the vote and winner in real time.",
    metrics: ["3 synchronised interfaces", "2,048 unique pseudonyms", "Live results without reloads", "Duplicate votes are blocked"],
  },
};

export function createEnglishContent(russian) {
  const problems = russian.problems.map((problem, index) => ({
    ...problem,
    title: englishProblemsById[problem.id].title,
    solutions: englishProblemsById[problem.id].solutions.map(([title, process, project, effect]) => ({ title, process, project, effect })),
  }));
  const career = russian.career.map((item, index) => {
    const [year, title, body, result] = englishCareer[index];
    return { ...item, year, title, body, result };
  });
  const galleryEnglish = {
    "ostrov-zdoroviya": [
      ["Ostrov Zdoroviya clinic platform homepage", "Homepage and clinic positioning"],
      ["Ostrov Zdoroviya doctor directory", "Doctor directory powered by CMS data"],
      ["Ostrov Zdoroviya service catalogue", "Service structure and customer journey"],
      ["Ostrov Zdoroviya check-up programmes", "Check-up programmes"],
      ["Light Life programme landing page", "Landing page for the Light Life programme"],
      ["Asclepius AI assistant interface", "RAG assistant grounded in clinic data"],
    ],
    "ilonmask-vpn": [
      ["IlonMask VPN subscription landing page", "Landing page and subscription entry point"],
      ["IlonMask VPN platform selection", "Connection instructions for different devices"],
      ["IlonMask VPN successful payment screen", "Payment and automatic access activation"],
      ["IlonMask VPN notification settings", "Service notifications in the preferred channel"],
      ["IlonMask VPN trial screen", "Trial period and the next user step"],
      ["IlonMask VPN referral programme", "Referral mechanics inside the product"],
    ],
    datoniks: [
      ["Deployed modular data centre in Irkutsk", "Deployed project in Irkutsk"],
      ["DATONIKS modular data centre layout", "Modular data-centre engineering layout"],
    ],
    "wedding-vote": [
      ["Wedding Vote shared result screen", "Winner and round results on the shared screen"],
      ["Wedding Vote guest screen on a phone", "Guest onboarding via QR code"],
      ["Wedding Vote host console on a phone", "Round and result controls"],
    ],
  };
  const actionLabels = {
    "Питч-дек": "Pitch deck",
    "Бизнес-план": "Business plan",
    "Финансовая модель": "Financial model",
  };
  const projects = russian.projects.map((project) => ({
    ...project,
    ...projectEnglish[project.slug],
    category: projectEnglish[project.slug].tags.join(" · "),
    gallery: project.gallery?.map((image, index) => ({
      ...image,
      alt: galleryEnglish[project.slug]?.[index]?.[0] ?? image.alt,
      caption: galleryEnglish[project.slug]?.[index]?.[1] ?? image.caption,
    })),
    externalActions: project.externalActions?.map((action) => ({
      ...action,
      label: actionLabels[action.label] ?? action.label,
    })),
  }));

  return {
    locale: "en",
    identity: "Gennady Guzhov",
    hero: {
      ...russian.hero,
      title: "Gennady Guzhov",
      nameLines: ["Gennady", "Guzhov"],
      role: "Digital and AI product developer",
      promise: "I build services, connect fragmented operations into systems and take products to launch—until their value can be measured.",
      cta: { ...russian.hero.cta, label: "Discuss a project" },
    },
    sectionCopy: {
      problems: { title: "What can I build for your business?" },
      career: { title: "My winding career path" },
      marketplace: { title: "Product marketplace", description: "In every project I owned the path from the business problem and process analysis to development and launch." },
    },
    problems,
    career,
    projects,
    contact: { ...russian.contact, title: "Replace a person with AI?", ctaLabel: "Discuss it on Telegram" },
    socialLinks: russian.socialLinks.map((link) => ({
      ...link,
      meta: link.id === "github" ? "My project repositories" : link.id === "telegram" ? "My channel — Hunting for Technology" : "AI and technology articles · 300K+ views",
    })),
    navigation: [
      { id: "about", label: "About", href: "#career", ariaLabel: "Go to the About section" },
      { id: "capabilities", label: "Capabilities", href: "#problems", ariaLabel: "Go to business capabilities" },
      { id: "projects", label: "Projects", href: "#projects", ariaLabel: "Go to projects" },
      { id: "articles", label: "Articles", href: "https://habr.com/ru/users/gguzhov/articles/", target: "_blank", rel: "noreferrer", ariaLabel: "Open Gennady Guzhov’s articles on Habr" },
    ],
    ui: englishUi,
  };
}

export const englishUi = {
  navLabel: "Main navigation",
  profileLabel: "Profile",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  contactTelegram: "Contact on Telegram",
  languageSwitchLabel: "Language",
  languageSwitch: [{ locale: "ru", label: "RU" }, { locale: "en", label: "EN" }],
  capabilitiesGroup: "Business capabilities",
  projectIdeas: "Project ideas for",
  businessProcess: "Process",
  digitalSolution: "Digital solution",
  businessResult: "What changes",
  previousCapabilityProjects: "Show the previous project",
  nextCapabilityProjects: "Show the next project",
  marketplaceRegion: "Projects",
  carousel: "carousel",
  previousProject: "Previous project",
  nextProject: "Next project",
  more: "View case",
  projectCategories: "Project categories",
  case: { close: "Close case", solution: "Solution", benefit: "Result", metrics: "Project results", gallery: "Project gallery", galleryLabel: "Project gallery", links: "Project links", actions: "Project actions", product: "Open public product", other: "Other projects", open: "Open case", previousImage: "Previous image", nextImage: "Next image", video: "Project video", cover: "Project cover" },
  footerNav: "Social profiles",
  footerIdentity: "Built by genidev",
  footerPerson: "Gennady Guzhov · 2026",
  brandHome: "Gennady Guzhov — back to the top",
  sliderControls: "Project slider controls",
  scrollToCapabilities: "Go to business capabilities",
};
