import { z } from 'zod';

export const AboutSchema = z.object({
  theCourse: z.array(z.string()).optional(),
  youtubeChannelUrl: z.string().optional(),
  studentPerspective: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  units: z.string().optional(),
});

export type AboutData = z.infer<typeof AboutSchema>;
