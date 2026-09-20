import { z } from 'zod';

export const SyllabusPolicyItemSchema = z.object({
  category: z.string(),
  details: z.string(),
  subItems: z.array(z.string()).default([]),
});

export const SyllabusResourceItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .default([]),
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
      })
    )
    .default([]),
});

export type SyllabusPolicyItem = z.infer<typeof SyllabusPolicyItemSchema>;
export type SyllabusResourceItem = z.infer<typeof SyllabusResourceItemSchema>;
export type SyllabusData = z.infer<typeof SyllabusDataSchema>;
