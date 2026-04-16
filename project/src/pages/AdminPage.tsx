import { useState, useEffect } from 'react';
import { Shield, LogIn, MessageSquare, Send, CheckCircle, Clock, AlertTriangle, Users, Lightbulb, X, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Report, ReportMessage, Initiative } from '../lib/types';
import {
  categoryLabels,
  categoryColors,
  statusLabels,
  statusColors,
  initiativeCategoryLabels,
  initiativeCategoryColors,
  formatDate,
} from '../lib/utils';

type AdminTab = 'reports' | 'initiatives';

interface ReportWithMessages extends Report {
  messages: ReportMessage[];
  expanded: boolean;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>('reports');
  const [reports, setReports] = useState<ReportWithMessages[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [adminResponse, setAdminResponse] = useState<Record<string, string>>({});
  const [dataLoading, setDataLoading] = useState(false);

  const [isRegister, setIsRegister] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError('שגיאה ביצירת חשבון: ' + error.message);
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) {
          setAuthError('החשבון נוצר. אנא התחבר.');
          setIsRegister(false);
        } else {
          setAuthed(true);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError('פרטי הכניסה שגויים. נסה שנית.');
      } else {
        setAuthed(true);
      }
    }
    setAuthLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) setAuthed(true);
    });
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    const [{ data: reportData }, { data: initData }] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('initiatives').select('*').order('created_at', { ascending: false }),
    ]);

    if (reportData) {
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
      const priorityOrder = { urgent: 0, discipline: 1, climate: 2 };
      const statusOrder = { open: 0, in_progress: 1, resolved: 2 };
      withMessages.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
        return priorityOrder[a.category] - priorityOrder[b.category];
      });
      setReports(withMessages);
    }

    if (initData) {
      const withVotes = await Promise.all(
        initData.map(async (init) => {
          const { count } = await supabase
            .from('initiative_votes')
            .select('*', { count: 'exact', head: true })
            .eq('initiative_id', init.id);
          return { ...init, vote_count: count || 0 };
        })
      );
      withVotes.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      setInitiatives(withVotes);
    }

    setDataLoading(false);
  };

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  const toggleExpand = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r))
    );
  };

  const sendAdminMessage = async (reportId: string) => {
    const text = replyText[reportId]?.trim();
    if (!text) return;
    await supabase.from('report_messages').insert({
      report_id: reportId,
      sender_role: 'admin',
      content: text,
    });
    setReplyText((prev) => ({ ...prev, [reportId]: '' }));
    fetchData();
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    setUpdatingStatus((prev) => ({ ...prev, [reportId]: true }));
    await supabase.from('reports').update({ status }).eq('id', reportId);
    setUpdatingStatus((prev) => ({ ...prev, [reportId]: false }));
    fetchData();
  };

  const updateInitiativeStatus = async (id: string, status: string, response?: string) => {
    await supabase.from('initiatives').update({
      status,
      admin_response: response || '',
    }).eq('id', id);
    fetchData();
  };

  const stats = {
    urgent: reports.filter((r) => r.category === 'urgent' && r.status !== 'resolved').length,
    discipline: reports.filter((r) => r.category === 'discipline' && r.status !== 'resolved').length,
    climate: reports.filter((r) => r.category === 'climate' && r.status !== 'resolved').length,
    pending: initiatives.filter((i) => i.status === 'pending').length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
              {isRegister ? 'הגדרת חשבון הנהלה' : 'כניסת הנהלה'}
            </h1>
            <p className="text-slate-500 text-sm">אזור מוגן — לצוות בית הספר בלבד</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">כתובת מייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="admin@school.il"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="••••••••"
              />
            </div>
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {authLoading ? (isRegister ? 'יוצר חשבון...' : 'מתחבר...') : (isRegister ? 'צור חשבון הנהלה' : 'כניסה')}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors mt-1"
            >
              {isRegister ? 'כבר יש חשבון? כנס כאן' : 'הגדרה ראשונית? צור חשבון הנהלה'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-amber-600" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900">לוח בקרה — הנהלה</h1>
              <p className="text-xs text-slate-400">הקול בכיתה</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            התנתק
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'דחוף פתוח', value: stats.urgent, color: 'bg-red-50 border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
            { label: 'משמעת פתוח', value: stats.discipline, color: 'bg-amber-50 border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
            { label: 'אקלים פתוח', value: stats.climate, color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
            { label: 'יוזמות חדשות', value: stats.pending, color: 'bg-blue-50 border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border ${stat.color} p-5 flex items-center gap-4`}>
              <div className={`w-3 h-3 rounded-full ${stat.dot} flex-shrink-0`} />
              <div>
                <div className={`text-3xl font-extrabold ${stat.text}`}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'reports' as AdminTab, label: 'דיווחים', icon: <AlertTriangle size={14} /> },
            { id: 'initiatives' as AdminTab, label: 'יוזמות', icon: <Lightbulb size={14} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">טוען נתונים...</p>
          </div>
        )}

        {!dataLoading && tab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">אין דיווחים פתוחים. כל הכבוד!</p>
              </div>
            )}
            {reports.map((report) => {
              const colors = categoryColors[report.category];
              return (
                <div key={report.id} className={`bg-white rounded-2xl border-2 ${colors.border} shadow-sm overflow-hidden`}>
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
                          {!report.is_anonymous && report.reporter_name && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                              <Users size={10} />
                              {report.reporter_name}
                            </span>
                          )}
                          {report.is_anonymous && (
                            <span className="text-xs text-slate-400">אנונימי</span>
                          )}
                          {report.messages.length > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 flex items-center gap-1">
                              <MessageSquare size={10} />
                              {report.messages.length} הודעות
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">{report.title}</h3>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <Clock size={11} />
                          {formatDate(report.created_at)}
                          {report.location && ` · ${report.location}`}
                        </div>
                      </div>
                      <div className="text-slate-400">
                        {report.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {report.expanded && (
                    <div className="px-6 py-5 space-y-5">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-slate-500 mb-1">תיאור</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{report.description}</p>
                        {report.media_url && (
                          <a
                            href={report.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:underline"
                          >
                            צפה בקובץ מצורף
                          </a>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">עדכן סטטוס</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['open', 'in_progress', 'resolved'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateReportStatus(report.id, s)}
                              disabled={updatingStatus[report.id] || report.status === s}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                report.status === s
                                  ? statusColors[s] + ' cursor-default'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {statusLabels[s]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <MessageSquare size={16} />
                          צ'אט אנונימי עם המדווח
                        </h4>
                        <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
                          {report.messages.length === 0 && (
                            <p className="text-slate-400 text-sm text-center py-4 bg-slate-50 rounded-xl">
                              שלח הודעה ראשונה — המדווח יראה אותה אנונימית
                            </p>
                          )}
                          {report.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                  msg.sender_role === 'admin'
                                    ? 'bg-amber-100 text-amber-900 rounded-tr-sm'
                                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs mt-1 opacity-60">
                                  {msg.sender_role === 'admin' ? 'הנהלה' : 'מדווח'} · {formatDate(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText[report.id] || ''}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [report.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendAdminMessage(report.id);
                              }
                            }}
                            placeholder="שלח הודעה למדווח האנונימי..."
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <button
                            onClick={() => sendAdminMessage(report.id)}
                            disabled={!replyText[report.id]?.trim()}
                            className="bg-amber-500 text-white p-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!dataLoading && tab === 'initiatives' && (
          <div className="space-y-4">
            {initiatives.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Lightbulb size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">אין יוזמות עדיין</p>
              </div>
            )}
            {initiatives.map((initiative) => (
              <div key={initiative.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${initiativeCategoryColors[initiative.category]}`}>
                        {initiativeCategoryLabels[initiative.category]}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[initiative.status]}`}>
                        {statusLabels[initiative.status]}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                        <ArrowUpDown size={10} />
                        {initiative.vote_count || 0} תמיכות
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{initiative.title}</h3>
                    <p className="text-slate-500 text-sm mb-2">{initiative.description}</p>
                    <p className="text-xs text-slate-400">
                      {initiative.is_anonymous ? 'תלמיד אנונימי' : initiative.submitter_name} · {formatDate(initiative.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-700 mb-2">תגובה ועדכון סטטוס</p>
                  <textarea
                    value={adminResponse[initiative.id] ?? initiative.admin_response ?? ''}
                    onChange={(e) => setAdminResponse((prev) => ({ ...prev, [initiative.id]: e.target.value }))}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none mb-3"
                    placeholder="כתוב תגובה לתלמיד (אופציונלי)..."
                  />
                  <div className="flex gap-2 flex-wrap">
                    {(['pending', 'approved', 'in_progress', 'done', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateInitiativeStatus(initiative.id, s, adminResponse[initiative.id] ?? initiative.admin_response)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          initiative.status === s
                            ? statusColors[s] + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
