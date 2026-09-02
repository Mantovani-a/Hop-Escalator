export const normalizeToken = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

export const formatDate = (date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '—';
  const targetDate = new Date(dateTime);
  if (Number.isNaN(targetDate.getTime())) return '—';

  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = targetDate.toDateString() === yesterday.toDateString();

  const timeStr = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(targetDate);

  if (isToday) {
    return `Hoje, ${timeStr}`;
  }
  if (isYesterday) {
    return `Ontem, ${timeStr}`;
  }

  const isSameYear = targetDate.getFullYear() === now.getFullYear();
  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(isSameYear ? {} : { year: 'numeric' }),
  }).format(targetDate);

  return `${dateStr}, ${timeStr}`;
};

export const formatElapsedMinutes = (minutes) => {
  if (minutes < 1) return 'há menos de 1 min';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `há ${hours}h ${remainingMinutes}min` : `há ${hours}h`;
};

