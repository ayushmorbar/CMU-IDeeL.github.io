import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { type AboutData, AboutSchema } from '../schemas/about';
import {
  type AssignmentsData,
  AssignmentsDataSchema,
} from '../schemas/assignment';
import { type GlobalConfig, GlobalConfigSchema } from '../schemas/config';
import { type DeadlineItem, DeadlinesSchema } from '../schemas/deadline';
import { type EventSchedule, EventScheduleSchema } from '../schemas/event';
import { type LectureItem, LecturesDataSchema } from '../schemas/lecture';
import { TextbooksSchema } from '../schemas/recitation';
import { type Semester, SemesterSchema } from '../schemas/semester';
import { type StaffData, StaffSchema } from '../schemas/staff';
import { type SyllabusData, SyllabusDataSchema } from '../schemas/syllabus';

const CONTENT_DIR = path.resolve(process.cwd(), 'content');

export type { GlobalConfig };

export function getConfig(): GlobalConfig {
  const file = path.join(CONTENT_DIR, 'config.yaml');
  const raw = fs.readFileSync(file, 'utf-8');
  return GlobalConfigSchema.parse(load(raw));
}

export function getAllSemesters(): string[] {
  const semestersDir = path.join(CONTENT_DIR, 'semesters');
  if (!fs.existsSync(semestersDir)) return [];
  return fs.readdirSync(semestersDir).filter((file) => {
    return fs.statSync(path.join(semestersDir, file)).isDirectory();
  });
}

export function getSemester(term: string): Semester {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'semester.yaml');
  const raw = fs.readFileSync(file, 'utf-8');
  return SemesterSchema.parse(load(raw));
}

export function getDeadlines(term: string): DeadlineItem[] {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'deadlines.yaml');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  return DeadlinesSchema.parse(load(raw));
}

export function getLectures(term: string): LectureItem[] {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'lectures.yaml');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  const parsed = LecturesDataSchema.parse(load(raw));
  return parsed.lectures;
}

export function getRecitations(term: string): {
  recitations_0?: any[];
  recitations?: any[];
} {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'recitations.yaml');
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf-8');
  return (load(raw) as any) || {};
}

export function getTextbooks(): any[] {
  const file = path.join(CONTENT_DIR, 'common', 'textbooks.yaml');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  return TextbooksSchema.parse(load(raw));
}

export function getSyllabusData(term: string): SyllabusData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'syllabus.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  return SyllabusDataSchema.parse(load(raw));
}

export function getAbout(term: string): AboutData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'about.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  return AboutSchema.parse(load(raw));
}

export function getStaff(term: string): StaffData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'staff.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  return StaffSchema.parse(load(raw));
}

export function getEvents(term: string): EventSchedule | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'events.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  return EventScheduleSchema.parse(load(raw));
}

export function getAssignments(term: string): AssignmentsData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'assignments.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  return AssignmentsDataSchema.parse(load(raw));
}
