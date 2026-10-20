import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Mail,
  Send,
  Eye,
  Edit3,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { NewsletterCampaign, CampaignStatus } from '../../types';
import {
  fetchCampaigns,
  saveCampaign,
  sendTestEmail,
  processCampaignBatch,
  fetchSubscribersForAdmin,
} from '../../services/newsletterService';

export const DashboardNewsletter: React.FC = () => {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedCount, setConfirmedCount] = useState(0);

  // Composer Form State
  const [isComposing, setIsComposing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [content, setContent] = useState('');

  // Test-Send & Dispatch State
  const [testEmail, setTestEmail] = useState('editor@everygyan.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [dispatchingBatch, setDispatchingBatch] = useState(false);

  // Notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [camps, subs] = await Promise.all([
        fetchCampaigns(),
        fetchSubscribersForAdmin({ status: 'confirmed' }),
      ]);
      setCampaigns(camps);
      setConfirmedCount(subs.filter((s) => s.status === 'confirmed').length);
    } catch (err: unknown) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartNewCampaign = () => {
    setSelectedCampaignId(null);
    setTitle('');
    setSubject('EveryGyan Weekly: ');
    setPreheader('');
    setContent(
      `# Welcome to EveryGyan Weekly\n\nHere is your weekend editorial digest covering insights across travel, tech, health, and enterprise SAP learning.\n\n## Lead Story of the Week\n...\n\nThank you for reading EveryGyan!`
    );
    setIsComposing(true);
    setIsPreview(false);
  };

  const handleEditCampaign = (camp: NewsletterCampaign) => {
    setSelectedCampaignId(camp.id);
    setTitle(camp.title);
    setSubject(camp.subject);
    setPreheader(camp.preheader || '');
    setContent(camp.content);
    setIsComposing(true);
    setIsPreview(false);
  };

  const handleSaveDraft = async () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);

    const { data, error } = await saveCampaign({
      id: selectedCampaignId || undefined,
      title,
      subject,
      preheader,
      content,
      status: 'draft',
    });

    if (error) {
      setFeedbackError(error);
      return;
    }

    if (data) {
      setFeedbackSuccess('Campaign draft saved successfully.');
      setSelectedCampaignId(data.id);
      loadData();
    }
  };

  const handleSendTest = async () => {
    if (!selectedCampaignId) {
      setFeedbackError('Please save the campaign draft first before sending a test.');
      return;
    }

    setSendingTest(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    const res = await sendTestEmail(selectedCampaignId, testEmail);
    setSendingTest(false);

    if (res.success) {
      setFeedbackSuccess(res.message);
    } else {
      setFeedbackError(res.error || res.message);
    }
  };

  const handleDispatchBatch = async (campaignId: string) => {
    if (
      !window.confirm(
        `Are you sure you want to dispatch a broadcast batch of 25 emails to confirmed subscribers? This will strictly exclude unconfirmed or unsubscribed addresses.`
      )
    ) {
      return;
    }

    setDispatchingBatch(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    const res = await processCampaignBatch(campaignId, 25);
    setDispatchingBatch(false);

    if (res.failed > 0 && res.sent === 0) {
      setFeedbackError(`Batch dispatch failed. Check send logs for transport errors.`);
    } else {
      setFeedbackSuccess(
        `Batch processed: ${res.sent} sent successfully${res.failed > 0 ? `, ${res.failed} failed` : ''}. (${
          res.isComplete ? 'Campaign Completed' : 'Further batches queued'
        })`
      );
    }

    loadData();
  };

  const statusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'sent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Delivered
          </span>
        );
      case 'sending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            In Queue / Sending
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Scheduled
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Delivery Failure
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Newsletter Campaigns</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author weekly editorial digests, test transport delivery, and process Hostinger-compliant batches.
          </p>
        </div>
        {!isComposing && (
          <button
            onClick={handleStartNewCampaign}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Issue</span>
          </button>
        )}
      </div>

      {/* Hostinger Rate Limit & Policy Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Hostinger Email Plan Compliance &amp; Send Limits</p>
          <p className="mt-0.5 text-amber-700 leading-relaxed">
            Standard Hostinger Business plans limit outbound SMTP to ~500 to 1,000 emails/day (~100 emails/hour).
            Our sending queue automatically batches dispatches into safe chunks of <strong>25 emails</strong>. Unconfirmed
            or unsubscribed addresses are strictly barred from marketing sends.
          </p>
        </div>
      </div>

      {/* Notification Banners */}
      {feedbackError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{feedbackError}</span>
          </div>
          <button onClick={() => setFeedbackError(null)} className="font-bold text-red-500 hover:text-red-700 ml-4">
            ✕
          </button>
        </div>
      )}
      {feedbackSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button onClick={() => setFeedbackSuccess(null)} className="font-bold text-emerald-500 hover:text-emerald-700 ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Composer Section */}
      {isComposing ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {selectedCampaignId ? 'Edit Newsletter Issue' : 'Compose Newsletter Issue'}
              </h2>
              <p className="text-xs text-slate-400">
                Eligible recipients: <strong className="text-emerald-600">{confirmedCount} confirmed subscribers</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isPreview ? 'Back to Editor' : 'Preview'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => setIsComposing(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>

          {isPreview ? (
            /* Email Client Preview Frame */
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 max-w-2xl mx-auto space-y-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <p>
                  <strong className="text-slate-500">From:</strong> EveryGyan Editorial &lt;newsletter@everygyan.com&gt;
                </p>
                <p>
                  <strong className="text-slate-500">Subject:</strong> {subject || '(No subject)'}
                </p>
                {preheader && (
                  <p>
                    <strong className="text-slate-500">Preheader:</strong> {preheader}
                  </p>
                )}
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-800 space-y-4 shadow-sm">
                <div className="border-b border-slate-100 pb-4 text-center">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">EveryGyan</h3>
                  <p className="text-[11px] text-red-600 font-semibold uppercase tracking-widest mt-0.5">
                    Knowledge for Everyone, Everywhere
                  </p>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>

                <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400 space-y-1">
                  <p>You received this email because you subscribed to EveryGyan Weekly.</p>
                  <p>
                    <span className="text-red-600 underline cursor-pointer">Unsubscribe</span> from future editions with one click.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Editor Inputs */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="camp_title" className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Campaign Title
                  </label>
                  <input
                    id="camp_title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Issue #15 — October Tech & Travel Highlights"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="camp_subject" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    id="camp_subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., EveryGyan: 10 Autumn Escapes + SAP Migration Strategy"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="camp_preheader" className="block text-xs font-semibold text-slate-700 mb-1">
                  Preheader Snippet (Inbox preview text)
                </label>
                <input
                  id="camp_preheader"
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Short 1-sentence preview visible in inbox list"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="camp_content" className="block text-xs font-semibold text-slate-700 mb-1">
                  Newsletter Markdown Body
                </label>
                <textarea
                  id="camp_content"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the weekly editorial digest in Markdown..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Test-Send input */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="admin@everygyan.com"
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-56"
                  />
                  <button
                    type="button"
                    disabled={sendingTest}
                    onClick={handleSendTest}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
                  >
                    {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Send Test</span>
                  </button>
                </div>

                {/* Batch Dispatch */}
                {selectedCampaignId && (
                  <button
                    type="button"
                    disabled={dispatchingBatch || confirmedCount === 0}
                    onClick={() => handleDispatchBatch(selectedCampaignId)}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 self-end md:self-auto cursor-pointer"
                  >
                    {dispatchingBatch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch Batch (25 recipients)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Campaigns Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Campaign History &amp; Queue</h2>
          <button
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No campaigns composed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Create your first weekly letter to broadcast to confirmed subscribers.
            </p>
            <button
              onClick={handleStartNewCampaign}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900">{camp.title}</p>
                    {statusBadge(camp.status)}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{camp.subject}</p>
                  <p className="text-[11px] text-slate-400">
                    Recipients: {camp.sent_count} sent / {camp.recipients_count} confirmed
                    {camp.failed_count > 0 && <span className="text-red-500 font-bold ml-1">({camp.failed_count} failed)</span>}
                    {camp.sent_at && <span> • Sent on {new Date(camp.sent_at).toLocaleDateString()}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleEditCampaign(camp)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {camp.status !== 'sent' && (
                    <button
                      onClick={() => handleDispatchBatch(camp.id)}
                      disabled={dispatchingBatch || confirmedCount === 0}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Batch</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardNewsletter;
