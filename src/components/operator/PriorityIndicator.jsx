import StatusBadge from '../StatusBadge';

export default function PriorityIndicator({ priority, compact = false }) {
  return (
    <span className={`operator-priority-indicator${compact ? ' is-compact' : ''}`}>
      <StatusBadge value={priority.classification} type="severity" />
      <strong>{priority.score}/100</strong>
    </span>
  );
}
