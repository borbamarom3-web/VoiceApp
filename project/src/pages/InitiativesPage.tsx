import { useState, useEffect } from 'react';
import { ThumbsUp, Plus, X, Lightbulb, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Initiative, InitiativeCategory } from '../lib/types';
import {
  getOrCreateAnonymousToken,
  getVoterToken,
  initiativeCategoryLabels,
  initiativeCategoryColors,
  statusLabels,
  statusColors,
  formatDate,
} from '../lib/utils';

type FilterCat = 'all' | InitiativeCategory;

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterCat>('all');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const [category, setCategory] = useState<InitiativeCategory>('physical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const voterToken = getVoterToken();
  const anonToken = getOrCreateAnonymousToken();

  const fetchInitiatives = async () => {
    const { data: initData } = await supabase
      .from('initiatives')
      .select('*')
      .order('created_at', { ascending: false });

    if (!initData) {
      setLoading(false);
      return;
    }

    const withVotes = await Promise.all(
      initData.map(async (init) => {
        const { count } = await supabase
          .from('initiative_votes')
          .select('*', { count: 'exact', head: true })
          .eq('initiative_id', init.id);
        const { data: myVote } = await supabase
          .from('initiative_votes')
          .select('id')
          .eq('initiative_id', init.id)
          .eq('voter_token', voterToken)
          .maybeSingle();
        return { ...init, vote_count: count || 0, user_voted: !!myVote };
      })
    );

    setInitiatives(withVotes);
    const voted = new Set(withVotes.filter((i) => i.user_voted).map((i) => i.id));
    setVotedIds(voted);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const vote = async (id: string) => {
    if (votedIds.has(id)) return;
    await supabase.from('initiative_votes').insert({
      initiative_id: id,
      voter_token: voterToken,
    });
    setVotedIds((prev) => new Set([...prev, id]));
    setInitiatives((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, vote_count: (i.vote_count || 0) + 1, user_voted: true } : i
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);

    await supabase.from('initiatives').insert({
      category,
      title: title.trim(),
      description: description.trim(),
      submitter_name: isAnonymous ? 'תלמיד אנונימי' : submitterName.trim() || 'תלמיד',
      is_anonymous: isAnonymous,
      anonymous_token: anonToken,
    });

    setSubmitting(false);
    setSubmitted(true);
    setTitle('');
    setDescription('');
    setSubmitterName('');
    setIsAnonymous(false);
    fetchInitiatives();
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2500);
  };

  const filtered = filter === 'all' ? initiatives : initiatives.filter((i) => i.category === filter);

  const sorted = [...filtered].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">יוזמות תלמידים</h1>
            <p className="text-slate-500">הצביעו על הרעיונות שהכי חשובים לכם</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-5 py-3 rounded-xl hover:shadow-md hover:scale-105 transition-all"
          >
            <Plus size={18} />
            הצע יוזמה
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          {(['all', 'physical', 'social', 'academic'] as FilterCat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {f === 'all' ? 'הכל' : initiativeCategoryLabels[f]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">טוען יוזמות...</p>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Lightbulb size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">אין יוזמות עדיין</h3>
            <p className="text-slate-400 mb-6">היה הראשון להציע רעיון לשיפור בית הספר!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              הצע יוזמה ראשונה
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((initiative) => (
            <div
              key={initiative.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${initiativeCategoryColors[initiative.category]}`}>
                      {initiativeCategoryLabels[initiative.category]}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[initiative.status]}`}>
                      {statusLabels[initiative.status]}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight">{initiative.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{initiative.description}</p>
                {initiative.admin_response && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1">תגובת ההנהלה</p>
                    <p className="text-sm text-blue-800">{initiative.admin_response}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs text-slate-400">
                  {initiative.is_anonymous ? 'תלמיד אנונימי' : initiative.submitter_name} · {formatDate(initiative.created_at)}
                </div>
                <button
                  onClick={() => vote(initiative.id)}
                  disabled={votedIds.has(initiative.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    votedIds.has(initiative.id)
                      ? 'bg-blue-100 text-blue-600 cursor-default'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ThumbsUp size={14} />
                  {initiative.vote_count || 0}
                  {votedIds.has(initiative.id) && ' · תמכת'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">הצע יוזמה חדשה</h2>
              <button
                onClick={() => { setShowForm(false); setSubmitted(false); }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">היוזמה הוגשה!</h3>
                <p className="text-slate-500">תודה! ההנהלה תבחן את הרעיון שלך.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">קטגוריה</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['physical', 'social', 'academic'] as InitiativeCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                          category === cat
                            ? `border-blue-400 ${initiativeCategoryColors[cat]}`
                            : 'border-slate-200 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        {initiativeCategoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">כותרת הרעיון *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="תאר בקצרה את הרעיון שלך..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">תיאור מפורט *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    placeholder="הסבר את הרעיון שלך — למה זה חשוב? איך זה יעזור לבית הספר?"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      isAnonymous ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isAnonymous ? 'translate-x-0.5' : 'translate-x-5'
                    }`} />
                  </button>
                  <label className="text-sm text-slate-700 cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                    הגש באופן אנונימי
                  </label>
                </div>

                {!isAnonymous && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">שמך</label>
                    <input
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="שם פרטי ושם משפחה"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'שולח...' : 'הגש יוזמה'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
