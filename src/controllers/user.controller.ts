import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user?.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { name, display_picture } = req.body;
      const user = await userService.updateUser(userId, { name, display_picture });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user?.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await userService.deleteUser(userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}