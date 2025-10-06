import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { CommentService } from '../services/comment.service';
import { SubmissionService } from '../services/submission.service';
import { NotificationService } from '../services/notification.service';

const commentService = new CommentService();
const submissionService = new SubmissionService();
const notificationService = new NotificationService();

export class CommentController {
  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const { content, line_number } = req.body;

      if (req.user!.role !== 'reviewer') {
        return res.status(403).json({ error: 'Only reviewers can comment' });
      }

      const comment = await commentService.createComment(
        submissionId,
        req.user!.id,
        content,
        line_number
      );

      const submission = await submissionService.getSubmissionById(submissionId);
      await notificationService.createNotification(
        submission.submitter_id,
        'comment',
        `New comment on "${submission.title}"`,
        submissionId
      );

      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const comments = await commentService.getCommentsBySubmission(submissionId);
      res.json(comments);
    } catch (err) {
      next(err);
    }
  }

  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      const comment = await commentService.updateComment(commentId, req.user!.id, content);
      res.json(comment);
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const commentId = parseInt(req.params.id);
      await commentService.deleteComment(commentId, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}