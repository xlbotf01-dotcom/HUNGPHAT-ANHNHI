import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  FileText, 
  Layout, 
  Table, 
  Code2, 
  Plus, 
  Maximize2, 
  Sun, 
  Moon, 
  Volume2, 
  Sparkles, 
  Download,
  Trash2
} from 'lucide-react';
import { BlankItem, BlankType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  blanks: BlankItem[];
  activeId: string;
  onSelectBlank: (id: string) => void;
  onCreateNewBlank: (type: BlankType) => void;
  onToggleFocusMode: () => void;
  onToggleTheme: () => void;
  onToggleAmbient: (type: 'rain' | 'whitenoise' | 'hearth') => void;
  onOpenTemplates: () => void;
  onExportCurrent: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  blanks,
  activeId,
  onSelectBlank,
  onCreateNewBlank,
  onToggleFocusMode,
  onToggleTheme,
  onToggleAmbient,
  onOpenTemplates,
  onExportCurrent,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build command items list
  const defaultActions: PaletteItem[] = [
    {
      id: 'new-doc',
      title: 'New Blank Document',
      subtitle: 'Create a clean markdown document or prose page',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => onCreateNewBlank('document'),
      shortcut: '⌘N',
    },
    {
      id: 'new-canvas',
      title: 'New Blank Canvas',
      subtitle: 'Infinite board for sketches, sticky notes, and flows',
      icon: <Layout className="w-4 h-4 text-emerald-500" />,
      action: () => onCreateNewBlank('canvas'),
    },
    {
      id: 'new-sheet',
      title: 'New Blank Sheet',
      subtitle: 'Fast spreadsheet grid with formulas and auto-sum',
      icon: <Table className="w-4 h-4 text-amber-500" />,
      action: () => onCreateNewBlank('sheet'),
    },
    {
      id: 'new-code',
      title: 'New Blank Scratchpad',
      subtitle: 'Code sandbox with JS evaluation and JSON tools',
      icon: <Code2 className="w-4 h-4 text-purple-500" />,
      action: () => onCreateNewBlank('code'),
    },
    {
      id: 'templates',
      title: 'Browse Blank Templates',
      subtitle: 'Meeting notes, product specs, project budgets',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: onOpenTemplates,
    },
    {
      id: 'export-file',
      title: 'Export / Download Current Blank',
      subtitle: 'Download as Markdown, PNG, or CSV',
      icon: <Download className="w-4 h-4 text-neutral-500" />,
      action: onExportCurrent,
      shortcut: '⌘S',
    },
    {
      id: 'toggle-focus',
      title: 'Toggle Zen Focus Mode',
      subtitle: 'Distraction-free fullscreen writing experience',
      icon: <Maximize2 className="w-4 h-4 text-amber-500" />,
      action: onToggleFocusMode,
      shortcut: 'F11',
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Dark / Light Theme',
      subtitle: 'Switch display appearance',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      action: onToggleTheme,
    },
    {
      id: 'ambient-rain',
      title: 'Soundscape: Gentle Rain',
      subtitle: 'Synthetic audio focus generator',
      icon: <Volume2 className="w-4 h-4 text-blue-400" />,
      action: () => onToggleAmbient('rain'),
    },
  ];

  // Document jump items
  const docActions: PaletteItem[] = blanks.map((b) => ({
    id: `blank-${b.id}`,
    title: b.title || 'Untitled',
    subtitle: `Open ${b.type} · Last updated ${new Date(b.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    icon: b.type === 'document' ? <FileText className="w-4 h-4 text-blue-500" /> :
          b.type === 'canvas' ? <Layout className="w-4 h-4 text-emerald-500" /> :
          b.type === 'sheet' ? <Table className="w-4 h-4 text-amber-500" /> :
          <Code2 className="w-4 h-4 text-purple-500" />,
    action: () => onSelectBlank(b.id),
  }));

  const allItems: PaletteItem[] = [...defaultActions, ...docActions];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, action, or blank name..."
            className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded">
            ESC
          </kbd>
        </div>

        {/* List of Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No matching commands found.
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  idx === selectedIndex
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1 rounded-lg bg-neutral-50 dark:bg-neutral-800/80">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {item.shortcut && (
                  <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 rounded shrink-0">
                    {item.shortcut}
                  </kbd>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts note */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Press <kbd>↵</kbd> to select</span>
        </div>
      </div>
    </div>
  );
};
