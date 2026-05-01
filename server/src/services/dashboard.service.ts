import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { TaskStatus } from '../utils/constants';

export class DashboardService {
  static async getDashboard(userId: string) {
    // Get all projects the user belongs to
    const projects = await Project.find({ 'members.userId': userId });
    const projectIds = projects.map((p) => p._id);
    const projectMap: Record<string, string> = {};
    projects.forEach((p) => {
      projectMap[p._id.toString()] = p.name;
    });

    // Get tasks assigned to the user
    const assignedTasks = await Task.find({
      assigneeId: userId,
      projectId: { $in: projectIds },
    }).sort({ updatedAt: -1 });

    // Task counts by status
    const tasksByStatus = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.DONE]: 0,
    };
    assignedTasks.forEach((t) => {
      tasksByStatus[t.status as TaskStatus]++;
    });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = assignedTasks
      .filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== TaskStatus.DONE
      )
      .map((t) => ({
        taskId: t._id,
        title: t.title,
        projectName: projectMap[t.projectId.toString()] || 'Unknown',
        dueDate: t.dueDate,
        status: t.status,
      }));

    // Recent activity (last 10 updated tasks across all user's projects)
    const recentTasks = await Task.find({
      projectId: { $in: projectIds },
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    const recentActivity = recentTasks.map((t) => ({
      taskId: t._id,
      title: t.title,
      status: t.status,
      updatedAt: t.updatedAt,
      projectName: projectMap[t.projectId.toString()] || 'Unknown',
    }));

    return {
      totalProjects: projects.length,
      totalTasksAssigned: assignedTasks.length,
      tasksByStatus,
      overdueTasks,
      recentActivity,
    };
  }
}
