import { Task } from '../models/Task';
import { Project } from '../models/Project';
import {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '../validators/task.validator';

export class TaskService {
  static async create(projectId: string, input: CreateTaskInput, createdBy: string) {
    // Verify assignee is a project member
    const project = await Project.findById(projectId);
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }

    const isMember = project.members.some(
      (m) => m.userId.toString() === input.assigneeId
    );
    if (!isMember) {
      throw { status: 400, message: 'Assignee must be a member of the project' };
    }

    const task = await Task.create({
      ...input,
      projectId,
      createdBy,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });

    return task.populate([
      { path: 'assigneeId', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);
  }

  static async listByProject(projectId: string) {
    return Task.find({ projectId })
      .populate('assigneeId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getById(taskId: string, projectId: string) {
    const task = await Task.findOne({ _id: taskId, projectId })
      .populate('assigneeId', 'name email')
      .populate('createdBy', 'name email');
    if (!task) {
      throw { status: 404, message: 'Task not found' };
    }
    return task;
  }

  static async update(taskId: string, projectId: string, input: UpdateTaskInput) {
    // If assigneeId is being changed, verify new assignee is a project member
    if (input.assigneeId) {
      const project = await Project.findById(projectId);
      if (!project) {
        throw { status: 404, message: 'Project not found' };
      }
      const isMember = project.members.some(
        (m) => m.userId.toString() === input.assigneeId
      );
      if (!isMember) {
        throw { status: 400, message: 'Assignee must be a member of the project' };
      }
    }

    const updateData: any = { ...input };
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assigneeId', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      throw { status: 404, message: 'Task not found' };
    }
    return task;
  }

  static async updateStatus(
    taskId: string,
    projectId: string,
    userId: string,
    memberRole: string,
    input: UpdateTaskStatusInput
  ) {
    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      throw { status: 404, message: 'Task not found' };
    }

    // Only the assignee or an Admin can update status
    const isAssignee = task.assigneeId.toString() === userId;
    const isAdmin = memberRole === 'Admin';

    if (!isAssignee && !isAdmin) {
      throw { status: 403, message: 'Only the assignee or an Admin can update task status' };
    }

    task.status = input.status as any;
    await task.save();

    return task.populate([
      { path: 'assigneeId', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);
  }

  static async delete(taskId: string, projectId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, projectId });
    if (!task) {
      throw { status: 404, message: 'Task not found' };
    }
    return { message: 'Task deleted' };
  }
}
