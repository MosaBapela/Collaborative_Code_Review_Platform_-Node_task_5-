import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);

      if (req.user!.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const notifications = await notificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notificationId = parseInt(req.params.id);
      await notificationService.markAsRead(notificationId, req.user!.id);
      res.json({ message: 'Marked as read' });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json({ message: 'All marked as read' });
    } catch (err) {
      next(err);
    }
  }
}