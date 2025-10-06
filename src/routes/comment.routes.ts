import { Router } from 'express';
import { body } from 'express-validator';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const commentController = new CommentController();

router.post(
  '/submissions/:id/comments',
  authenticate,
  validate([
    body('content').notEmpty(),
    body('line_number').optional().isInt()
  ]),
  commentController.createComment
);

router.get('/submissions/:id/comments', authenticate, commentController.getComments);

router.put(
  '/:id',
  authenticate,
  validate([body('content').notEmpty()]),
  commentController.updateComment
);

router.delete('/:id', authenticate, commentController.deleteComment);

export default router;