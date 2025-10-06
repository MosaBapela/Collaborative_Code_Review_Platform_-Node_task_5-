import { pool } from '../config/database';
import { Notification } from '../types';

export class NotificationService {
  async createNotification(userId: number, type: string, message: string, relatedId?: number) {
    const result = await pool.query<Notification>(
      'INSERT INTO notifications (user_id, type, message, related_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, type, message, relatedId]
    );

    return result.rows[0];
  }

  async getUserNotifications(userId: number, limit = 50) {
    const result = await pool.query<Notification>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows;
  }

  async markAsRead(id: number, userId: number) {
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  async markAllAsRead(userId: number) {
    await pool.query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [userId]);
  }
}