# tools/ — Historical Migration & Utility Scripts

This directory contains one-time migration scripts used during the transition from the legacy
monolithic HTML semester pages to the current Astro 7 + YAML content model.

**Migration status: COMPLETE.** All active semesters (F25, S26, F26) now live in
`content/semesters/` as per-section YAML files and are compiled by Astro.

---

## Scripts

### `migrate-semester.js`
Generic migration runner. Extracts semester data from a legacy `F##/index.html` or
`S##/index.html` and writes the structured YAML files into `content/semesters/##/`.

### `migrate-f25.js`
One-shot migration for Fall 2025 specifically. Hardcoded semester metadata and
extraction logic tailored to the F25 page structure.

### `migrate-monolithic.js`
Migration for older "monolithic" semesters (pre-F25) where all content lived in a
single giant HTML file without clear structural sections.

### `run-all-monolithic.js`
Batch runner that calls `migrate-monolithic.js` for all legacy semesters.

### `html-extractors.js`
Shared helper functions used by the migration scripts. Parses HTML tables, extracts
lecture rows, recitation groups, staff cards, etc. using `cheerio`.

### `inspect-metadata.js`
Diagnostic script. Prints extracted metadata from a semester HTML file to stdout
for debugging migration output before committing it.

### `inspect-tables.js`
Diagnostic script. Enumerates all `<table>` elements in a semester HTML file to
help identify which tables map to which YAML section.

---

## f26_discord_bot/

A standalone Python Discord bot that ingests file uploads from a Discord channel
and queues them for processing. Has its own `README.md` and `requirements.txt`.
This is **not** part of the Astro build process — it runs independently on a server
(or locally) during active semesters.

See [`f26_discord_bot/README.md`](./f26_discord_bot/README.md) for setup instructions.

---

## Do Not Run Migration Scripts on Active Semesters

Running any migration script against an already-migrated semester (F26, S26, F25)
will **overwrite** the hand-edited YAML content in `content/semesters/`. These scripts
are preserved for reference and for potential future semester migrations only.
