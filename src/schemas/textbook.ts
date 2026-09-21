import { z } from 'zod';

/** Optional textbooks listed under Documentation and Tools (Phase 3). */
export const TextbookItemSchema = z.object({
  title: z.string(),
  authors: z.string(),
  edition: z.string(),
  url: z.string(),
  image: z.string(),
});

export const TextbooksSchema = z.array(TextbookItemSchema);

export type TextbookItem = z.infer<typeof TextbookItemSchema>;
