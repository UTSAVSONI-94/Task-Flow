import mongoose, { Schema, Document } from 'mongoose';
import { ProjectRole } from '../utils/constants';

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: ProjectRole;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  members: IProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(ProjectRole), required: true },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [projectMemberSchema],
  },
  { timestamps: true }
);

projectSchema.index({ 'members.userId': 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
