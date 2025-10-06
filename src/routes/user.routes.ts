import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const userController = new UserController();

router.get('/:id', authenticate, userController.getUser);

router.put(
  '/:id',
  authenticate,
  validate([
    body('name').optional().notEmpty(),
    body('display_picture').optional().isURL()
  ]),
  userController.updateUser
);

router.delete('/:id', authenticate, userController.deleteUser);

// TODO: Implement notification routes when NotificationController is created
// router.get('/:id/notifications', authenticate, notificationController.getNotifications);
// router.put('/notifications/:id/read', authenticate, notificationController.markAsRead);
// router.put('/notifications/read-all', authenticate, notificationController.markAllAsRead);

export default router;
