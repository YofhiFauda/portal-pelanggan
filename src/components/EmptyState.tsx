import type { ReactNode } from 'react';

/** Empty state — ikon + 1 kalimat spesifik per konteks, JANGAN generik. */
export function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="text-3xl text-gray-300">{icon}</div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
