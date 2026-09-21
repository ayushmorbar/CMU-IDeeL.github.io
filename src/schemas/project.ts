import { z } from 'zod';

export const ProjectIdeaSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  mentors: z.string().optional(),
  description: z.string(),
  paper: z.string().optional().default(''),
  dataset: z.string().optional().default(''),
  code: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  icon: z.string().default('fas fa-cubes'),
  color: z.string().default('#A80000'),
});

export const LegacyProjectArchiveSchema = z.object({
  semester: z.string(),
  code: z.string(),
  description: z.string(),
  reportsUrl: z.string(),
  videosUrl: z.string().optional().default(''),
});

export const ProjectsDataSchema = z.object({
  projects: z.array(ProjectIdeaSchema),
  legacyArchives: z.array(LegacyProjectArchiveSchema).default([]),
});

export type ProjectIdea = z.infer<typeof ProjectIdeaSchema>;
export type LegacyProjectArchive = z.infer<typeof LegacyProjectArchiveSchema>;
export type ProjectsData = z.infer<typeof ProjectsDataSchema>;
