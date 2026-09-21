/**
 * Verification for the Phase 2 unified assignment model.
 *
 * - Canonical semesters: validates strict ISO schema + asserts formatted
 *   display strings match the expected labels below.
 * - Legacy semesters: runs the load-time adapter and asserts every legacy
 *   display string produced an ISO timestamp, all `../shared/` links were
 *   normalized, and every inferred deadline keeps its original display text.
 *
 * Run: `node tools/verify-assignments.mjs` (exit non-zero on failure).
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import {
  AssignmentsDataSchema,
  LegacyAssignmentsDataSchema,
  LegacyDeadlinesSchema,
} from '../src/schemas/assignment.ts';
import {
  adaptLegacySemester,
  formatAssignmentDate,
  hasDateLike,
} from '../src/lib/assignment-adapter.ts';

const ROOT = process.cwd();
const SEMESTERS_DIR = path.join(ROOT, 'content', 'semesters');

let failures = 0;
function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}
function pass(message) {
  console.log(`ok: ${message}`);
}

// Expected rendered strings for the canonical F26 file.
const F26_EXPECTED = {
  hw1p1: {
    release: 'Friday, Aug 28',
    due: 'Friday, Sep 18, 11:59 PM',
    deadlines: [
      'Early Submission: Friday, Sep 4, 11:59 PM',
      'Final Submission: Friday, Sep 18, 11:59 PM',
    ],
  },
  hw1p2: {
    release: 'Friday, Aug 28',
    due: 'Friday, Sep 18, 11:59 PM',
    deadlines: [
      'Checkpoint Submission: Friday, Sep 4, 11:59 PM',
      'Final Submission: Friday, Sep 18, 11:59 PM',
    ],
  },
  hw1bonus: {
    release: 'Friday, Aug 28',
    due: 'Friday, Dec 4, 11:59 PM',
    deadlines: ['Final Submission: Friday, Dec 4, 11:59 PM'],
  },
  hw1autograd: {
    release: 'Friday, Aug 28',
    due: 'Friday, Dec 4, 11:59 PM',
    deadlines: ['Final Submission: Friday, Dec 4, 11:59 PM'],
  },
  hw2: {
    release: 'Friday, Sep 18',
    due: 'Friday, Oct 9, 11:59 PM',
    deadlines: [
      'Early Submission: Friday, Oct 2, 11:59 PM',
      'Final Deadline: Friday, Oct 9, 11:59 PM',
    ],
  },
  hw3: {
    release: 'Friday, Oct 9',
    due: 'Friday, Nov 6, 11:59 PM',
    deadlines: [
      'Early Submission: Friday, Oct 30, 11:59 PM',
      'Final Deadline: Friday, Nov 6, 11:59 PM',
    ],
  },
  hw4: {
    release: 'Friday, Nov 6',
    due: 'Friday, Dec 4, 11:59 PM',
    deadlines: [
      'Early Submission: Friday, Nov 20, 11:59 PM',
      'Final Deadline: Friday, Dec 4, 11:59 PM',
    ],
  },
};

function checkCanonical(term, data) {
  let parsed;
  try {
    parsed = AssignmentsDataSchema.parse(data);
  } catch (err) {
    fail(`${term}: canonical schema parse error: ${err.message}`);
    return;
  }
  const byId = new Map(parsed.assignments.map((a) => [a.id, a]));
  for (const [id, expected] of Object.entries(F26_EXPECTED)) {
    const item = byId.get(id);
    if (!item) {
      fail(`${term}: missing canonical assignment "${id}"`);
      continue;
    }
    if (item.releaseDisplay ?? item.dueDisplay) {
      fail(`${term}/${id}: canonical entries must not carry display strings`);
    }
    const release = item.releaseDate ? formatAssignmentDate(item.releaseDate) : null;
    const due = item.dueDate ? formatAssignmentDate(item.dueDate) : null;
    if (release !== expected.release) fail(`${term}/${id}: release "${release}" !== "${expected.release}"`);
    if (due !== expected.due) fail(`${term}/${id}: due "${due}" !== "${expected.due}"`);
    const rendered = item.deadlines.map((d) => `${d.label}: ${formatAssignmentDate(d.date)}`);
    if (JSON.stringify(rendered) !== JSON.stringify(expected.deadlines)) {
      fail(`${term}/${id}: deadlines ${JSON.stringify(rendered)} !== ${JSON.stringify(expected.deadlines)}`);
    }
  }
  const resource = byId.get('resources');
  if (!resource || resource.releaseDate || resource.dueDate) {
    fail(`${term}: resources row must exist without dates`);
  }
  if (resource && !resource.links.some((l) => l.url === '/shared/project.html')) {
    fail(`${term}: resources row must link to /shared/project.html`);
  }
  pass(`${term}: canonical unified file (${parsed.assignments.length} items)`);
}

function checkLegacy(term, data) {
  let groups;
  try {
    groups = LegacyAssignmentsDataSchema.parse(data);
  } catch (err) {
    fail(`${term}: legacy assignments parse error: ${err.message}`);
    return;
  }
  const deadlinesFile = path.join(SEMESTERS_DIR, term, 'deadlines.yaml');
  let rows = [];
  if (fs.existsSync(deadlinesFile)) {
    try {
      rows = LegacyDeadlinesSchema.parse(load(fs.readFileSync(deadlinesFile, 'utf-8')));
    } catch (err) {
      fail(`${term}: legacy deadlines parse error: ${err.message}`);
      return;
    }
  }
  let items;
  try {
    items = adaptLegacySemester(term, groups, rows);
  } catch (err) {
    fail(`${term}: adapter error: ${err.message}`);
    return;
  }

  // Positional check: adapter emits assignments in file order, so zip the
  // legacy details against the leading items (unmatched deadline rows append).
  let cursor = 0;
  for (const group of groups.assignment_groups) {
    const groupHasDate = hasDateLike(group.release_date);
    for (const detail of group.assignments) {
      const item = items[cursor];
      cursor += 1;
      if (!item || item.title !== detail.name) {
        fail(`${term}: adapter order drift at "${detail.name}"`);
        continue;
      }
      if (groupHasDate && !item.releaseDate) {
        fail(`${term}: release "${group.release_date}" produced no ISO timestamp for "${detail.name}"`);
      }
      const dueRaw = detail.due_date.trim();
      if (dueRaw.length > 0 && hasDateLike(dueRaw)) {
        if (!item.dueDate && item.deadlines.length === 0) {
          fail(`${term}: "${detail.name}" has display dates but no ISO timestamp (${dueRaw})`);
        }
        if (item.dueDisplay !== dueRaw && item.deadlines.length === 0) {
          fail(`${term}: "${detail.name}" lost its due display text`);
        }
      }
    }
  }

  for (const item of items) {
    for (const link of item.links) {
      if (link.url.startsWith('../shared/')) {
        fail(`${term}/${item.id}: unnormalized shared link ${link.url}`);
      }
    }
    for (const d of item.deadlines) {
      if (!d.display) fail(`${term}/${item.id}: inferred deadline "${d.label}" lost its display text`);
    }
    if (item.releaseDisplay && hasDateLike(item.releaseDisplay) && !item.releaseDate) {
      fail(`${term}/${item.id}: release display without ISO timestamp`);
    }
  }
  pass(`${term}: legacy adapter (${items.length} items from ${groups.assignment_groups.length} groups + ${rows.length} deadline rows)`);
}

const terms = fs
  .readdirSync(SEMESTERS_DIR)
  .filter((f) => fs.statSync(path.join(SEMESTERS_DIR, f)).isDirectory())
  .sort();

for (const term of terms) {
  const file = path.join(SEMESTERS_DIR, term, 'assignments.yaml');
  if (!fs.existsSync(file)) {
    fail(`${term}: missing assignments.yaml`);
    continue;
  }
  const data = load(fs.readFileSync(file, 'utf-8'));
  if (data && Array.isArray(data.assignments)) checkCanonical(term, data);
  else checkLegacy(term, data);
}

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log(`\nAll ${terms.length} semesters verified.`);
