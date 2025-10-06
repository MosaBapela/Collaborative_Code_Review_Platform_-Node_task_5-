import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  validate([
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('role').optional().isIn(['submitter', 'reviewer'])
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail(),
    body('password').notEmpty()
  ]),
  authController.login
);

export default router;
