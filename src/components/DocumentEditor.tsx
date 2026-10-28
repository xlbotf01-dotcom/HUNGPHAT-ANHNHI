import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  FileCode, 
  Table as TableIcon, 
  Minus, 
  Eye, 
  Edit3, 
  Copy, 
  Check, 
  Printer, 
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';
import { DocumentData, FontStyle, PageWidth } from '../types';
import { playTypewriterClick } from '../utils/audio';

interface DocumentEditorProps {
  data: DocumentData;
  onChange: (data: DocumentData) => void;
  isFocusMode: boolean;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  data,
  onChange,
  isFocusMode,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [typewriterSound, setTypewriterSound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(data.targetWordCount ? String(data.targetWordCount) : '500');
  const [slashMenu, setSlashMenu] = useState<{ open: boolean; x: number; y: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Statistics calculation
  const words = data.content.trim() ? data.content.trim().split(/\s+/).length : 0;
  const characters = data.content.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const goalProgress = data.targetWordCount ? Math.min(100, Math.round((words / data.targetWordCount) * 100)) : null;

  // Font family class
  const fontClass = 
    data.font === 'serif' ? 'font-serif' :
    data.font === 'mono' ? 'font-mono' : 'font-sans';

  // Page width class
  const widthClass =
    data.pageWidth === 'full' ? 'max-w-6xl' :
    data.pageWidth === 'wide' ? 'max-w-4xl' : 'max-w-2xl';

  // Keyboard shortcut & typing sound handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (typewriterSound && e.key.length === 1) {
      playTypewriterClick();
    }

    // Markdown shortcut helpers
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      applyFormatting('**', '**');
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      applyFormatting('*', '*');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange({ ...data, content: val });

    // Check for slash command
    const pos = e.target.selectionStart;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const currentLine = val.substring(lineStart, pos);

    if (currentLine === '/') {
      setSlashMenu({ open: true, x: 24, y: 80 });
    } else {
      if (slashMenu?.open) setSlashMenu(null);
    }
  };

  const insertText = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = data.content;
    const newVal = currentVal.substring(0, start) + text + currentVal.substring(end);
    onChange({ ...data, content: newVal });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const applyFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = data.content;
    const selected = currentVal.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange({ ...data, content: newVal });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 10);
  };

  const insertBlock = (blockText: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const currentVal = data.content;
    // ensure new line
    const before = currentVal.substring(0, start);
    const after = currentVal.substring(start);
    const prefix = before.endsWith('\n') || before.length === 0 ? '' : '\n';
    const newVal = before + prefix + blockText + '\n' + after;
    onChange({ ...data, content: newVal });
    setSlashMenu(null);
    setTimeout(() => {
      el.focus();
    }, 10);
  };

  const handleCopyFormatted = async () => {
    try {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSetGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      onChange({ ...data, targetWordCount: val });
    } else {
      onChange({ ...data, targetWordCount: undefined });
    }
    setShowGoalModal(false);
  };

  // Convert basic markdown to safe formatted preview
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-bold tracking-tight mt-6 mb-3 text-neutral-900 dark:text-neutral-50">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-semibold tracking-tight mt-5 mb-2.5 text-neutral-800 dark:text-neutral-100">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2 text-neutral-800 dark:text-neutral-200">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={idx} className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1 italic my-3 text-neutral-600 dark:text-neutral-400">{line.replace('> ', '')}</blockquote>;
      }
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const checked = line.startsWith('- [x] ');
        const label = line.replace(/- \[[ x]\] /, '');
        return (
          <div key={idx} className="flex items-center gap-2.5 my-1 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={checked} readOnly className="rounded border-neutral-300 text-neutral-900" />
            <span className={checked ? 'line-through opacity-60' : ''}>{label}</span>
          </div>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-5 list-disc my-1 text-neutral-700 dark:text-neutral-300">{line.replace(/^[-*] /, '')}</li>;
      }
      if (/^\d+\. /.test(line)) {
        return <li key={idx} className="ml-5 list-decimal my-1 text-neutral-700 dark:text-neutral-300">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="bg-neutral-100 dark:bg-neutral-800 font-mono text-xs px-3 py-1 rounded my-1 text-neutral-500">Code block</div>;
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-6 border-neutral-200 dark:border-neutral-800" />;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-4" />;
      }
      return <p key={idx} className="leading-relaxed my-2 text-neutral-800 dark:text-neutral-200">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Floating or pinned formatting bar */}
      {!isFocusMode && (
        <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-white/90 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-xs text-xs text-neutral-600 dark:text-neutral-400">
          {/* Format actions */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <button
              onClick={() => applyFormatting('**', '**')}
              title="Bold (⌘B)"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('*', '*')}
              title="Italic (⌘I)"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('~~', '~~')}
              title="Strikethrough"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('`', '`')}
              title="Inline Code"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <button
              onClick={() => insertBlock('# ')}
              title="Heading 1"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('## ')}
              title="Heading 2"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('### ')}
              title="Heading 3"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <button
              onClick={() => insertBlock('- ')}
              title="Bullet list"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('1. ')}
              title="Numbered list"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('- [ ] ')}
              title="Task checklist"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('> ')}
              title="Quote block"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('```\n// code snippet\n```')}
              title="Code block"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |')}
              title="Table"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertBlock('---\n')}
              title="Divider"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Typography, view mode, and audio controls */}
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  viewMode === 'edit' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-medium' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-2 py-1 rounded text-xs transition-colors hidden md:block ${
                  viewMode === 'split' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-medium' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Split View"
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  viewMode === 'preview' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-medium' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font selector */}
            <select
              value={data.font}
              onChange={(e) => onChange({ ...data, font: e.target.value as FontStyle })}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="sans">Sans (Jakarta)</option>
              <option value="serif">Serif (Newsreader)</option>
              <option value="mono">Mono (JetBrains)</option>
            </select>

            {/* Width selector */}
            <select
              value={data.pageWidth}
              onChange={(e) => onChange({ ...data, pageWidth: e.target.value as PageWidth })}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none hidden sm:block"
            >
              <option value="standard">Standard Page</option>
              <option value="wide">Wide Page</option>
              <option value="full">Full Width</option>
            </select>

            {/* Typewriter mechanical sound toggle */}
            <button
              onClick={() => setTypewriterSound(!typewriterSound)}
              title={typewriterSound ? "Disable Typewriter Keystroke Sound" : "Enable Typewriter Keystroke Sound"}
              className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                typewriterSound ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' : ''
              }`}
            >
              {typewriterSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopyFormatted}
              title="Copy markdown text"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handlePrint}
              title="Print document (⌘P)"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden sm:block"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Document Workspace */}
      <div className="flex-1 px-4 sm:px-8 py-8 flex justify-center">
        <div className={`w-full ${widthClass} transition-all duration-200`}>
          {/* Document Sheet Surface */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs p-6 sm:p-12 min-h-[750px] flex flex-col relative transition-colors">
            {/* Document Title Header */}
            <div className="mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <input
                type="text"
                value={data.title}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
                placeholder="Untitled Document..."
                className="w-full text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              />
            </div>

            {/* Split / Edit / Preview Views */}
            <div className="flex-1 flex gap-8">
              {/* Textarea Editor */}
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className={`relative flex-1 flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <textarea
                    ref={textareaRef}
                    value={data.content}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Start typing your thoughts, notes, or draft... Type / for block inserter."
                    className={`w-full flex-1 bg-transparent resize-none border-none outline-none leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 ${fontClass} text-[15px] sm:text-[16px] min-h-[500px]`}
                    spellCheck="true"
                    autoFocus
                  />

                  {/* Slash command popover menu */}
                  {slashMenu?.open && (
                    <div className="absolute top-12 left-4 z-30 w-56 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl text-xs">
                      <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        Insert Block
                      </div>
                      <button
                        onClick={() => insertBlock('# ')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <Heading1 className="w-3.5 h-3.5" />
                        <span>Heading 1</span>
                      </button>
                      <button
                        onClick={() => insertBlock('## ')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                        <span>Heading 2</span>
                      </button>
                      <button
                        onClick={() => insertBlock('- [ ] ')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Task Checklist</span>
                      </button>
                      <button
                        onClick={() => insertBlock('- ')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Bullet List</span>
                      </button>
                      <button
                        onClick={() => insertBlock('> ')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span>Quote Callout</span>
                      </button>
                      <button
                        onClick={() => insertBlock('```\n\n```')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Code Block</span>
                      </button>
                      <button
                        onClick={() => insertBlock('---\n')}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Horizontal Divider</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Preview view */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`prose dark:prose-invert max-w-none flex-1 overflow-y-auto ${viewMode === 'split' ? 'w-1/2 pl-6 border-l border-neutral-200 dark:border-neutral-800' : 'w-full'} ${fontClass}`}>
                  {renderMarkdownPreview(data.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unboxed Tabular Metrics Footer */}
      <footer className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-2.5 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span>{words.toLocaleString()} words</span>
          <span aria-hidden="true">·</span>
          <span>{characters.toLocaleString()} characters</span>
          <span aria-hidden="true">·</span>
          <span>{readingTime} min read</span>
          {goalProgress !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                Goal: {words} / {data.targetWordCount} ({goalProgress}%)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{data.targetWordCount ? 'Edit Goal' : 'Set Word Goal'}</span>
          </button>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-600 dark:text-emerald-400">Autosaved locally</span>
        </div>
      </footer>

      {/* Word Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Word Count Target
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Set a target for your writing session. Leave blank to disable.
            </p>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none mb-4 tabular-nums"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetGoal}
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
