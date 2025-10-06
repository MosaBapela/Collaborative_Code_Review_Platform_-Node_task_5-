import { pool } from '../config/database';
import { Project } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ProjectService {
  async createProject(name: string, description: string | undefined, ownerId: number) {
    const result = await pool.query<Project>(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, ownerId]
    );

    return result.rows[0];
  }

  async getProjects(userId: number) {
    const result = await pool.query<Project>(
      `SELECT DISTINCT p.* FROM projects p 
       LEFT JOIN project_members pm ON p.id = pm.project_id 
       WHERE p.owner_id = $1 OR pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  async getProjectById(id: number) {
    const result = await pool.query<Project>('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError(404, 'Project not found');
    }

    return result.rows[0];
  }

  async addMember(projectId: number, userId: number) {
    try {
      await pool.query(
        'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
        [projectId, userId]
      );
    } catch (err: any) {
      if (err.code === '23505') {
        throw new AppError(400, 'User already member of project');
      }
      throw err;
    }
  }

  async removeMember(projectId: number, userId: number) {
    const result = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'Member not found in project');
    }
  }

  async getMembers(projectId: number) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [projectId]
    );

    return result.rows;
  }

  async isOwnerOrMember(projectId: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2
       UNION
       SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    return result.rows.length > 0;
  }
}