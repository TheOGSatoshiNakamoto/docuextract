'use client';

export interface Filters {
  docType: string;
  status: string;
  confidence: string;
  dateRange: string;
  model: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const DOC_TYPES = ['All Types', 'Invoice', 'Receipt', 'Resume', 'Bank Statement', 'Contract', 'Form', 'ID Document', 'Business Card'];
const STATUSES = ['All', 'Successful', 'Failed'];
const CONFIDENCE_LEVELS = ['All', '> 95%', '> 90%', '< 85%'];
const DATE_RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'This billing period'];
const MODELS = ['All Models', 'Haiku 4.5', 'Sonnet 4.6'];

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="min-w-[130px]">
      <label className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface-variant/40 block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-high border-none rounded text-xs text-on-surface focus:ring-1 focus:ring-primary/50 py-2 px-3"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const activeFilters = [
    filters.docType !== 'All Types' ? filters.docType : null,
    filters.status !== 'All' ? filters.status : null,
    filters.confidence !== 'All' ? filters.confidence : null,
    filters.dateRange !== 'Last 7 days' ? filters.dateRange : null,
    filters.model !== 'All Models' ? filters.model : null,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <section className="bg-surface-container-low/50 p-4 rounded-lg flex flex-wrap gap-4 items-end">
        <FilterSelect label="Doc Type" value={filters.docType} options={DOC_TYPES} onChange={(v) => onChange({ ...filters, docType: v })} />
        <FilterSelect label="Status" value={filters.status} options={STATUSES} onChange={(v) => onChange({ ...filters, status: v })} />
        <FilterSelect label="Confidence" value={filters.confidence} options={CONFIDENCE_LEVELS} onChange={(v) => onChange({ ...filters, confidence: v })} />
        <FilterSelect label="Date Range" value={filters.dateRange} options={DATE_RANGES} onChange={(v) => onChange({ ...filters, dateRange: v })} />
        <FilterSelect label="Model" value={filters.model} options={MODELS} onChange={(v) => onChange({ ...filters, model: v })} />
      </section>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((f) => (
            <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-headline uppercase tracking-wider">
              {f}
              <button
                onClick={() => {
                  const reset = { ...filters };
                  if (f === filters.docType) reset.docType = 'All Types';
                  if (f === filters.status) reset.status = 'All';
                  if (f === filters.confidence) reset.confidence = 'All';
                  if (f === filters.dateRange) reset.dateRange = 'Last 7 days';
                  if (f === filters.model) reset.model = 'All Models';
                  onChange(reset);
                }}
                className="hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
