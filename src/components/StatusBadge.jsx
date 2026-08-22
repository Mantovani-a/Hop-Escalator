import { normalizeToken } from '../utils/presentation';

export default function StatusBadge({ value, type = 'status' }) {
  const normalizedValue = normalizeToken(value);
  const isSeverity = type === 'severity';

  return (
    <span className={`hop-badge hop-badge--${isSeverity ? 'severity' : 'status'} hop-badge--${normalizedValue}`}>
      <span className="hop-badge__marker" aria-hidden="true">{isSeverity ? '!' : '●'}</span>
      {value}
    </span>
  );
}
