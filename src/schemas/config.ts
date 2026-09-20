import { z } from 'zod';

export const SemesterEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  isCurrent: z.boolean(),
});

export const GlobalConfigSchema = z.object({
  currentSemester: z.string(),
  semesters: z.array(SemesterEntrySchema),
});

export type SemesterEntry = z.infer<typeof SemesterEntrySchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
