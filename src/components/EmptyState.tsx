import type { ReactNode } from 'react';

export function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center rounded-xl border border-dashed border-border">
      <div className="w-14 h-14 rounded-md bg-surface-muted flex items-center justify-center text-text-muted">
        {icon}
      </div>
      <p className="text-xs font-bold text-foreground/40 max-w-xs leading-relaxed">
        {text}
      </p>
    </div>
  );
}
