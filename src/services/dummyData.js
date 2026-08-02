import { MOCK_MANTRI_LIST } from '../data/leadership';
import { MOCK_FACULTY } from '../data/faculty';
import { MOCK_TEAMS } from '../data/teams';
import { MOCK_EVENTS } from '../data/events';
import { MOCK_GALLERY } from '../data/gallery';

export { MOCK_MANTRI_LIST, MOCK_FACULTY, MOCK_TEAMS, MOCK_EVENTS, MOCK_GALLERY };

// ─── Campus Mantri (Current) ────────────────────────────────────────────
export const MOCK_CURRENT_MANTRI = MOCK_MANTRI_LIST[0];


// ─── Resources ──────────────────────────────────────────────────────────────────

// ─── Resources ──────────────────────────────────────────────────────────────────
export const MOCK_RESOURCES = [
  {
    _id: 'r1',
    title: 'Ultimate DSA & SDE Sheet (500+ Problems)',
    description: 'Curated list of Data Structures & Algorithms topic-wise practice problems for placement preparation.',
    fileUrl: '#',
    category: 'DSA',
    downloadsCount: 1420
  },
  {
    _id: 'r2',
    title: 'Full-Stack Web Development Roadmap 2026',
    description: 'Complete learning roadmap covering HTML, CSS, JavaScript, React, Node.js, Express, MongoDB and deployment.',
    fileUrl: '#',
    category: 'Development',
    downloadsCount: 890
  },
  {
    _id: 'r3',
    title: 'Operating System Interview Notes',
    description: 'Comprehensive OS notes covering process management, memory management, file systems, and deadlock concepts.',
    fileUrl: '#',
    category: 'Placement',
    downloadsCount: 672
  },
  {
    _id: 'r4',
    title: 'Competitive Programming Handbook',
    description: 'Essential CP techniques, algorithms, and strategies for coding competitions. Includes problem-solving patterns.',
    fileUrl: '#',
    category: 'CP',
    downloadsCount: 534
  },
  {
    _id: 'r5',
    title: 'Python for Data Science Cheat Sheet',
    description: 'Quick reference for Python libraries including NumPy, Pandas, Matplotlib, and Scikit-learn.',
    fileUrl: '#',
    category: 'Development',
    downloadsCount: 1100
  },
  {
    _id: 'r6',
    title: 'DBMS Placement Quick Notes',
    description: 'Concise DBMS notes covering normalization, SQL queries, ER diagrams, transactions, and indexing.',
    fileUrl: '#',
    category: 'Placement',
    downloadsCount: 780
  }
];

// ─── Announcements ──────────────────────────────────────────────────────────────
export const MOCK_ANNOUNCEMENTS = [
  {
    _id: 'a1',
    title: '🚀 Python Boot Camp 2026 Registrations are Now Live!',
    description: 'Register before August 15th to claim early-bird perks and mentorship access.',
    priority: 'High'
  },
  {
    _id: 'a2',
    title: '📢 Code Starter Session — Canva Campus Workshop Coming Soon',
    description: 'Learn creative design & branding with industry-standard tools. Open to all departments.',
    priority: 'Medium'
  }
];

// ─── Community Feed Posts ───────────────────────────────────────────────────────
export const MOCK_POSTS = [
  {
    _id: 'p1',
    postType: 'Study Note',
    title: 'Operating System Process Scheduling Notes',
    content: 'Detailed notes on CPU scheduling algorithms — FCFS, SJF, Round Robin, Priority Scheduling. Includes comparison tables and example problems with solutions. These notes are based on the Galvin textbook and class lectures.',
    tags: ['OS', 'Placement', 'GATE'],
    authorRef: {
      name: 'Adiba Bushra Khan',
      role: 'Tech Lead',
      photo: '/assets/team/tech-lead-adiba.jpg'
    },
    likesCount: 24,
    commentsCount: 8,
    bookmarksCount: 15,
    isPinned: true,
    createdAt: new Date('2026-07-28')
  },
  {
    _id: 'p2',
    postType: 'Achievement',
    title: '🎉 AWS Hackathon — Our Team Won 2nd Prize!',
    content: 'Super proud of our team for securing 2nd position at the AWS Hackathon! We built a cloud-based student management system using Lambda, DynamoDB, and API Gateway. Huge thanks to the GFG Campus Body for organizing such an amazing event.',
    tags: ['AWS', 'Hackathon', 'Achievement'],
    authorRef: {
      name: 'Shaan Ahmad',
      role: 'Social Media Co-Lead',
      photo: '/assets/team/social-colead-shaan.jpg'
    },
    mediaUrl: '/assets/gallery/events-gallery-001.jpg',
    likesCount: 42,
    commentsCount: 12,
    bookmarksCount: 6,
    isPinned: false,
    createdAt: new Date('2026-07-25')
  },
  {
    _id: 'p3',
    postType: 'Question',
    title: 'Best resources for learning React from scratch?',
    content: 'I\'m a 2nd year CSE student and want to start learning React. Should I go with the official docs or follow a YouTube course? Also, is it necessary to learn Redux right away or can I start with just useState/useEffect? Any recommendations from seniors would be appreciated!',
    tags: ['React', 'WebDev', 'Question'],
    authorRef: {
      name: 'Kashish Safia',
      role: 'Event & Operations Co-Lead',
      photo: '/assets/team/event-colead-kashish.jpg'
    },
    likesCount: 18,
    commentsCount: 22,
    bookmarksCount: 9,
    isPinned: false,
    createdAt: new Date('2026-07-20')
  },
  {
    _id: 'p4',
    postType: 'Opportunity',
    title: '💼 Google STEP Internship Applications Open',
    content: 'Google STEP (Student Training in Engineering Program) internship 2026 applications are now open! This is a great opportunity for 1st and 2nd year students. The application deadline is September 15, 2026. Make sure your resume and DSA prep are on point.',
    tags: ['Internship', 'Google', 'Placement'],
    authorRef: {
      name: 'Md Tanzeel Nasim',
      role: 'Community Lead',
      photo: '/assets/team/community-lead-tanzeel.jpg'
    },
    likesCount: 56,
    commentsCount: 14,
    bookmarksCount: 38,
    isPinned: false,
    createdAt: new Date('2026-07-18')
  },
  {
    _id: 'p5',
    postType: 'Thought',
    title: 'Why contributing to open-source matters',
    content: 'Started my open-source journey last month by contributing to a small npm package. The experience taught me more about git, code reviews, and collaboration than any tutorial. If you\'re hesitant about contributing, just start small — fix typos, improve docs, or write tests. Every contribution counts!',
    tags: ['OpenSource', 'GitHub', 'Career'],
    authorRef: {
      name: 'Arham Raza',
      role: 'Event & Operations Lead',
      photo: '/assets/team/event-lead-arham.jpg'
    },
    likesCount: 31,
    commentsCount: 7,
    bookmarksCount: 12,
    isPinned: false,
    createdAt: new Date('2026-07-15')
  }
];

// ─── Leaderboard ────────────────────────────────────────────────────────────────
export const MOCK_LEADERBOARD = [
  {
    rank: 1,
    member: {
      name: 'Saquib Sarfaraz',
      role: 'Campus Mantri',
      teamName: 'Executive Team',
      photo: '/assets/leadership/campus-mantri-2024-25.jpg'
    },
    badge: '🏆 Chapter Champion',
    points: 2450,
    notesUploaded: 28
  },
  {
    rank: 2,
    member: {
      name: 'Adiba Bushra Khan',
      role: 'Tech Lead',
      teamName: 'Technical Team',
      photo: '/assets/team/tech-lead-adiba.jpg'
    },
    badge: '⭐ Code Warrior',
    points: 2180,
    notesUploaded: 22
  },
  {
    rank: 3,
    member: {
      name: 'Md Tanzeel Nasim',
      role: 'Community Lead',
      teamName: 'Community Lead',
      photo: '/assets/team/community-lead-tanzeel.jpg'
    },
    badge: '🌟 Rising Star',
    points: 1920,
    notesUploaded: 18
  },
  {
    rank: 4,
    member: {
      name: 'Arham Raza',
      role: 'Event Lead',
      teamName: 'Event & Operation',
      photo: '/assets/team/event-lead-arham.jpg'
    },
    badge: '💡 Innovator',
    points: 1680,
    notesUploaded: 14
  },
  {
    rank: 5,
    member: {
      name: 'Rida Fatima Tanveer',
      role: 'Creative Lead',
      teamName: 'Design & Creative',
      photo: '/assets/team/design-lead-rida.jpg'
    },
    badge: '🎨 Creative Genius',
    points: 1540,
    notesUploaded: 11
  },
  {
    rank: 6,
    member: {
      name: 'Bushra Shams',
      role: 'Social Media Head',
      teamName: 'Social Media',
      photo: '/assets/team/social-head-bushra.jpg'
    },
    badge: '📣 Engagement Pro',
    points: 1320,
    notesUploaded: 9
  },
  {
    rank: 7,
    member: {
      name: 'Tahreer Tanweer',
      role: 'PR Lead',
      teamName: 'PR & Outreach',
      photo: '/assets/team/pr-lead-tahreer.jpg'
    },
    badge: '🤝 Connector',
    points: 1150,
    notesUploaded: 7
  },
  {
    rank: 8,
    member: {
      name: 'Yussra Khan',
      role: 'Technical Co-Lead',
      teamName: 'Technical Team',
      photo: '/assets/team/tech-colead-yussra.jpg'
    },
    badge: '🔧 Builder',
    points: 980,
    notesUploaded: 6
  }
];

// ─── Settings (Homepage Config) ─────────────────────────────────────────────────
export const MOCK_SETTINGS = {
  heroHeading: 'Empowering Innovators, Coders & Future Tech Leaders',
  heroSubheading: 'Master Data Structures, Full-Stack Web Dev, Artificial Intelligence & Competitive Programming with Jamia Hamdard\'s official GFG Campus Body.',
  ctaText: 'Explore Upcoming Events',
  ctaLink: '#events',
  contactEmail: 'gfg.chapter@jamiahamdard.ac.in'
};

// ─── Stats ──────────────────────────────────────────────────────────────────────
export const MOCK_STATS = {
  totalMembers: 185,
  totalEvents: 28,
  activeProjects: 14,
  communityRating: '4.9/5'
};

// ─── Assembled Homepage Data ────────────────────────────────────────────────────
export const MOCK_HOMEPAGE = {
  settings: MOCK_SETTINGS,
  stats: MOCK_STATS,
  faculty: MOCK_FACULTY,
  currentMantri: MOCK_CURRENT_MANTRI,
  teams: MOCK_TEAMS,
  events: MOCK_EVENTS,
  gallery: MOCK_GALLERY,
  resources: MOCK_RESOURCES,
  announcements: MOCK_ANNOUNCEMENTS
};
