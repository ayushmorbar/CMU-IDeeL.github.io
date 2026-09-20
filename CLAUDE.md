# CMU 11-785 Web Platform: Claude Code Agent Guide (CLAUDE.md)

This repository powers the official Carnegie Mellon University **11-785: Introduction to Deep Learning** course website (`deeplearning.cs.cmu.edu`).

---

## 1. Prime Directives for Agents (CRITICAL)

1. **NEVER PUSH TO REMOTE:** Under no circumstances should you run `git push` or modify remote repository state unless explicitly commanded by the user. All operations are strictly local.
2. **NEVER DELETE MATERIALS OR ASSETS:** Do not delete existing lecture slides (`.pdf`, `.pptx`), Jupyter notebooks (`.ipynb`), homework archives (`.zip`), or images in `images/` or `documents/`.
3. **CONTENT-FIRST UPDATES:** For routine course maintenance (deadlines, lectures, syllabus, staff, office hours), **edit ONLY the structured data in `content/`**. Never touch generated output files or raw presentation templates unless specifically instructed to modify the design system.
4. **STRICT VERIFICATION BEFORE COMMITTING:** Always run the verification harness (`pnpm typecheck` and `pnpm build`) before reporting any task complete.

---

## 2. Project Architecture & Mental Model

* **Content Layer (`content/`):** Pure data. Contains `config.yaml` (active semester pointer) and domain-specific YAML/Markdown files per semester:
  * `content/semesters/<TERM>/semester.yaml`: Metadata (title, Zoom link, venue, times).
  * `content/semesters/<TERM>/deadlines.yaml`: Active deadlines and bulletin announcements.
  * `content/semesters/<TERM>/lectures.yaml`: Lecture schedule, topics, slides, recordings, readings.
  * `content/semesters/<TERM>/recitations.yaml`: Recitations, bootcamps, notebooks, starter files.
  * `content/semesters/<TERM>/staff.yaml`: Instructors, TAs, office hour slots.
  * `content/semesters/<TERM>/syllabus.md`: Course policies, grading breakdown, exam rules.
* **Presentation Engine (`src/`):** Written once, shared across all semesters.
  * `src/components/`: Reusable UI components (Tables, Navigation, Cards).
  * `src/layouts/`: Global HTML shell, CMU brand header, footer, SEO metadata.
  * `src/pages/`: Dynamic static routes (`[semester]/index.astro` or `[semester]/page.tsx`).
  * `src/schemas/`: Zod validation schemas enforcing strict type contracts on YAML files.
* **Design Specification:** Follow `DESIGN.md` for all color tokens (`--cmu-red: #A80000`), typography (`Open Sans`), and spacing.

---

## 3. Essential Verification Commands

```bash
# Typecheck data and code against Zod schemas
pnpm typecheck

# Validate and build static HTML output into dist/
pnpm build

# Run local development server
pnpm dev

# Check links and route integrity
pnpm test:links
```

---

## 4. Routine Maintenance Workflows for Agents

### A. Updating Course Deadlines
1. Open `content/semesters/<ACTIVE_TERM>/deadlines.yaml`.
2. Locate or add the assignment item.
3. Ensure dates use ISO format (`YYYY-MM-DDTHH:mm:ss-04:00`).
4. Run `pnpm typecheck` to verify schema conformance.

### B. Adding a Lecture Slide or Recording
1. Open `content/semesters/<ACTIVE_TERM>/lectures.yaml`.
2. Locate the lecture number.
3. Add the slide/video object under `slides_videos`:
   ```yaml
   - text: "Slides"
     url: "https://..."
   ```
4. Run `pnpm typecheck`.

### C. Rollover to a New Semester (e.g., S27)
1. Copy the latest semester folder: `cp -r content/semesters/F26 content/semesters/S27`.
2. Update `content/semesters/S27/semester.yaml` with new venue, dates, and streaming links.
3. Update `content/config.yaml`:
   ```yaml
   currentSemester: "S27"
   ```
4. Run `pnpm build` to verify the new semester compiles cleanly.

---

## 5. Coding & Style Conventions

* **HTML & Accessibility:** Strictly adhere to WCAG 2.2 Level AA. Use semantic elements (`<nav>`, `<main>`, `<article>`, `<button>`). Never use clickable `<span>` or `<div>` tags for navigation.
* **CSS:** Use CSS custom properties defined in `DESIGN.md`. Avoid inline styles.
* **Zero Client JS for Content:** Course tables, schedules, and text must be rendered statically at build time. Client-side JavaScript is reserved strictly for light interactive chrome (e.g., mobile drawer toggle).
