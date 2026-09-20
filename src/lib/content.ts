import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { SemesterSchema, type Semester } from '../schemas/semester';
import { DeadlinesSchema, type DeadlineItem } from '../schemas/deadline';
import { LecturesDataSchema, type LectureItem } from '../schemas/lecture';
import { TextbooksSchema } from '../schemas/recitation';
import { AboutSchema, type AboutData } from '../schemas/about';
import { StaffSchema, type StaffData } from '../schemas/staff';
import { EventScheduleSchema, type EventSchedule } from '../schemas/event';
import { AssignmentsDataSchema, type AssignmentsData } from '../schemas/assignment';

const CONTENT_DIR = path.resolve(process.cwd(), 'content');

export interface GlobalConfig {
  currentSemester: string;
  semesters: Array<{
    id: string;
    title: string;
    isCurrent: boolean;
  }>;
}

export function getConfig(): GlobalConfig {
  const file = path.join(CONTENT_DIR, 'config.yaml');
  const raw = fs.readFileSync(file, 'utf-8');
  return load(raw) as GlobalConfig;
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
  const data = load(raw);
  return SemesterSchema.parse(data);
}

export function getDeadlines(term: string): DeadlineItem[] {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'deadlines.yaml');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return DeadlinesSchema.parse(data);
}

export function getLectures(term: string): LectureItem[] {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'lectures.yaml');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  const parsed = LecturesDataSchema.parse(data);
  return parsed.lectures;
}

export function getRecitations(term: string): { recitations_0?: any[]; recitations?: any[] } {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'recitations.yaml');
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf-8');
  return (load(raw) as any) || {};
}

export function getTextbooks(): any[] {
  const file = path.join(CONTENT_DIR, 'common', 'textbooks.yaml');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return TextbooksSchema.parse(data);
}

import { SyllabusDataSchema, type SyllabusData } from '../schemas/syllabus';

export function getSyllabusData(term: string): SyllabusData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'syllabus.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return SyllabusDataSchema.parse(data);
}

export function getSyllabus(term: string): string {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'syllabus.md');
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf-8');
}

export function getAbout(term: string): AboutData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'about.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return AboutSchema.parse(data);
}

export function getStaff(term: string): StaffData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'staff.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return StaffSchema.parse(data);
}

export function getEvents(term: string): EventSchedule | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'events.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return EventScheduleSchema.parse(data);
}

export function getAssignments(term: string): AssignmentsData | undefined {
  const file = path.join(CONTENT_DIR, 'semesters', term, 'assignments.yaml');
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf-8');
  const data = load(raw);
  return AssignmentsDataSchema.parse(data);
}
