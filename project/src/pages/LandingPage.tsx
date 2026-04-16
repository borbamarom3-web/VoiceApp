import { AlertTriangle, MessageSquare, Lightbulb, Shield, Eye, Users, ArrowLeft } from 'lucide-react';
import { Page } from '../lib/types';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Shield size={14} />
            בטוח · אנונימי · אפקטיבי
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            הקול שלך{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              שינוי אמיתי
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            פלטפורמה דיגיטלית שמאפשרת לכל תלמיד להשפיע על בית הספר שלו — לדווח על עוולות בצורה מוגנת, וליזום שינויים חיוביים.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('report')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all text-lg"
            >
              דווח על אירוע
            </button>
            <button
              onClick={() => onNavigate('initiatives')}
              className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all text-lg"
            >
              צפה ביוזמות תלמידים
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6" dir="rtl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">כיצד המערכת עובדת?</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">שלושה שלבים פשוטים שהופכים שתיקה לשינוי</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye size={28} className="text-blue-600" />,
                title: 'ראית משהו?',
                desc: 'חרם, בריונות, ונדליזם — כל אירוע שמדאיג אותך. שלח דיווח בלחיצה אחת עם אפשרות לצרף תמונה או סרטון.',
                step: '01',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: <Shield size={28} className="text-cyan-600" />,
                title: 'בחר את רמת הגנתך',
                desc: 'אנונימי לחלוטין? מזוהה? הבחירה בידיך. המערכת מצפינה את זהותך ומאפשרת דיאלוג עם ההנהלה — ללא חשיפה.',
                step: '02',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                icon: <MessageSquare size={28} className="text-emerald-600" />,
                title: 'צ\'אט אנונימי דו-כיווני',
                desc: 'ההנהלה יכולה לשאול אותך שאלות הבהרה ואתה עונה — מבלי שידעו מי אתה. בעיות נפתרות בזמן אמת.',
                step: '03',
                color: 'from-emerald-500 to-emerald-600',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-4 left-4 text-5xl font-extrabold text-slate-100">{item.step}</div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6" dir="rtl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">מערכת סיווג חכמה</h2>
            <p className="text-slate-500 text-lg">כל דיווח מקבל עדיפות אוטומטית</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                color: 'border-red-300 bg-red-50',
                badge: 'bg-red-100 text-red-700',
                dot: 'bg-red-500',
                title: 'אדום — דחוף',
                label: 'עדיפות עליונה',
                items: ['חרם ובידוד חברתי', 'אלימות פיזית', 'פגיעה נפשית'],
              },
              {
                color: 'border-amber-300 bg-amber-50',
                badge: 'bg-amber-100 text-amber-700',
                dot: 'bg-amber-500',
                title: 'צהוב — משמעת',
                label: 'טיפול מהיר',
                items: ['ונדליזם ונזק לרכוש', 'לכלוך ואי-סדר', 'גניבה'],
              },
              {
                color: 'border-emerald-300 bg-emerald-50',
                badge: 'bg-emerald-100 text-emerald-700',
                dot: 'bg-emerald-500',
                title: 'ירוק — אקלים',
                label: 'שיפור מתמיד',
                items: ['יחס מזלזל מצד מורה', 'בעיות תחזוקה', 'לכלוך בשירותים'],
              },
            ].map((cat) => (
              <div key={cat.title} className={`rounded-2xl p-7 border-2 ${cat.color}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-3 h-3 rounded-full ${cat.dot} animate-pulse`} />
                  <span className="font-extrabold text-slate-900 text-lg">{cat.title}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.badge} mr-auto`}>{cat.label}</span>
                </div>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-700 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6" dir="rtl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-5">
                <Lightbulb size={14} />
                זירת היוזמות
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-5">לא רק לדווח — ליזום</h2>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                בית הספר הוא שלכם. הציעו שינויים פיזיים, חברתיים ואקדמיים. הצביעו על הרעיונות הכי טובים. ההנהלה רואה ומגיבה.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '🎨', text: 'צביעת קירות והשבחת מרחבים' },
                  { icon: '🌱', text: 'הקמת פינת ישיבה מחומרים ממוחזרים' },
                  { icon: '📅', text: 'שינוי לוח המבחנים וימי שיא' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-sm border border-slate-200">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('initiatives')}
                className="mt-8 flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                לזירת היוזמות
                <ArrowLeft size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '94%', label: 'תלמידים שדיווחו בפעם הראשונה' },
                { num: '3 ימים', label: 'זמן טיפול ממוצע' },
                { num: '200+', label: 'יוזמות שהוגשו ואושרו' },
                { num: '0', label: 'מקרים של חשיפת זהות' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
                  <div className="text-3xl font-extrabold text-blue-600 mb-2">{stat.num}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center px-4" dir="rtl">
          <div className="flex justify-center mb-6">
            <Users size={40} className="text-cyan-400" />
          </div>
          <blockquote className="text-2xl font-light text-white italic mb-4">
            "אל תחכו לשינוי — תהיו השינוי"
          </blockquote>
          <cite className="text-slate-400 text-sm">— מהאטמה גנדי</cite>
          <div className="mt-10">
            <button
              onClick={() => onNavigate('report')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-10 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all text-lg"
            >
              התחל לשנות עכשיו
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
