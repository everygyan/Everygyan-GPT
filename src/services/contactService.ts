import { ContactMessage, MessageStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

// Local storage fallback key for local dev or offline mode
const LOCAL_MESSAGES_KEY = 'everygyan_contact_messages';

function getLocalMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage parse error
  }
  return [];
}

function saveLocalMessages(messages: ContactMessage[]) {
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // Ignore storage write error
  }
}

export interface ContactSubmissionInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validates and submits a new reader inquiry to the database
 */
export async function submitContactMessage(
  input: ContactSubmissionInput
): Promise<ContactServiceResult<{ id: string }>> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const subject = input.subject.trim();
  const message = input.message.trim();

  // Basic validation
  if (!name || name.length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: 'Please provide a valid email address.' };
  }
  if (!subject || subject.length < 2) {
    return { success: false, error: 'Please enter a subject (at least 2 characters).' };
  }
  if (!message || message.length < 5) {
    return { success: false, error: 'Please write your message (at least 5 characters).' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          subject,
          message,
          status: 'unread',
        })
        .select('id')
        .single();

      if (error) {
        console.error('[ContactService] Supabase insert failed:', error);
        return { success: false, error: error.message || 'Failed to submit message to the database.' };
      }

      return { success: true, data: { id: data.id } };
    } catch (err) {
      console.error('[ContactService] Unexpected error inserting message:', err);
      return { success: false, error: 'Network error submitting your inquiry. Please try again.' };
    }
  }

  // Offline / local development fallback
  const fallbackMessage: ContactMessage = {
    id: 'local-' + Date.now(),
    name,
    email,
    subject,
    message,
    status: 'unread',
    created_at: new Date().toISOString(),
  };
  const list = getLocalMessages();
  saveLocalMessages([fallbackMessage, ...list]);

  return { success: true, data: { id: fallbackMessage.id } };
}

/**
 * Fetches all reader inquiries for dashboard display (requires editor/admin role)
 */
export async function fetchContactMessages(filters?: {
  status?: string;
  search?: string;
}): Promise<ContactMessage[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('contact_messages')
        .select('id, name, email, subject, message, status, admin_notes, replied_at, created_at')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (!error && data) {
        let results = data as ContactMessage[];
        if (filters?.search?.trim()) {
          const q = filters.search.toLowerCase();
          results = results.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.email.toLowerCase().includes(q) ||
              m.subject.toLowerCase().includes(q) ||
              m.message.toLowerCase().includes(q)
          );
        }
        return results;
      }
    } catch (err) {
      console.warn('[ContactService] Supabase fetch failed, falling back to local storage:', err);
    }
  }

  let list = getLocalMessages();
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((m) => m.status === filters.status);
  }
  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }
  return list;
}

/**
 * Updates a contact message status (read, replied, archived)
 */
export async function updateContactMessageStatus(
  id: string,
  status: MessageStatus,
  adminNotes?: string
): Promise<ContactServiceResult> {
  const updates: Record<string, unknown> = { status };
  if (status === 'replied') {
    updates.replied_at = new Date().toISOString();
  }
  if (adminNotes !== undefined) {
    updates.admin_notes = adminNotes;
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Failed to update message.' };
    }
  }

  // Local storage update
  const list = getLocalMessages();
  const updated = list.map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveLocalMessages(updated as ContactMessage[]);
  return { success: true };
}

/**
 * Deletes a contact message (requires admin role)
 */
export async function deleteContactMessage(id: string): Promise<ContactServiceResult> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Failed to delete message.' };
    }
  }

  const list = getLocalMessages();
  saveLocalMessages(list.filter((m) => m.id !== id));
  return { success: true };
}

/**
 * Retrieves the count of unread messages for badges
 */
export async function fetchUnreadMessagesCount(): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      if (!error && count !== null) {
        return count;
      }
    } catch {
      // Fallback
    }
  }

  return getLocalMessages().filter((m) => m.status === 'unread').length;
}
