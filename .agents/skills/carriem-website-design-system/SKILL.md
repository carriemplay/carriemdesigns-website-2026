---
name: carriem-website-design-system
description: >-
  Standard 8pt/4pt design system, UI layout specifications, responsive breakpoint rules, typography,
  WCAG AA accessibility guidelines, and spacing scale for Carrie Mah's portfolio website and brand assets.
  Use whenever building, modifying, styling, or refactoring components, pages, or stylesheets for Carrie M Designs.
---

# Carrie M Designs: Web Design System & Implementation Guide

This skill captures the exact design specifications, responsive breakpoint behaviors, layout patterns, standard modular typography scale, 8pt/4pt spacing systems, and WCAG AA accessibility standards established for Carrie Mah's portfolio website (`carriemdesigns-website-2026`).

---

## 1. Core Design Tokens

### Color Palette
```css
:root {
    --bg-page: #F0FBFF;          /* Soft light-blue canvas background */
    --bg-card-white: #FDFDFD;    /* Primary card surface */
    --bg-card-blue: #EAFDFF;     /* Accent / facts card surface */
    
    /* Semantic Border Colors (2px solid) */
    --border-light-blue: #80DFE8; /* Hero cards & testimonial borders */
    --border-dark-blue: #084887;  /* Philosophy & experience cards */
    --border-orange: #E98D38;     /* Case Study 1 (Fortis / Compliance) */
    --border-green: #89CF11;      /* Case Study 2 (Nutrien / B2B Platform) */
    
    --text-color: #1F2427;        /* High-contrast charcoal text (16:1 ratio, AAA) */
}
```

### Typography Scale (Standard Modular Scale, 16px Base)
```css
:root {
    --font-heading: 'Poppins', sans-serif;
    --font-links: 'Avenir Next', Avenir, 'Helvetica Neue', sans-serif;
    --font-body: 'Iowan Old Style', Iowan, Georgia, serif;

    /* Font Size Tokens */
    --text-xs: 0.75rem;    /* 12px - footnotes, tiny captions */
    --text-sm: 0.875rem;   /* 14px - metadata, dates, tags, small body */
    --text-base: 1rem;     /* 16px - standard body, primary descriptions */
    --text-lg: 1.125rem;   /* 18px - lead paragraphs, card titles, subheadings */
    --text-xl: 1.25rem;    /* 20px - small section titles, logo */
    --text-2xl: 1.5rem;    /* 24px - case study titles */
    --text-3xl: 1.75rem;   /* 28px - main section headings */
    --text-4xl: 2.25rem;   /* 36px - hero display title (H1) */
}
```

| Token | Rem Value | Pixel Equiv | Primary Semantic Roles |
| :--- | :--- | :--- | :--- |
| `--text-xs` | `0.75rem` | 12px | Micro captions, footnotes |
| `--text-sm` | `0.875rem` | 14px | Metadata, dates, tags, testimonials body, facts text, footer copyright |
| `--text-base` | `1rem` | 16px | Standard body text, case study descriptions, bullet lists |
| `--text-lg` | `1.125rem` | 18px | Hero description, card titles (`.facts-title`, `.phil-card-title`, `.job-role`) |
| `--text-xl` | `1.25rem` | 20px | Logo branding text, mobile case study titles |
| `--text-2xl` | `1.5rem` | 24px | Desktop case study titles (`.cs-title`) |
| `--text-3xl` | `1.75rem` | 28px | Section headings (`.section-heading`), mobile hero display title |
| `--text-4xl` | `2.25rem` | 36px | Desktop hero display title (`.hero-title`) |

---

## 2. Standard 8pt / 4pt Spacing System

All margins, paddings, gaps, and offsets follow the standard 8pt/4pt geometric grid:

```css
:root {
    --space-4: 4px;    /* 3xs - micro offsets, badge padding, sub-item gaps */
    --space-8: 8px;    /* 2xs - icon gaps, list item gaps, title sub-gaps */
    --space-12: 12px;  /* xs  - inline elements, facts card row gap, tight margins */
    --space-16: 16px;  /* sm  - text block spacing, card title margins */
    --space-24: 24px;  /* md  - standard card gap, grid gap, card mobile padding, radius */
    --space-32: 32px;  /* lg  - card padding, section title bottom margins, list margins */
    --space-48: 48px;  /* xl  - container margins, desktop card padding, section gap */
}
```

| Token | Pixel Value | Rem Value | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `--space-4` | `4px` | `0.25rem` | Micro badge padding, tiny row gaps |
| `--space-8` | `8px` | `0.5rem` | Icon-to-text gap, bullet item margins, title group gaps |
| `--space-12` | `12px` | `0.75rem` | Facts card row gap, header logo gap, company-date margins |
| `--space-16` | `16px` | `1.0rem` | Paragraph spacing, card title bottom margins, squiggle top margin |
| `--space-24` | `24px` | `1.5rem` | Grid gaps, mobile card padding, border-radius, list indent |
| `--space-32` | `32px` | `2.0rem` | Desktop card padding, section heading bottom margins |
| `--space-48` | `48px` | `3.0rem` | Section bottom margins, desktop hero/experience card padding |

---

## 3. WCAG 2.1 AA Accessibility Standards

1. **Alt Text Rules (WCAG 1.1.1):**
   * Every non-decorative image must have concise, descriptive alt text explaining its contents or purpose.
   * *Example:* `alt="Portrait of Carrie Mah, Product Design Leader"`
   * *Example:* `alt="Compliance SDK user flows, configuration panels, and verification screens for Fortis Games"`
2. **Decorative Icons & Emojis (WCAG 1.1.1):**
   * Decorative emoji glyphs (e.g. ⬇️, 📕, 📰, 👩🏻‍💻) paired with text must include `aria-hidden="true"` to prevent screen reader stutter.
3. **Semantic Landmarks (WCAG 1.3.1):**
   * Wrap main page contents in `<main id="main-content">` between `<header>` and `<footer>`.
4. **Keyboard Focus States (WCAG 2.4.7):**
   * Interactive links must display visible `:focus-visible` outlines:
   ```css
   a:focus-visible {
       outline: 2px solid var(--border-dark-blue);
       outline-offset: 4px;
       border-radius: var(--space-4);
   }
   ```
5. **Reduced Motion (WCAG 2.3.3):**
   * Always include `@media (prefers-reduced-motion: reduce)` to disable non-essential animations.

---

## 4. Responsive Breakpoint Rules & Stacking Hierarchy

The site uses a cascading, progressive stacking strategy across targeted viewports:

```
[ Desktop > 1034px ] ──> [ 1034px: Facts Stack ] ──> [ 880px: Philosophy Stack ] ──> [ 780px: Case Studies Stack ] ──> [ <= 768px: Mobile ]
```

### Breakpoint Specifications

1. **`@media (max-width: 1034px)` — Facts Card Stacking**
   * **Only** `.hero-right` changes from horizontal flex row to vertical column stack (`gap: var(--space-12);`).
   * Keeps image at top and left-aligns facts text beneath.
   * The rest of the hero grid and page remains in desktop layout.

2. **`@media (max-width: 880px)` — Philosophy Section Stacking**
   * `.philosophy-section` switches from a 3-column grid (`repeat(3, 1fr)`) to a 1-column stack (`grid-template-columns: 1fr; gap: var(--space-24);`).

3. **`@media (max-width: 780px)` — Case Study Stacking**
   * `.case-study-card` switches from 2-column grid (`1.2fr 1fr`) to 1-column flex layout.
   * The image container (`.cs-image-container`) moves to the top (`order: -1;`).
   * `.cs-content` and `.padded-graphic` receive `padding: var(--space-24);`.
   * Title scales to `var(--text-xl)`.

4. **`@media (max-width: 768px)` — Full Mobile Adaptation**
   * `body` padding: `var(--space-24) var(--space-12);`
   * `.hero-section`: switches to 1-column grid (`grid-template-columns: 1fr; gap: var(--space-24);`).
   * `.hero-title`: scales to `var(--text-3xl)`.
   * `.testimonials-grid`: switches to 1-column grid (`gap: var(--space-24);`).
   * `.company-date-row` & `.earlier-item`: switch to vertical column with `gap: var(--space-4);`.
