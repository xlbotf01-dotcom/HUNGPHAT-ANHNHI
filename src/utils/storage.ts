import { BlankItem, BlankType } from '../types';

const STORAGE_KEY = 'quick_blank_workspace_items_v2';
const ACTIVE_ID_KEY = 'quick_blank_active_id_v2';
const THEME_KEY = 'quick_blank_theme_v2';

export const STARTER_BLANKS: BlankItem[] = [
  {
    id: 'blank-doc-default',
    title: 'Untitled Document',
    type: 'document',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    documentData: {
      title: 'Untitled Document',
      content: `# Untitled Document

Welcome to your blank canvas. Start typing immediately, write markdown, or use keyboard shortcuts.

### Quick Shortcuts
- **⌘ + N** : Quick new blank document
- **⌘ + K** : Open command palette
- **Type /** : Insert headings, quotes, tasks, and tables
- **⌘ + S** : Export / Download document

### Today's Focus
- [ ] Brainstorm initial architecture
- [ ] Jot down core requirements
- [ ] Draft export specifications

> "A blank page is not empty; it is full of infinite possibilities."
`,
      font: 'sans',
      pageWidth: 'standard',
      targetWordCount: 500,
    },
  },
  {
    id: 'blank-canvas-default',
    title: 'Visual Brainstorm Board',
    type: 'canvas',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 120000,
    canvasData: {
      title: 'Visual Brainstorm Board',
      items: [
        {
          id: 'sticky-1',
          type: 'sticky',
          x: 100,
          y: 80,
          width: 200,
          height: 160,
          text: 'Core Idea:\nLightning-fast blank canvas for thoughts, diagrams, and quick notes.',
          color: '#FEF08A', // soft yellow
        },
        {
          id: 'sticky-2',
          type: 'sticky',
          x: 340,
          y: 80,
          width: 200,
          height: 160,
          text: 'Zero Clutter:\nDistraction-free environment with instant auto-save to device.',
          color: '#BAE6FD', // soft sky blue
        },
        {
          id: 'sticky-3',
          type: 'sticky',
          x: 580,
          y: 80,
          width: 200,
          height: 160,
          text: 'Instant Export:\nMarkdown, CSV, PDF, and PNG at your fingertips.',
          color: '#BBF7D0', // soft emerald
        },
        {
          id: 'shape-1',
          type: 'shape',
          shapeType: 'rect',
          x: 100,
          y: 280,
          width: 440,
          height: 120,
          fillColor: '#F8FAFC',
          strokeColor: '#CBD5E1',
          label: 'Drag items, click anywhere to draw, add sticky notes & shapes',
        },
      ],
      zoom: 1,
      panX: 0,
      panY: 0,
    },
  },
  {
    id: 'blank-sheet-default',
    title: 'Quick Calculations & Ledger',
    type: 'sheet',
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now() - 180000,
    sheetData: {
      title: 'Quick Calculations & Ledger',
      rows: 15,
      cols: 8,
      cells: {
        A1: { value: 'Item Description', bold: true },
        B1: { value: 'Category', bold: true },
        C1: { value: 'Quantity', bold: true, align: 'right' },
        D1: { value: 'Unit Price ($)', bold: true, align: 'right' },
        E1: { value: 'Total ($)', bold: true, align: 'right' },
        A2: { value: 'Studio Workspace Desk' },
        B2: { value: 'Furniture' },
        C2: { value: '2', align: 'right', format: 'number' },
        D2: { value: '350', align: 'right', format: 'currency' },
        E2: { value: '=C2*D2', formula: '=C2*D2', align: 'right', format: 'currency' },
        A3: { value: '4K IPS UltraWide Monitor' },
        B3: { value: 'Hardware' },
        C3: { value: '2', align: 'right', format: 'number' },
        D3: { value: '620', align: 'right', format: 'currency' },
        E3: { value: '=C3*D3', formula: '=C3*D3', align: 'right', format: 'currency' },
        A4: { value: 'Ergonomic Mesh Chair' },
        B4: { value: 'Furniture' },
        C4: { value: '2', align: 'right', format: 'number' },
        D4: { value: '450', align: 'right', format: 'currency' },
        E4: { value: '=C4*D4', formula: '=C4*D4', align: 'right', format: 'currency' },
        A5: { value: 'Summary Total', bold: true },
        E5: { value: '=SUM(E2:E4)', formula: '=SUM(E2:E4)', bold: true, align: 'right', format: 'currency' },
      },
    },
  },
  {
    id: 'blank-code-default',
    title: 'Code & Logic Scratchpad',
    type: 'code',
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now() - 240000,
    codeData: {
      title: 'Code & Logic Scratchpad',
      language: 'javascript',
      code: `// Quick JavaScript Scratchpad - Click "Run / Evaluate" below
const items = [
  { name: 'Paper Notebook', price: 18, stock: 42 },
  { name: 'Gel Pens (Pack of 6)', price: 12, stock: 110 },
  { name: 'Desk Organizer Tray', price: 34, stock: 25 },
];

const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);
console.log('Total inventory valuation: $' + totalValue.toLocaleString());

const lowStockItems = items.filter(i => i.stock < 30);
console.log('Low stock items:', lowStockItems.map(i => i.name));

// Return value for scratch preview:
({ totalValue, lowStockCount: lowStockItems.length });
`,
    },
  },
];

export function getStoredBlanks(): BlankItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_BLANKS));
      return STARTER_BLANKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : STARTER_BLANKS;
  } catch {
    return STARTER_BLANKS;
  }
}

export function saveStoredBlanks(items: BlankItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save blanks to localStorage', err);
  }
}

export function getStoredActiveId(): string {
  try {
    return localStorage.getItem(ACTIVE_ID_KEY) || 'blank-doc-default';
  } catch {
    return 'blank-doc-default';
  }
}

export function saveStoredActiveId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch {
    // Ignore
  }
}

export function createNewBlankItem(type: BlankType, customTitle?: string, starterContent?: string): BlankItem {
  const id = `blank-${type}-${Date.now()}`;
  const now = Date.now();

  const title = customTitle || (
    type === 'document' ? 'Untitled Document' :
    type === 'canvas' ? 'Untitled Canvas' :
    type === 'sheet' ? 'Untitled Sheet' : 'Untitled Scratchpad'
  );

  const newItem: BlankItem = {
    id,
    title,
    type,
    createdAt: now,
    updatedAt: now,
  };

  if (type === 'document') {
    newItem.documentData = {
      title,
      content: starterContent || `# ${title}\n\nStart writing here...\n`,
      font: 'sans',
      pageWidth: 'standard',
    };
  } else if (type === 'canvas') {
    newItem.canvasData = {
      title,
      items: [
        {
          id: `sticky-${now}`,
          type: 'sticky',
          x: 120,
          y: 100,
          width: 220,
          height: 180,
          text: 'New Blank Canvas\nClick anywhere to draw, add sticky notes, or place shapes.',
          color: '#FEF08A',
        },
      ],
      zoom: 1,
      panX: 0,
      panY: 0,
    };
  } else if (type === 'sheet') {
    newItem.sheetData = {
      title,
      rows: 15,
      cols: 8,
      cells: {
        A1: { value: 'Item', bold: true },
        B1: { value: 'Value', bold: true, align: 'right' },
      },
    };
  } else if (type === 'code') {
    newItem.codeData = {
      title,
      language: 'javascript',
      code: starterContent || `// Quick scratchpad\nconsole.log("Hello from Quick Blank!");\n`,
    };
  }

  return newItem;
}
