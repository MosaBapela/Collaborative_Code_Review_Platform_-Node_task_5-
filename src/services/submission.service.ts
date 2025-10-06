import { pool } from '../config/database';
import { Submission, SubmissionStatus, ReviewAction } from '../types';
import { AppError } from '../middleware/errorHandler';

export class SubmissionService {
  async createSubmission(
    projectId: number,
    submitterId: number,
    title: string,
    codeContent: string,
    description?: string,
    filename?: string
  ) {
    const result = await pool.query<Submission>(
      'INSERT INTO submissions (project_id, submitter_id, title, description, code_content, filename) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [projectId, submitterId, title, description, codeContent, filename]
    );

    return result.rows[0];
  }

  async getSubmissionsByProject(projectId: number) {
    const result = await pool.query<Submission>(
      `SELECT s.*, u.name as submitter_name FROM submissions s
       JOIN users u ON s.submitter_id = u.id
       WHERE s.project_id = $1
       ORDER BY s.created_at DESC`,
      [projectId]
    );

    return result.rows;
  }

  async getSubmissionById(id: number) {
    const result = await pool.query<Submission>(
      `SELECT s.*, u.name as submitter_name FROM submissions s
       JOIN users u ON s.submitter_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Submission not found');
    }

    return result.rows[0];
  }

  async updateStatus(id: number, status: SubmissionStatus) {
    const result = await pool.query<Submission>(
      'UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Submission not found');
    }

    return result.rows[0];
  }

  async deleteSubmission(id: number) {
    const result = await pool.query('DELETE FROM submissions WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new AppError(404, 'Submission not found');
    }
  }

  async addReview(submissionId: number, reviewerId: number, action: ReviewAction, comment?: string) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      await client.query(
        'INSERT INTO reviews (submission_id, reviewer_id, action, comment) VALUES ($1, $2, $3, $4)',
        [submissionId, reviewerId, action, comment]
      );

      const newStatus: SubmissionStatus = action === 'approve' ? 'approved' : 'changes_requested';
      await client.query(
        'UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStatus, submissionId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getReviews(submissionId: number) {
    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.submission_id = $1
       ORDER BY r.created_at DESC`,
      [submissionId]
    );

    return result.rows;
  }
}