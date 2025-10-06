import { pool } from '../config/database';
import { Comment } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CommentService {
  async createComment(submissionId: number, userId: number, content: string, lineNumber?: number) {
    const result = await pool.query<Comment>(
      'INSERT INTO comments (submission_id, user_id, content, line_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [submissionId, userId, content, lineNumber]
    );

    return result.rows[0];
  }

  async getCommentsBySubmission(submissionId: number) {
    const result = await pool.query(
      `SELECT c.*, u.name as user_name FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.submission_id = $1
       ORDER BY c.line_number NULLS LAST, c.created_at ASC`,
      [submissionId]
    );

    return result.rows;
  }

  async updateComment(id: number, userId: number, content: string) {
    const result = await pool.query<Comment>(
      'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [content, id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Comment not found or unauthorized');
    }

    return result.rows[0];
  }

  async deleteComment(id: number, userId: number) {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'Comment not found or unauthorized');
    }
  }
}