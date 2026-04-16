export type ReportCategory = 'urgent' | 'discipline' | 'climate';
export type ReportStatus = 'open' | 'in_progress' | 'resolved';
export type InitiativeCategory = 'physical' | 'social' | 'academic';
export type InitiativeStatus = 'pending' | 'approved' | 'in_progress' | 'done' | 'rejected';
export type MessageSenderRole = 'admin' | 'reporter';

export interface Report {
  id: string;
  anonymous_token: string | null;
  reporter_user_id: string | null;
  reporter_name: string | null;
  category: ReportCategory;
  title: string;
  description: string;
  location: string;
  media_url: string;
  status: ReportStatus;
  is_anonymous: boolean;
  admin_notes: string;
  created_at: string;
}

export interface ReportMessage {
  id: string;
  report_id: string;
  sender_role: MessageSenderRole;
  content: string;
  created_at: string;
}

export interface Initiative {
  id: string;
  submitter_user_id: string | null;
  submitter_name: string;
  anonymous_token: string | null;
  is_anonymous: boolean;
  category: InitiativeCategory;
  title: string;
  description: string;
  status: InitiativeStatus;
  admin_response: string;
  created_at: string;
  vote_count?: number;
  user_voted?: boolean;
}

export interface InitiativeVote {
  id: string;
  initiative_id: string;
  voter_token: string;
  created_at: string;
}

export type Page = 'landing' | 'report' | 'initiatives' | 'my-reports' | 'admin';
