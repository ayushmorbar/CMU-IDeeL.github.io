import { z } from 'zod';

/**
 * Canonical syllabus model (Phase 3).
 *
 * Files use only canonical keys: `details` / `subItems` for policies and
 * `links: [{ label, url }]` for resources. The legacy variants
 * (`description`, `items`, singular `link:`, `text:`) were migrated in bulk
 * and are no longer accepted — author new content with canonical keys.
 */

export const SyllabusPolicyItemSchema = z.object({
  category: z.string(),
  details: z.string().default(''),
  subItems: z.array(z.string()).default([]),
});

export const SyllabusLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const SyllabusResourceItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  links: z.array(SyllabusLinkSchema).default([]),
  badge: z.string().optional(),
});

export const SyllabusDataSchema = z.object({
  policies: z.array(SyllabusPolicyItemSchema).default([]),
  resources: z.array(SyllabusResourceItemSchema).default([]),
  readingList: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      }),
    )
    .default([]),
});

export type SyllabusPolicyItem = z.infer<typeof SyllabusPolicyItemSchema>;
export type SyllabusLink = z.infer<typeof SyllabusLinkSchema>;
export type SyllabusResourceItem = z.infer<typeof SyllabusResourceItemSchema>;
export type SyllabusData = z.infer<typeof SyllabusDataSchema>;
