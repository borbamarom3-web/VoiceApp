export function getOrCreateAnonymousToken(): string {
  const key = 'kol_bakita_anon_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export function getVoterToken(): string {
  const key = 'kol_bakita_voter_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export const categoryLabels = {
  urgent: 'דחוף - פגיעה בנפש',
  discipline: 'משמעת ורכוש',
  climate: 'אקלים בית ספרי',
};

export const categoryColors = {
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    icon: '🔴',
    text: 'text-red-700',
  },
  discipline: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    icon: '🟡',
    text: 'text-amber-700',
  },
  climate: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: '🟢',
    text: 'text-emerald-700',
  },
};

export const statusLabels: Record<string, string> = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  resolved: 'נסגר',
  pending: 'ממתין',
  approved: 'אושר',
  done: 'הושלם',
  rejected: 'נדחה',
};

export const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-gray-100 text-gray-600',
  approved: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export const initiativeCategoryLabels = {
  physical: 'שיפור פיזי',
  social: 'יוזמה חברתית',
  academic: 'שינוי אקדמי',
};

export const initiativeCategoryColors = {
  physical: 'bg-sky-100 text-sky-700',
  social: 'bg-rose-100 text-rose-700',
  academic: 'bg-violet-100 text-violet-700',
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
