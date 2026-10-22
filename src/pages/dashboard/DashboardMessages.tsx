import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox,
  Search,
  Mail,
  Reply,
  CheckCircle,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { ContactMessage, MessageStatus } from '../../types';
import {
  fetchContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../../services/contactService';

export const DashboardMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Active message modal states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [copied, setCopied] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContactMessages({
        status: statusFilter,
        search,
      });
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setActionError('Failed to load contact inquiries from database.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleOpenDetails = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    // Auto-mark as read if unread
    if (msg.status === 'unread') {
      await updateContactMessageStatus(msg.id, 'read');
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
      );
    }
  };

  const handleOpenReplyModal = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    const template = `Dear ${msg.name},

Thank you for reaching out to the EveryGyan editorial team regarding "${msg.subject}".

[Write your response here...]

Best regards,
EveryGyan Editorial Team
https://everygyan.com`;
    setReplyText(template);
    setReplyModalOpen(true);
    setCopied(false);
  };

  const handleSendMailto = async () => {
    if (!selectedMessage) return;

    const subject = `Re: ${selectedMessage.subject}`;
    const mailtoUrl = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(replyText)}`;

    // Open user's default email client
    window.open(mailtoUrl, '_blank');

    // Mark as replied in database
    await updateContactMessageStatus(selectedMessage.id, 'replied');
    setMessages((prev) =>
      prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: 'replied' } : m))
    );
    setActionSuccess(`Marked message from ${selectedMessage.name} as replied.`);
    setReplyModalOpen(false);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStatusChange = async (id: string, newStatus: MessageStatus) => {
    setActionError(null);
    setActionSuccess(null);
    const res = await updateContactMessageStatus(id, newStatus);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      setActionSuccess(`Message updated to "${newStatus}".`);
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } else {
      setActionError(res.error || 'Failed to update message status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the message from ${name}?`)) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    const res = await deleteContactMessage(id);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setActionSuccess('Message removed successfully.');
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } else {
      setActionError(res.error || 'Failed to delete message.');
    }
  };

  const statusBadge = (status: MessageStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            Unread
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Read
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Replied
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-red-600" />
            <span>Reader Inquiries & Contact Messages</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review inquiries submitted through the public contact form, track response status, and reply directly.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 font-bold ml-4">
            ×
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or subject..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 w-full md:w-auto">
          {['all', 'unread', 'read', 'replied', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading messages from database...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Mail className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Messages Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {statusFilter === 'all'
                ? 'No inquiries have been received yet. Test by submitting a note on the /contact page.'
                : `No messages match the "${statusFilter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Subject & Message</th>
                  <th className="py-3.5 px-4">Date Received</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      msg.status === 'unread' ? 'bg-red-50/20 font-medium' : ''
                    }`}
                  >
                    {/* Sender */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 text-sm">{msg.name}</div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-slate-500 hover:text-red-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{msg.email}</span>
                      </a>
                    </td>

                    {/* Subject & Message */}
                    <td className="py-3.5 px-4 align-top max-w-md">
                      <div className="font-bold text-slate-800 text-xs mb-1">{msg.subject}</div>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {statusBadge(msg.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenDetails(msg)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold inline-flex items-center gap-1 transition-colors"
                        title="View Full Message"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>

                      <button
                        onClick={() => handleOpenReplyModal(msg)}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold inline-flex items-center gap-1 transition-colors shadow-sm"
                        title="Reply via Email"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>

                      <button
                        onClick={() => handleDelete(msg.id, msg.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && !replyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-1">
                  Inquiry Details
                </span>
                <h2 className="text-xl font-bold text-slate-900">{selectedMessage.subject}</h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">From:</span>
                <span className="font-bold text-slate-800">{selectedMessage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Email:</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="font-bold text-red-600 hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Received:</span>
                <span className="text-slate-700">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
                <span className="text-slate-500 font-semibold">Status:</span>
                <div className="flex items-center gap-2">
                  {statusBadge(selectedMessage.status)}
                  <select
                    value={selectedMessage.status}
                    onChange={(e) =>
                      handleStatusChange(selectedMessage.id, e.target.value as MessageStatus)
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Message</h4>
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans border border-slate-100 max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenReplyModal(selectedMessage)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Reply className="w-4 h-4" />
                <span>Compose Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-0.5">
                  Replying to Reader
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Send Email to {selectedMessage.name} ({selectedMessage.email})
                </h2>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Subject: </span>
              <span>Re: {selectedMessage.subject}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reply Content (Edit before sending)
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={9}
                className="w-full p-3 font-mono text-xs leading-relaxed border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyReply}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendMailto}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Email & Mark Replied</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMessages;
