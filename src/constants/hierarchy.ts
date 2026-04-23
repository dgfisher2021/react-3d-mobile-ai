import type { HierarchyLevel } from '../types';

export const HIERARCHY: HierarchyLevel[] = [
  {
    level: 'Initiative',
    duration: '12-24 months',
    subItems: 'Multiple projects',
    ownerLevel: 'Executive',
    example: 'Architecture Modernization',
    color: '#E53E3E',
  },
  {
    level: 'Project',
    duration: '1-6 months',
    subItems: 'Multiple epics',
    ownerLevel: 'Senior dev / PM',
    example: 'Estimating Tools',
    color: '#DD6B20',
  },
  {
    level: 'Epic',
    duration: '2-10 weeks',
    subItems: 'Multiple stories',
    ownerLevel: 'Developer',
    example: 'Bid Board MVP',
    color: '#9F7AEA',
  },
  {
    level: 'Story',
    duration: '1-5 days',
    subItems: 'Optional sub-tasks',
    ownerLevel: 'Developer',
    example: 'Add filter by trade',
    color: '#48BB78',
  },
  {
    level: 'Task',
    duration: 'Hours to days',
    subItems: 'None',
    ownerLevel: 'Developer',
    example: 'Write API endpoint for filters',
    color: '#4299E1',
  },
];
