import { z } from 'zod';

export const RecitationItemSchema = z.object({
  number: z.union([z.number(), z.string()]),
  date: z.string().default(''),
  topics: z.array(z.string()).default([]),
  slides_videos: z.array(z.object({
    text: z.string(),
    url: z.string(),
  })).default([]),
  notes_code: z.array(z.object({
    text: z.string(),
    url: z.string(),
  })).default([]),
});

export const RecitationsDataSchema = z.object({
  recitations: z.array(z.any()), // flexible to handle bootcamps, labs, and recitations
});

export const TextbookItemSchema = z.object({
  title: z.string(),
  authors: z.string(),
  edition: z.string(),
  url: z.string(),
  image: z.string(),
});

export const TextbooksSchema = z.array(TextbookItemSchema);
