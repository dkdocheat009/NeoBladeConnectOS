import './Badge.css';

interface BadgeProps {
  count: number;
}

/** Real, independent badge element — renders nothing when count is 0. */
export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="badge" aria-label={`${count} notificações`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
