import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  DollarSign, 
  Percent, 
  Bold, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Calculator,
  RefreshCw
} from 'lucide-react';
import { SheetData, SheetCell } from '../types';

interface SheetEditorProps {
  data: SheetData;
  onChange: (data: SheetData) => void;
  isFocusMode: boolean;
}

const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const SheetEditor: React.FC<SheetEditorProps> = ({
  data,
  onChange,
  isFocusMode,
}) => {
  const [selectedCell, setSelectedCell] = useState<string | null>('A1');
  const [editingFormula, setEditingFormula] = useState<string>('');

  // Evaluated values cache
  const evaluatedValues = useMemo(() => {
    const values: Record<string, number | string> = {};

    // First pass: extract literal numeric or text values
    Object.entries(data.cells).forEach(([key, cell]) => {
      const val = cell.value.trim();
      if (!val.startsWith('=')) {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        values[key] = !isNaN(num) && val !== '' ? num : val;
      }
    });

    // Helper: parse cell reference or range (e.g. A1 or A1:A5)
    const resolveRange = (rangeStr: string): number[] => {
      if (rangeStr.includes(':')) {
        const [start, end] = rangeStr.split(':');
        const startCol = start.charAt(0);
        const startRow = parseInt(start.substring(1), 10);
        const endCol = end.charAt(0);
        const endRow = parseInt(end.substring(1), 10);

        const nums: number[] = [];
        const colStartIdx = COL_LETTERS.indexOf(startCol);
        const colEndIdx = COL_LETTERS.indexOf(endCol);

        for (let c = colStartIdx; c <= colEndIdx; c++) {
          for (let r = startRow; r <= endRow; r++) {
            const cellKey = `${COL_LETTERS[c]}${r}`;
            const v = values[cellKey];
            if (typeof v === 'number') nums.push(v);
          }
        }
        return nums;
      } else {
        const v = values[rangeStr];
        return typeof v === 'number' ? [v] : [];
      }
    };

    // Second pass: evaluate simple formulas
    Object.entries(data.cells).forEach(([key, cell]) => {
      const val = cell.value.trim();
      if (val.startsWith('=')) {
        const upper = val.toUpperCase();
        try {
          if (upper.startsWith('=SUM(')) {
            const range = upper.substring(5, upper.length - 1);
            const nums = resolveRange(range);
            values[key] = nums.reduce((a, b) => a + b, 0);
          } else if (upper.startsWith('=AVERAGE(') || upper.startsWith('=AVG(')) {
            const range = upper.substring(upper.indexOf('(') + 1, upper.length - 1);
            const nums = resolveRange(range);
            values[key] = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
          } else if (upper.startsWith('=COUNT(')) {
            const range = upper.substring(7, upper.length - 1);
            const nums = resolveRange(range);
            values[key] = nums.length;
          } else if (upper.startsWith('=MIN(')) {
            const range = upper.substring(5, upper.length - 1);
            const nums = resolveRange(range);
            values[key] = nums.length > 0 ? Math.min(...nums) : 0;
          } else if (upper.startsWith('=MAX(')) {
            const range = upper.substring(5, upper.length - 1);
            const nums = resolveRange(range);
            values[key] = nums.length > 0 ? Math.max(...nums) : 0;
          } else {
            // Arithmetic expression: replace references with values
            let expr = val.substring(1);
            // Replace cell coordinates like A1, B2 with their values
            expr = expr.replace(/[A-Z]\d+/g, (match) => {
              const v = values[match];
              return typeof v === 'number' ? String(v) : '0';
            });
            // Safe evaluation of basic math
            if (/^[0-9+\-*/().\s]+$/.test(expr)) {
              // eslint-disable-next-line no-eval
              const res = Function(`"use strict"; return (${expr})`)();
              values[key] = typeof res === 'number' && !isNaN(res) ? res : '#ERR';
            } else {
              values[key] = '#ERR';
            }
          }
        } catch {
          values[key] = '#ERR';
        }
      }
    });

    return values;
  }, [data.cells]);

  // Selected cell formatted string
  const activeCellData = selectedCell ? data.cells[selectedCell] : undefined;

  const handleCellChange = (cellKey: string, newValue: string) => {
    const existing = data.cells[cellKey] || {};
    const updated: SheetCell = {
      ...existing,
      value: newValue,
      formula: newValue.startsWith('=') ? newValue : undefined,
    };
    onChange({
      ...data,
      cells: {
        ...data.cells,
        [cellKey]: updated,
      },
    });
  };

  const toggleFormat = (key: 'bold') => {
    if (!selectedCell) return;
    const existing = data.cells[selectedCell] || { value: '' };
    onChange({
      ...data,
      cells: {
        ...data.cells,
        [selectedCell]: {
          ...existing,
          [key]: !existing[key],
        },
      },
    });
  };

  const setCellFormatType = (format: 'text' | 'currency' | 'percent' | 'number') => {
    if (!selectedCell) return;
    const existing = data.cells[selectedCell] || { value: '' };
    onChange({
      ...data,
      cells: {
        ...data.cells,
        [selectedCell]: {
          ...existing,
          format: existing.format === format ? undefined : format,
        },
      },
    });
  };

  const setCellAlignment = (align: 'left' | 'center' | 'right') => {
    if (!selectedCell) return;
    const existing = data.cells[selectedCell] || { value: '' };
    onChange({
      ...data,
      cells: {
        ...data.cells,
        [selectedCell]: {
          ...existing,
          align,
        },
      },
    });
  };

  const addRow = () => {
    onChange({ ...data, rows: data.rows + 1 });
  };

  const addCol = () => {
    if (data.cols < 26) {
      onChange({ ...data, cols: data.cols + 1 });
    }
  };

  const deleteRow = () => {
    if (data.rows > 3) {
      onChange({ ...data, rows: data.rows - 1 });
    }
  };

  const deleteCol = () => {
    if (data.cols > 2) {
      onChange({ ...data, cols: data.cols - 1 });
    }
  };

  const exportCSV = () => {
    let csv = '';
    for (let r = 1; r <= data.rows; r++) {
      const rowVals: string[] = [];
      for (let c = 0; c < data.cols; c++) {
        const key = `${COL_LETTERS[c]}${r}`;
        const val = evaluatedValues[key] !== undefined ? String(evaluatedValues[key]) : (data.cells[key]?.value || '');
        rowVals.push(`"${val.replace(/"/g, '""')}"`);
      }
      csv += rowVals.join(',') + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.title || 'blank-sheet'}.csv`;
    link.click();
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(Boolean);
      const newCells: Record<string, SheetCell> = {};
      let maxCols = data.cols;

      lines.forEach((line, rIdx) => {
        const row = rIdx + 1;
        // Simple comma split
        const cols = line.split(',');
        maxCols = Math.max(maxCols, cols.length);
        cols.forEach((colVal, cIdx) => {
          if (cIdx < 26) {
            const key = `${COL_LETTERS[cIdx]}${row}`;
            newCells[key] = { value: colVal.replace(/^"|"$/g, '').trim() };
          }
        });
      });

      onChange({
        ...data,
        rows: Math.max(lines.length + 5, data.rows),
        cols: Math.min(26, Math.max(maxCols, data.cols)),
        cells: newCells,
      });
    };
    reader.readAsText(file);
  };

  // Format value for display in grid
  const formatValueDisplay = (key: string, cell?: SheetCell) => {
    const raw = evaluatedValues[key] !== undefined ? evaluatedValues[key] : (cell?.value || '');
    if (typeof raw === 'number') {
      if (cell?.format === 'currency') {
        return '$' + raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (cell?.format === 'percent') {
        return (raw * 100).toFixed(1) + '%';
      }
      if (cell?.format === 'number') {
        return raw.toLocaleString();
      }
      return raw.toLocaleString();
    }
    return String(raw);
  };

  // Compute selected summary metrics
  const selectionSummary = useMemo(() => {
    if (!selectedCell) return null;
    const v = evaluatedValues[selectedCell];
    return typeof v === 'number' ? v : null;
  }, [selectedCell, evaluatedValues]);

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Formula & Formatting Bar */}
      {!isFocusMode && (
        <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-xs text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            {/* Active Cell Reference Indicator */}
            <div className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 font-mono font-bold text-neutral-900 dark:text-neutral-100 rounded border border-neutral-200 dark:border-neutral-700 min-w-[48px] text-center">
              {selectedCell || '—'}
            </div>

            {/* Formula Input */}
            <div className="flex-1 flex items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1">
              <span className="text-neutral-400 font-mono mr-2 font-bold">fx</span>
              <input
                type="text"
                value={selectedCell ? (data.cells[selectedCell]?.value || '') : ''}
                onChange={(e) => selectedCell && handleCellChange(selectedCell, e.target.value)}
                placeholder="Enter text, number, or formula (e.g. =SUM(A1:A5), =A1*B1)"
                className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 outline-none font-mono"
              />
            </div>
          </div>

          {/* Formatting & Grid Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFormat('bold')}
              title="Bold Text"
              className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                activeCellData?.bold ? 'bg-neutral-200 dark:bg-neutral-700 font-bold' : ''
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCellFormatType('currency')}
              title="Currency ($)"
              className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                activeCellData?.format === 'currency' ? 'bg-neutral-200 dark:bg-neutral-700 text-emerald-600' : ''
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCellFormatType('percent')}
              title="Percentage (%)"
              className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                activeCellData?.format === 'percent' ? 'bg-neutral-200 dark:bg-neutral-700 text-blue-600' : ''
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <button
              onClick={() => setCellAlignment('left')}
              title="Align Left"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCellAlignment('center')}
              title="Align Center"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCellAlignment('right')}
              title="Align Right"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <button
              onClick={addRow}
              title="Add Row"
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Row</span>
            </button>
            <button
              onClick={addCol}
              title="Add Column"
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Col</span>
            </button>

            <label className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors" title="Import CSV">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
            </label>

            <button
              onClick={exportCSV}
              title="Export as CSV"
              className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-white dark:bg-neutral-900">
        <table className="w-full border-collapse text-xs select-none">
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-800/80 sticky top-0 z-10">
              <th className="w-12 p-2 border-b border-r border-neutral-200 dark:border-neutral-700 text-center font-mono text-[10px] text-neutral-400">
                #
              </th>
              {Array.from({ length: data.cols }).map((_, cIdx) => (
                <th
                  key={cIdx}
                  className="min-w-[120px] p-2 border-b border-r border-neutral-200 dark:border-neutral-700 text-center font-mono font-bold text-neutral-600 dark:text-neutral-300"
                >
                  {COL_LETTERS[cIdx]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: data.rows }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <tr key={rowNum} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="w-12 p-1.5 bg-neutral-100/60 dark:bg-neutral-800/50 border-b border-r border-neutral-200 dark:border-neutral-700 text-center font-mono text-[11px] text-neutral-400">
                    {rowNum}
                  </td>
                  {Array.from({ length: data.cols }).map((_, cIdx) => {
                    const key = `${COL_LETTERS[cIdx]}${rowNum}`;
                    const cell = data.cells[key];
                    const isSelected = selectedCell === key;

                    return (
                      <td
                        key={key}
                        onClick={() => setSelectedCell(key)}
                        className={`p-0 border-b border-r border-neutral-200 dark:border-neutral-700 relative min-w-[120px] h-8 ${
                          isSelected ? 'ring-2 ring-blue-500 z-10' : ''
                        }`}
                      >
                        <input
                          type="text"
                          value={isSelected ? (cell?.value || '') : formatValueDisplay(key, cell)}
                          onChange={(e) => handleCellChange(key, e.target.value)}
                          onFocus={() => setSelectedCell(key)}
                          className={`w-full h-full px-2.5 bg-transparent border-none outline-none font-mono tabular-nums text-neutral-900 dark:text-neutral-100 ${
                            cell?.bold ? 'font-bold' : ''
                          } ${
                            cell?.align === 'right' ? 'text-right' :
                            cell?.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tabular Status Bar */}
      <footer className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-2 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-3">
          <span>Grid: {data.rows} rows × {data.cols} cols</span>
          <span aria-hidden="true">·</span>
          <span>Cell: {selectedCell || 'none'}</span>
          {selectionSummary !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Selected: {selectionSummary.toLocaleString()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-600 dark:text-emerald-400">Live Formula Engine Ready</span>
        </div>
      </footer>
    </div>
  );
};
