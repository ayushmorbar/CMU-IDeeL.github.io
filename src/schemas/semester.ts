import { z } from 'zod';

export const SemesterSchema = z.object({
  id: z.string(),
  courseNumber: z.string().default('11-785'),
  title: z.string(),
  term: z.string(),
  venue: z.string(),
  zoomLink: z.string().optional(),
  piazzaLink: z.string().optional(),
  mediaServicesLink: z.string().optional(),
});

export type Semester = z.infer<typeof SemesterSchema>;
