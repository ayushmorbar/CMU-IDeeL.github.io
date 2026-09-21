import {
  type LegacyAssignmentsData,
  type LegacyDeadlineEntry,
  type UnifiedAssignment,
} from '../schemas/assignment.ts';

/**
 * Load-time adapter (Phase 2).
 *
 * Historical semesters keep the legacy split shape (`assignment_groups` in
 * `assignments.yaml` plus a separate `deadlines.yaml`). This module converts
 * both into `UnifiedAssignment[]` so components only consume the unified
 * model. Canonical semesters (unified `assignments.yaml`) bypass the adapter.
 *
 * Date inference rules (documented, deterministic):
 * - Year comes from the semester id: `Fxx` → fall 20xx, `Sxx` → spring 20xx.
 * - Missing times default to midnight; explicit times are honored.
 * - UTC offset follows America/New_York DST (EDT `-04:00`, EST `-05:00`).
 * - Every inferred timestamp keeps the original display string alongside it
 *   (`display` / `releaseDisplay` / `dueDisplay`) so rendered output is
 *   preserved verbatim. Canonical files omit display strings and are
 *   formatted from ISO instead.
 */

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const MONTH_TOKEN =
  '(jan\\w*|feb\\w*|mar\\w*|apr\\w*|may|jun\\w*|jul\\w*|aug\\w*|sep\\w*|oct\\w*|nov\\w*|dec\\w*)';
const ORDINAL = '(?:\\s*(?:st|nd|rd|th))?\\.?';
// Month-first: "Friday, Sept 4", "Aug. 31", "December, 4th", "Jan 23rd, 2022".
const MONTH_FIRST_PATTERN = new RegExp(`${MONTH_TOKEN}\\.?\\s+(\\d{1,2})${ORDINAL}`, 'i');
// Day-first: "13th Jan", "20th Aug", "31th Mar".
const DAY_FIRST_PATTERN = new RegExp(`(\\d{1,2})${ORDINAL},?\\s+${MONTH_TOKEN}\\.?`, 'i');
const TIME_PATTERN = /(\d{1,2})(?::(\d{2}))?\s*([AP])\.?\s*M\.?/i;

function monthNumber(token: string): number | undefined {
  return MONTHS[token.slice(0, 3).toLowerCase()];
}

/** True when a string contains something shaped like a calendar date. */
export function hasDateLike(value: string): boolean {
  return MONTH_FIRST_PATTERN.test(value) || DAY_FIRST_PATTERN.test(value);
}

export function semesterYear(term: string): number {
  const m = term.match(/^([FS])(\d{2})$/i);
  if (!m) throw new Error(`Cannot infer year from semester id "${term}"`);
  return 2000 + Number.parseInt(m[2], 10);
}

function nthSundayOfMonth(year: number, monthZeroBased: number, n: number): number {
  const first = new Date(Date.UTC(year, monthZeroBased, 1)).getUTCDay();
  return 1 + ((7 - first) % 7) + (n - 1) * 7;
}

/** True when a wall-clock time falls under America/New_York daylight time. */
export function isEasternDaylight(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): boolean {
  const dstStart = nthSundayOfMonth(year, 2, 2); // 2nd Sunday of March
  const dstEnd = nthSundayOfMonth(year, 10, 1); // 1st Sunday of November
  const key = (month * 100 + day) * 10000 + hour * 100 + minute;
  const start = (3 * 100 + dstStart) * 10000 + 300; // 03:00, clocks spring forward
  const end = (11 * 100 + dstEnd) * 10000 + 200; // 02:00, clocks fall back
  return key >= start && key < end;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export interface ParsedDateTime {
  iso: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/** Parse a legacy display date like `"Friday, Sept 4, 11:59 PM"` or `"December, 4th"`. */
export function parseDisplayDateTime(raw: string, year: number): ParsedDateTime | null {
  let month: number | undefined;
  let day = 0;
  const mf = raw.match(MONTH_FIRST_PATTERN);
  if (mf) {
    month = monthNumber(mf[1]);
    day = Number.parseInt(mf[2], 10);
  } else {
    const df = raw.match(DAY_FIRST_PATTERN);
    if (!df) return null;
    month = monthNumber(df[2]);
    day = Number.parseInt(df[1], 10);
  }
  if (!month || day < 1 || day > 31) return null;
  let hour = 0;
  let minute = 0;
  const t = raw.match(TIME_PATTERN);
  if (t) {
    const hour12 = Number.parseInt(t[1], 10);
    minute = t[2] === undefined ? 0 : Number.parseInt(t[2], 10);
    if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
    hour = (hour12 % 12) + (t[3].toUpperCase() === 'P' ? 12 : 0);
  }
  const offset = isEasternDaylight(year, month, day, hour, minute) ? '-04:00' : '-05:00';
  return {
    iso: `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${offset}`,
    month,
    day,
    hour,
    minute,
  };
}

function splitBreaks(value: string): string[] {
  return value
    .split(/<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Split `"Early Deadline: Friday, Sep 06 11:59 PM"` into label + date part. */
function splitLabel(part: string): { label: string; datePart: string } {
  const idx = part.indexOf(':');
  if (idx > 0) {
    const maybeLabel = part.slice(0, idx).trim();
    const rest = part.slice(idx + 1).trim();
    if (maybeLabel.length > 0 && hasDateLike(rest) && !hasDateLike(maybeLabel)) {
      return { label: maybeLabel, datePart: rest };
    }
  }
  return { label: 'Due', datePart: part };
}

export function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'item';
}

/** Rewrite legacy `../shared/...` links to root-absolute `/shared/...`. */
export function normalizeSharedUrl(url: string): string {
  if (url.startsWith('../shared/')) return `/${url.slice(3)}`;
  return url;
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Format a canonical ISO datetime for display in America/New_York:
 * `"Friday, Sep 4, 11:59 PM"`, or `"Friday, Aug 28"` for midnight releases.
 */
export function formatAssignmentDate(iso: string): string {
  const dt = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(dt);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(dt);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';
  if (hour === 12 && minute === '00' && dayPeriod === 'AM') return date;
  return `${date}, ${hour}:${minute} ${dayPeriod}`;
}

interface InheritedDue {
  iso: string | undefined;
  display: string;
  deadlines: UnifiedAssignment['deadlines'];
}

function parseDueField(
  raw: string,
  year: number,
): { iso: string | undefined; display: string; deadlines: UnifiedAssignment['deadlines'] } {
  const display = raw.trim();
  if (display.length === 0) return { iso: undefined, display: '', deadlines: [] };
  const deadlines: UnifiedAssignment['deadlines'] = [];
  let lastIso: string | undefined;
  for (const part of splitBreaks(display)) {
    const { label, datePart } = splitLabel(part);
    const parsed = parseDisplayDateTime(datePart, year);
    if (!parsed) continue;
    lastIso = parsed.iso;
    deadlines.push({ label, date: parsed.iso, display: `${label}: ${datePart}` });
  }
  return { iso: lastIso, display, deadlines };
}

/**
 * Convert one legacy semester (`assignment_groups` + `deadlines.yaml` rows)
 * into unified assignments. Assignments keep file order; unmatched deadline
 * rows (resource links) are appended as dateless items.
 */
export function adaptLegacySemester(
  term: string,
  groups: LegacyAssignmentsData,
  deadlineRows: LegacyDeadlineEntry[],
): UnifiedAssignment[] {
  const year = semesterYear(term);
  const items: UnifiedAssignment[] = [];
  const byKey = new Map<string, UnifiedAssignment>();
  const usedIds = new Set<string>();

  const claimId = (base: string): string => {
    let id = base;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(id);
    return id;
  };

  for (const group of groups.assignment_groups) {
    // Release strings sometimes carry the time after a <br>; join and parse once.
    const releaseRaw = splitBreaks(group.release_date).join(' ');
    const releaseParsed = parseDisplayDateTime(releaseRaw, year);
    let inherited: InheritedDue | null = null;

    for (const detail of group.assignments) {
      const parsed: { iso: string | undefined; display: string; deadlines: UnifiedAssignment['deadlines'] } =
        detail.due_date.trim().length > 0
          ? parseDueField(detail.due_date, year)
          : (inherited ?? { iso: undefined, display: '', deadlines: [] });
      inherited = { iso: parsed.iso, display: parsed.display, deadlines: parsed.deadlines };

      const item: UnifiedAssignment = {
        id: claimId(slugify(detail.name)),
        title: detail.name,
        ...(releaseParsed ? { releaseDate: releaseParsed.iso } : {}),
        releaseDisplay: group.release_date,
        ...(parsed.iso ? { dueDate: parsed.iso } : {}),
        ...(parsed.display ? { dueDisplay: parsed.display } : {}),
        deadlines: parsed.deadlines,
        description: '',
        links: detail.materials.map((mat) => ({
          label: mat.text.length > 0 ? mat.text : 'Link',
          url: normalizeSharedUrl(mat.url),
        })),
      };
      items.push(item);
      const key = normalizeKey(detail.name);
      if (!byKey.has(key)) byKey.set(key, item);
    }
  }

  for (const row of deadlineRows) {
    const title = collapseWhitespace(row.assignment);
    const target = byKey.get(normalizeKey(title));
    const rowLinks = row.links.map((l) => ({
      label: l.label,
      url: normalizeSharedUrl(l.url),
    }));
    if (target) {
      if (target.description.length === 0 && row.description.length > 0) {
        target.description = row.description;
      }
      const seen = new Set(target.links.map((l) => l.url));
      for (const link of rowLinks) {
        if (!seen.has(link.url)) {
          seen.add(link.url);
          target.links.push(link);
        }
      }
      const knownInstants = new Set(target.deadlines.map((d) => d.date));
      for (const d of row.deadlines) {
        const parsed = parseDisplayDateTime(d.date, year);
        if (!parsed || knownInstants.has(parsed.iso)) continue;
        knownInstants.add(parsed.iso);
        target.deadlines.push({
          label: d.label,
          date: parsed.iso,
          display: `${d.label}: ${d.date}`,
        });
      }
      if (!target.dueDate) {
        const last = target.deadlines[target.deadlines.length - 1];
        if (last) target.dueDate = last.date;
      }
      continue;
    }
    // Dateless resource row (project gallery, piazza links, anecdotes).
    items.push({
      id: claimId(row.id.length > 0 ? slugify(row.id) : slugify(title)),
      title,
      deadlines: row.deadlines.flatMap((d) => {
        const parsed = parseDisplayDateTime(d.date, year);
        return parsed ? [{ label: d.label, date: parsed.iso, display: `${d.label}: ${d.date}` }] : [];
      }),
      description: row.description,
      links: rowLinks,
    });
  }

  return items;
}
