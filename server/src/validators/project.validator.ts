import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters').trim(),
  description: z.string().max(500, 'Description must be at most 500 characters').trim().optional().default(''),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters').trim().optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').trim().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  role: z.enum(['Admin', 'Member']).optional().default('Member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['Admin', 'Member']),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
