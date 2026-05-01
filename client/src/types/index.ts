export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: User | string;
  role: 'Admin' | 'Member';
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: ProjectMember[];
  taskCounts?: {
    Todo?: number;
    'In Progress'?: number;
    Done?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId: User | string;
  createdBy: User | string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalProjects: number;
  totalTasksAssigned: number;
  tasksByStatus: {
    Todo: number;
    'In Progress': number;
    Done: number;
  };
  overdueTasks: {
    taskId: string;
    title: string;
    projectName: string;
    dueDate: string;
    status: TaskStatus;
  }[];
  recentActivity: {
    taskId: string;
    title: string;
    status: TaskStatus;
    updatedAt: string;
    projectName: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
