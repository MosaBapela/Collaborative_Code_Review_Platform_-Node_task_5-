import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ProjectService } from '../services/project.service';
import { SubmissionService } from '../services/submission.service';
import { StatsService } from '../services/stats.service';

const projectService = new ProjectService();
const submissionService = new SubmissionService();
const statsService = new StatsService();

export class ProjectController {
  async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const project = await projectService.createProject(name, description, req.user!.id);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  }

  async getProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.getProjects(req.user!.id);
      res.json(projects);
    } catch (err) {
      next(err);
    }
  }

  async getProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const project = await projectService.getProjectById(projectId);
      res.json(project);
    } catch (err) {
      next(err);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const { user_id } = req.body;

      const project = await projectService.getProjectById(projectId);
      if (project.owner_id !== req.user!.id) {
        return res.status(403).json({ error: 'Only owner can add members' });
      }

      await projectService.addMember(projectId, user_id);
      res.status(201).json({ message: 'Member added' });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      const project = await projectService.getProjectById(projectId);
      if (project.owner_id !== req.user!.id) {
        return res.status(403).json({ error: 'Only owner can remove members' });
      }

      await projectService.removeMember(projectId, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const members = await projectService.getMembers(projectId);
      res.json(members);
    } catch (err) {
      next(err);
    }
  }

  async getSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const submissions = await submissionService.getSubmissionsByProject(projectId);
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const stats = await statsService.getProjectStats(projectId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}