import { pool } from '../config/database';
import { ProjectStats } from '../types';

export class StatsService {
  async getProjectStats(projectId: number): Promise<ProjectStats> {
    const submissionStats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'changes_requested' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'pending' OR status = 'in_review' THEN 1 ELSE 0 END) as pending,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_hours
       FROM submissions WHERE project_id = $1`,
      [projectId]
    );

    const activeReviewers = await pool.query(
      `SELECT u.id as user_id, u.name, COUNT(r.id) as review_count
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.project_id = $1
       GROUP BY u.id, u.name
       ORDER BY review_count DESC
       LIMIT 5`,
      [projectId]
    );

    const mostCommented = await pool.query(
      `SELECT s.id as submission_id, s.title, COUNT(c.id) as comment_count
       FROM submissions s
       LEFT JOIN comments c ON s.id = c.submission_id
       WHERE s.project_id = $1
       GROUP BY s.id, s.title
       ORDER BY comment_count DESC
       LIMIT 1`,
      [projectId]
    );

    const stats = submissionStats.rows[0];

    return {
      total_submissions: parseInt(stats.total) || 0,
      approved_count: parseInt(stats.approved) || 0,
      rejected_count: parseInt(stats.rejected) || 0,
      pending_count: parseInt(stats.pending) || 0,
      avg_review_time_hours: parseFloat(stats.avg_hours) || 0,
      most_active_reviewers: activeReviewers.rows,
      most_commented_submission: mostCommented.rows[0] || null
    };
  }
}