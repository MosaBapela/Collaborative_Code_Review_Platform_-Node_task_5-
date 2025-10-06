import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { SubmissionService } from '../services/submission.service';
import { ProjectService } from '../services/project.service';
import { NotificationService } from '../services/notification.service';

const submissionService = new SubmissionService();
const projectService = new ProjectService();
const notificationService = new NotificationService();

export class SubmissionController {
  async createSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { project_id, title, description, code_content, filename } = req.body;
      
      const isMember = await projectService.isOwnerOrMember(project_id, req.user!.id);
      if (!isMember) {
        return res.status(403).json({ error: 'Not a project member' });
      }

      const submission = await submissionService.createSubmission(
        project_id,
        req.user!.id,
        title,
        code_content,
        description,
        filename
      );

      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  }

  async getSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await submissionService.getSubmissionById(submissionId);
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const { status } = req.body;

      const submission = await submissionService.updateStatus(submissionId, status);
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }

  async deleteSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await submissionService.getSubmissionById(submissionId);

      if (submission.submitter_id !== req.user!.id) {
        return res.status(403).json({ error: 'Only submitter can delete' });
      }

      await submissionService.deleteSubmission(submissionId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async approveSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const { comment } = req.body;

      if (req.user!.role !== 'reviewer') {
        return res.status(403).json({ error: 'Only reviewers can approve' });
      }

      await submissionService.addReview(submissionId, req.user!.id, 'approve', comment);

      const submission = await submissionService.getSubmissionById(submissionId);
      await notificationService.createNotification(
        submission.submitter_id,
        'review',
        `Your submission "${submission.title}" was approved`,
        submissionId
      );

      res.json({ message: 'Submission approved' });
    } catch (err) {
      next(err);
    }
  }

  async requestChanges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const { comment } = req.body;

      if (req.user!.role !== 'reviewer') {
        return res.status(403).json({ error: 'Only reviewers can request changes' });
      }

      await submissionService.addReview(submissionId, req.user!.id, 'request_changes', comment);

      const submission = await submissionService.getSubmissionById(submissionId);
      await notificationService.createNotification(
        submission.submitter_id,
        'review',
        `Changes requested for "${submission.title}"`,
        submissionId
      );

      res.json({ message: 'Changes requested' });
    } catch (err) {
      next(err);
    }
  }

  async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissionId = parseInt(req.params.id);
      const reviews = await submissionService.getReviews(submissionId);
      res.json(reviews);
    } catch (err) {
      next(err);
    }
  }
}