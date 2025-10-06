import { Router } from 'express';
import { body } from 'express-validator';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const submissionController = new SubmissionController();

router.post(
  '/',
  authenticate,
  validate([
    body('project_id').isInt(),
    body('title').notEmpty(),
    body('code_content').notEmpty(),
    body('description').optional(),
    body('filename').optional()
  ]),
  submissionController.createSubmission
);

router.get('/:id', authenticate, submissionController.getSubmission);

router.put(
  '/:id/status',
  authenticate,
  validate([
    body('status').isIn(['pending', 'in_review', 'approved', 'changes_requested'])
  ]),
  submissionController.updateStatus
);

router.delete('/:id', authenticate, submissionController.deleteSubmission);

router.post(
  '/:id/approve',
  authenticate,
  validate([body('comment').optional()]),
  submissionController.approveSubmission
);

router.post(
  '/:id/request-changes',
  authenticate,
  validate([body('comment').optional()]),
  submissionController.requestChanges
);

router.get('/:id/reviews', authenticate, submissionController.getReviews);

export default router;