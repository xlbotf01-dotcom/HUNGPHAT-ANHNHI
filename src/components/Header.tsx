import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Maximize2, 
  Minimize2, 
  Folder, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Sparkles,
  FileText,
  Layout,
  Table as TableIcon,
  Code2,
  ChevronDown,
  Download
} from 'lucide-react';
import { BlankType, AppTheme } from '../types';

interface HeaderProps {
  currentType: BlankType;
  blanksCount: number;
  activeTitle: string;
  isFocusMode: boolean;
  theme: AppTheme;
  ambientSound: 'rain' | 'whitenoise' | 'hearth' | null;
  onToggleFocusMode: () => void;
  onOpenPalette: () => void;
  onOpenDrawer: () => void;
  onOpenTemplates: () => void;
  onToggleAmbient: (type: 'rain' | 'whitenoise' | 'hearth') => void;
  onToggleTheme: () => void;
  onCreateNewBlank: (type: BlankType) => void;
  onExportCurrent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentType,
  blanksCount,
  activeTitle,
  isFocusMode,
  theme,
  ambientSound,
  onToggleFocusMode,
  onOpenPalette,
  onOpenDrawer,
  onOpenTemplates,
  onToggleAmbient,
  onToggleTheme,
  onCreateNewBlank,
  onExportCurrent,
}) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
      if (soundRef.current && !soundRef.current.contains(e.target as Node)) {
        setShowSoundMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onOpenDrawer(); }}
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50 hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2"
          title="Open all blanks"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-mono text-xs font-black">
            _
          </span>
          Quick Blank
        </a>
        <div className="hidden sm:flex items-center text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
          <span aria-hidden="true" className="mx-1.5">/</span>
          <span className="truncate max-w-[140px] md:max-w-[200px] font-medium text-neutral-600 dark:text-neutral-400">
            {activeTitle || 'Untitled'}
          </span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">saved</span>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links / workspace modes */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
        <button
          onClick={() => onCreateNewBlank('document')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentType === 'document' ? 'text-neutral-900 dark:text-neutral-100 font-semibold underline underline-offset-4' : ''
          }`}
        >
          <FileText className="w-4 h-4 opacity-75" />
          Document
        </button>
        <button
          onClick={() => onCreateNewBlank('canvas')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentType === 'canvas' ? 'text-neutral-900 dark:text-neutral-100 font-semibold underline underline-offset-4' : ''
          }`}
        >
          <Layout className="w-4 h-4 opacity-75" />
          Canvas
        </button>
        <button
          onClick={() => onCreateNewBlank('sheet')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentType === 'sheet' ? 'text-neutral-900 dark:text-neutral-100 font-semibold underline underline-offset-4' : ''
          }`}
        >
          <TableIcon className="w-4 h-4 opacity-75" />
          Sheet
        </button>
        <button
          onClick={() => onCreateNewBlank('code')}
          className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentType === 'code' ? 'text-neutral-900 dark:text-neutral-100 font-semibold underline underline-offset-4' : ''
          }`}
        >
          <Code2 className="w-4 h-4 opacity-75" />
          Scratchpad
        </button>
        <button
          onClick={onOpenDrawer}
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Folder className="w-4 h-4 opacity-75" />
          All Blanks ({blanksCount})
        </button>
      </nav>

      {/* Zone 3: 1 primary action + minimal utility triggers */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Ambient focus sound generator */}
        <div className="relative" ref={soundRef}>
          <button
            onClick={() => setShowSoundMenu(!showSoundMenu)}
            title="Focus Soundscapes (Rain, White Noise, Hearth)"
            className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              ambientSound ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' : ''
            }`}
          >
            {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-70" />}
          </button>

          {showSoundMenu && (
            <div className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 text-xs">
              <div className="px-3 py-1 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
                Synthetic Focus Sounds
              </div>
              <button
                onClick={() => { onToggleAmbient('rain'); setShowSoundMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                  ambientSound === 'rain' ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>Gentle Rain</span>
                {ambientSound === 'rain' && <span className="text-[10px]">Active</span>}
              </button>
              <button
                onClick={() => { onToggleAmbient('whitenoise'); setShowSoundMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                  ambientSound === 'whitenoise' ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>Soft White Noise</span>
                {ambientSound === 'whitenoise' && <span className="text-[10px]">Active</span>}
              </button>
              <button
                onClick={() => { onToggleAmbient('hearth'); setShowSoundMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                  ambientSound === 'hearth' ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>Cozy Hearth Crackle</span>
                {ambientSound === 'hearth' && <span className="text-[10px]">Active</span>}
              </button>
              {ambientSound && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                  <button
                    onClick={() => { onToggleAmbient(ambientSound); setShowSoundMenu(false); }}
                    className="w-full text-left px-3 py-1 text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Mute Audio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Command palette search shortcut */}
        <button
          onClick={onOpenPalette}
          title="Command Palette (⌘K)"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="font-mono text-[10px] px-1 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick Export current */}
        <button
          onClick={onExportCurrent}
          title="Export current blank"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Fullscreen Zen Mode */}
        <button
          onClick={onToggleFocusMode}
          title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Focus Mode"}
          className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            isFocusMode ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' : ''
          }`}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Light / Dark / Sepia theme"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action Button: + Quick New Blank */}
        <div className="relative" ref={menuRef}>
          <div className="inline-flex rounded-lg shadow-xs">
            <button
              onClick={() => onCreateNewBlank(currentType)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-l-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick New Blank</span>
              <kbd className="hidden sm:inline-block font-mono text-[9px] px-1 py-0.2 bg-neutral-800 dark:bg-neutral-300 text-neutral-300 dark:text-neutral-800 rounded">
                ⌘N
              </kbd>
            </button>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              title="Select blank type"
              className="px-1.5 py-1.5 text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-r-lg border-l border-neutral-700 dark:border-neutral-300 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Blank Menu */}
          {showNewMenu && (
            <div className="absolute right-0 mt-2 w-52 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 text-xs">
              <div className="px-3 py-1 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
                Create New Blank
              </div>
              <button
                onClick={() => { onCreateNewBlank('document'); setShowNewMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-800 dark:text-neutral-200"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium">Blank Document</div>
                  <div className="text-[10px] text-neutral-500">Markdown, notes & prose</div>
                </div>
              </button>
              <button
                onClick={() => { onCreateNewBlank('canvas'); setShowNewMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-800 dark:text-neutral-200"
              >
                <Layout className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="font-medium">Blank Canvas</div>
                  <div className="text-[10px] text-neutral-500">Draw, stickies & diagram</div>
                </div>
              </button>
              <button
                onClick={() => { onCreateNewBlank('sheet'); setShowNewMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-800 dark:text-neutral-200"
              >
                <TableIcon className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-medium">Blank Sheet</div>
                  <div className="text-[10px] text-neutral-500">Grid, formulas & ledger</div>
                </div>
              </button>
              <button
                onClick={() => { onCreateNewBlank('code'); setShowNewMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-800 dark:text-neutral-200"
              >
                <Code2 className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="font-medium">Blank Scratchpad</div>
                  <div className="text-[10px] text-neutral-500">Code runner & JSON tools</div>
                </div>
              </button>
              <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                <button
                  onClick={() => { onOpenTemplates(); setShowNewMenu(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Browse Templates...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
