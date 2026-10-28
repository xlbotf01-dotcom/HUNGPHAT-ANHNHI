import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  RotateCcw, 
  FileJson, 
  Terminal, 
  Sparkles 
} from 'lucide-react';
import { CodeData } from '../types';

interface CodeScratchpadProps {
  data: CodeData;
  onChange: (data: CodeData) => void;
  isFocusMode: boolean;
}

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'sql', label: 'SQL' },
  { id: 'json', label: 'JSON' },
  { id: 'html', label: 'HTML/CSS' },
] as const;

export const CodeScratchpad: React.FC<CodeScratchpadProps> = ({
  data,
  onChange,
  isFocusMode,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Execute JavaScript in sandbox
  const handleRun = () => {
    setIsRunning(true);
    const captured: string[] = [];

    // Temporary override console
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    try {
      console.log = (...args) => {
        captured.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
        originalLog(...args);
      };
      console.warn = (...args) => {
        captured.push('[WARN] ' + args.join(' '));
        originalWarn(...args);
      };
      console.error = (...args) => {
        captured.push('[ERROR] ' + args.join(' '));
        originalError(...args);
      };

      // Evaluate code
      const result = new Function(data.code)();
      if (result !== undefined) {
        captured.push('➔ Result: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
      }

      setLogs(captured.length > 0 ? captured : ['(Code executed successfully with no output)']);
    } catch (err: unknown) {
      setLogs([`✕ Error: ${(err as Error).message}`]);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  const handleFormatJSON = () => {
    try {
      const parsed = JSON.parse(data.code);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange({ ...data, code: formatted });
      setLogs(['✓ JSON formatted successfully']);
    } catch (err: unknown) {
      setLogs([`✕ Invalid JSON: ${(err as Error).message}`]);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const insertSnippet = (snippetType: 'fetch' | 'regex' | 'sql') => {
    if (snippetType === 'fetch') {
      const fetchCode = `// Fetch API Starter
async function fetchWorkspaceData() {
  console.log('Initiating async fetch...');
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  const data = await response.json();
  console.log('Received response:', data);
  return data;
}

fetchWorkspaceData();
`;
      onChange({ ...data, language: 'javascript', code: fetchCode });
    } else if (snippetType === 'regex') {
      const regexCode = `// Regex Matching Scratchpad
const text = 'Contact support@quickblank.app or sales@blank.dev for inquiries.';
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;

const matches = text.match(emailRegex);
console.log('Found matches:', matches);

matches;
`;
      onChange({ ...data, language: 'javascript', code: regexCode });
    } else if (snippetType === 'sql') {
      const sqlCode = `-- Quick SQL Scratchpad
SELECT 
    u.id,
    u.name,
    COUNT(d.id) AS documents_count,
    MAX(d.updated_at) AS last_active
FROM users u
LEFT JOIN documents d ON u.id = d.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name
ORDER BY documents_count DESC
LIMIT 10;
`;
      onChange({ ...data, language: 'sql', code: sqlCode });
    }
  };

  // Line numbers calculation
  const lineCount = data.code.split('\n').length;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-neutral-900 text-neutral-100 font-mono transition-colors">
      {/* Scratchpad Header Toolbar */}
      {!isFocusMode && (
        <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs">
          {/* Languages */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => onChange({ ...data, language: lang.id })}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  data.language === lang.id
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Quick Snippets & Actions */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-[11px] hidden md:inline">Snippets:</span>
            <button
              onClick={() => insertSnippet('fetch')}
              className="px-2 py-0.5 rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-[11px] transition-colors"
            >
              Fetch API
            </button>
            <button
              onClick={() => insertSnippet('regex')}
              className="px-2 py-0.5 rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-[11px] transition-colors"
            >
              Regex Test
            </button>
            <button
              onClick={() => insertSnippet('sql')}
              className="px-2 py-0.5 rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-[11px] transition-colors"
            >
              SQL
            </button>

            <span className="w-px h-4 bg-neutral-800 mx-1" />

            {data.language === 'json' && (
              <button
                onClick={handleFormatJSON}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 transition-colors"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Format JSON</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              title="Copy Code"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run / Evaluate</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor & Console Split View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Code Input */}
        <div className="flex-1 flex relative overflow-auto border-r border-neutral-800">
          {/* Gutter Line Numbers */}
          <div className="w-12 py-4 pl-3 pr-2 select-none text-right text-xs text-neutral-600 font-mono border-r border-neutral-800/50">
            {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={data.code}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
            placeholder="// Write code, test regex, format JSON, or draft queries..."
            className="flex-1 p-4 bg-transparent resize-none border-none outline-none font-mono text-sm leading-6 text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
            spellCheck="false"
          />
        </div>

        {/* Console / Output Drawer */}
        <div className="h-48 md:h-auto md:w-80 lg:w-96 flex flex-col bg-neutral-950 border-t md:border-t-0 md:border-l border-neutral-800">
          <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console Output</span>
            </div>
            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-neutral-300 space-y-1.5 leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-neutral-600 italic">
                Press "Run / Evaluate" to execute code and see results here.
              </div>
            ) : (
              logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`whitespace-pre-wrap break-all ${
                    log.startsWith('✕ Error:') ? 'text-red-400' : 
                    log.startsWith('➔ Result:') ? 'text-emerald-400 font-bold' : 
                    log.startsWith('[WARN]') ? 'text-amber-400' : 'text-neutral-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
