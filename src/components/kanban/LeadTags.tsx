import React from 'react';
import { Tag } from './crmKanban.types';
import { cn } from '../../lib/utils';
import { X, Plus } from 'lucide-react';
import { MOCK_TAGS } from './crmKanban.mock';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  showRemove?: boolean;
  className?: string;
}

export function TagBadge({ tag, onClick, showRemove, className }: TagBadgeProps) {
  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group px-2.5 py-1.5 rounded-lg text-[8px] lg:text-[9px] font-black text-white uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 border border-black/10",
        onClick && "hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
      {showRemove && <X size={10} className="hidden group-hover:block opacity-70" />}
    </button>
  );
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onToggle: (tag: Tag) => void;
}

export function TagSelector({ selectedTags, onToggle }: TagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5 max-h-[160px] lg:max-h-[200px] overflow-y-auto pr-1 no-scrollbar font-sans">
      {MOCK_TAGS.map(tag => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag)}
            className={cn(
              "px-2.5 py-1.5 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all border",
              isSelected 
                ? "border-transparent text-white shadow-md shadow-black/10 scale-105" 
                : "bg-gray-50/50 border-gray-100 text-gray-400 hover:bg-gray-100"
            )}
            style={isSelected ? { backgroundColor: tag.color } : {}}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

interface LeadTagsEditorProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function LeadTagsEditor({ tags, onTagsChange }: LeadTagsEditorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleTag = (tag: Tag) => {
    const isSelected = tags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(tags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <TagBadge 
          key={tag.id} 
          tag={tag} 
          onClick={() => toggleTag(tag)} 
          showRemove 
        />
      ))}
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-xl transition-all",
            isOpen ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          )}
        >
          <Plus size={16} className={cn("transition-transform", isOpen && "rotate-45")} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full left-0 mb-3 z-20 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Gerenciar Tags</p>
              <TagSelector selectedTags={tags} onToggle={toggleTag} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
