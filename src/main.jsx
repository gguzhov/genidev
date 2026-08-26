import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/hero.css";
import "./styles/sections.css";
import { resolveLocale } from "./lib/projectRouting.js";

const locale = resolveLocale(window.location.pathname);
document.documentElement.lang = locale;
createRoot(document.getElementById("root")).render(<App locale={locale} />);
