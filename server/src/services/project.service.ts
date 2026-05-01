import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { ProjectRole } from '../utils/constants';
import {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '../validators/project.validator';

export class ProjectService {
  static async create(input: CreateProjectInput, userId: string) {
    const project = await Project.create({
      name: input.name,
      description: input.description || '',
      ownerId: userId,
      members: [{ userId: new mongoose.Types.ObjectId(userId), role: ProjectRole.ADMIN }],
    });

    return project.populate('members.userId', 'name email');
  }

  static async listForUser(userId: string) {
    const projects = await Project.find({ 'members.userId': userId })
      .populate('members.userId', 'name email')
      .sort({ updatedAt: -1 });

    // Attach task counts for each project
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: { projectId: '$projectId', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap: Record<string, Record<string, number>> = {};
    for (const tc of taskCounts) {
      const pid = tc._id.projectId.toString();
      if (!countMap[pid]) countMap[pid] = {};
      countMap[pid][tc._id.status] = tc.count;
    }

    return projects.map((p) => {
      const obj = p.toObject();
      (obj as any).taskCounts = countMap[p._id.toString()] || {};
      return obj;
    });
  }

  static async getById(projectId: string) {
    const project = await Project.findById(projectId).populate(
      'members.userId',
      'name email'
    );
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }
    return project;
  }

  static async update(projectId: string, input: UpdateProjectInput) {
    const project = await Project.findByIdAndUpdate(projectId, input, {
      new: true,
      runValidators: true,
    }).populate('members.userId', 'name email');
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }
    return project;
  }

  static async delete(projectId: string) {
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }
    // Cascade delete all tasks
    await Task.deleteMany({ projectId });
    return { message: 'Project and all associated tasks deleted' };
  }

  static async addMember(projectId: string, input: AddMemberInput) {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw { status: 404, message: 'User not found with that email' };
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }

    const existingMember = project.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );
    if (existingMember) {
      throw { status: 409, message: 'User is already a member of this project' };
    }

    project.members.push({
      userId: user._id,
      role: (input.role as ProjectRole) || ProjectRole.MEMBER,
    });
    await project.save();

    return project.populate('members.userId', 'name email');
  }

  static async updateMemberRole(
    projectId: string,
    memberId: string,
    input: UpdateMemberRoleInput
  ) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }

    const member = project.members.find(
      (m) => m.userId.toString() === memberId
    );
    if (!member) {
      throw { status: 404, message: 'Member not found in project' };
    }

    // Ensure at least one admin remains
    if (
      member.role === ProjectRole.ADMIN &&
      input.role === ProjectRole.MEMBER
    ) {
      const adminCount = project.members.filter(
        (m) => m.role === ProjectRole.ADMIN
      ).length;
      if (adminCount <= 1) {
        throw {
          status: 400,
          message: 'Project must have at least one Admin',
        };
      }
    }

    member.role = input.role as ProjectRole;
    await project.save();

    return project.populate('members.userId', 'name email');
  }

  static async removeMember(projectId: string, memberId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw { status: 404, message: 'Project not found' };
    }

    const memberIndex = project.members.findIndex(
      (m) => m.userId.toString() === memberId
    );
    if (memberIndex === -1) {
      throw { status: 404, message: 'Member not found in project' };
    }

    const member = project.members[memberIndex];

    // Ensure at least one admin remains
    if (member.role === ProjectRole.ADMIN) {
      const adminCount = project.members.filter(
        (m) => m.role === ProjectRole.ADMIN
      ).length;
      if (adminCount <= 1) {
        throw {
          status: 400,
          message: 'Cannot remove the last Admin from the project',
        };
      }
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    // Unassign tasks from the removed member in this project
    await Task.updateMany(
      { projectId, assigneeId: memberId },
      { assigneeId: project.ownerId }
    );

    return project.populate('members.userId', 'name email');
  }
}
