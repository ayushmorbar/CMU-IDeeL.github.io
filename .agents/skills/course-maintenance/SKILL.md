---
name: course-maintenance
description: Comprehensive workflow for maintaining CMU 11-785 course deadlines, lecture slides, recitations, staff, calendars, syllabus, and rolling over semesters using Astro 7 and Zod schemas.
---

# CMU 11-785 Course Maintenance Skill

This skill guides human operators and AI agents through safe, schema-validated updates to the CMU 11-785 course website.

## Core Rules & Operational Guardrails
1. **Zero Remote Push:** NEVER run `git push`, `gh pr create`, or any command modifying remote GitHub state. All changes are strictly local.
2. **Asset Integrity:** Never delete, truncate, or overwrite binary educational assets (PDFs, PPTXs, IPYNBs, ZIPs, images) across any semester directory.
3. **Data Boundary:** Course content edits must only occur in `content/`. Visual/styling changes must occur in `src/styles/` or `src/components/`, referencing [`DESIGN.md`](../../DESIGN.md).

---

## Maintenance Workflows

### Workflow 1: Update an Active Deadline or Bulletin
1. Open `content/semesters/<SEMESTER>/deadlines.yaml`.
2. Update the `deadlines` list (e.g. `Early Submission`, `Final Submission`) under the target assignment ID (e.g. `hw1p1`).
3. Run `pnpm typecheck` to verify schema conformance.
4. Run `pnpm build` to compile the updated static page.

### Workflow 2: Update Full Assignments Schedule (HW1–HW4)
1. Open `content/semesters/<SEMESTER>/assignments.yaml`.
2. Update release dates, due dates, or append new material links (handouts, starter notebooks, Kaggle competition links, Gradescope links).
3. Run `pnpm typecheck`.

### Workflow 3: Add Lecture Slides or Recordings
1. Save the slide PDF to `<SEMESTER>/documents/slides/lecX.name.pdf`.
2. Open `content/semesters/<SEMESTER>/lectures.yaml`.
3. Locate the lecture entry by `number`.
4. Add the slide/video object under `slides_videos`:
   ```yaml
   - text: "Slides"
     url: "./documents/slides/lecX.name.pdf"
   - text: "YouTube"
     url: "https://www.youtube.com/watch?v=..."
   - text: "MediaServices"
     url: "https://mediaservices.cmu.edu/media/..."
   ```
5. Run `pnpm typecheck`.

### Workflow 4: Update Recitations, Bootcamps, or Labs
1. Place recitation notebooks or slides into `<SEMESTER>/documents/recitation_0/` or `<SEMESTER>/documents/labs/`.
2. Open `content/semesters/<SEMESTER>/recitations.yaml`.
3. Update the corresponding recitation or lab item with new materials or video links.

### Workflow 5: Update Staff, TAs, or Photos
1. Open `content/semesters/<SEMESTER>/staff.yaml`.
2. Add or update names and emails under `instructors`, `shadowInstructors`, `headTAs`, or `coreTAs`.
3. If adding a new team photo, place it in `<SEMESTER>/images/` and reference it under `images` in `staff.yaml`.

### Workflow 6: Update Google Calendars or Event Times
1. Open `content/semesters/<SEMESTER>/events.yaml`.
2. Update `lectures`, `recitations`, `officeHours`, or `hackathons` time/location details.
3. Update `eventCalendarUrl` or `ohCalendarUrl` if the Google Calendar embed URLs change.

### Workflow 7: Rollover to a New Semester (e.g., S27)
1. Duplicate the latest semester content directory:
   ```bash
   cp -r content/semesters/F26 content/semesters/S27
   ```
2. Update `content/semesters/S27/semester.yaml`:
   - `id: "S27"`
   - `term: "Spring 2027"`
   - Update `venue` and `zoomLink` if changed.
3. Create the asset folder `<WORKSPACE>/S27/` with `images/` and `documents/` for binary materials.
4. Update `content/config.yaml`:
   ```yaml
   currentSemester: "S27"
   semesters:
     - id: "S27"
       title: "Spring 2027"
       isCurrent: true
     - id: "F26"
       title: "Fall 2026"
       isCurrent: false
   ```
5. Run `pnpm build` to compile the new semester at `/S27/` and update the root redirect.

---

## Verification Protocol
Before finishing any maintenance task:
1. `pnpm typecheck`: Validates all YAML data against the Zod schemas in `src/schemas/`.
2. `pnpm lint`: Enforces static code quality and formatting.
3. `pnpm build`: Verifies that the static site compiles cleanly into `dist/`.
