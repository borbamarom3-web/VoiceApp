import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Report, ReportMessage } from '../lib/types';
import {
  getOrCreateAnonymousToken,
  categoryLabels,
  categoryColors,
  statusLabels,
  statusColors,
  formatDate,
} from '../lib/utils';

interface ReportWithMessages extends Report {
  messages: ReportMessage[];
  expanded: boolean;
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<ReportWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<Record<string, HTMLDivElement | null>>({});

  const anonToken = getOrCreateAnonymousToken();

  const fetchReports = async () => {
    const { data: reportData } = await supabase
      .from('reports')
      .select('*')
      .eq('anonymous_token', anonToken)
      .order('created_at', { ascending: false });

    if (!reportData) {
      setLoading(false);
      return;
    }

    const withMessages = await Promise.all(
      reportData.map(async (r) => {
        const { data: msgs } = await supabase
          .from('report_messages')
          .select('*')
          .eq('report_id', r.id)
          .order('created_at', { ascending: true });
        return { ...r, messages: msgs || [], expanded: false };
      })
    );

    setReports(withMessages);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleExpand = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r))
    );
  };

  const sendReply = async (reportId: string) => {
    const text = replyText[reportId]?.trim();
    if (!text) return;
    setSendingReply((prev) => ({ ...prev, [reportId]: true }));

    await supabase.from('report_messages').insert({
      report_id: reportId,
      sender_role: 'reporter',
      content: text,
    });

    setReplyText((prev) => ({ ...prev, [reportId]: '' }));
    setSendingReply((prev) => ({ ...prev, [reportId]: false }));
    fetchReports();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">טוען את הדיווחים שלך...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">הדיווחים שלי</h1>
          <p className="text-slate-500">
            {reports.length > 0
              ? `נמצאו ${reports.length} דיווח${reports.length > 1 ? 'ים' : ''} המקושרים למכשיר זה`
              : 'לא נמצאו דיווחים קשורים למכשיר זה'}
          </p>
        </div>

        {reports.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">אין דיווחים עדיין</h3>
            <p className="text-slate-400">דיווחים שתשלח מהמכשיר הזה יופיעו כאן.</p>
          </div>
        )}

        <div className="space-y-4">
          {reports.map((report) => {
            const colors = categoryColors[report.category];
            const hasAdminMessages = report.messages.some((m) => m.sender_role === 'admin');

            return (
              <div
                key={report.id}
                className={`bg-white rounded-2xl border-2 ${colors.border} shadow-sm overflow-hidden`}
              >
                <div
                  className={`${colors.bg} px-6 py-4 cursor-pointer`}
                  onClick={() => toggleExpand(report.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                          {categoryLabels[report.category]}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[report.status]}`}>
                          {statusLabels[report.status]}
                        </span>
                        {hasAdminMessages && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                            <MessageSquare size={10} />
                            תגובה מההנהלה
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg truncate">{report.title}</h3>
                      <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                        <Clock size={11} />
                        {formatDate(report.created_at)}
                        {report.location && ` · ${report.location}`}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-slate-400">
                      {report.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {report.expanded && (
                  <div className="px-6 py-5">
                    <div className="bg-slate-50 rounded-xl p-4 mb-5">
                      <p className="text-sm font-semibold text-slate-500 mb-1">תיאור הדיווח</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{report.description}</p>
                    </div>

                    <div className="mb-5">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} />
                        צ'אט עם ההנהלה
                        <span className="text-xs text-slate-400 font-normal">(זהותך נשמרת אנונימית)</span>
                      </h4>

                      {report.messages.length === 0 ? (
                        <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400 text-sm">
                          אין הודעות עדיין. ההנהלה עשויה לשלוח שאלות הבהרה כאן.
                        </div>
                      ) : (
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {report.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender_role === 'reporter' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                  msg.sender_role === 'reporter'
                                    ? 'bg-slate-100 text-slate-800 rounded-tr-sm'
                                    : 'bg-blue-600 text-white rounded-tl-sm'
                                }`}
                              >
                                <p className="leading-relaxed">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.sender_role === 'reporter' ? 'text-slate-400' : 'text-blue-200'}`}>
                                  {msg.sender_role === 'reporter' ? 'אתה' : 'ההנהלה'} · {formatDate(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={(el) => { messagesEndRef.current[report.id] = el; }} />
                        </div>
                      )}

                      {report.status !== 'resolved' && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText[report.id] || ''}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [report.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendReply(report.id);
                              }
                            }}
                            placeholder="כתוב תגובה להנהלה..."
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <button
                            onClick={() => sendReply(report.id)}
                            disabled={sendingReply[report.id] || !replyText[report.id]?.trim()}
                            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
