# Design QA

## Evidence

- Source visual truth, desktop: `docs/design-evidence/source/reactbits-liquid-ether-desktop-1440x900.png` (actual capture: 1280×720 px).
- Source visual truth, mobile: `docs/design-evidence/source/reactbits-liquid-ether-mobile-390x844.png` (390×844 px).
- Implementation, desktop: `docs/design-evidence/implementation/hero-desktop-1280x720.png` (1280×720 px).
- Implementation, mobile idle: `docs/design-evidence/implementation/hero-mobile-390x844.png` (390×844 px).
- Implementation, mobile interactive: `docs/design-evidence/implementation/hero-mobile-interactive-390x844.png` (390×844 px).
- Implementation, mobile menu: `docs/design-evidence/implementation/hero-mobile-menu-open-390x844.png` (390×844 px).
- Final identity and motion, desktop: `docs/design-evidence/implementation/hero-identity-motion-desktop-1280x720.png` (1280×720 px).
- Final identity and motion, mobile: `docs/design-evidence/implementation/hero-identity-motion-mobile-390x844.png` (390×844 px).
- Side-by-side desktop comparison: `docs/design-evidence/comparison-desktop-1280x720.png`.
- Side-by-side mobile comparison: `docs/design-evidence/comparison-mobile-390x844.png`.
- Density normalization: all source and implementation captures use device scale factor 1 and were compared at equal pixel dimensions for each viewport.
- State: light theme, Liquid Ether running; interactive captures include cursor-generated flow. Mobile navigation was also checked open.

## Full-view comparison

The implementation preserves the source hero's essential composition: contained top navigation, a centered status pill, large two-line display heading, concise supporting copy, two CTA controls, and a full-bleed fluid background responding to pointer movement. The ReactBits documentation shell and branding are intentionally excluded because the requested output is the personal-site hero, not a clone of the documentation page.

The light-theme adaptation keeps the original motion and hierarchy while mapping the background, flow, foreground, borders, surfaces, and controls to the project's blue tokens.

## Required fidelity surfaces

- Fonts and typography: JetBrains Mono Variable is loaded locally and used consistently across the hero, navigation, controls, and utility text. The display treatment uses weight 700, compact line-height, controlled tracking, and intentional two-line wrapping.
- Spacing and layout rhythm: centered composition and relative proportions match the reference. Header, status, heading, supporting copy, and CTA rhythm remain coherent at desktop and mobile sizes.
- Colors and visual tokens: all application colors map to the blue palette from `docs/design-system.md`. The final lighter effect uses `--blue-2`, `--blue-4`, and `--blue-7` equivalents at `0.48` opacity over `--blue-1`; foreground uses `--blue-12` and primary actions use `--blue-9`.
- Image quality and asset fidelity: there are no raster illustration or logo substitutions. The background is the copied ReactBits WebGL component using Three.js, not a static image or CSS approximation. Interface icons use Hugeicons.
- Copy and content: ReactBits marketing copy was replaced with concise personal-site copy for Геннадий Гужов. The content remains structurally equivalent to the source hero.
- Accessibility: semantic landmarks and heading structure are present; mobile menu exposes `aria-expanded`; touch targets are at least 44×44 px; keyboard focus is visible; reduced motion disables automatic driving.

## Focused comparison

The dedicated 390×844 side-by-side comparison is the focused mobile check. It clearly exposes the header, menu control, pill, heading wrapping, supporting copy, CTA sizing, and liquid effect, so an additional crop was not required.

## Responsive verification

Checked widths: 375, 430, 768, 1024, 1280, and 1440 px. At every width, `documentElement.scrollWidth` equals `clientWidth`; no page-level horizontal overflow was found. Mobile navigation is used below 768 px and desktop navigation from 768 px upward.

## Interaction and console verification

- Liquid flow responds to pointer movement across desktop and mobile-sized viewports.
- Mobile menu opens, exposes all three links, reports its expanded state, and closes when a link is selected.
- Anchor CTAs and navigation targets resolve within the hero.
- Browser console checked after the final implementation capture: no errors or warnings.

## Comparison history

### Pass 1

- [P2] The initial light palette made the liquid flow too faint in the idle mobile capture.
- Fix: raised effect opacity from `0.56` to `0.72`, increased auto intensity to `2.2`, restored auto speed to `0.5`, and moved the palette to the stronger `blue-7`, `blue-8`, and `blue-10` stops.
- Post-fix evidence: `docs/design-evidence/implementation/hero-mobile-interactive-390x844.png` and `docs/design-evidence/implementation/hero-desktop-1280x720.png` show distinct fluid ribbons while retaining readable foreground contrast.

### Pass 2

- [P2] The copied component used deprecated `THREE.Clock`, producing a console warning.
- Fix: migrated the component timing to `THREE.Timer` and disposed it during cleanup.
- Post-fix evidence: fresh desktop and mobile browser sessions report no warnings or errors, and the fluid simulation remains interactive.

### Pass 3

- [P2] User feedback indicated that the active flow could still reduce heading readability.
- Fix: replaced the effect palette with the lighter `blue-2`, `blue-4`, and `blue-7` stops and reduced layer opacity from `0.64` to `0.48`.
- Post-fix evidence: `docs/design-evidence/implementation/hero-lightened-desktop-1280x720.png` and `docs/design-evidence/implementation/hero-lightened-mobile-390x844.png` show the active flow behind the heading. The calculated worst-case contrast between `--blue-12` text and the darkest composited flow stop is `8.43:1`, exceeding WCAG AA and AAA requirements for large text.
- Responsive retest: 375, 430, 768, 1024, 1280, and 1440 px all passed without horizontal overflow or heading clipping. Browser console remained free of warnings and errors.

### Pass 4

- Identity: connected `public/logo.svg` as the favicon and as a 28×22 px brand mark beside “Геннадий Гужов”; the decorative inline logo is excluded from the accessibility tree while the brand link retains a complete accessible name.
- Typography: switched the full interface to the locally bundled JetBrains Mono Variable family and documented its roles and fallback stack in `docs/design-system.md`.
- Motion: tuned Liquid Ether to a calmer viscous flow, lowered automatic speed and intensity, softened cursor force, and added a short staged entrance for the header, status, title, intro, and actions.
- Reduced motion: browser emulation confirmed that `prefers-reduced-motion: reduce` disables the header and title entrance animations; React also disables the Liquid Ether auto-demo through the same media preference.
- Final evidence: `docs/design-evidence/implementation/hero-identity-motion-desktop-1280x720.png` and `docs/design-evidence/implementation/hero-identity-motion-mobile-390x844.png`.
- Final responsive retest: 375, 430, 768, 1024, 1280, and 1440 px all passed with the heading inside the viewport, the logo loaded, and no horizontal overflow. Mobile navigation opened and closed correctly. Browser console reported no warnings or errors.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] Replace the placeholder internal anchor targets with final portfolio sections and real contact destinations when the rest of the site is built.

final result: passed
