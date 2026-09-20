import fs from 'node:fs';
import path from 'node:path';
import { load, dump } from 'js-yaml';

const term = process.argv[2];
if (!term) {
  console.error('Usage: node tools/migrate-semester.js <TERM>');
  process.exit(1);
}

const rootDir = process.cwd();
const termDir = path.join(rootDir, term);
if (!fs.existsSync(termDir)) {
  console.error(`Directory ${termDir} does not exist.`);
  process.exit(1);
}

const outDir = path.join(rootDir, 'content', 'semesters', term);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Migrating semester ${term} from ${termDir} to ${outDir}...`);

// Helper to find file in pages/ or page/
function findFile(relPaths) {
  for (const rel of relPaths) {
    const full = path.join(termDir, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

// 1. Semester Metadata
const indexHtmlPath = path.join(termDir, 'index.html');
const indexHtml = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf-8') : '';

let termTitle = term.startsWith('S') ? `Spring 20${term.slice(1)}` : `Fall 20${term.slice(1)}`;
let venue = 'Giant Eagle Auditorium, Baker Hall (A51)';
let zoomLink = '';

const subtitleMatch = indexHtml.match(/<div class="subtitle"><i>(.*?)<\/i>/i);
if (subtitleMatch) {
  termTitle = subtitleMatch[1].trim();
}

const zoomMatch = indexHtml.match(/href="([^"]*zoom[^"]*)"/i);
if (zoomMatch) {
  zoomLink = zoomMatch[1].replace(/&amp;/g, '&');
}

const venueMatch = indexHtml.match(/<p>\s*In-Person Venue:\s*([^<]+)<\/p>/i);
if (venueMatch) {
  venue = venueMatch[1].trim();
}

const semesterData = {
  id: term,
  courseNumber: '11-785',
  title: 'Introduction to Deep Learning',
  term: termTitle,
  venue,
  zoomLink: zoomLink || undefined,
  mediaServicesLink: `https://mediaservices.cmu.edu/channel/Introduction+to+Deep+Learning_${encodeURIComponent(termTitle)}/397642153`
};
fs.writeFileSync(path.join(outDir, 'semester.yaml'), dump(semesterData, { lineWidth: -1 }));

// 2. Logistics & Staff & Events & About
const logisticsPath = findFile(['pages/general_logistics.html', 'page/general_logistics.html']);
const logisticsHtml = logisticsPath ? fs.readFileSync(logisticsPath, 'utf-8') : '';

// Parse Staff
const staff = {
  instructors: [
    { name: 'Bhiksha Raj', email: 'bhiksha@cs.cmu.edu' },
    { name: 'Rita Singh', email: 'rsingh@cs.cmu.edu' }
  ],
  shadowInstructors: [],
  headTAs: [],
  coreTAs: [],
  images: [],
  pastTAsUrl: '../shared/TAs.html'
};

if (logisticsHtml) {
  // Shadow instructor
  const shadowMatch = logisticsHtml.match(/Shadow Instructor:[\s\S]*?<li><b>([^<]+)<\/b>:\s*([^<]+)<\/li>/i);
  if (shadowMatch) {
    staff.shadowInstructors.push({ name: shadowMatch[1].trim(), email: shadowMatch[2].trim() });
  }

  // Head TA
  const headMatch = logisticsHtml.match(/Head TA:[\s\S]*?<li><b>([^<]+)<\/b>:\s*([^<]+)<\/li>/i);
  if (headMatch) {
    staff.headTAs.push({ name: headMatch[1].trim(), email: headMatch[2].trim() });
  }

  // Core TAs
  const coreSection = logisticsHtml.match(/Core Instruction TAs:[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
  if (coreSection) {
    const taMatches = [...coreSection[1].matchAll(/<li><b>([^<]+)<\/b>:\s*([^<]+)<\/li>/gi)];
    for (const m of taMatches) {
      staff.coreTAs.push({ name: m[1].trim(), email: m[2].trim() });
    }
  }

  // Images in logistics
  const imgMatches = [...logisticsHtml.matchAll(/<img[^>]+src=["'](\.\/images\/[^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi)];
  for (const m of imgMatches) {
    const src = m[1];
    const alt = m[2];
    staff.images.push({
      src,
      alt: alt || `${term} TAs`,
      caption: alt ? `${term} Teaching Staff` : `Course Staff for ${term}`
    });
  }
}

// Fallback images if none found
if (staff.images.length === 0) {
  const imgDir = path.join(termDir, 'images');
  if (fs.existsSync(imgDir)) {
    const taImgs = fs.readdirSync(imgDir).filter(f => f.startsWith('TA_'));
    for (const f of taImgs) {
      staff.images.push({
        src: `./images/${f}`,
        alt: `${term} TAs`,
        caption: `${term} Course Staff`
      });
    }
  }
}
fs.writeFileSync(path.join(outDir, 'staff.yaml'), dump(staff, { lineWidth: -1 }));

// Events & Calendars
const events = {
  lectures: 'Monday and Wednesday, 8:00 a.m – 9:20 a.m Eastern Standard Time (EST). More information in the Event Calendar below.',
  recitations: 'Friday, 8:00 a.m – 9:20 a.m Eastern Standard Time (EST). More information in the Event Calendar below.',
  officeHours: 'Please refer to the OH Calendar below for up-to-date information.',
  hackathons: {
    location: 'Gates-Hillman Center 6115',
    time: 'Saturdays 2:00 p.m – 5:00 p.m Eastern Standard Time (EST)',
    description: "During 'Homework Hackathons', students will be assisted with homework by the course staff. It is recommended to come as study groups."
  },
  eventCalendarUrl: 'https://calendar.google.com/calendar/embed?src=c_b802e86af4e2a5050e095b1f4b567d2380acda621b8e468c8d2b3527f4811f35%40group.calendar.google.com&ctz=America%2FNew_York',
  ohCalendarUrl: 'https://calendar.google.com/calendar/embed?src=c_0f69c21b0beb30e468022d49c18b81a6e4ded6512548585f1ceeb9755de0f9bd%40group.calendar.google.com&ctz=America%2FNew_York'
};

if (logisticsHtml) {
  const hackLocation = logisticsHtml.match(/Location:\s*<b>\s*<strong>\s*([^<]+)<\/strong>/i) || logisticsHtml.match(/Location:\s*<b>\s*([^<]+)<\/b>/i);
  if (hackLocation) {
    events.hackathons.location = hackLocation[1].trim();
  }
  const calendarMatches = [...logisticsHtml.matchAll(/src=["'](https:\/\/calendar\.google\.com\/calendar\/embed\?[^"']+)["']/gi)];
  if (calendarMatches.length >= 1) {
    events.eventCalendarUrl = calendarMatches[0][1].replace(/&amp;/g, '&');
  }
  if (calendarMatches.length >= 2) {
    events.ohCalendarUrl = calendarMatches[1][1].replace(/&amp;/g, '&');
  }
}
fs.writeFileSync(path.join(outDir, 'events.yaml'), dump(events, { lineWidth: -1 }));

// About
const about = {
  theCourse: [
    '“Deep Learning” systems, typified by deep neural networks, are increasingly taking over all the AI tasks, ranging from language understanding, speech and image recognition, to machine translation, planning, and even game playing and autonomous driving. As a result, expertise in deep learning is fast changing from an esoteric desirable to a mandatory prerequisite in many advanced academic settings, and a large advantage in the industrial job market.',
    'In this course we will learn about the basics of deep neural networks, and their applications to various AI tasks. By the end of the course, it is expected that students will have significant familiarity with the subject, and be able to apply Deep Learning to a variety of tasks. They will also be positioned to understand much of the current literature on the topic and extend their knowledge through further study.',
    'If you are only interested in the lectures, you can watch them on the YouTube channel.'
  ],
  youtubeChannelUrl: 'https://www.youtube.com/channel/UC8hYZGEkI2dDO8scT8C5UQA',
  studentPerspective: "The course is well rounded in terms of concepts. It helps us understand the fundamentals of Deep Learning. The course starts off gradually with MLPs and it progresses into the more complicated concepts such as attention and sequence-to-sequence models. We get a complete hands on with PyTorch which is very important to implement Deep Learning models. As a student, you will learn the tools required for building Deep Learning models. The homeworks usually have 2 components which is Autolab and Kaggle. The Kaggle components allow us to explore multiple architectures and understand how to fine-tune and continuously improve models. The task for all the homeworks were similar and it was interesting to learn how the same task can be solved using multiple Deep Learning approaches. Overall, at the end of this course you will be confident enough to build and tune Deep Learning models.",
  prerequisites: [
    'We will use Numpy and PyTorch in this class, so you will need to be able to program in python3.',
    'You will need familiarity with basic calculus (differentiation, chain rule), linear algebra, and basic probability.'
  ],
  units: 'Courses 11-785 and 11-685 are equivalent 12-unit graduate courses, and have a final project and a guided project respectively. Course 11-485 is the undergraduate version worth 9 units, the only difference being that there is no final project nor guided project.'
};
fs.writeFileSync(path.join(outDir, 'about.yaml'), dump(about, { lineWidth: -1 }));

// Deadlines & Bulletin
const deadlines = [
  {
    id: 'hw1p1',
    assignment: 'HW1 P1',
    deadlines: [
      { label: 'Early Submission', date: 'Early Submission: Friday, Sep 4, 11:59 PM' },
      { label: 'Final Submission', date: 'Final Submission: Friday, Sep 18, 11:59 PM' }
    ],
    description: 'Implementing and training an MLP from scratch',
    links: [
      { label: 'Gradescope Submission', url: 'https://www.gradescope.com/courses/1315509' }
    ]
  },
  {
    id: 'hw1p2',
    assignment: 'HW1 P2',
    deadlines: [
      { label: 'Checkpoint Submission', date: 'Checkpoint Submission: Friday, Sept 4, 11:59 PM' },
      { label: 'Final Submission', date: 'Final Submission: Friday, Sep 18, 11:59 PM' }
    ],
    description: 'Phoneme state labelling using MLPs',
    links: [
      { label: 'Gradescope Submission', url: 'https://www.gradescope.com/courses/1315509' }
    ]
  },
  {
    id: 'resources',
    assignment: 'Resource Links',
    deadlines: [],
    description: 'Quick access to piazza and project resources',
    links: [
      { label: 'Important Piazza Posts Finder', url: 'https://piazza.com' },
      { label: 'Projects Page', url: '../shared/project.html' }
    ]
  }
];
fs.writeFileSync(path.join(outDir, 'deadlines.yaml'), dump(deadlines, { lineWidth: -1 }));

// 3. Tables Data (Lectures, Recitations, Assignments)
const lecturesFile = findFile(['pages/tables_data/lectures.yaml', 'page/tables_data/lectures.yaml', 'data/lectures.yaml']);
if (lecturesFile) {
  const raw = fs.readFileSync(lecturesFile, 'utf-8');
  const data = load(raw);
  // Ensure array
  const lecs = data.lectures || data || [];
  fs.writeFileSync(path.join(outDir, 'lectures.yaml'), dump({ lectures: lecs }, { lineWidth: -1 }));
} else {
  // Copy F26 as fallback template
  const f26Lec = path.join(rootDir, 'content/semesters/F26/lectures.yaml');
  fs.copyFileSync(f26Lec, path.join(outDir, 'lectures.yaml'));
}

const recitationsFile = findFile(['pages/tables_data/recitations.yaml', 'page/tables_data/recitations.yaml', 'data/recitations.yaml']);
if (recitationsFile) {
  const raw = fs.readFileSync(recitationsFile, 'utf-8');
  fs.writeFileSync(path.join(outDir, 'recitations.yaml'), raw);
} else {
  const f26Rec = path.join(rootDir, 'content/semesters/F26/recitations.yaml');
  fs.copyFileSync(f26Rec, path.join(outDir, 'recitations.yaml'));
}

const assignmentsFile = findFile(['pages/tables_data/assignments.yaml', 'page/tables_data/assignments.yaml', 'data/assignments.yaml']);
if (assignmentsFile) {
  const raw = fs.readFileSync(assignmentsFile, 'utf-8');
  fs.writeFileSync(path.join(outDir, 'assignments.yaml'), raw);
} else {
  const f26Asg = path.join(rootDir, 'content/semesters/F26/assignments.yaml');
  fs.copyFileSync(f26Asg, path.join(outDir, 'assignments.yaml'));
}

// 4. Syllabus
const syllabusFile = findFile(['pages/syllabus.html', 'page/syllabus.html']);
const syllabusMd = `# Syllabus & Course Policies for ${termTitle}\n\nAll grading policies, quizzes, project guidelines, and homework requirements for ${termTitle}.`;
fs.writeFileSync(path.join(outDir, 'syllabus.md'), syllabusMd);

console.log(`Successfully generated content for ${term}!`);
