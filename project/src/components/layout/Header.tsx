import { useState } from 'react';
import { Menu, X, Volume2, ShieldCheck } from 'lucide-react';
import { Page } from '../../lib/types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export default function Header({ currentPage, onNavigate, isAdmin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { label: string; page: Page }[] = [
    { label: 'בית', page: 'landing' },
    { label: 'דיווח חדש', page: 'report' },
    { label: 'יוזמות תלמידים', page: 'initiatives' },
    { label: 'הדיווחים שלי', page: 'my-reports' },
  ];

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Volume2 size={18} className="text-white" />
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800 text-sm leading-tight">הקול בכיתה</div>
              <div className="text-xs text-slate-400 leading-tight">קול לכל תלמיד</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentPage === 'admin'
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck size={14} />
                ניהול
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ShieldCheck size={13} />
                כניסת הנהלה
              </button>
            )}
            <button
              onClick={() => handleNav('report')}
              className="hidden md:flex bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:shadow-md hover:scale-105 transition-all"
            >
              דווח עכשיו
            </button>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-all block ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
              >
                <ShieldCheck size={14} />
                לוח ניהול
              </button>
            )}
            <div className="pt-2">
              <button
                onClick={() => handleNav('report')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
              >
                דווח עכשיו
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
