/**
 * Local types for CRM Kanban section
 */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
export type LeadSource = string;
export type DealStatus = 'open' | 'won' | 'lost';

export interface SourceOption {
  id: string;
  label: string;
}

export interface ResponsibleUser {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
  photoUrl?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  order: number;
  color: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'whatsapp' | 'stage_change' | 'proposal' | 'follow_up' | 'won' | 'lost';
  description: string;
  date: string;
}

export type FollowUpType = 'callback' | 'proposal' | 'collection' | 'call' | 'message' | 'meeting';

export interface FollowUp {
  id: string;
  title: string;
  due_date: string;
  type: FollowUpType;
  responsible_id?: string;
  note?: string;
  completed: boolean;
  completed_at?: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  lead: Lead;
  value: number;
  currency: string;
  stage_id: string;
  tags: Tag[];
  responsible?: ResponsibleUser;
  last_activity?: Activity;
  next_action?: string; // Date string
  follow_ups?: FollowUp[];
  status: DealStatus;
  loss_reason?: string;
  competitor?: string;
  closed_at?: string;
  created_at: string;
  notes?: string;
  activities?: Activity[];
}

export interface LossReason {
  id: string;
  label: string;
}

export interface KanbanFilters {
  search: string;
  tags: string[];
  responsible_id?: string;
  stage_id?: string;
  source?: LeadSource;
  status?: DealStatus;
  min_value?: number;
  max_value?: number;
  overdue_only?: boolean;
}

export interface SegmentFilters extends KanbanFilters {
  pipeline_id?: string;
  tag_logic: 'any' | 'all' | 'not';
  no_activity?: boolean;
}

export interface LeadSegment {
  id: string;
  name: string;
  description?: string;
  filters: SegmentFilters;
  count: number;
  created_at: string;
}
