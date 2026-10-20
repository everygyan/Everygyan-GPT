export type UserRole = 'reader' | 'author' | 'editor' | 'moderator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export type ArticleStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  cover_caption?: string;
  category: string;
  category_slug: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  tags: string[];
  status: ArticleStatus;
  published_at: string;
  read_time: string;
  is_lead_story?: boolean;
  is_featured?: boolean;
  views_count?: number;
  table_of_contents?: { id: string; title: string; level: number }[];
  references?: { title: string; url: string }[];
  seo_title?: string;
  seo_description?: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface Comment {
  id: string;
  article_id: string;
  article_title?: string;
  user_id?: string;
  author_name: string;
  author_email?: string;
  author_avatar?: string;
  content: string;
  status: CommentStatus;
  created_at: string;
}

export type SubscriptionStatus = 'pending_confirmation' | 'confirmed' | 'unsubscribed';

export interface NewsletterSubscription {
  id: string;
  email: string;
  status: SubscriptionStatus;
  unsubscribe_token: string;
  confirmation_token?: string;
  confirmed_at?: string;
  consent_source: string;
  consent_at: string;
  created_at: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  preheader?: string;
  content: string;
  status: CampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSendLog {
  id: string;
  campaign_id: string;
  recipient_email: string;
  status: 'sent' | 'failed' | 'retry';
  error_message?: string;
  attempt_number: number;
  sent_at: string;
}
