'use client';

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={className}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{title}</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
