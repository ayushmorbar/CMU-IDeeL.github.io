import { z } from 'zod';

export const SyllabusPolicyItemSchema = z
  .object({
    category: z.string(),
    details: z.string().optional(),
    description: z.string().optional(),
    subItems: z.array(z.string()).default([]),
    items: z.array(z.string()).optional(),
  })
  .transform((val) => ({
    category: val.category,
    details: val.details || val.description || '',
    subItems:
      val.subItems && val.subItems.length > 0 ? val.subItems : val.items || [],
  }));

export const SyllabusResourceItemSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    links: z
      .array(
        z
          .object({
            label: z.string().optional(),
            text: z.string().optional(),
            url: z.string(),
          })
          .transform((l) => ({
            label: l.label || l.text || 'Link',
            url: l.url,
          }))
      )
      .default([]),
    link: z
      .object({
        text: z.string().optional(),
        label: z.string().optional(),
        url: z.string(),
      })
      .optional(),
    badge: z.string().optional(),
  })
  .transform((val) => {
    const links = [...val.links];
    if (val.link) {
      links.push({
        label: val.link.label || val.link.text || 'Link',
        url: val.link.url,
      });
    }
    return {
      title: val.title,
      description: val.description,
      links,
      badge: val.badge,
    };
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
