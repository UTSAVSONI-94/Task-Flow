import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/authenticate';
import { requireProjectRole } from '../middleware/requireProjectRole';
import { validate } from '../middleware/validate';
import { ProjectRole } from '../utils/constants';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/project.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', validate(createProjectSchema), ProjectController.create);
router.get('/', ProjectController.list);
router.get('/:id', requireProjectRole(ProjectRole.ADMIN, ProjectRole.MEMBER), ProjectController.getById);
router.patch('/:id', requireProjectRole(ProjectRole.ADMIN), validate(updateProjectSchema), ProjectController.update);
router.delete('/:id', requireProjectRole(ProjectRole.ADMIN), ProjectController.delete);

// Member management
router.post('/:id/members', requireProjectRole(ProjectRole.ADMIN), validate(addMemberSchema), ProjectController.addMember);
router.patch('/:id/members/:userId', requireProjectRole(ProjectRole.ADMIN), validate(updateMemberRoleSchema), ProjectController.updateMemberRole);
router.delete('/:id/members/:userId', requireProjectRole(ProjectRole.ADMIN), ProjectController.removeMember);

export default router;
