import { Router } from 'express';
import { body } from 'express-validator';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const projectController = new ProjectController();

router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty(),
    body('description').optional()
  ]),
  projectController.createProject
);

router.get('/', authenticate, projectController.getProjects);
router.get('/:id', authenticate, projectController.getProject);
router.get('/:id/members', authenticate, projectController.getMembers);
router.get('/:id/submissions', authenticate, projectController.getSubmissions);
router.get('/:id/stats', authenticate, projectController.getStats);

router.post(
  '/:id/members',
  authenticate,
  validate([body('user_id').isInt()]),
  projectController.addMember
);

router.delete('/:id/members/:userId', authenticate, projectController.removeMember);

export default router;