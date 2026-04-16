import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Page } from './lib/types';
import Header from './components/layout/Header';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import MyReportsPage from './pages/MyReportsPage';
import InitiativesPage from './pages/InitiativesPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session?.user?.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!session) {
          setIsAdmin(false);
          setCurrentPage('landing');
        } else {
          setIsAdmin(!!session.user?.email);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const showHeader = currentPage !== 'admin';

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {showHeader && (
        <Header currentPage={currentPage} onNavigate={setCurrentPage} isAdmin={isAdmin} />
      )}
      {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
      {currentPage === 'report' && <ReportPage onNavigate={setCurrentPage} />}
      {currentPage === 'my-reports' && <MyReportsPage />}
      {currentPage === 'initiatives' && <InitiativesPage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
}
