const englishProblems = [
  {
    id: "marketing",
    title: "Marketing",
    solutions: [
      ["Content factory", "AI turns raw recordings into ready-to-publish short videos: it selects clips, edits, adds captions and motion graphics.", "The team publishes more video without expanding the editing department."],
      ["Virality analytics", "AI analyses X, Instagram and Telegram, finds high-engagement themes and turns them into scripts and posts.", "Content is built around real audience response instead of random ideas."],
      ["Post and carousel design", "The system creates posts, cards and carousels from the brand book and adapts layouts for every platform.", "The visual identity stays consistent while design production gets faster."],
      ["Any other digital solution", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "management",
    title: "Management",
    solutions: [
      ["A digital twin of your business", "The system shows the real process, team load, queues and bottlenecks.", "You see where the business loses time and what an improvement will change."],
      ["CRM and ERP for your industry", "One system connects customers, documents, money, inventory and the rules of your business.", "Spreadsheets, chats and manual checks become one process."],
      ["A dashboard for leaders", "The dashboard combines money, deadlines, workload and risks and highlights where a decision is needed.", "Problems appear before they become delays or losses."],
      ["Any other digital solution", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "sales",
    title: "Sales",
    solutions: [
      ["AI-powered cold calls", "A voice AI works through a lead list, presents the service, asks natural questions and hands interested prospects to a salesperson.", "Salespeople join conversations that have already been qualified."],
      ["AI head of sales", "AI reviews calls and chats, evaluates salespeople and creates coaching recommendations from objections and the company knowledge base.", "The manager sees growth opportunities for each person and the whole team."],
      ["A shop in Telegram and MAX", "A chatbot presents products or services, answers from the knowledge base, takes payment and sends the order to CRM.", "Customers buy directly in the messenger without a separate website."],
      ["Any other digital solution", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "operations",
    title: "Operations",
    solutions: [
      ["AI candidate screening", "AI reads CVs, matches experience to the role, ranks applicants and writes the result to CRM or ATS.", "Recruiters spend time on relevant candidates instead of manually scanning every response."],
      ["New-employee onboarding", "An AI mentor answers from the knowledge base, guides the onboarding plan, checks assignments and tracks progress.", "New employees reach productive work faster and interrupt experienced colleagues less often."],
      ["Purchasing and invoices without data entry", "The system requests supplier quotes, compares terms and sends the approved invoice to ERP ready for payment.", "The path from need to invoice runs without copying data, chasing emails or losing documents."],
      ["Any other digital solution", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "ai-infrastructure",
    title: "AI infrastructure",
    solutions: [
      ["Private AI environment", "I integrate GPUs and servers into company infrastructure, select Hugging Face models and configure access, data and monitoring.", "AI responds faster while sensitive data stays inside the company."],
      ["Agentic development with AI", "I set up an AI-agent development workflow with Docker, Git, repositories, a task manager, Agile cadence, checks and releases.", "The team ships internal services faster while code and changes remain controlled."],
      ["GPU infrastructure for real workloads", "I size GPUs, servers, networking and storage for model training, inference and concurrent employee use.", "The company gets predictable performance and can expand capacity without rebuilding the environment."],
      ["Any other digital solution", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
  {
    id: "enablement",
    title: "Consulting and training",
    solutions: [
      ["Process audit and AI roadmap", "I review systems, data and manual operations, calculate the economics and prioritise digital and AI projects.", "The company knows where to start and which outcome to test first."],
      ["A pilot on real company data", "I build a working prototype on company data, connect the required systems and test quality, security and business effect.", "The implementation decision is based on results rather than a presentation."],
      ["Team training and standards", "I train employees on their work, document scenarios, access rules, quality checks and the internal knowledge base.", "The team uses AI safely and consistently instead of depending on one enthusiast."],
      ["Any other digital solution", "If the problem does not fit a template, I’ll design a focused product around your process, data and economics.", "The software adapts to your business rules—not the other way around."],
    ],
  },
];

const englishProblemsById = Object.fromEntries(
  englishProblems.map((problem) => [problem.id, problem]),
);

const englishCareer = [
  ["2021–2024", "Trade and logistics from China", "I sold products on Wildberries and Avito, found suppliers and organised sourcing—from trending goods to industrial equipment.", "I can help with logistics from Europe and China"],
  ["2024", "Mobile data centres", "I organised the development of a mobile data centre and held discussions with venture funds. The product is developed and continues to evolve; I am seeking funding to launch serial production."],
  ["2021–2025", "HSE + LSE", "I completed an English-taught dual-degree programme in Enterprise Innovation Management."],
  ["2025–present", "Moscow City Hospital No. 15", "I identified data risks, reduced compulsory-medical-insurance underpayments, built BI reporting and explored safe AI analysis of anonymised medical histories.", "I continually look for growth opportunities and optimise operational processes with AI", "Analyst"],
  ["Ongoing", "Consulting", "I develop digital and AI products for businesses in any industry—from framing the problem and calculating economics to development, launch and analytics."],
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
    tags: ["EventTech", "Web"],
    summary: "A wedding interaction where guests vote for a boy or a girl by QR code and the shared screen shows the result in real time.",
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
    solutions: englishProblemsById[problem.id].solutions.map(([title, project, effect]) => ({ title, project, effect })),
  }));
  const career = russian.career.map((item, index) => {
    const [year, title, body, result, role] = englishCareer[index];
    const translated = { ...item, year, title, body };
    if (result) translated.result = result;
    else delete translated.result;
    if (role) translated.role = role;
    if (translated.action) {
      translated.action = { ...translated.action, label: "View case" };
    }
    return translated;
  });
  const galleryEnglish = {
    "ostrov-zdoroviya": [
      ["Ostrov Zdoroviya clinic platform homepage", "Homepage and clinic positioning"],
      ["Ostrov Zdoroviya doctor directory", "Doctor directory powered by CMS data"],
      ["Ostrov Zdoroviya service catalogue", "Service structure and customer journey"],
      ["Ostrov Zdoroviya check-up programmes", "Check-up programmes"],
      ["Light Life programme landing page", "Landing page for the Light Life programme"],
      ["Ostrov Zdoroviya infusion programme catalogue", "Infusion programmes powered by shared CMS data"],
    ],
    "ilonmask-vpn": [
      ["IlonMask VPN subscription landing page", "Landing page and subscription entry point"],
      ["IlonMask VPN customer dashboard", "Account, payments, settings and referrals in one place"],
      ["IlonMask VPN balance and tariff screen", "Tariffs, balance, promo codes and top-ups"],
      ["IlonMask VPN Telegram bot", "Profile, tariffs, support and referrals in Telegram"],
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
      role: "Full-stack digital and AI product developer",
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
  digitalSolution: "Example digital solution",
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
