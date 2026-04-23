import type { Ceremony } from '../types';

export const CEREMONIES: Ceremony[] = [
  {
    name: 'Daily Standup',
    duration: '15 min',
    cadence: 'Daily (weekdays)',
    owner: 'Rotating / Dustin',
    attendees: ['Dustin', 'Federico', 'Ethan', 'Omar'],
    sections: [
      { name: 'Opening', time: '~1 min', desc: 'Quick pulse check' },
      {
        name: 'Round Robin',
        time: '~10 min',
        desc: 'Shipped / Working on / Blockers — ~2 min each',
      },
      {
        name: 'Flags & Handoffs',
        time: '~3 min',
        desc: 'Cross-cutting concerns, quick decisions, pairing',
      },
      { name: 'Parking Lot', time: '~1 min', desc: 'Capture items for separate discussion' },
    ],
    antiPatterns: [
      'Status report TO Dustin — talk to each other',
      '"Nothing to report" — if true, why are you in the sprint?',
      'Solving problems in standup — flag it, take it offline',
      'Going over 15 min — hard stop',
    ],
    color: '#48BB78',
  },
  {
    name: 'Sprint Planning',
    duration: '60 min',
    cadence: 'First day of sprint',
    owner: 'Dustin + Omar',
    attendees: ['Dustin', 'Federico', 'Ethan', 'Omar'],
    sections: [
      {
        name: 'Previous Sprint Closeout',
        time: '~10 min',
        desc: 'Carryover items + velocity check',
      },
      {
        name: 'Sprint Goal',
        time: '~5 min',
        desc: '"By end of sprint, we will have [outcome] so that [who benefits]"',
      },
      {
        name: 'Capacity Reality Check',
        time: '~5 min',
        desc: 'Available days, conflicts, effective capacity',
      },
      {
        name: 'Sprint Backlog Construction',
        time: '~30 min',
        desc: 'Walk draft plan: ready? owner? dependencies? right size?',
      },
      {
        name: 'Risk & Dependency Scan',
        time: '~5 min',
        desc: 'External deps, arch decisions, mid-sprint risks',
      },
      { name: 'Confirm & Commit', time: '~5 min', desc: 'Each person confirms verbally' },
    ],
    antiPatterns: [
      'Planning without a draft — come prepared',
      'Assigning work instead of choosing — people commit to their own',
      'Ignoring capacity math — "we\'ll figure it out" = carryover',
      "Not protecting innovation time — it's strategic, not optional",
    ],
    color: '#4299E1',
  },
  {
    name: 'Sprint Retro',
    duration: '45 min',
    cadence: 'Last day of sprint',
    owner: 'Rotating facilitator',
    attendees: ['Dustin', 'Federico', 'Ethan', 'Omar'],
    sections: [
      {
        name: 'Previous Action Items',
        time: '~5 min',
        desc: 'Did we actually do them? 2+ retros = commit or drop',
      },
      {
        name: 'Sprint Data',
        time: '~5 min',
        desc: 'Committed vs completed, carryover, bugs, goal met?',
      },
      {
        name: 'What Went Well',
        time: '~10 min',
        desc: 'What to KEEP doing — everyone contributes at least one',
      },
      {
        name: "What Didn't Go Well",
        time: '~10 min',
        desc: 'What to STOP/CHANGE — blameless, specific, systems not people',
      },
      { name: 'Action Items', time: '~10 min', desc: '1-3 concrete actions, owned, measurable' },
      { name: 'Team Pulse', time: '~5 min', desc: 'How are you feeling? Red/Yellow/Green/Blue' },
    ],
    antiPatterns: [
      'Skipping retro because "too busy" — that\'s when you need it most',
      "Same complaints with no action — why didn't the action item fix it?",
      'Turning it into blame — address the system, not the person',
      'Too many action items — 1-3 max, actually do them',
    ],
    color: '#9F7AEA',
  },
  {
    name: 'Dept Sprint Sync',
    duration: '30 min',
    cadence: 'First day of sprint (after planning)',
    owner: 'Nick / Omar',
    attendees: ['Nick', 'Dustin', 'Omar', 'Wolf', 'Ethan', 'Federico', 'Ni', 'Dominick'],
    sections: [
      {
        name: 'Previous Sprint Results',
        time: '~5 min',
        desc: 'Each team: goal met? key deliverables? carryover?',
      },
      {
        name: 'This Sprint — Team Plans',
        time: '~15 min',
        desc: 'SW Dev (5 min) + Data & Arch (5 min) + Innovation (2 min)',
      },
      {
        name: 'Cross-Team Dependencies',
        time: '~5 min',
        desc: 'Surface and resolve — assign owner + resolution date',
      },
      {
        name: 'Strategic Alignment',
        time: '~5 min',
        desc: 'Priority shifts? Demos? Resource changes? Trade-offs?',
      },
    ],
    antiPatterns: [
      'Using this meeting TO plan — planning happens in team meetings',
      'One team dominates the time — hard timebox per team',
      'Priority changes without trade-off discussion',
      'Skipping when "nothing changed" — 30 min is cheap insurance',
    ],
    color: '#ECC94B',
  },
];
