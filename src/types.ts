export type BlankType = 'document' | 'canvas' | 'sheet' | 'code';

export type FontStyle = 'sans' | 'serif' | 'mono';
export type PageWidth = 'standard' | 'wide' | 'full';
export type AppTheme = 'light' | 'dark' | 'sepia' | 'nord';

export interface DocumentData {
  title: string;
  content: string; // Markdown / Plain text
  font: FontStyle;
  pageWidth: PageWidth;
  targetWordCount?: number;
}

export type CanvasTool = 'select' | 'pen' | 'sticky' | 'rect' | 'circle' | 'arrow' | 'text';

export interface CanvasStroke {
  id: string;
  type: 'stroke';
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface CanvasSticky {
  id: string;
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export interface CanvasShape {
  id: string;
  type: 'shape';
  shapeType: 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  label?: string;
}

export interface CanvasText {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export type CanvasItem = CanvasStroke | CanvasSticky | CanvasShape | CanvasText;

export interface CanvasData {
  title: string;
  items: CanvasItem[];
  zoom: number;
  panX: number;
  panY: number;
}

export interface SheetCell {
  value: string;
  formula?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'currency' | 'percent' | 'number';
}

export interface SheetData {
  title: string;
  rows: number;
  cols: number;
  cells: Record<string, SheetCell>; // "A1", "B2", etc.
}

export interface CodeData {
  title: string;
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'sql' | 'json' | 'markdown';
  output?: string;
}

export interface BlankItem {
  id: string;
  title: string;
  type: BlankType;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  documentData?: DocumentData;
  canvasData?: CanvasData;
  sheetData?: SheetData;
  codeData?: CodeData;
}

export interface DocumentRevision {
  timestamp: number;
  title: string;
  summary: string;
  snapshot: BlankItem;
}
