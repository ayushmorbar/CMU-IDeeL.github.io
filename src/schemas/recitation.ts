import { z } from 'zod';

/**
 * Strict recitation models (Phase 3).
 *
 * `recitations.yaml` has two sections:
 * - `recitations_0`: bootcamp days → groups → topics (sessions with
 *   materials/videos). Present for recent semesters, empty for older ones.
 * - `recitations`: weekly labs/hackathons in one of two shapes —
 *   `SessionRecitation` (title/materials/videos/authors, F25+) or
 *   `ClassicRecitation` (number/slides_videos/notes_code, older semesters).
 */

export const RecitationLinkSchema = z.object({
  text: z.string().default(''),
  url: z.string().default(''),
});

/**
 * Link lists tolerate legacy variants: items missing `url` (TBA stubs) or
 * bare strings. Entries with neither text nor URL are dropped.
 */
const RecitationLinkArraySchema = z
  .array(
    z.union([
      z.object({ text: z.string().default(''), url: z.string().default('') }),
      z.string(),
    ]),
  )
  .default([])
  .transform((links) =>
    links
      .map((link) => (typeof link === 'string' ? { text: link, url: '' } : link))
      .filter((link) => link.text !== '' || link.url !== ''),
  );

export const BootcampTopicSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  date: z.string().default(''),
  materials: RecitationLinkArraySchema,
  videos: RecitationLinkArraySchema,
  authors: z.string().default(''),
});

export const BootcampGroupSchema = z.object({
  name: z.string().default(''),
  status: z.string().optional(),
  topics: z.array(BootcampTopicSchema).default([]),
});

export const BootcampDaySchema = z.object({
  date: z.string().default(''),
  groups: z.array(BootcampGroupSchema).default([]),
});

export const SessionRecitationSchema = z.object({
  title: z.string(),
  date: z.string().default(''),
  topics: z.union([z.string(), z.array(z.string())]).default(''),
  materials: RecitationLinkArraySchema,
  videos: RecitationLinkArraySchema,
  authors: z.string().default(''),
  // Legacy rowspan layout hints; flat rendering ignores them.
  date_rowspan: z.number().optional(),
  materials_rowspan: z.number().optional(),
  videos_rowspan: z.number().optional(),
  authors_rowspan: z.number().optional(),
});

export const ClassicRecitationSchema = z.object({
  number: z.union([z.number(), z.string()]),
  date: z.string().default(''),
  topics: z.array(z.string()).default([]),
  slides_videos: RecitationLinkArraySchema,
  notes_code: RecitationLinkArraySchema,
});

export const RecitationEntrySchema = z.union([SessionRecitationSchema, ClassicRecitationSchema]);

export const RecitationsDataSchema = z.object({
  recitations_0: z.array(BootcampDaySchema).default([]),
  recitations: z.array(RecitationEntrySchema).default([]),
});

export type RecitationLink = z.infer<typeof RecitationLinkSchema>;
export type BootcampTopic = z.infer<typeof BootcampTopicSchema>;
export type BootcampGroup = z.infer<typeof BootcampGroupSchema>;
export type BootcampDay = z.infer<typeof BootcampDaySchema>;
export type SessionRecitation = z.infer<typeof SessionRecitationSchema>;
export type ClassicRecitation = z.infer<typeof ClassicRecitationSchema>;
export type RecitationEntry = z.infer<typeof RecitationEntrySchema>;
export type RecitationsData = z.infer<typeof RecitationsDataSchema>;
