import { z } from 'zod';

export const DeadlineItemSchema = z.object({
  id: z.string(),
  assignment: z.string(),
  deadlines: z.array(z.object({
    label: z.string(),
    date: z.string(),
  })),
  description: z.string(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).default([]),
});

export const DeadlinesSchema = z.array(DeadlineItemSchema);

export type DeadlineItem = z.infer<typeof DeadlineItemSchema>;
