export interface StatusPillProps {
  label: string;
  /** Tailwind color classes, e.g. "bg-green-100 text-green-700". */
  color?: string;
}

export function StatusPill({ label, color = 'bg-gray-100 text-gray-700' }: StatusPillProps) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}
