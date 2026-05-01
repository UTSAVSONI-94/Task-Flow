import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters').trim(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').trim().optional().default(''),
  assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID'),
  status: z.enum(['Todo', 'In Progress', 'Done']).optional().default('Todo'),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  dueDate: z.union([
    z.string().datetime({ offset: true }),
    z.null(),
  ]).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters').trim().optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').trim().optional(),
  assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID').optional(),
  status: z.enum(['Todo', 'In Progress', 'Done']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.union([
    z.string().datetime({ offset: true }),
    z.null(),
  ]).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['Todo', 'In Progress', 'Done']),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
