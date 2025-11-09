export interface Item {
  _id: string;
  name: string;
  description?: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  name: string;
  description?: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  price: number;
  quantity: number;
}

export interface Project {
  _id: string;
  name: string;
  status: 'Planned' | 'In Progress' | 'At Risk' | 'Completed';
  progress: number;
  studio: string;
  dueDate: string | null;
  notes?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  taskSummary?: {
    total: number;
    completed: number;
  };
}

export interface Task {
  _id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Complete';
  project: string;
  assignedTo?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}
