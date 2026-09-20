import fs from 'node:fs';
import path from 'node:path';
import { load, dump } from 'js-yaml';

const term = 'F25';
const rootDir = process.cwd();
const termDir = path.join(rootDir, term);
const outDir = path.join(rootDir, 'content', 'semesters', term);

console.log('Migrating F25...');

// 1. Semester metadata
const semesterData = {
  id: 'F25',
  courseNumber: '11-785',
  title: 'Introduction to Deep Learning',
  term: 'Fall 2025',
  venue: 'Giant Eagle Auditorium, Baker Hall (A51)',
  zoomLink: 'https://cmu.zoom.us/j/98857399276?pwd=ems3MzMvMjNQYkZzdTAyWGdVRGZSUT09',
  mediaServicesLink: 'https://mediaservices.cmu.edu/channel/Introduction%2Bto%2BDeep%2BLearning_Fall%2B2025/385611772'
};
fs.writeFileSync(path.join(outDir, 'semester.yaml'), dump(semesterData, { lineWidth: -1 }));

// 2. Deadlines: F25 active bulletin has Project Gallery
const deadlinesData = [
  {
    id: 'resources',
    assignment: 'Resource Links',
    deadlines: [],
    description: 'Quick access to project gallery and resources',
    links: [
      { label: 'Project Gallery', url: '../shared/project.html' }
    ]
  }
];
fs.writeFileSync(path.join(outDir, 'deadlines.yaml'), dump(deadlinesData, { lineWidth: -1 }));

// 3. Staff from F25/page/general_logistics.html
const staffData = {
  instructors: [
    { name: 'Bhiksha Raj', email: 'bhiksha@cs.cmu.edu' },
    { name: 'Rita Singh', email: 'rsingh@cs.cmu.edu' }
  ],
  shadowInstructors: [],
  headTAs: [],
  coreTAs: [
    { name: 'Miya Sylvester', email: 'nsylvest@andrew.cmu.edu' },
    { name: 'Rutvik Joshi', email: 'rutvikj@andrew.cmu.edu' },
    { name: 'Shravanth Srinivas', email: 'shravans@andrew.cmu.edu' },
    { name: 'Yuzhou Wang', email: 'yuzhouwa@andrew.cmu.edu' },
    { name: 'Massa Baali', email: 'mbaali@andrew.cmu.edu' },
    { name: 'Mengchun Zhang', email: 'mengchuz@andrew.cmu.edu' },
    { name: 'Michael Kireeff', email: 'mkireeff@andrew.cmu.edu' },
    { name: 'Sophia Wang', email: 'sophiaw3@andrew.cmu.edu' },
    { name: 'Ishita Gupta', email: 'ishitag@andrew.cmu.edu' },
    { name: 'Sreeharsha Paruchuri', email: 'sparuchu@andrew.cmu.edu' },
    { name: 'Aisha Opaluwa', email: 'aopaluwa@andrew.cmu.edu' },
    { name: 'Ahmed Alhassan', email: 'aalhassa@andrew.cmu.edu' },
    { name: 'Kipngeno Koech', email: 'bkoech@andrew.cmu.edu' },
    { name: 'Nayesha Gandotra', email: 'nayeshag@andrew.cmu.edu' },
    { name: 'Haojia Sun', email: 'haojias@andrew.cmu.edu' },
    { name: 'Yuanyi Gao', email: 'yuanyig@andrew.cmu.edu' },
    { name: 'Euijin Hong', email: 'ehong@andrew.cmu.edu' },
    { name: 'Dhivya Sreedhar', email: 'dsreedha@andrew.cmu.edu' },
    { name: 'Chaeeun Lee', email: 'chaeeunl@andrew.cmu.edu' }
  ],
  supportTAs: [
    { name: 'Shubham Kachroo', email: 'skachroo@andrew.cmu.edu' },
    { name: 'Ahmed Issah', email: 'aissah@andrew.cmu.edu' },
    { name: 'Tanghang Elvis Tata', email: 'etanghan@andrew.cmu.edu' },
    { name: 'Mona Aman', email: 'amona@andrew.cmu.edu' },
    { name: 'Peter Wauyo', email: 'pwauyo@andrew.cmu.edu' },
    { name: 'Ahmed Safwat Abouhashem', email: 'a.s.a@pitt.edu' },
    { name: 'delphine nyaboke', email: 'delphinenyaboke@gmail.com' },
    { name: 'Carmel Sagbo', email: 'csagbo@andrew.cmu.edu' },
    { name: 'Bradley Warren', email: 'bwarren2@andrew.cmu.edu' },
    { name: 'Maxime Manzi', email: 'mmanzi@andrew.cmu.edu' }
  ],
  images: [],
  pastTAsUrl: '../shared/TAs.html'
};

// Check for TA images in F25/images
const imgDir = path.join(termDir, 'images');
if (fs.existsSync(imgDir)) {
  const imgs = fs.readdirSync(imgDir).filter(f => f.startsWith('TA_'));
  for (const f of imgs) {
    staffData.images.push({
      src: `./images/${f}`,
      alt: 'F25 TAs',
      caption: 'Fall 2025 Course Staff'
    });
  }
}
fs.writeFileSync(path.join(outDir, 'staff.yaml'), dump(staffData, { lineWidth: -1 }));

// 4. Events
const eventsData = {
  lectures: 'Monday and Wednesday, 8:00 a.m. - 9:20 a.m. - Good times :)',
  recitations: 'Friday, 8:00 a.m. - 9:20 a.m.',
  officeHours: 'Please refer to the OH Calendar / Piazza for up-to-date information.',
  hackathons: {
    location: '6501 Gates-Hillman',
    time: 'Saturday 2-5 PM EST',
    description: "During 'Homework Hackathons', students will be assisted with homework by the course staff. It is recommended to come as study groups."
  },
  eventCalendarUrl: 'https://calendar.google.com/calendar/embed?src=c_b802e86af4e2a5050e095b1f4b567d2380acda621b8e468c8d2b3527f4811f35%40group.calendar.google.com&ctz=America%2FNew_York',
  ohCalendarUrl: 'https://calendar.google.com/calendar/embed?src=c_0f69c21b0beb30e468022d49c18b81a6e4ded6512548585f1ceeb9755de0f9bd%40group.calendar.google.com&ctz=America%2FNew_York'
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

// 6. Tables data: Copy authentic YAML files from F25/page/tables_data/
fs.copyFileSync(path.join(termDir, 'page/tables_data/lectures.yaml'), path.join(outDir, 'lectures.yaml'));
fs.copyFileSync(path.join(termDir, 'page/tables_data/recitations.yaml'), path.join(outDir, 'recitations.yaml'));
fs.copyFileSync(path.join(termDir, 'page/tables_data/assignments.yaml'), path.join(outDir, 'assignments.yaml'));

// 7. Syllabus
const syllabusData = {
  policies: [
    {
      category: 'Score Assignment',
      description: 'Grading will be based on weekly quizzes (24%), homeworks (50%) and a course project (25%). Note that 1% of your grade is assigned to Attendance.'
    },
    {
      category: 'Quizzes',
      description: 'There will be weekly quizzes.',
      items: [
        'We will retain your best 12 out of the remaining 14 quizzes.',
        'Quizzes will generally (but not always) be released on Friday and due 48 hours later.',
        'Quizzes are scored by the number of correct answers.',
        'Quizzes will be worth 24% of your overall score.'
      ]
    },
    {
      category: 'Assignments',
      description: 'There will be four assignments in all, plus the Peer Review assignment during the last week of the semester. Assignments will include Autolab components, where you implement low-level operations, and a Kaggle component, where you compete with your colleagues over relevant DL tasks.',
      items: [
        'Autolab components are scored according to the number of correctly completed parts.',
        'We will post performance cutoffs for HIGH (90%), MEDIUM (70%), LOW (50%), and VERY LOW (30%) for Kaggle competitions. Scores will be interpolated linearly between these cutoffs.',
        'Early submission deadline: You are required to make at least one submission to Kaggle by this deadline. People who miss this deadline will automatically lose 10% of subsequent marks they may get on the homework.',
        'On-time deadline: People who submit by this deadline are eligible for up to five bonus points. These points will be computed by interpolation between the A cutoff and the highest performance obtained for the HW. The highest performance will get 105.',
        'Late deadline: People who submit after the on-time deadline can still submit until the late deadline. There is a 10% penalty applied to your final score, for submitting late.',
        'Slack days: Everyone gets up to 10 slack days, which they can distribute across all their homework P2s only. Once you use up your slack days you will fall into the late-submission category by default. Slack days are accumulated over all parts of all homeworks.',
        'Kaggle scoring: We will use max(max(on-time score), max(slack-day score), 0.9*max(late-submission score)) as your final score for the HW.',
        'Assignments carry 50% of your total score, with each of the four HWs being worth 12.5%.',
        'A guided project will be released later in the course and will have the same weight as a course project.',
        'Bonus HWs will count towards the score of the correlating HWp1 assignment number.',
        'The Peer Review assignment is required of all students, 11-485/685/785. The task is for all students to review and grade 4-6 of the videos.'
      ]
    },
    {
      category: 'Project',
      description: 'Course project rules for graduate versions of the course.',
      items: [
        'All students taking a graduate version of the course are required to do a course project. The project is worth 25% of your grade. These points are distributed as follows: 20% - Midterm Report; 35% - Project Video; 5% - Responding to comments on Piazza; 40% - Project report.',
        'A Project is mandatory for 11-785 students. In the event of a catastrophe, the Project may be substituted with the guided project. 11-685 Students may choose to do a Project instead of the guided project.',
        'Important information for project reports and video presentations: see project rubrics spreadsheet.'
      ]
    },
    {
      category: 'Attendance',
      description: 'Attendance policy for Section A and remote sections.',
      items: [
        'If you are in section A you are expected to attend in-person lectures. We will track attendance.',
        'If you are in any of the other (out-of-timezone) sections, you must watch lectures live on zoom. CMU students who view on MediaServices must watch before Monday 8AM of the following week.',
        'At the end of the semester, we will select a random subset of lectures and tabulate attendance.',
        'If you have attended at least 70% of these (randomly chosen) lectures, you get the attendance point.'
      ]
    },
    {
      category: 'Final Grade',
      description: 'The end-of-term grade is curved. Your overall grade will depend on your performance relative to your classmates.'
    },
    {
      category: 'Pass/Fail',
      description: 'Students registered for pass/fail must complete all quizzes, HWs and if they are in the graduate course, the project. A grade equivalent to B- is required to pass the course.'
    },
    {
      category: 'Auditing',
      description: 'Auditors are not required to complete the course project, but must complete all quizzes and homeworks. We encourage doing a course project regardless.'
    }
  ],
  resources: [
    {
      title: 'Study Groups',
      description: 'We believe that effective collaboration can greatly enhance student learning. Thus, this course employs study groups for both quizzes and homework ablations. It is highly recommended that you join a study group; Check piazza for further updates.'
    },
    {
      title: 'Piazza: Discussion Board',
      description: 'Piazza is what we use for discussions. You should be automatically signed up if you are enrolled at the start of the semester.',
      link: {
        text: 'Sign up on Piazza',
        url: 'https://www.piazza.com'
      }
    },
    {
      title: 'AutoLab: Software Engineering',
      description: 'AutoLab is what we use to test your understanding of low-level concepts, such as engineering your own libraries, implementing important algorithms, and developing optimization methods from scratch.'
    },
    {
      title: 'Kaggle: Data Science',
      description: 'Kaggle is where we test your understanding and ability to extend neural network architectures discussed in lecture. We work on hot AI topics like speech recognition, face recognition, and neural machine translation.',
      link: {
        text: 'Kaggle Platform',
        url: 'https://kaggle.com/'
      }
    },
    {
      title: 'MediaServices / YouTube: Recordings',
      description: 'CMU students who are not in the live lectures should watch the uploaded lectures at MediaServices. Non-CMU folks can view recordings on our YouTube Channel.',
      link: {
        text: 'MediaServices Channel',
        url: 'https://mediaservices.cmu.edu/channel/Introduction%2Bto%2BDeep%2BLearning_Fall%2B2025/385611772'
      }
    },
    {
      title: 'Academic Integrity',
      description: 'You are expected to comply with the University Policy on Academic Integrity and Plagiarism. You are allowed to talk with and work with other students on homework assignments, and share ideas but not code. You should submit your own code.',
      link: {
        text: 'CMU Academic Integrity Policy',
        url: 'https://www.cmu.edu/policies/student-and-student-life/academic-integrity.html'
      }
    }
  ]
};

fs.writeFileSync(path.join(outDir, 'syllabus.yaml'), dump(syllabusData, { lineWidth: -1 }));
fs.writeFileSync(path.join(outDir, 'syllabus.md'), '# Syllabus & Course Policies for Fall 2025\n\nAll grading policies, quizzes, project guidelines, and homework requirements for Fall 2025.');

console.log('F25 Migration Complete!');
