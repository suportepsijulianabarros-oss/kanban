/**
 * Shared types for CRM entities
 */

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'agent';
  created_at: string;
}

export interface Tag {
  id: string;
  org_id: string;
  name: string;
  color?: string;
}

export interface Stage {
  id: string;
  org_id: string;
  pipeline_id: string;
  name: string;
  order: number;
  color?: string;
}

export interface Pipeline {
  id: string;
  org_id: string;
  name: string;
  is_default: boolean;
}

export interface Lead {
  id: string;
  org_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  created_at: string;
}

export interface Deal {
  id: string;
  org_id: string;
  lead_id: string;
  stage_id: string;
  title: string;
  value: number;
  currency: string;
  expected_closing_date?: string;
  owner_id?: string;
  status: 'open' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  org_id: string;
  lead_id: string;
  deal_id?: string;
  user_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  description: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  org_id: string;
  lead_id: string;
  deal_id?: string;
  user_id: string;
  due_date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}
