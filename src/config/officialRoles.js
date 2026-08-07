/**
 * Canonical Official Role Taxonomy for GFG Campus Body
 */
export const OFFICIAL_ROLE_GROUPS = [
  {
    group: 'GENERAL',
    roles: [
      'Visitor',
      'Member'
    ]
  },
  {
    group: 'CAMPUS LEADERSHIP',
    roles: [
      'Campus Mantri'
    ]
  },
  {
    group: 'TECHNICAL TEAM',
    roles: [
      'Technical Lead',
      'Technical Co-Lead',
      'Technical Member'
    ]
  },
  {
    group: 'EVENT TEAM',
    roles: [
      'Event Lead',
      'Event Co-Lead',
      'Event Member'
    ]
  },
  {
    group: 'PR TEAM',
    roles: [
      'PR Lead',
      'PR Co-Lead',
      'PR Member'
    ]
  },
  {
    group: 'DESIGN TEAM',
    roles: [
      'Design Lead',
      'Design Co-Lead',
      'Design Member'
    ]
  },
  {
    group: 'SOCIAL MEDIA TEAM',
    roles: [
      'Social Media Lead',
      'Social Media Co-Lead',
      'Social Media Member'
    ]
  },
  {
    group: 'COMMUNITY',
    roles: [
      'Community Lead'
    ]
  },
  {
    group: 'FACULTY',
    roles: [
      'Faculty Coordinator'
    ]
  }
];

export const ALL_OFFICIAL_ROLES = OFFICIAL_ROLE_GROUPS.flatMap(g => g.roles);

/**
 * Derives default team / department from official role string
 */
export const getTeamNameFromRole = (role) => {
  if (!role) return 'General';
  const r = String(role).trim();

  if (r.startsWith('Technical')) return 'Technical';
  if (r.startsWith('Event')) return 'Event';
  if (r.startsWith('PR')) return 'PR';
  if (r.startsWith('Design')) return 'Design';
  if (r.startsWith('Social Media')) return 'Social Media';
  if (r.startsWith('Community')) return 'Community';
  if (r === 'Campus Mantri') return 'Leadership';
  if (r === 'Faculty Coordinator') return 'Faculty';
  return 'General';
};
