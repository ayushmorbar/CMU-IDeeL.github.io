import { z } from 'zod';

export const LectureTopicSchema = z.union([
  z.string(),
  z.object({
    main: z.string(),
    sub_topics: z.array(z.string()).optional(),
  }),
]);

export const LectureItemSchema = z.object({
  number: z.union([z.number(), z.string()]),
  date: z.string().default(''),
  topics: z.array(LectureTopicSchema).default([]),
  slides_videos: z
    .array(
      z.object({
        text: z.string().optional().default(''),
        url: z.string().optional().default(''),
      })
    )
    .default([]),
  additional_materials: z
    .array(
      z.object({
        text: z.string().optional().default(''),
        url: z.string().optional().default(''),
      })
    )
    .default([]),
  quiz: z
    .object({
      text: z.string().optional().default(''),
      url: z.string().optional(),
      rowspan: z.number().optional().default(1),
    })
    .optional(),
});

export const LecturesDataSchema = z.object({
  lectures: z.array(LectureItemSchema),
});

export type LectureItem = z.infer<typeof LectureItemSchema>;
