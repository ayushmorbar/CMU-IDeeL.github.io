import { z } from 'zod';

export const AssignmentMaterialSchema = z.object({
  text: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

export const AssignmentDetailSchema = z.object({
  name: z.string(),
  due_date: z.string().optional().default(''),
  due_date_rowspan: z.number().optional(),
  materials: z.array(AssignmentMaterialSchema).default([]),
});

export const AssignmentGroupSchema = z.object({
  release_date: z.string(),
  assignments: z.array(AssignmentDetailSchema),
});

export const AssignmentsDataSchema = z.object({
  assignment_groups: z.array(AssignmentGroupSchema),
});

export type AssignmentsData = z.infer<typeof AssignmentsDataSchema>;
