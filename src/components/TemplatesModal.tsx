import React from 'react';
import { 
  X, 
  FileText, 
  Layout, 
  Table, 
  Code2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BlankItem, BlankType } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Partial<BlankItem>) => void;
}

interface TemplateOption {
  id: string;
  title: string;
  type: BlankType;
  description: string;
  tags: string[];
  data: Partial<BlankItem>;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'tpl-meeting',
    title: 'Executive Meeting Notes',
    type: 'document',
    description: 'Clean agenda, attendees, key decisions, and prioritized action item checklist.',
    tags: ['Meetings', 'Productivity'],
    data: {
      title: 'Meeting Notes: Strategic Sync',
      type: 'document',
      documentData: {
        title: 'Meeting Notes: Strategic Sync',
        font: 'sans',
        pageWidth: 'standard',
        content: `# Meeting Notes: Strategic Sync

**Date & Time**: ${new Date().toLocaleDateString()} · 10:00 AM PST  
**Attendees**: Team Leads, Product, Engineering  
**Goal**: Finalize quarterly roadmap priorities and unblock deliverables.

---

### Agenda
1. Review sprint commitments and milestones
2. Architecture deep dive and dependencies
3. Action items and owners

### Key Decisions
- Adopted client-first offline persistence model.
- Standardized typography and unified component system.

### Action Items
- [ ] Draft technical specification for review
- [ ] Validate performance benchmarks on low-end hardware
- [ ] Schedule follow-up sync with stakeholders
`,
      },
    },
  },
  {
    id: 'tpl-prd',
    title: 'Product Requirements (PRD)',
    type: 'document',
    description: 'Comprehensive product spec template with problem statement, metrics, and technical requirements.',
    tags: ['Product', 'Engineering'],
    data: {
      title: 'Product Brief & Requirements',
      type: 'document',
      documentData: {
        title: 'Product Brief & Requirements',
        font: 'sans',
        pageWidth: 'wide',
        content: `# Product Specification: [Feature Name]

**Author**: Product Team  
**Status**: Draft  
**Target Delivery**: Q4 2026

---

## 1. Problem Statement
Users need an instant, low-latency workspace that boots without delay and provides distraction-free utility.

## 2. Key Objectives & Metrics
- Time to first interactive keystroke $\le 100\\text{ms}$
- 100% offline resilient with local caching
- Zero unnecessary chrome or notification distractions

## 3. Scope & User Flows
### Core User Journey
1. User clicks or types shortcut
2. Instant blank state appears
3. Automatic background save to device

## 4. Technical Non-Functional Requirements
- WCAG AA contrast compliance
- Strict tabular figures for numerical displays
`,
      },
    },
  },
  {
    id: 'tpl-canvas-matrix',
    title: '2x2 Priority Matrix',
    type: 'canvas',
    description: 'Impact vs Effort canvas with ready-to-move stickies for rapid team brainstorming.',
    tags: ['Brainstorm', 'Planning'],
    data: {
      title: 'Impact vs Effort 2x2 Matrix',
      type: 'canvas',
      canvasData: {
        title: 'Impact vs Effort 2x2 Matrix',
        zoom: 1,
        panX: 0,
        panY: 0,
        items: [
          {
            id: 'box-q1',
            type: 'shape',
            shapeType: 'rect',
            x: 80,
            y: 60,
            width: 280,
            height: 200,
            fillColor: '#F0FDF4',
            strokeColor: '#86EFAC',
            label: 'Quick Wins (High Impact, Low Effort)',
          },
          {
            id: 'box-q2',
            type: 'shape',
            shapeType: 'rect',
            x: 380,
            y: 60,
            width: 280,
            height: 200,
            fillColor: '#EFF6FF',
            strokeColor: '#93C5FD',
            label: 'Major Projects (High Impact, High Effort)',
          },
          {
            id: 'box-q3',
            type: 'shape',
            shapeType: 'rect',
            x: 80,
            y: 280,
            width: 280,
            height: 200,
            fillColor: '#F8FAFC',
            strokeColor: '#CBD5E1',
            label: 'Fill-ins (Low Impact, Low Effort)',
          },
          {
            id: 'box-q4',
            type: 'shape',
            shapeType: 'rect',
            x: 380,
            y: 280,
            width: 280,
            height: 200,
            fillColor: '#FEF2F2',
            strokeColor: '#FCA5A5',
            label: 'Thankless Tasks (Low Impact, High Effort)',
          },
          {
            id: 'sticky-init-1',
            type: 'sticky',
            x: 100,
            y: 110,
            width: 160,
            height: 100,
            text: 'Instant keyboard shortcuts (⌘N, ⌘K)',
            color: '#FEF08A',
          },
          {
            id: 'sticky-init-2',
            type: 'sticky',
            x: 400,
            y: 110,
            width: 160,
            height: 100,
            text: 'Live collaborative synchronization',
            color: '#BAE6FD',
          },
        ],
      },
    },
  },
  {
    id: 'tpl-budget',
    title: 'Project Budget & Burn Ledger',
    type: 'sheet',
    description: 'Financial sheet with pre-configured sum formulas and category columns.',
    tags: ['Finance', 'Spreadsheet'],
    data: {
      title: 'Project Budget & Financial Model',
      type: 'sheet',
      sheetData: {
        title: 'Project Budget & Financial Model',
        rows: 14,
        cols: 6,
        cells: {
          A1: { value: 'Expense Item', bold: true },
          B1: { value: 'Department', bold: true },
          C1: { value: 'Allocated ($)', bold: true, align: 'right' },
          D1: { value: 'Actual Spent ($)', bold: true, align: 'right' },
          E1: { value: 'Variance ($)', bold: true, align: 'right' },
          A2: { value: 'Cloud Compute Infrastructure' },
          B2: { value: 'DevOps' },
          C2: { value: '4500', align: 'right', format: 'currency' },
          D2: { value: '3820', align: 'right', format: 'currency' },
          E2: { value: '=C2-D2', formula: '=C2-D2', align: 'right', format: 'currency' },
          A3: { value: 'Software Tooling & Licences' },
          B3: { value: 'Engineering' },
          C3: { value: '2800', align: 'right', format: 'currency' },
          D3: { value: '2750', align: 'right', format: 'currency' },
          E3: { value: '=C3-D3', formula: '=C3-D3', align: 'right', format: 'currency' },
          A4: { value: 'Typography & Design Assets' },
          B4: { value: 'Design' },
          C4: { value: '1200', align: 'right', format: 'currency' },
          D4: { value: '950', align: 'right', format: 'currency' },
          E4: { value: '=C4-D4', formula: '=C4-D4', align: 'right', format: 'currency' },
          A5: { value: 'Total Burn', bold: true },
          C5: { value: '=SUM(C2:C4)', formula: '=SUM(C2:C4)', bold: true, align: 'right', format: 'currency' },
          D5: { value: '=SUM(D2:D4)', formula: '=SUM(D2:D4)', bold: true, align: 'right', format: 'currency' },
          E5: { value: '=C5-D5', formula: '=C5-D5', bold: true, align: 'right', format: 'currency' },
        },
      },
    },
  },
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Blank Starter Templates</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Select a pre-structured blank slate or jump in right away.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl.data);
                onClose();
              }}
              className="group p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {tpl.type === 'document' && <FileText className="w-4 h-4 text-blue-500" />}
                    {tpl.type === 'canvas' && <Layout className="w-4 h-4 text-emerald-500" />}
                    {tpl.type === 'sheet' && <Table className="w-4 h-4 text-amber-500" />}
                    {tpl.type === 'code' && <Code2 className="w-4 h-4 text-purple-500" />}
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {tpl.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                  {tpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
                <span>{tpl.tags.join(' · ')}</span>
                <span className="flex items-center gap-1 font-medium text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1 transition-transform">
                  Use blank <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
