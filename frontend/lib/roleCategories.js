export const ROLE_GROUPS = [
  {
    label: 'Construction & Site Roles',
    options: [
      'Project Director',
      'Project Manager',
      'Senior Project Manager',
      'Operations Manager',
      'Construction Manager',
      'Renovation Manager',
      'Restoration Project Lead',
      'Project Supervisor',
      'Site Supervisor',
      'Site Coordinator',
      'Site Foreman',
      'Safety Officer',
      'Structural Engineer',
      'Civil Engineer',
      'QA/QC Engineer',
      'Planning Engineer',
      'Structural Assessment Engineer',
      'Masonry Specialist',
      'Equipment Operator',
      'Survey Technician',
      'Materials Coordinator',
      'Procurement Manager',
      'Inventory Controller',
      'Quality Inspector',
      'Quality Controller',
    ],
  },
  {
    label: 'Architects',
    options: [
      'Lead Architect',
      'Senior Architect',
      'Junior Architect',
      'Principal Architect',
      'Associate Architect',
      'Architectural Designer',
      'Design Architect',
      'Project Architect',
      'Landscape Architect',
      'Urban Planning Architect',
      'BIM Architect (Revit Architect)',
      'Technical Architect',
      'Facade Architect',
      'Interior Architect',
      'Architectural Draftsman / Drafting Architect',
      'Sustainable / Green Building Architect',
      '3D Visualization Architect',
      'Restoration Architect (Heritage)',
      'Residential Architect',
      'Commercial Architect',
    ],
  },
  {
    label: 'Interior Designing Roles',
    options: [
      'Creative Director',
      'Lead Interior Designer',
      'Senior Interior Designer',
      'Interior Design Consultant',
      'Residential Interior Specialist',
      'Modular Furniture Expert',
      'Space Planner',
      'Furniture & Decor Specialist',
      'Furniture Layout Designer',
      'Lighting Designer',
      'Color & Texture Consultant',
      'Moodboard Expert',
      '3D Visualizer',
      'CAD Drafting Specialist',
      'Decor Stylist',
    ],
  },
  {
    label: 'Carpentry Roles',
    options: [
      'Lead Carpenter',
      'Senior Carpenter',
      'Carpenter',
      'Modular Furniture Carpenter',
      'Restoration Carpenter',
    ],
  },
  {
    label: 'Admin, Tech & Office Roles',
    options: [
      'Operations Lead',
      'System Admin',
      'Data Analyst',
      'Admin Assistant',
      'Vendor Relations Manager',
      'Accountant',
    ],
  },
];

export function getRoleCategory(role) {
  if (!role) return 'Other';
  const normalized = String(role).trim();
  if (!normalized) return 'Other';

  for (const group of ROLE_GROUPS) {
    if (group.options.includes(normalized)) {
      return group.label;
    }
  }

  return 'Other';
}
