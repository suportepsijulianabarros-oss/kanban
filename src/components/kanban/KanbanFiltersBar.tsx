import React from 'react';
import { 
  Filter, 
  X, 
  Search, 
  User, 
  Tag as TagIcon, 
  Share2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { MOCK_RESPONSIBLES } from './crmKanban.mock';
import { useCRMKanban } from './CRMKanbanContext';

export function KanbanFiltersBar() {
  const { filters, setFilters: onChange, tags, sources, setActiveSegmentId } = useCRMKanban();

  const onClear = () => {
    onChange({ search: '', tags: [], responsible_id: 'all' });
    setActiveSegmentId(null);
  };

  const activeFiltersCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === 'tags' && Array.isArray(value)) return acc + value.length;
    if (key === 'search') return acc;
    if (value !== undefined && value !== '' && value !== 'all' && value !== false) return acc + 1;
    return acc;
  }, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-white rounded-[1.25rem] shadow-sm border border-gray-100 font-sans">
      {/* Search Input (Local) */}
      <div className="relative group min-w-[160px] flex-1 lg:flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={14} />
        <input 
          type="text" 
          placeholder="Filtrar nesta etapa..." 
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-gray-50/50 border-none rounded-xl py-2 pl-9 pr-3 text-[11px] font-bold text-gray-700 placeholder:text-gray-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
        />
      </div>

      <div className="hidden lg:block h-4 w-px bg-gray-100 mx-1" />

      {/* Responsible Filter */}
      <FilterSelect 
        icon={<User size={13} />} 
        label="Responsável"
        value={MOCK_RESPONSIBLES.find(r => r.id === filters.responsible_id)?.name || 'Todos'}
        active={!!filters.responsible_id}
      >
        <div className="p-2 space-y-1">
          <button 
            onClick={() => {
              onChange({ ...filters, responsible_id: undefined });
            }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors leading-none",
              !filters.responsible_id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-gray-50 text-gray-400"
            )}
          >
            Todos
          </button>
          {MOCK_RESPONSIBLES.map(r => (
            <button 
              key={r.id}
              onClick={() => {
                onChange({ ...filters, responsible_id: r.id });
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-colors",
                filters.responsible_id === r.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-400 group"
              )}
            >
              <div className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                filters.responsible_id === r.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
              )}>
                {r.initials}
              </div>
              {r.name}
            </button>
          ))}
        </div>
      </FilterSelect>

      {/* Source Filter */}
      <FilterSelect 
        icon={<Share2 size={13} />} 
        label="Origem"
        value={sources.find(s => s.id === filters.source)?.label || 'Qualquer'}
        active={!!filters.source}
      >
        <div className="p-2 space-y-1">
          <button 
            onClick={() => {
              onChange({ ...filters, source: undefined });
            }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors leading-none",
              !filters.source ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-gray-50 text-gray-400"
            )}
          >
            Qualquer origem
          </button>
          {sources.map(s => (
            <button 
              key={s.id}
              onClick={() => {
                onChange({ ...filters, source: s.id });
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors",
                filters.source === s.id ? "bg-blue-50 text-blue-600 border border-blue-100" : "hover:bg-gray-50 text-gray-400 border border-transparent"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FilterSelect>

      {/* Tags Filter */}
      <FilterSelect 
        icon={<TagIcon size={13} />} 
        label="Tags"
        value={filters.tags.length > 0 ? `${filters.tags.length} selecionadas` : 'Qualquer'}
        active={filters.tags.length > 0}
      >
        <div className="p-3 space-y-3 min-w-[200px]">
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => {
              const checked = filters.tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    const newTags = checked 
                      ? filters.tags.filter(t => t !== tag.id) 
                      : [...filters.tags, tag.id];
                    onChange({ ...filters, tags: newTags });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                    checked 
                      ? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-black/10" 
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                  )}
                  style={checked ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          {filters.tags.length > 0 && (
            <button 
              onClick={() => onChange({ ...filters, tags: [] })}
              className="text-[9px] font-black text-blue-600 border-t border-gray-100 pt-3 uppercase tracking-widest hover:underline w-full text-center"
            >
              Limpar Seleção
            </button>
          )}
        </div>
      </FilterSelect>

      {/* Overdue Switch */}
      <button 
        onClick={() => onChange({ ...filters, overdue_only: !filters.overdue_only })}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border",
          filters.overdue_only 
            ? "bg-red-50 border-red-100 text-red-600 shadow-sm" 
            : "bg-gray-50/20 border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-500"
        )}
      >
        <ClockIcon size={14} />
        Atrasados
      </button>

      {/* Clear All Button */}
      {activeFiltersCount > 0 && (
        <button 
          onClick={onClear}
          className="lg:ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 shrink-0"
        >
          <X size={14} />
          Limpar Filtros ({activeFiltersCount})
        </button>
      )}
    </div>
  );
}

function FilterSelect({ icon, label, value, active, children }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  active: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
          active 
            ? "bg-blue-50 border-blue-100 text-blue-600 shadow-sm" 
            : "bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-500"
        )}
      >
        <span className={cn("transition-colors", active ? "text-blue-500" : "text-gray-300")}>{icon}</span>
        <span className="opacity-60">{label}:</span>
        <span>{value}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 min-w-[180px] bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function ClockIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
