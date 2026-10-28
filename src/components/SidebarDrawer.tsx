import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  FileText, 
  Layout, 
  Table, 
  Code2, 
  Copy, 
  Trash2, 
  Pin, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BlankItem, BlankType } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blanks: BlankItem[];
  activeId: string;
  onSelectBlank: (id: string) => void;
  onCreateNewBlank: (type: BlankType) => void;
  onDuplicateBlank: (id: string) => void;
  onDeleteBlank: (id: string) => void;
  onTogglePinBlank: (id: string) => void;
  onOpenTemplates: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  blanks,
  activeId,
  onSelectBlank,
  onCreateNewBlank,
  onDuplicateBlank,
  onDeleteBlank,
  onTogglePinBlank,
  onOpenTemplates,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredBlanks = blanks
    .filter((b) => {
      if (filterType !== 'all' && b.type !== filterType) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const inTitle = b.title.toLowerCase().includes(q);
      const inContent = b.documentData?.content.toLowerCase().includes(q) || false;
      return inTitle || inContent;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const getTypeIcon = (type: BlankType) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'canvas': return <Layout className="w-4 h-4 text-emerald-500" />;
      case 'sheet': return <Table className="w-4 h-4 text-amber-500" />;
      case 'code': return <Code2 className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPreviewSummary = (item: BlankItem) => {
    if (item.type === 'document') {
      const words = item.documentData?.content.trim() ? item.documentData.content.trim().split(/\s+/).length : 0;
      return `${words} words`;
    }
    if (item.type === 'canvas') {
      const count = item.canvasData?.items.length || 0;
      return `${count} elements`;
    }
    if (item.type === 'sheet') {
      const count = Object.keys(item.sheetData?.cells || {}).length;
      return `${count} cells`;
    }
    if (item.type === 'code') {
      return item.codeData?.language || 'code';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-start">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col border-r border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Workspace Blanks ({blanks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all blanks..."
              className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            {['all', 'document', 'canvas', 'sheet', 'code'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md transition-colors capitalize ${
                  filterType === t
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Blank List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredBlanks.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No blanks match your filter.
            </div>
          ) : (
            filteredBlanks.map((item) => {
              const isActive = item.id === activeId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectBlank(item.id);
                    onClose();
                  }}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-50 dark:bg-neutral-800/90 border-neutral-300 dark:border-neutral-700 shadow-2xs'
                      : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:border-neutral-200 dark:hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.title || 'Untitled'}
                      </span>
                    </div>

                    {/* Quick item actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePinBlank(item.id);
                        }}
                        title={item.isPinned ? "Unpin blank" : "Pin blank to top"}
                        className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${
                          item.isPinned ? 'text-amber-500 opacity-100' : 'text-neutral-400'
                        }`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateBlank(item.id);
                        }}
                        title="Duplicate blank"
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {blanks.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBlank(item.id);
                          }}
                          title="Delete blank"
                          className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata line (strictly clean unboxed text) */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
                    <span>{getPreviewSummary(item)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    {item.isPinned && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-500 font-sans font-medium">Pinned</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col gap-2">
          <button
            onClick={() => {
              onCreateNewBlank('document');
              onClose();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quick Blank</span>
          </button>
          <button
            onClick={() => {
              onOpenTemplates();
              onClose();
            }}
            className="w-full py-1.5 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Browse Starter Templates</span>
          </button>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
