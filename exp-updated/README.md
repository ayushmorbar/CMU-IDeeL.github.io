# exp-updated/ — Legacy Redesign Stub (2019)

This directory is a **stub index page** from a 2019 redesign experiment that was
never completed. It contains:

- `index.html` — A minimal landing page linking to the `exp-updated/S24/` semester
- `S24/` — A legacy Spring 2024 semester site in the old static format
- `css/`, `icon/` — Shared style and icon assets for the legacy pages

**This content is live and publicly served** at `https://deeplearning.cs.cmu.edu/exp-updated/`
as part of the site build (copied to `dist/` during `pnpm build`).

## Maintenance Policy

**Do not edit.** This is a read-only historical archive. The `index.html` references a
2019-era contact address and has not been maintained. All active semester content lives in
`content/semesters/` and is compiled by Astro.

If the `exp-updated/` URL needs to be retired, remove it from the `LEGACY_DIRS` array
in `astro.config.mjs` and it will no longer be included in the build output.
