import { Subject, Chapter, OnlineClass, NoteItem, ExamGoal, StudyTask } from '../types';

export const defaultSubjects: Subject[] = [
  { id: 'phy1', nameEn: 'Physics 1st Paper', nameBn: 'পদার্থবিজ্ঞান ১ম পত্র', code: 'PHY-101', color: 'bg-blue-600', isArchived: false, order: 1 },
  { id: 'phy2', nameEn: 'Physics 2nd Paper', nameBn: 'পদার্থবিজ্ঞান ২য় পত্র', code: 'PHY-102', color: 'bg-indigo-600', isArchived: false, order: 2 },
  { id: 'chem1', nameEn: 'Chemistry 1st Paper', nameBn: 'রসায়ন ১ম পত্র', code: 'CHE-101', color: 'bg-emerald-600', isArchived: false, order: 3 },
  { id: 'chem2', nameEn: 'Chemistry 2nd Paper', nameBn: 'রসায়ন ২য় পত্র', code: 'CHE-102', color: 'bg-teal-600', isArchived: false, order: 4 },
  { id: 'bio1', nameEn: 'Biology 1st Paper', nameBn: 'জীববিজ্ঞান ১ম পত্র', code: 'BIO-101', color: 'bg-green-600', isArchived: false, order: 5 },
  { id: 'bio2', nameEn: 'Biology 2nd Paper', nameBn: 'জীববিজ্ঞান ২য় পত্র', code: 'BIO-102', color: 'bg-lime-600', isArchived: false, order: 6 },
  { id: 'math1', nameEn: 'Higher Mathematics 1st Paper', nameBn: 'উচ্চতর গণিত ১ম পত্র', code: 'MAT-101', color: 'bg-violet-600', isArchived: false, order: 7 },
  { id: 'math2', nameEn: 'Higher Mathematics 2nd Paper', nameBn: 'উচ্চতর গণিত ২য় পত্র', code: 'MAT-102', color: 'bg-purple-700', isArchived: false, order: 8 },
  { id: 'bangla', nameEn: 'Bangla', nameBn: 'বাংলা', code: 'BAN-101', color: 'bg-rose-500', isArchived: false, order: 9 },
  { id: 'english', nameEn: 'English', nameBn: 'ইংরেজি', code: 'ENG-101', color: 'bg-sky-600', isArchived: false, order: 10 },
  { id: 'ict', nameEn: 'ICT', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', code: 'ICT-101', color: 'bg-amber-500', isArchived: false, order: 11 },
];

export const defaultChapters: Chapter[] = [
  // Physics 1st Paper
  {
    id: 'ch-phy1-1',
    subjectId: 'phy1',
    nameEn: 'Vectors',
    nameBn: 'ভেক্টর',
    topics: ['Dot & Cross Product', 'Unit Vectors', 'River-Boat Problems', 'Gradient, Divergence & Curl'],
    subtopics: ['Scalar product applications', 'Velocity of boat in river', 'Shortest distance & time'],
    estimatedHours: 8,
    difficulty: 'Medium',
    priority: 'high',
    deadlineDate: '2026-11-15',
    status: 'in_progress',
    confidence: 'strong',
    examWeight: '10 Marks CQ (Guaranteed)',
    revisionRequired: false,
    personalNotes: 'Focus on river-boat problems with current velocity vector decomposition.',
    resourceLinks: [
      { id: 'r1', title: 'River-boat Concept Video', url: 'https://youtube.com', type: 'youtube' }
    ],
    subtasks: [
      { id: 'st1', title: 'Formula sheet review', completed: true, estimatedMinutes: 30, taskType: 'theory' },
      { id: 'st2', title: 'Solve 15 board questions', completed: false, estimatedMinutes: 90, taskType: 'cq' },
      { id: 'st3', title: 'Vector calculus derivations', completed: false, estimatedMinutes: 45, taskType: 'numerical' },
    ]
  },
  {
    id: 'ch-phy1-2',
    subjectId: 'phy1',
    nameEn: 'Newtonian Mechanics',
    nameBn: 'নিউটনীয় বলবিদ্যা',
    topics: ['Inertia & Force', 'Momentum & Collision', 'Torque & Angular Momentum', 'Banked Road / Road Turning'],
    subtopics: ['Elastic vs Inelastic collision', 'Banking angle tan(θ) = v²/rg', 'Moment of inertia formulas'],
    estimatedHours: 10,
    difficulty: 'Hard',
    priority: 'urgent',
    deadlineDate: '2026-11-20',
    status: 'in_progress',
    confidence: 'average',
    examWeight: '10 Marks CQ + 4 MCQs',
    revisionRequired: true,
    personalNotes: 'Practice banking of roads with friction coefficients.',
    resourceLinks: [],
    subtasks: [
      { id: 'st4', title: 'Banking road derivations', completed: true, estimatedMinutes: 40, taskType: 'theory' },
      { id: 'st5', title: 'Angular momentum conservation problems', completed: false, estimatedMinutes: 60, taskType: 'numerical' },
    ]
  },
  {
    id: 'ch-phy1-3',
    subjectId: 'phy1',
    nameEn: 'Work, Energy & Power',
    nameBn: 'কাজ, শক্তি ও ক্ষমতা',
    topics: ['Work by Variable Force', 'Spring Potential Energy', 'Conservation of Mechanical Energy', 'Efficiency & Power of Pumps'],
    subtopics: ['Water tank filling problem', 'Hooke\'s Law Spring Work W=1/2kx²'],
    estimatedHours: 7,
    difficulty: 'Medium',
    priority: 'medium',
    deadlineDate: '2026-11-28',
    status: 'needs_revision',
    confidence: 'weak',
    examWeight: 'High Yield Numerical',
    revisionRequired: true,
    personalNotes: 'Pump efficiency calculations are frequently asked in Board creative questions.',
    resourceLinks: [],
    subtasks: [
      { id: 'st6', title: 'Water pump efficiency questions', completed: false, estimatedMinutes: 60, taskType: 'numerical' }
    ]
  },

  // Physics 2nd Paper
  {
    id: 'ch-phy2-1',
    subjectId: 'phy2',
    nameEn: 'Thermodynamics',
    nameBn: 'তাপগতিবিদ্যা',
    topics: ['Zeroth, First & Second Laws', 'Carnot Engine & Efficiency', 'Entropy Calculation in Phase Change'],
    subtopics: ['Isothermal vs Adiabatic processes', 'Carnot efficiency η = 1 - T2/T1', 'Entropy formula ΔS = dQ/T'],
    estimatedHours: 9,
    difficulty: 'Hard',
    priority: 'urgent',
    deadlineDate: '2026-11-18',
    status: 'in_progress',
    confidence: 'average',
    examWeight: '10 Marks CQ (Board Core)',
    revisionRequired: true,
    personalNotes: 'Entropy of mixing water and ice requires two-step calculation.',
    resourceLinks: [],
    subtasks: [
      { id: 'st7', title: 'Carnot cycle PV diagrams', completed: true, estimatedMinutes: 45, taskType: 'theory' },
      { id: 'st8', title: 'Entropy math practice', completed: false, estimatedMinutes: 60, taskType: 'numerical' },
    ]
  },

  // Chemistry 1st Paper
  {
    id: 'ch-chem1-1',
    subjectId: 'chem1',
    nameEn: 'Qualitative Chemistry',
    nameBn: 'গুণগত রসায়ন',
    topics: ['Bohr Atomic Model', 'Quantum Numbers', 'Aufbau & Hund Principles', 'Solubility Product (Ksp vs Kip)'],
    subtopics: ['Precipitation conditions Kip > Ksp', 'Salt cation/anion flame test'],
    estimatedHours: 8,
    difficulty: 'Medium',
    priority: 'high',
    deadlineDate: '2026-11-12',
    status: 'completed',
    confidence: 'strong',
    completedAt: '2026-10-25',
    examWeight: '10 Marks CQ',
    revisionRequired: false,
    personalNotes: 'Ksp calculations are solid. Memorize d-block flame test colors.',
    resourceLinks: [],
    subtasks: [
      { id: 'st9', title: 'Quantum number sets check', completed: true, estimatedMinutes: 30, taskType: 'theory' },
      { id: 'st10', title: 'Solve 10 Ksp board CQ', completed: true, estimatedMinutes: 75, taskType: 'cq' },
    ]
  },

  // Chemistry 2nd Paper
  {
    id: 'ch-chem2-2',
    subjectId: 'chem2',
    nameEn: 'Organic Chemistry',
    nameBn: 'জৈব রসায়ন',
    topics: ['IUPAC Nomenclature', 'Isomerism (Optical, Geometric)', 'Electrophilic & Nucleophilic Substitution (SN1, SN2)', 'Aromaticity & Benzene Reactions'],
    subtopics: ['Markovnikov rule & anti-Markovnikov', 'Aldol condensation & Cannizzaro reaction', 'Lucas reagent alcohol test'],
    estimatedHours: 18,
    difficulty: 'Hard',
    priority: 'urgent',
    deadlineDate: '2026-12-15',
    status: 'in_progress',
    confidence: 'weak',
    examWeight: '20 Marks (2 CQ Sets)',
    revisionRequired: true,
    personalNotes: 'Huge syllabus chapter! Allocate minimum 2 hours every evening.',
    resourceLinks: [],
    subtasks: [
      { id: 'st12', title: 'Isomerism classification review', completed: true, estimatedMinutes: 60, taskType: 'theory' },
      { id: 'st13', title: 'Aliphatic synthesis flowcharts', completed: false, estimatedMinutes: 90, taskType: 'numerical' },
      { id: 'st14', title: 'Name reactions sheet', completed: false, estimatedMinutes: 60, taskType: 'revision' },
    ]
  },

  // Higher Mathematics 1st Paper
  {
    id: 'ch-math1-2',
    subjectId: 'math1',
    nameEn: 'Differentiation',
    nameBn: 'অন্তরীকরণ',
    topics: ['Limits & Continuity', 'First Principles Derivation', 'Successive Differentiation (Leibniz Theorem)', 'Maxima & Minima Applications'],
    subtopics: ['Product and Quotient rules', 'Rate of change and tangent/normal equations'],
    estimatedHours: 12,
    difficulty: 'Hard',
    priority: 'urgent',
    deadlineDate: '2026-12-08',
    status: 'needs_revision',
    confidence: 'weak',
    examWeight: '15 Marks (Calculus Core)',
    revisionRequired: true,
    personalNotes: 'Maxima-minima word problems require clear constraint equations.',
    resourceLinks: [],
    subtasks: [
      { id: 'st15', title: 'Limits trigonometric formulas', completed: true, estimatedMinutes: 45, taskType: 'theory' },
      { id: 'st16', title: 'Leibniz n-th derivative questions', completed: false, estimatedMinutes: 60, taskType: 'numerical' },
    ]
  },

  // ICT
  {
    id: 'ch-ict-1',
    subjectId: 'ict',
    nameEn: 'Number Systems & Digital Logic',
    nameBn: 'সংখ্যা পদ্ধতি ও ডিজিটাল লজিক',
    topics: ['Binary, Octal, Hexadecimal Conversion', '2\'s Complement Arithmetic', 'Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)', 'Boolean Algebra & Karnaugh Maps'],
    subtopics: ['Universal gate NAND/NOR synthesis', 'Encoder, Decoder, Half Adder & Full Adder'],
    estimatedHours: 8,
    difficulty: 'Medium',
    priority: 'high',
    deadlineDate: '2026-11-13',
    status: 'in_progress',
    confidence: 'average',
    examWeight: '10 Marks CQ',
    revisionRequired: false,
    personalNotes: 'Practice 2\'s complement subtraction and Full Adder circuit diagrams.',
    resourceLinks: [],
    subtasks: [
      { id: 'st17', title: 'Binary conversions practice', completed: true, estimatedMinutes: 30, taskType: 'numerical' },
      { id: 'st18', title: 'Full adder circuit truth table', completed: false, estimatedMinutes: 45, taskType: 'theory' },
    ]
  }
];

export const defaultExams: ExamGoal[] = [
  {
    id: 'exam-1',
    title: 'HSC Board Final Examination 2026',
    targetDate: '2026-12-20',
    targetScore: 'GPA 5.00 / Golden',
    notes: 'Primary milestone for higher education and university entrance preparation.',
    syllabusSubjectIds: ['phy1', 'phy2', 'chem1', 'chem2', 'bio1', 'bio2', 'math1', 'math2', 'bangla', 'english', 'ict']
  },
  {
    id: 'exam-2',
    title: 'College Pre-Test / Model Exam',
    targetDate: '2026-11-25',
    targetScore: '85%+',
    notes: 'Evaluate weak chapters in Chemistry & Physics.',
    syllabusSubjectIds: ['phy1', 'chem1', 'math1']
  }
];

export const defaultOnlineClasses: OnlineClass[] = [
  {
    id: 'class-1',
    title: 'Physics Live: Modern Thermodynamics & Entropy',
    subjectId: 'phy2',
    teacherName: 'Dr. Rafiqul Islam',
    date: '2026-10-29',
    startTime: '19:00',
    durationMinutes: 90,
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    platform: 'google_meet',
    status: 'upcoming',
    notes: 'Bring calculator and past 5 years board question papers.'
  },
  {
    id: 'class-2',
    title: 'Chemistry Special: Organic Reaction Mechanisms (SN1/SN2)',
    subjectId: 'chem2',
    teacherName: 'Prof. Tanvir Ahmed',
    date: '2026-10-30',
    startTime: '18:30',
    durationMinutes: 75,
    meetUrl: 'https://zoom.us/j/1234567890',
    platform: 'zoom',
    status: 'upcoming',
    notes: 'Discussion on nucleophilic attack in tertiary haloalkanes.'
  }
];

export const defaultStudyTasks: StudyTask[] = [
  {
    id: 'task-1',
    subjectId: 'chem2',
    chapterId: 'ch-chem2-2',
    title: 'Organic Chemistry: Alkane & Alkene Mechanisms',
    date: '2026-10-28',
    startTime: '16:00',
    durationMinutes: 90,
    priority: 'urgent',
    taskType: 'theory',
    completed: true,
    completedAt: '2026-10-28T17:30:00',
    notes: 'Solved reaction flowchart on page 245.'
  },
  {
    id: 'task-2',
    subjectId: 'phy1',
    chapterId: 'ch-phy1-2',
    title: 'Newtonian Mechanics: Road Banking Math Problems',
    date: '2026-10-28',
    startTime: '19:30',
    durationMinutes: 60,
    priority: 'high',
    taskType: 'numerical',
    completed: false,
    notes: 'Practice 5 questions with friction angle.'
  },
  {
    id: 'task-3',
    subjectId: 'math1',
    chapterId: 'ch-math1-2',
    title: 'Differentiation: First Principle Limit Proofs',
    date: '2026-10-28',
    startTime: '21:00',
    durationMinutes: 60,
    priority: 'high',
    taskType: 'numerical',
    completed: false,
  },
  {
    id: 'task-overdue-1',
    subjectId: 'ict',
    chapterId: 'ch-ict-1',
    title: 'Digital Logic: Full Adder Truth Table & Karnaugh Map',
    date: '2026-10-27',
    startTime: '17:00',
    durationMinutes: 45,
    priority: 'high',
    taskType: 'theory',
    completed: false,
    notes: 'Missed due to coaching class; needs rescheduling to today.'
  }
];

export const defaultNotes: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Physics 1st Paper - Quick Formula Summary',
    subjectId: 'phy1',
    chapterId: 'ch-phy1-1',
    content: `## Vector Quick Formulas\n- Dot Product: A · B = |A||B| cos θ\n- Cross Product: A × B = |A||B| sin θ η\n- River-boat shortest path: cos α = -u / v (v > u)\n- Time for shortest path: t = d / √(v² - u²)\n- Shortest time across river: t_min = d / v (aim perpendicular)`,
    resources: [
      { id: 'nl1', title: 'Vector Formulas PDF', url: 'https://drive.google.com', type: 'drive' }
    ],
    isFavorite: true,
    createdAt: '2026-10-20T10:00:00',
    updatedAt: '2026-10-25T14:30:00',
    tags: ['Physics', 'Formulas', 'Vectors']
  }
];
