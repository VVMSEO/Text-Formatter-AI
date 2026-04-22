import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Eye, 
  Trash2, 
  Copy, 
  Type, 
  Bold, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Table as TableIcon,
  Eraser,
  Sparkles,
  Columns2,
  FileCode,
  Download,
  RotateCcw,
  RotateCw,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { cleanHTML, transformStrong } from '../../lib/html-utils/cleaner';
import { applyTypographyToHTML } from '../../lib/html-utils/typography';
import { cn } from '../../lib/utils';
import { html_beautify } from 'js-beautify';

type ViewMode = 'visual' | 'code' | 'split' | 'preview';

export function HTMLEditor() {
  const [content, setContent] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('html_editor_content');
    if (saved) {
      setContent(saved);
      addToHistory(saved);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('html_editor_content', content);
  }, [content]);

  const addToHistory = (newContent: string) => {
    if (history[historyIndex] === newContent) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    addToHistory(val);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setContent(prev);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setContent(next);
    }
  };

  const handleAction = (action: () => string, msg: string) => {
    try {
      const newContent = action();
      handleContentChange(newContent);
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const beautify = () => handleAction(() => html_beautify(content, { indent_size: 2 }), "Код отформатирован");

  const runCleanup = (preset: any) => handleAction(() => cleanHTML(content, preset), "HTML очищен");

  const runTypography = () => handleAction(() => applyTypographyToHTML(content), "Типографика применена");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setSuccess("Скопировано в буфер обмена");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleClear = () => {
    if (window.confirm("Очистить всё содержимое?")) {
      handleContentChange("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-1">
          <ModeButton active={viewMode === 'visual'} onClick={() => setViewMode('visual')} icon={<Type size={16} />} label="Визуал" />
          <ModeButton active={viewMode === 'code'} onClick={() => setViewMode('code')} icon={<Code size={16} />} label="Код" />
          <ModeButton active={viewMode === 'split'} onClick={() => setViewMode('split')} icon={<Columns2 size={16} />} label="Раздельно" />
          <ModeButton active={viewMode === 'preview'} onClick={() => setViewMode('preview')} icon={<Eye size={16} />} label="Предпросмотр" />
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <ActionButton onClick={undo} icon={<RotateCcw size={16} />} title="Отменить" />
          <ActionButton onClick={redo} icon={<RotateCw size={16} />} title="Повторить" />
          
          {(viewMode === 'visual' || viewMode === 'split') && (
            <>
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <ActionButton onClick={() => document.execCommand('bold')} icon={<Bold size={16} />} title="Жирный" />
              <ActionButton onClick={() => document.execCommand('formatBlock', false, 'h1')} icon={<Heading1 size={16} />} title="H1" />
              <ActionButton onClick={() => document.execCommand('formatBlock', false, 'h2')} icon={<Heading2 size={16} />} title="H2" />
              <ActionButton onClick={() => document.execCommand('formatBlock', false, 'h3')} icon={<Heading3 size={16} />} title="H3" />
              <ActionButton onClick={() => document.execCommand('insertUnorderedList')} icon={<List size={16} />} title="Список" />
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={beautify}
            className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors"
          >
            <FileCode size={14} />
            <span>Форматировать</span>
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            <Copy size={14} />
            <span>Копировать</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Helper Siderbar (Tools) */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-6">
          <div>
            <SectionTitle>Очистка HTML</SectionTitle>
            <div className="grid grid-cols-1 gap-2">
              <ToolButton onClick={() => runCleanup('word')} icon={<Eraser size={14} />} label="Очистить Word/Docs" />
              <ToolButton onClick={() => runCleanup('cms')} icon={<Sparkles size={14} />} label="Очистить для CMS" />
              <ToolButton onClick={() => runCleanup('semantic')} icon={<Sparkles size={14} />} label="Семантическая чистка" />
              <ToolButton onClick={() => runCleanup('all-formatting')} icon={<Trash2 size={14} />} label="Удалить всё форматирование" />
              <ToolButton onClick={() => runCleanup('table')} icon={<TableIcon size={14} />} label="Очистить таблицы" />
            </div>
          </div>

          <div>
            <SectionTitle>Тег STRONG / B</SectionTitle>
            <div className="grid grid-cols-1 gap-2">
              <ToolButton onClick={() => handleAction(() => transformStrong(content, 'remove'), "Strong удалены")} icon={<Bold size={14} className="opacity-50" />} label="Удалить все Strong" />
              <ToolButton onClick={() => handleAction(() => transformStrong(content, 'to-b'), "Strong -> B")} icon={<Bold size={14} />} label="Strong → B" />
              <ToolButton onClick={() => handleAction(() => transformStrong(content, 'b-to-strong'), "B -> Strong")} icon={<Bold size={14} />} label="B → Strong" />
            </div>
          </div>

          <div>
            <SectionTitle>Типографика</SectionTitle>
            <div className="grid grid-cols-1 gap-2">
              <ToolButton onClick={runTypography} icon={<Type size={14} />} label="Умная типографика" />
            </div>
          </div>

          <div className="pt-8 mt-auto border-t border-gray-100">
            <button 
              onClick={handleClear}
              className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <Trash2 size={14} />
              <span>Очистить всё</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden bg-white">
          {(viewMode === 'code' || viewMode === 'split') && (
            <div className={cn("h-full", viewMode === 'split' ? "w-1/2 border-r border-gray-100" : "w-full")}>
              <CodeMirror
                value={content}
                height="100%"
                extensions={[html()]}
                onChange={handleContentChange}
                theme="light"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                }}
                className="h-full text-sm"
              />
            </div>
          )}

          {(viewMode === 'visual' || viewMode === 'split') && (
            <div className={cn("h-full overflow-y-auto p-8 bg-white", viewMode === 'split' ? "w-1/2" : "w-full")}>
              <div
                ref={visualEditorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
                className="prose prose-indigo max-w-none focus:outline-none min-h-full"
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="w-full h-full overflow-y-auto p-12 bg-gray-50 flex justify-center">
              <div className="w-full max-w-4xl bg-white shadow-xl p-16 rounded-lg min-h-full">
                <div 
                  className="prose prose-indigo max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-[100] flex items-center space-x-3",
              success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="text-xs font-bold uppercase tracking-wider">{success || error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
        active ? "bg-white border border-gray-300 shadow-sm text-indigo-600" : "text-gray-500 hover:bg-gray-100"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ActionButton({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {icon}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">{children}</h3>
  );
}

function ToolButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left"
    >
      <div className="text-gray-400">{icon}</div>
      <span>{label}</span>
    </button>
  );
}
