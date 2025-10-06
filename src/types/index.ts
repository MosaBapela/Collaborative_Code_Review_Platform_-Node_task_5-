//Importing Request type from express to extend it for authenticated requests
import { Request } from 'express';

export type UserRole = 'submitter' | 'reviewer';
export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'changes_requested';
export type ReviewAction = 'approve' | 'request_changes';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  display_picture?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Submission {
  id: number;
  project_id: number;
  submitter_id: number;
  title: string;
  description?: string;
  code_content: string;
  filename?: string;
  status: SubmissionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: number;
  submission_id: number;
  user_id: number;
  content: string;
  line_number?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: number;
  submission_id: number;
  reviewer_id: number;
  action: ReviewAction;
  comment?: string;
  created_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  related_id?: number;
  read: boolean;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface ProjectStats {
  total_submissions: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  avg_review_time_hours: number;
  most_active_reviewers: Array<{
    user_id: number;
    name: string;
    review_count: number;
  }>;
  most_commented_submission: {
    submission_id: number;
    title: string;
    comment_count: number;
  } | null;
}