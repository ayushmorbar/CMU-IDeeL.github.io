import { z } from 'zod';

export const StaffMemberSchema = z.object({
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  website: z.string().optional(),
  officeHours: z.string().optional(),
});

export const StaffImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string(),
});

export const StaffSchema = z.object({
  instructors: z.array(StaffMemberSchema).optional(),
  shadowInstructors: z.array(StaffMemberSchema).optional(),
  headTAs: z.array(StaffMemberSchema).optional(),
  coreTAs: z.array(StaffMemberSchema).optional(),
  images: z.array(StaffImageSchema).optional(),
  pastTAsUrl: z.string().optional(),
});

export type StaffMember = z.infer<typeof StaffMemberSchema>;
export type StaffImage = z.infer<typeof StaffImageSchema>;
export type StaffData = z.infer<typeof StaffSchema>;
