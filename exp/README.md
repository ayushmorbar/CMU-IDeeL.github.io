# exp/ — Legacy Experimental Course Website

This directory is an **archived experimental version** of the 11-785 Deep Learning course
website from the early course years (pre-2020). It contains a standalone static site with
its own CSS, JavaScript, and HTML pages.

**This content is live and publicly served** at `https://deeplearning.cs.cmu.edu/exp/`
as part of the site build (it is copied to `dist/` during `pnpm build` via the
`legacySemestersIntegration` plugin in `astro.config.mjs`).

## Contents

| File/Dir | Description |
|---|---|
| `index.html` | Main course page (Bootstrap 3-era layout) |
| `rest.html` | Full course schedule / recitations page (79KB) |
| `pseudocode.html` | Pseudocode reference page |
| `etiquette.html` | Course etiquette guidelines |
| `videoinstr.html` | Video submission instructions |
| `chatbot.css` | Legacy chatbot styles |
| `data/` | Static JSON data files |
| `document/` | Course document assets |
| `image/` | Image assets |
| `page/` | Additional sub-pages |

## Maintenance Policy

**Do not edit.** This is a read-only historical archive. If any content needs updating,
the current semester pages in `content/semesters/` and the Astro components in `src/`
are the authoritative source.
