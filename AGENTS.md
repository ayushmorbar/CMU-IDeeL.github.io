# CMU 11-785 Universal Agent Guidelines (AGENTS.md)

This file defines the operational constraints, conventions, and verification workflows for all AI coding agents (Cursor, Windsurf, Claude Code, Antigravity, GitHub Copilot) operating on `CMU-IDeeL.github.io`.

---

## 1. Safety & Operational Constraints

1. **NO REMOTE PUSH:** Never run `git push`, `gh pr create`, or any command that modifies remote Git repositories. All work is strictly local.
2. **ASSET INTEGRITY:** Do not delete, truncate, or overwrite binary assets (PDFs, PPTXs, IPYNBs, ZIPs, images).
3. **BOUNDARIES:**
   * Course content changes $\rightarrow$ edit `content/`.
   * Visual / Design system changes $\rightarrow$ edit `src/components/`, `src/styles/`, consult `DESIGN.md`.
   * Infrastructure / Ingestion changes $\rightarrow$ edit `tools/` or `.github/`.

---

## 2. Directory Map for Agents

* `content/semesters/`: Domain-specific YAML and Markdown files for each semester.
* `src/components/`: Reusable components (e.g., `CourseNav`, `LectureTable`, `DeadlinesBulletin`).
* `src/schemas/`: Zod validation schemas enforcing strict type safety.
* `src/styles/`: Global styles, CSS custom properties, tokens.
* `DESIGN.md`: Authoritative visual specification and color palette.
* `legacy/`: Historical static archives (read-only; do not modify).

---

## 3. Verification Protocol

Before finishing any task, run the following commands:
1. `pnpm typecheck`: Validates all YAML data against the Zod schemas in `src/schemas/`.
2. `pnpm build`: Confirms that the static export compiles cleanly into `dist/`.
3. `pnpm lint`: Enforces code quality and formatting.
