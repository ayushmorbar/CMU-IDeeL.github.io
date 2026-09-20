# CMU 11-785 Design System & Specification (DESIGN.md)

**Source Reference:** `https://deeplearning.cs.cmu.edu/F26/index.html`  
**Standard:** CMU Deep Learning Academic Courseware (2026 September Specification)  
**Target Standard:** Modern 2026 CSS Custom Properties, Semantic HTML5, WCAG 2.2 Level AA

---

## 1. Design Philosophy

This design system is tailored for the high-intensity, rigorous academic environment of graduate and upper-level computer science courses (specifically modeled on Carnegie Mellon University's 11-785 Introduction to Deep Learning). It communicates uncompromising academic authority, systematic clarity, and rapid utilitarian orientation.

The design philosophy adheres to **Academic Functionalism with High-Density Modern Clarity**:
- **Utilitarian & Content-First:** Eliminates distracting visual embellishments in favor of immediate access to critical operational tools—stream links, due dates, slide decks, recitation colabs, and office hours calendars.
- **Institutional Authority:** Built on an intentional Carnegie-inspired crimson accent system grounded by clean, neutral surfaces that command respect while ensuring all-day reading comfort.
- **Structured Density:** Complex schedules, deadline matrices, and multi-instructor directories rely on precise horizontal rules, subtle tabular striping, and structured card layouts rather than excessive whitespace or decorative depth.

---

## 2. Color Tokens

```yaml
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#58413f'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#8b716e'
  outline-variant: '#dfbfbc'
  surface-tint: '#aa3531'
  primary: '#6a020a'
  on-primary: '#ffffff'
  primary-container: '#8b1e1e'
  on-primary-container: '#ff9d95'
  inverse-primary: '#ffb3ad'
  secondary: '#ab3333'
  on-secondary: '#ffffff'
  secondary-container: '#ff716c'
  on-secondary-container: '#70040f'
  tertiary: '#6b000b'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d1b1e'
  on-tertiary-container: '#ff9d96'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
  cmu-crimson: '#8B1E1E'
  cmu-burgundy: '#9E2A2B'
  cmu-scarlet: '#A80000'
  surface-page: '#FFFFFF'
  surface-subtle: '#F9F9F9'
  surface-border: '#E5E5E5'
  table-border: '#DDDDDD'
  table-stripe: '#F7F7F7'
  text-primary: '#333333'
  text-muted: '#666666'
  link-crimson: '#8B1E1E'
  badge-active: '#C9302C'
  pill-link-bg: '#8B1E1E'
  pill-link-hover: '#6D1717'
```

---

## 3. Typography Hierarchy

Typographic discipline is maintained through a unified implementation of **Open Sans**:

```yaml
typography:
  display-hero:
    fontFamily: Open Sans
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 48px
  display-hero-mobile:
    fontFamily: Open Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Open Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Open Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Open Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Open Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-header:
    fontFamily: Open Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
  table-cell:
    fontFamily: Open Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-nav:
    fontFamily: Open Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  badge-label:
    fontFamily: Open Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
```

---

## 4. Layout, Spacing & Shapes

```yaml
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem (4px)
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max-width: 1140px
  gutter: 1rem
  gutter-table: 0.5rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 3.5rem
```

---

## 5. Component Specifications

### 1. Header & Navigation Bar
- Global Sticky Navigation in CMU Scarlet (`#A80000`).
- Navigation links at `label-nav` (13px semi-bold, line-height 18px).
- Term Switcher: Active term (`F26`) and historical terms (`S26`, `F25`).
- Mobile: Condenses to responsive hamburger drawer labeled "Menu".

### 2. High-Priority Action Buttons (Streaming & Zoom Links)
- Pill-shaped (`border-radius: 9999px`).
- Crimson fill (`#8B1E1E` or `#847777`) with bold white text and external link glyph (`↗`).
- Hover state: `#6D1717`.

### 3. Active Deadlines & Bulletin Table
- High-visibility banner framed with 1px border (`#DDDDDD`) and subtle header background.
- Partitioned into `Assignment`, `Deadline`, `Description`, and `Links`.

### 4. Schedule Matrices (Lectures, Recitations & Bootcamps)
- Compact high-density table sizing: `table-header` (13px bold), `table-cell` (13px regular).
- 1px cell boundaries in `#DDDDDD`.
- Zebra striping on alternating rows (`#F7F7F7`).
- Embedded links (`Slides`, `YouTube`, `Notebook`, `MediaServices`) in primary crimson (`#8B1E1E`).

### 5. Instructor & Course Staff Directories
- Instructors, Shadow Instructor, Head TA, and 34 Core Instruction TAs.
- Responsive grid with direct `mailto:` links and TA team group photos (`TA_F26_2.png`, `missing_TAs.png`).

### 6. Events & Google Calendars
- Responsive iframes for Course Events Calendar and Office Hours Calendar (`#oh`).
