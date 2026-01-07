export type UserRole = "advogado" | "admin" | "secretaria"

export type ProcessStatus = "active" | "archived" | "won" | "lost"

export type Priority = "low" | "medium" | "high" | "urgent"

export type DeadlineStatus = "pending" | "completed" | "overdue"

export type TransactionType = "income" | "expense"

export type TransactionStatus = "pending" | "paid" | "overdue" | "cancelled"

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost"

export type TaskStatus = "todo" | "in_progress" | "done"

export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled"

export type SubscriptionPlan = "free" | "basic" | "premium" | "enterprise"

export type NotificationType = "deadline_reminder" | "payment_reminder" | "process_update"

export type NotificationChannel = "whatsapp" | "email" | "in_app"

export type NotificationStatus = "pending" | "sent" | "failed"

export interface Profile {
  id: string
  full_name: string | null
  email: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  oab_number: string | null
  specialties: string[] | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  cpf_cnpj: string | null
  address: any | null
  client_type: "person" | "company"
  status: "active" | "inactive"
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Process {
  id: string
  user_id: string
  client_id: string
  process_number: string
  title: string
  description: string | null
  court: string | null
  vara: string | null
  judge: string | null
  status: ProcessStatus
  process_type: string | null
  matter: string | null
  value: number | null
  probability: number | null
  priority: Priority
  start_date: string | null
  estimated_end_date: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Deadline {
  id: string
  user_id: string
  process_id: string | null
  title: string
  description: string | null
  deadline_date: string
  reminder_date: string | null
  status: DeadlineStatus
  priority: Priority
  type: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  process_id: string | null
  client_id: string | null
  title: string
  description: string | null
  file_url: string
  file_name: string
  file_size: number | null
  file_type: string | null
  category: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface FinancialTransaction {
  id: string
  user_id: string
  process_id: string | null
  client_id: string | null
  title: string
  description: string | null
  amount: number
  type: TransactionType
  category: string | null
  status: TransactionStatus
  due_date: string | null
  paid_date: string | null
  payment_method: string | null
  invoice_number: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  status: LeadStatus
  interest: string | null
  notes: string | null
  score: number
  converted_to_client_id: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  process_id: string | null
  client_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  process_id: string | null
  client_id: string | null
  title: string
  description: string | null
  location: string | null
  start_time: string
  end_time: string
  type: string | null
  status: "scheduled" | "completed" | "cancelled"
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  entity_type: string | null
  entity_id: string | null
  channel: NotificationChannel
  status: NotificationStatus
  sent_at: string | null
  error_message: string | null
  created_at: string
}
