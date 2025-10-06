import { pool } from '../config/database';
import { User } from '../types';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  async getUserById(id: number) {
    const result = await pool.query<User>(
      'SELECT id, email, name, display_picture, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    return result.rows[0];
  }

  async updateUser(id: number, updates: Partial<Pick<User, 'name' | 'display_picture'>>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.display_picture !== undefined) {
      fields.push(`display_picture = $${paramCount++}`);
      values.push(updates.display_picture);
    }

    if (fields.length === 0) {
      throw new AppError(400, 'No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, display_picture, role, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }

  async deleteUser(id: number) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}