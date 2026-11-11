import { useId, type ReactNode } from 'react';
import { Music2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon: Icon = Music2, action }: EmptyStateProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-7" />
      </div>

      <h2 id={titleId} className="font-heading text-xl font-bold tracking-tight">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>

      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
