'use client';

interface OnboardingStepProps {
  step: number;
  title: string;
  description: string;
  active: boolean;
  complete: boolean;
  children: React.ReactNode;
}

export default function OnboardingStep({ step, title, description, active, complete, children }: OnboardingStepProps) {
  return (
    <section className={`relative md:pl-16 group transition-opacity ${!active && !complete ? 'opacity-70 hover:opacity-100' : ''}`}>
      {/* Timeline circle */}
      <div className={`
        absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center z-10 hidden md:flex transition-all
        ${complete
          ? 'border-2 border-primary bg-surface shadow-[0_0_15px_rgba(180,197,255,0.3)]'
          : active
            ? 'border-2 border-primary bg-surface shadow-[0_0_15px_rgba(180,197,255,0.3)]'
            : 'border border-outline-variant bg-surface-container-low'
        }
      `}>
        {complete ? (
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        ) : (
          <span className={`font-bold font-headline ${active ? 'text-primary' : 'text-outline'}`}>{step}</span>
        )}
      </div>

      {/* Card */}
      <div className={`
        rounded-xl p-6 md:p-8 transition-all
        ${active
          ? 'bg-surface-container-high border border-primary/40 ring-1 ring-primary/20 shadow-2xl'
          : complete
            ? 'bg-surface-container border border-outline-variant/20'
            : 'bg-surface-container-low border border-outline-variant/30'
        }
      `}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-on-surface font-headline font-semibold text-lg mb-1">{title}</h2>
            <p className="text-on-surface-variant text-sm">{description}</p>
          </div>
          {complete && (
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
