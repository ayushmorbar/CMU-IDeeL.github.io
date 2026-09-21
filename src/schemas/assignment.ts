import { z } from 'zod';

/**
 * Unified assignment model (Phase 2).
 *
 * Canonical semester files (`content/semesters/<sem>/assignments.yaml`) use:
 *   { assignments: UnifiedAssignment[] }
 * with strict ISO 8601 datetimes (explicit UTC offset, America/New_York).
 *
 * Historical semesters still store the legacy split shape
 * (`assignment_groups` + a separate `deadlines.yaml`). Those are parsed with
 * the `Legacy*` schemas below and converted at load time by
 * `src/lib/assignment-adapter.ts`. Do not author new content in legacy shape.
 */

/** Strict ISO 8601 datetime with explicit UTC offset, e.g. `2026-09-04T23:59:00-04:00`. */
export const IsoDateTimeSchema = z.iso.datetime({ offset: true });

export const AssignmentLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const AssignmentDeadlineSchema = z.object({
  label: z.string(),
  date: IsoDateTimeSchema,
  /**
   * Original display string preserved for legacy entries only
   * (e.g. `"December, 4th, 11:59 PM"`). Omit in canonical files; the
   * components format `date` instead. Never invent new display strings.
   */
  display: z.string().optional(),
});

export const UnifiedAssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  /**
   * Release timestamp. Optional so dateless resource rows (project
   * gallery, piazza links) from legacy `deadlines.yaml` files remain
   * representable. Strict ISO when present.
   */
  releaseDate: IsoDateTimeSchema.optional(),
  /** Legacy display string for `releaseDate`. Omit in canonical files. */
  releaseDisplay: z.string().optional(),
  /** Final deadline timestamp. Optional for dateless resource rows. */
  dueDate: IsoDateTimeSchema.optional(),
  /** Legacy display string for `dueDate`. Omit in canonical files. */
  dueDisplay: z.string().optional(),
  /** All labeled deadlines (early / final / checkpoint). Strict ISO dates. */
  deadlines: z.array(AssignmentDeadlineSchema).default([]),
  description: z.string().default(''),
  links: z.array(AssignmentLinkSchema).default([]),
});

export const AssignmentsDataSchema = z.object({
  assignments: z.array(UnifiedAssignmentSchema),
});

export type AssignmentLink = z.infer<typeof AssignmentLinkSchema>;
export type AssignmentDeadline = z.infer<typeof AssignmentDeadlineSchema>;
export type UnifiedAssignment = z.infer<typeof UnifiedAssignmentSchema>;
export type AssignmentsData = z.infer<typeof AssignmentsDataSchema>;

// ---------------------------------------------------------------------------
// Legacy shapes (read-only). Parsed only by the load-time adapter for
// historical semesters. Do not use for new content.
// ---------------------------------------------------------------------------

export const LegacyAssignmentMaterialSchema = z.object({
  text: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

export const LegacyAssignmentDetailSchema = z.object({
  name: z.string(),
  /** Display string, possibly multi-deadline HTML (`"...<br>..."`). */
  due_date: z.string().optional().default(''),
  due_date_rowspan: z.number().optional(),
  materials: z.array(LegacyAssignmentMaterialSchema).default([]),
});

export const LegacyAssignmentGroupSchema = z.object({
  /** Display string, e.g. `"Friday, Aug 28"` or `"Wednesday, Aug 27<br>11:59 PM"`. */
  release_date: z.string(),
  assignments: z.array(LegacyAssignmentDetailSchema),
});

export const LegacyAssignmentsDataSchema = z.object({
  assignment_groups: z.array(LegacyAssignmentGroupSchema),
});

export const LegacyDeadlineLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const LegacyDeadlineEntrySchema = z.object({
  id: z.string(),
  assignment: z.string(),
  deadlines: z
    .array(
      z.object({
        label: z.string(),
        date: z.string(),
      }),
    )
    .default([]),
  description: z.string().default(''),
  links: z.array(LegacyDeadlineLinkSchema).default([]),
});

export const LegacyDeadlinesSchema = z.array(LegacyDeadlineEntrySchema);

export type LegacyAssignmentsData = z.infer<typeof LegacyAssignmentsDataSchema>;
export type LegacyDeadlineEntry = z.infer<typeof LegacyDeadlineEntrySchema>;
