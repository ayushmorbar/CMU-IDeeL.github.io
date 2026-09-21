import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { dump } from 'js-yaml';
import { parseLecturesFromHtml, parseRecitationsFromHtml, parseAssignmentsFromHtml } from './html-extractors.js';

export function migrateSingleMonolithicSemester(term) {
  const rootDir = process.cwd();
  const indexHtmlPath = path.join(rootDir, term, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`Cannot find ${indexHtmlPath}`);
    return;
  }

  const outDir = path.join(rootDir, 'content', 'semesters', term);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`\n========================================`);
  console.log(`Migrating monolithic semester: ${term}`);
  console.log(`========================================`);

  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  const $ = cheerio.load(html);

  // 1. Semester Metadata
  let termTitle = term.startsWith('S') ? `Spring 20${term.slice(1)}` : `Fall 20${term.slice(1)}`;
  const subtitleMatch = $('.subtitle i').first().text().trim();
  if (subtitleMatch) termTitle = subtitleMatch;

  let zoomLink = '';
  const zoomHref = $('a[href*="zoom"]').attr('href');
  if (zoomHref) zoomLink = zoomHref;

  let venue = 'Giant Eagle Auditorium, Baker Hall (A51)';
  const venueText = $('p:contains("In-Person Venue:")').text();
  if (venueText) {
    venue = venueText.replace(/In-Person Venue:\s*/i, '').trim();
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

  // 2. Deadlines / Active Bulletin
  const deadlines = [];
  let bulletinCount = 0;
  $('h2').each((i, h2) => {
    if ($(h2).text().includes('Active Deadlines')) {
      const table = $(h2).nextAll('.table-responsive').first().find('table');
      table.find('tbody tr').each((rIdx, tr) => {
        const text = $(tr).text().replace(/\s+/g, ' ').trim();
        if (!text) return;
        const links = [];
        $(tr).find('a').each((_, a) => {
          const lText = $(a).text().trim();
          const lHref = $(a).attr('href');
          if (lHref && lText) {
            links.push({ label: lText, url: lHref });
          }
        });

        // First td is assignment
        const tds = $(tr).find('td');
        const asg = $(tds[0]).text().trim() || 'Notice';
        const desc = tds.length >= 3 ? $(tds[tds.length - 2]).text().trim() : text;

        deadlines.push({
          id: `item-${bulletinCount++}`,
          assignment: asg,
          deadlines: [],
          description: desc,
          links: links.length > 0 ? links : [{ label: 'Details', url: '#title' }]
        });
      });
    }
  });

  if (deadlines.length === 0) {
    deadlines.push({
      id: 'resources',
      assignment: 'Resource Links',
      deadlines: [],
      description: 'Course resources and links',
      links: [{ label: 'Project Gallery', url: '/shared/project.html' }]
    });
  }
  fs.writeFileSync(path.join(outDir, 'deadlines.yaml'), dump(deadlines, { lineWidth: -1 }));

  // 3. Staff
  const instructors = [];
  const coreTAs = [];
  const supportTAs = [];

  $('b:contains("Instructors:"), b:contains("Instructor:")').each((_, b) => {
    $(b).parent().next('ul').find('li').each((_, li) => {
      const parts = $(li).text().split(':');
      if (parts.length >= 2) {
        instructors.push({ name: parts[0].trim(), email: parts[1].trim() });
      } else if ($(li).text().trim()) {
        instructors.push({ name: $(li).text().trim(), email: 'idl-staff@cs.cmu.edu' });
      }
    });
  });

  $('b:contains("Core Instruction TAs:"), b:contains("TAs:")').each((_, b) => {
    $(b).parent().next('ul').find('li').each((_, li) => {
      const parts = $(li).text().split(':');
      if (parts.length >= 2) {
        coreTAs.push({ name: parts[0].trim(), email: parts[1].trim() });
      } else if ($(li).text().trim()) {
        coreTAs.push({ name: $(li).text().trim(), email: 'idl-ta@cs.cmu.edu' });
      }
    });
  });

  $('b:contains("Support TAs:")').each((_, b) => {
    $(b).parent().next('ul').find('li').each((_, li) => {
      const parts = $(li).text().split(':');
      if (parts.length >= 2) {
        supportTAs.push({ name: parts[0].trim(), email: parts[1].trim() });
      }
    });
  });

  if (instructors.length === 0) {
    instructors.push({ name: 'Bhiksha Raj', email: 'bhiksha@cs.cmu.edu' });
    instructors.push({ name: 'Rita Singh', email: 'rsingh@cs.cmu.edu' });
  }

  const staffImages = [];
  const imgDir = path.join(rootDir, term, 'images');
  if (fs.existsSync(imgDir)) {
    const files = fs.readdirSync(imgDir).filter(f => f.startsWith('TA_'));
    for (const f of files) {
      staffImages.push({
        src: `./images/${f}`,
        alt: `${term} Course Staff`,
        caption: `${termTitle} Teaching Staff`
      });
    }
  }

  const staffData = {
    instructors,
    shadowInstructors: [],
    headTAs: [],
    coreTAs,
    supportTAs: supportTAs.length > 0 ? supportTAs : undefined,
    images: staffImages,
    pastTAsUrl: '../shared/TAs.html'
  };
  fs.writeFileSync(path.join(outDir, 'staff.yaml'), dump(staffData, { lineWidth: -1 }));

  // 4. Events
  const iframes = $('iframe').map((_, el) => $(el).attr('src')).get().filter(s => s && s.includes('calendar.google.com'));
  const eventCalendarUrl = iframes[0] || 'https://calendar.google.com/calendar/embed?src=c_b802e86af4e2a5050e095b1f4b567d2380acda621b8e468c8d2b3527f4811f35%40group.calendar.google.com&ctz=America%2FNew_York';
  const ohCalendarUrl = iframes[1] || 'https://calendar.google.com/calendar/embed?src=c_0f69c21b0beb30e468022d49c18b81a6e4ded6512548585f1ceeb9755de0f9bd%40group.calendar.google.com&ctz=America%2FNew_York';

  const eventsData = {
    lectures: 'Monday and Wednesday, 8:00 a.m. - 9:20 a.m. - Good times :)',
    recitations: 'Friday, 8:00 a.m. - 9:20 a.m.',
    officeHours: 'Please refer to the OH Calendar / Piazza for up-to-date information.',
    hackathons: {
      location: '6501 Gates-Hillman',
      time: 'Saturday 2-5 PM EST',
      description: "During 'Homework Hackathons', students will be assisted with homework by the course staff. It is recommended to come as study groups."
    },
    eventCalendarUrl,
    ohCalendarUrl
  };
  fs.writeFileSync(path.join(outDir, 'events.yaml'), dump(eventsData, { lineWidth: -1 }));

  // 5. About
  const aboutData = {
    theCourse: [
      '“Deep Learning” systems, typified by deep neural networks, are increasingly taking over all the AI tasks, ranging from language understanding, speech and image recognition, to machine translation, planning, and even game playing and autonomous driving. As a result, expertise in deep learning is fast changing from an esoteric desirable to a mandatory prerequisite in many advanced academic settings, and a large advantage in the industrial job market.',
      'In this course we will learn about the basics of deep neural networks, and their applications to various AI tasks. By the end of the course, it is expected that students will have significant familiarity with the subject, and be able to apply Deep Learning to a variety of tasks. They will also be positioned to understand much of the current literature on the topic and extend their knowledge through further study.',
      'If you are only interested in the lectures, you can watch them on the YouTube channel.'
    ],
    youtubeChannelUrl: 'https://www.youtube.com/channel/UC8hYZGEkI2dDO8scT8C5UQA',
    studentPerspective: "The course is well rounded in terms of concepts. It helps us understand the fundamentals of Deep Learning. The course starts off gradually with MLPs and it progresses into the more complicated concepts such as attention and sequence-to-sequence models. We get a complete hands on with PyTorch which is very important to implement Deep Learning models. As a student, you will learn the tools required for building Deep Learning models. The homeworks usually have 2 components which is Autolab and Kaggle. The Kaggle components allow us to explore multiple architectures and understand how to fine-tune and continuously improve models. The task for all the homeworks were similar and it was interesting to learn how the same task can be solved using multiple Deep Learning approaches. Overall, at the end of this course you will be confident enough to build and tune Deep Learning models.",
    prerequisites: [
      'We will be using Numpy and PyTorch in this class, so you will need to be able to program in python3.',
      'You will need familiarity with basic calculus (differentiation, chain rule), linear algebra, and basic probability.'
    ],
    units: 'Courses 11-785 and 11-685 are equivalent 12-unit graduate courses, and have a final project and a guided project respectively. Course 11-485 is the undergraduate version worth 9 units, the only difference being that there is no final project nor guided project.'
  };
  fs.writeFileSync(path.join(outDir, 'about.yaml'), dump(aboutData, { lineWidth: -1 }));

  // 6. Tables Data (Lectures, Recitations, Assignments)
  const lectures = parseLecturesFromHtml(html);
  fs.writeFileSync(path.join(outDir, 'lectures.yaml'), dump({ lectures }, { lineWidth: -1 }));

  const recitations = parseRecitationsFromHtml(html);
  fs.writeFileSync(path.join(outDir, 'recitations.yaml'), dump(recitations, { lineWidth: -1 }));

  const assignments = parseAssignmentsFromHtml(html);
  fs.writeFileSync(path.join(outDir, 'assignments.yaml'), dump(assignments, { lineWidth: -1 }));

  // 7. Syllabus
  const syllabusData = {
    policies: [
      {
        category: 'Score Assignment',
        description: 'Grading will be based on weekly quizzes (24%), homeworks (50%) and a course project (25%). Note that 1% of your grade is assigned to Attendance.'
      },
      {
        category: 'Quizzes',
        description: 'There will be weekly quizzes. We will retain your best 12 out of the remaining 14 quizzes. Quizzes are scored by the number of correct answers and are worth 24% of your overall score.'
      },
      {
        category: 'Assignments',
        description: 'There will be four/five assignments in all, plus the Peer Review assignment during the last week of the semester. Assignments carry 50% of your total score.'
      },
      {
        category: 'Course Project',
        description: 'All students taking a graduate version of the course are required to do a course project. The project is worth 25% of your grade.'
      },
      {
        category: 'Attendance',
        description: 'If you are in section A you are expected to attend in-person lectures. We will track attendance.'
      },
      {
        category: 'Grading & Curves',
        description: 'The end-of-term grade is curved. Your overall grade will depend on your performance relative to your classmates.'
      }
    ],
    resources: [
      {
        title: 'Study Groups',
        description: 'We believe that effective collaboration can greatly enhance student learning. It is highly recommended that you join a study group.'
      },
      {
        title: 'Discussion Forum',
        description: 'Piazza / Canvas is used for course discussion and questions.',
        link: { text: 'Class Forum', url: 'https://piazza.com' }
      },
      {
        title: 'AutoLab',
        description: 'AutoLab is used to test your understanding of low-level concepts from scratch.'
      },
      {
        title: 'Kaggle',
        description: 'Kaggle is where we test your understanding and ability to extend neural network architectures.',
        link: { text: 'Kaggle', url: 'https://kaggle.com' }
      },
      {
        title: 'Academic Integrity',
        description: 'You are expected to comply with the University Policy on Academic Integrity and Plagiarism.',
        link: { text: 'CMU Academic Integrity Policy', url: 'https://www.cmu.edu/policies/student-and-student-life/academic-integrity.html' }
      }
    ]
  };
  fs.writeFileSync(path.join(outDir, 'syllabus.yaml'), dump(syllabusData, { lineWidth: -1 }));
  fs.writeFileSync(path.join(outDir, 'syllabus.md'), `# Syllabus & Course Policies for ${termTitle}\n\nAll grading policies, quizzes, project guidelines, and homework requirements for ${termTitle}.`);

  console.log(`✓ Completed migration for ${term}: ${lectures.length} lectures, ${recitations.recitations.length} recitations, ${assignments.assignment_groups.length} assignment groups.`);
}
