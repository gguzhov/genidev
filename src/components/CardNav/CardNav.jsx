import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import useReducedMotion from "../../hooks/useReducedMotion";
import {
  CARD_NAV_EASE,
  CARD_NAV_INITIAL_STATE,
  CLOSED_HEIGHT,
  getMenuRecreationState,
  getNavigationCloseOptions,
  transitionCardNavState,
} from "./cardNavState";
import "./CardNav.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
gsap.registerPlugin(CustomEase);
const cardNavEase = CustomEase.create("card-nav-ease", CARD_NAV_EASE.gsap);

export const normalizeNavigationItems = (items) =>
  items.flatMap((item) => {
    if (Array.isArray(item?.links)) return item.links;
    return item?.href ? [item] : [];
  });

export default function CardNav({ items = [], cta, className = "", ease = cardNavEase }) {
  const [menuState, setMenuState] = useState(CARD_NAV_INITIAL_STATE);
  const navRef = useRef(null);
  const triggerRef = useRef(null);
  const cardsRef = useRef([]);
  const timelineRef = useRef(null);
  const openFrameRef = useRef(null);
  const lifecycleStateRef = useRef(CARD_NAV_INITIAL_STATE);
  const reducedMotion = useReducedMotion();
  const normalizedItems = normalizeNavigationItems(items);
  const { isExpanded, isHamburgerOpen, panelInteractive, contentVisible } = menuState;

  const calculateHeight = useCallback(() => {
    const nav = navRef.current;
    const content = nav?.querySelector(".card-nav__content");
    if (!content) return CLOSED_HEIGHT;

    return CLOSED_HEIGHT + content.scrollHeight + 12;
  }, []);

  const transitionMenu = useCallback((event) => {
    const nextState = transitionCardNavState(lifecycleStateRef.current, event);
    lifecycleStateRef.current = nextState;
    setMenuState(nextState);
    return nextState;
  }, []);

  const returnFocus = useCallback(() => {
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const closeMenu = useCallback(
    ({ restoreFocus = true } = {}) => {
      const nav = navRef.current;
      if (!nav || !lifecycleStateRef.current.desiredOpen) return;

      transitionMenu("CLOSE");
      if (openFrameRef.current != null) {
        window.cancelAnimationFrame(openFrameRef.current);
        openFrameRef.current = null;
      }

      if (reducedMotion || !timelineRef.current) {
        gsap.set(nav, { height: CLOSED_HEIGHT });
        gsap.set(cardsRef.current, { y: 32, opacity: 0 });
        transitionMenu("CLOSE_FINISHED");
      } else {
        timelineRef.current.reverse();
      }

      if (restoreFocus) returnFocus();
    },
    [reducedMotion, returnFocus, transitionMenu],
  );

  const openMenu = useCallback(() => {
    const nav = navRef.current;
    if (!nav || lifecycleStateRef.current.desiredOpen) return;

    transitionMenu("OPEN");
    openFrameRef.current = window.requestAnimationFrame(() => {
      openFrameRef.current = null;
      if (!lifecycleStateRef.current.desiredOpen) return;

      if (reducedMotion || !timelineRef.current) {
        gsap.set(nav, { height: calculateHeight() });
        gsap.set(cardsRef.current, { y: 0, opacity: 1 });
        return;
      }

      timelineRef.current.play();
    });
  }, [calculateHeight, reducedMotion, transitionMenu]);

  const toggleMenu = () => {
    if (lifecycleStateRef.current.desiredOpen) closeMenu();
    else openMenu();
  };

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    timelineRef.current?.kill();
    lifecycleStateRef.current = transitionCardNavState(
      lifecycleStateRef.current,
      "TIMELINE_RECREATED",
    );
    const recreationState = getMenuRecreationState(
      lifecycleStateRef.current.desiredOpen,
      calculateHeight(),
    );

    if (reducedMotion) {
      gsap.set(nav, { height: recreationState.height, overflow: "hidden" });
      gsap.set(cardsRef.current, {
        y: recreationState.cardsY,
        opacity: recreationState.cardsOpacity,
      });
      timelineRef.current = null;
      return undefined;
    }

    gsap.set(nav, { height: CLOSED_HEIGHT, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 32, opacity: 0 });
    const timeline = gsap.timeline({ paused: true });
    timeline.eventCallback("onReverseComplete", () => {
      if (!lifecycleStateRef.current.desiredOpen) transitionMenu("CLOSE_FINISHED");
    });
    timeline.to(nav, { height: calculateHeight, duration: 0.28, ease });
    timeline.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.16, ease, stagger: 0.04 },
      0,
    );
    if (recreationState.timelineProgress === 1) timeline.progress(1);
    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      timelineRef.current = null;
    };
  }, [calculateHeight, ease, items, reducedMotion, transitionMenu]);

  useEffect(
    () => () => {
      if (openFrameRef.current != null) window.cancelAnimationFrame(openFrameRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!isExpanded || !navRef.current) return;
      gsap.set(navRef.current, { height: calculateHeight() });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateHeight, isExpanded]);

  useEffect(() => {
    if (!isExpanded) return undefined;

    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) closeMenu();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !navRef.current) return;
      const focusable = [...navRef.current.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true",
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isExpanded]);

  const handleHeaderNavigation = () => closeMenu(getNavigationCloseOptions("header"));
  const handlePanelNavigation = () => closeMenu(getNavigationCloseOptions("panel"));

  return (
    <header className={`card-nav-container ${className}`.trim()}>
      <nav
        ref={navRef}
        className={`card-nav${isExpanded ? " card-nav--open" : ""}${
          contentVisible ? " card-nav--content-visible" : ""
        }`}
        aria-label="Основная навигация"
      >
        <div className="card-nav__top">
          <button
            ref={triggerRef}
            className={`card-nav__menu-button${isHamburgerOpen ? " card-nav__menu-button--open" : ""}`}
            type="button"
            aria-label={isExpanded ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isExpanded}
            aria-controls="card-navigation-panel"
            onClick={toggleMenu}
          >
            <span />
            <span />
          </button>

          <a
            className="card-nav__brand"
            href="#top"
            aria-label="Геннадий Гужов — к началу страницы"
            onClick={handleHeaderNavigation}
          >
            <img src="/images/gennady-logo.webp" alt="" width="36" height="36" />
          </a>

          <a
            className="card-nav__cta"
            href={cta?.href}
            target={cta?.target ?? "_blank"}
            rel={cta?.rel ?? "noreferrer"}
            onClick={handleHeaderNavigation}
          >
            {cta?.label ?? "Решить проблему"}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </a>
        </div>

        <div
          className="card-nav__content"
          id="card-navigation-panel"
          aria-hidden={!panelInteractive}
          inert={!panelInteractive ? true : undefined}
        >
          <div className="card-nav__links">
            {normalizedItems.map((link, index) => (
              <a
                className="card-nav__link"
                href={link.href}
                key={`${link.href}-${link.label}`}
                aria-label={link.ariaLabel}
                target={link.target}
                rel={link.rel}
                tabIndex={panelInteractive ? 0 : -1}
                onClick={handlePanelNavigation}
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
              >
                <span>{link.label}</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>

          <div
            className="card-nav__visual"
            aria-hidden="true"
            ref={(element) => {
              cardsRef.current[normalizedItems.length] = element;
            }}
          />
        </div>
      </nav>
    </header>
  );
}
