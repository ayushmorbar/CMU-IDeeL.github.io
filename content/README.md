# Content Organization & Schema Guide

This directory (`content/`) contains all structured data powering the CMU 11-785 website. All files are strictly validated at build time against Zod schemas in `src/schemas/`.

---

## Directory Structure

```text
content/
├── config.yaml                     # Global course configuration & semester registry
├── common/
│   └── textbooks.yaml              # Shared textbook list across all semesters
└── semesters/
    └── <SEMESTER_ID>/              # e.g., F26, S27
        ├── semester.yaml           # Metadata (title, term, venue, Zoom link)
        ├── about.yaml              # Course intro, student perspective, prerequisites, units
        ├── deadlines.yaml          # Active Deadlines & Bulletin table (top of page)
        ├── assignments.yaml        # Full HW1-HW4 schedule, release/due dates, handouts, links
        ├── events.yaml             # Lecture/Lab/OH times, Hackathons, Google Calendar embeds
        ├── staff.yaml              # Instructors, Shadow Instructor, Head TA, Core TAs, photos
        ├── lectures.yaml           # Schedule of 28 lectures (topics, slides, videos)
        ├── recitations.yaml        # Recitations 0 series, JAX, Labs 1-15 (materials, videos)
        └── syllabus.md             # Course policy details & markdown syllabus
```

---

## File Responsibilities & Schemas

| File | Corresponding Schema | Purpose |
| :--- | :--- | :--- |
| `config.yaml` | `getConfig()` in `src/lib/content.ts` | Sets `currentSemester` and lists historical/active terms for the switcher. |
| `semester.yaml` | [`SemesterSchema`](../src/schemas/semester.ts) | Defines course number (`11-785`), full title, term, venue, and Zoom URL. |
| `about.yaml` | [`AboutSchema`](../src/schemas/about.ts) | Narrative description of the course, student perspective, prerequisites, and units. |
| `deadlines.yaml` | [`DeadlinesSchema`](../src/schemas/deadline.ts) | Urgent active assignments table displayed in the hero bulletin. |
| `assignments.yaml`| [`AssignmentsDataSchema`](../src/schemas/assignment.ts) | Complete HW1–HW4 assignment matrix with release dates, due dates, handouts, and links. |
| `events.yaml` | [`EventScheduleSchema`](../src/schemas/event.ts) | Timing for lectures, labs, hackathons, and Google Calendar iframe embed URLs. |
| `staff.yaml` | [`StaffSchema`](../src/schemas/staff.ts) | Instructors, TAs, email addresses, team photos, and Hall of Fame links. |
| `lectures.yaml` | [`LecturesDataSchema`](../src/schemas/lecture.ts) | Matrix of all 28 lectures with slide PDFs, YouTube, and MediaServices links. |
| `recitations.yaml`| Raw / Typed YAML | Recitation 0 series notebooks, JAX bootcamp, and Labs 1–15 materials. |
| `common/textbooks.yaml` | [`TextbooksSchema`](../src/schemas/recitation.ts) | Recommended textbooks with covers, citations, and external links. |

---

## How to Maintain Content

1. **Update a Deadline:**
   Edit `content/semesters/<TERM>/deadlines.yaml` or `assignments.yaml`.
2. **Add Lecture Slides:**
   Place the PDF in `F26/documents/slides/lecX.name.pdf` and add the entry to `content/semesters/<TERM>/lectures.yaml`.
3. **Update Course Staff:**
   Edit `content/semesters/<TERM>/staff.yaml`. Add photos to `<TERM>/images/` if needed.
4. **Update Calendar Links:**
   Edit `content/semesters/<TERM>/events.yaml` with the latest Google Calendar embed URLs.
5. **Verify Changes:**
   Always run `pnpm typecheck` and `pnpm build` before committing.
