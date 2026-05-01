import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { requireProjectRole } from '../middleware/requireProjectRole';
import { validate } from '../middleware/validate';
import { ProjectRole } from '../utils/constants';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator';

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent router

// All routes require authentication
router.use(authenticate);

// Task CRUD
router.post('/', requireProjectRole(ProjectRole.ADMIN), validate(createTaskSchema), TaskController.create);
router.get('/', requireProjectRole(ProjectRole.ADMIN, ProjectRole.MEMBER), TaskController.list);
router.get('/:taskId', requireProjectRole(ProjectRole.ADMIN, ProjectRole.MEMBER), TaskController.getById);
router.patch('/:taskId', requireProjectRole(ProjectRole.ADMIN), validate(updateTaskSchema), TaskController.update);
router.patch('/:taskId/status', requireProjectRole(ProjectRole.ADMIN, ProjectRole.MEMBER), validate(updateTaskStatusSchema), TaskController.updateStatus);
router.delete('/:taskId', requireProjectRole(ProjectRole.ADMIN), TaskController.delete);

export default router;
