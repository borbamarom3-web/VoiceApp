import { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Upload, X, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReportCategory, Page } from '../lib/types';
import { getOrCreateAnonymousToken, categoryColors, categoryLabels } from '../lib/utils';

interface ReportPageProps {
  onNavigate: (page: Page) => void;
}

type Step = 'category' | 'form' | 'success';

export default function ReportPage({ onNavigate }: ReportPageProps) {
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportId, setReportId] = useState('');

  const selectCategory = (cat: ReportCategory) => {
    setCategory(cat);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !description.trim()) return;
    setLoading(true);
    setError('');

    const anonToken = getOrCreateAnonymousToken();
    const { data, error: err } = await supabase
      .from('reports')
      .insert({
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        media_url: mediaUrl.trim(),
        is_anonymous: isAnonymous,
        reporter_name: isAnonymous ? null : reporterName.trim() || null,
        anonymous_token: anonToken,
      })
      .select()
      .single();

    if (err) {
      setError('אירעה שגיאה בשליחת הדיווח. אנא נסה שנית.');
    } else if (data) {
      setReportId(data.id);
      setStep('success');
    }
    setLoading(false);
  };

  const reset = () => {
    setStep('category');
    setCategory(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setMediaUrl('');
    setReporterName('');
    setIsAnonymous(true);
    setError('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">הדיווח נשלח בהצלחה!</h2>
          <p className="text-slate-500 mb-2">
            {isAnonymous
              ? 'דיווחך נשלח באופן אנונימי. ניתן לעקוב אחרי התגובות בדף "הדיווחים שלי".'
              : 'דיווחך נשלח בהצלחה. ניתן לעקוב אחרי הטיפול בדף "הדיווחים שלי".'}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 my-6 text-left" dir="ltr">
            <p className="text-xs text-slate-400 mb-1">מזהה דיווח</p>
            <p className="font-mono text-xs text-slate-600 break-all">{reportId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('my-reports')}
              className="bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              עקוב אחרי הדיווח שלי
            </button>
            <button
              onClick={reset}
              className="text-slate-500 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200"
            >
              שלח דיווח נוסף
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'category') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">דיווח על אירוע</h1>
            <p className="text-slate-500">בחר את סוג הדיווח כדי לעזור לנו לטפל בו בצורה הנכונה</p>
          </div>
          <div className="space-y-4">
            {(['urgent', 'discipline', 'climate'] as ReportCategory[]).map((cat) => {
              const colors = categoryColors[cat];
              return (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className={`w-full ${colors.bg} border-2 ${colors.border} rounded-2xl p-6 text-right flex items-start gap-5 hover:shadow-md transition-all group`}
                >
                  <div className={`w-4 h-4 rounded-full ${colors.dot} mt-1 flex-shrink-0 group-hover:scale-125 transition-transform`} />
                  <div className="flex-1">
                    <div className={`font-extrabold text-lg ${colors.text} mb-1`}>{categoryLabels[cat]}</div>
                    <p className="text-slate-500 text-sm">
                      {cat === 'urgent' && 'חרם, בריונות, אלימות, פגיעה נפשית — טיפול מיידי'}
                      {cat === 'discipline' && 'ונדליזם, נזק לרכוש, גניבה, לכלוך — טיפול מהיר'}
                      {cat === 'climate' && 'יחס מזלזל, בעיות תחזוקה, הצעות לשיפור — שיפור מתמיד'}
                    </p>
                  </div>
                  <AlertTriangle size={20} className={`${colors.text} opacity-60 mt-1 flex-shrink-0`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const colors = category ? categoryColors[category] : categoryColors.climate;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setStep('category')}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">פרטי הדיווח</h1>
            {category && (
              <span className={`text-sm font-semibold ${colors.text}`}>{categoryLabels[category]}</span>
            )}
          </div>
        </div>

        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-5 mb-6`}>
          <p className="font-semibold text-slate-800 mb-1">בחר את רמת הגנתך</p>
          <p className="text-slate-500 text-sm mb-4">הזהות שלך בטוחה בכל מקרה. ניתן לשנות את הבחירה בכל עת.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsAnonymous(true)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-right ${
                isAnonymous ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'
              }`}
            >
              <EyeOff size={18} className={isAnonymous ? 'text-blue-600' : 'text-slate-400'} />
              <div>
                <div className="font-semibold text-sm text-slate-800">אנונימי</div>
                <div className="text-xs text-slate-400">זהותי מוצפנת</div>
              </div>
            </button>
            <button
              onClick={() => setIsAnonymous(false)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-right ${
                !isAnonymous ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'
              }`}
            >
              <Eye size={18} className={!isAnonymous ? 'text-blue-600' : 'text-slate-400'} />
              <div>
                <div className="font-semibold text-sm text-slate-800">מזוהה</div>
                <div className="text-xs text-slate-400">קרדיט וליווי אישי</div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isAnonymous && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">שמך המלא</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="שם פרטי ושם משפחה"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">כותרת הדיווח *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="תאר בקצרה מה קרה..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">תיאור מפורט *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              placeholder="תאר את האירוע בפירוט — מי, מה, מתי, כמה פעמים..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} />
              מיקום האירוע
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="כיתה, חצר, שירותים, מסדרון..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Upload size={14} />
              קישור לתמונה / סרטון (אופציונלי)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="https://..."
              dir="ltr"
            />
            <p className="text-xs text-slate-400 mt-1">ניתן להעלות תמונה ל-Google Photos, Dropbox או כל שירות שיתוף ולהדביק את הקישור</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim() || !description.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
          >
            {loading ? 'שולח...' : isAnonymous ? 'שלח דיווח אנונימי' : 'שלח דיווח מזוהה'}
          </button>
        </form>
      </div>
    </div>
  );
}
