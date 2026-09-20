import { z } from 'zod';

export const EventScheduleSchema = z.object({
  lectures: z.string().optional(),
  recitations: z.string().optional(),
  officeHours: z.string().optional(),
  hackathons: z
    .object({
      location: z.string().optional(),
      time: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  eventCalendarUrl: z.string().optional(),
  ohCalendarUrl: z.string().optional(),
});

export type EventSchedule = z.infer<typeof EventScheduleSchema>;
