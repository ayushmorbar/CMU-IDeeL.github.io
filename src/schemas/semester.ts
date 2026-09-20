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
  supportedBy: z
    .object({
      label: z.string().default('Supported by'),
      logo: z.string(),
      alt: z.string().default('Google'),
    })
    .optional(),
});

export type Semester = z.infer<typeof SemesterSchema>;
