import ReactMarkdown from "react-markdown";
import { Copy, Download, Trash2, Columns2, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  originalText: string;
  formattedText: string | null;
  onClear: () => void;
  isLoading: boolean;
}

export function ResultArea({ originalText, formattedText, onClear, isLoading }: Props) {
  const [showComparison, setShowComparison] = useState(false);

  const handleCopy = () => {
    if (formattedText) {
      navigator.clipboard.writeText(formattedText);
    }
  };

  const handleDownload = () => {
    if (!formattedText) return;
    const blob = new Blob([formattedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!formattedText && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="bg-indigo-50 p-4 rounded-xl mb-4 text-indigo-400">
          <FileText size={32} />
        </div>
        <h3 className="text-[#1A1A1B] font-bold mb-1">Результат готов</h3>
        <p className="text-gray-400 max-w-xs text-xs uppercase tracking-wider font-semibold">
          Вставьте ваш текст, чтобы начать.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex space-x-1">
          <button
            onClick={() => setShowComparison(false)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-all",
              !showComparison ? "bg-white border border-gray-300 shadow-sm text-[#1A1A1B]" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Результат
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5",
              showComparison ? "bg-white border border-gray-300 shadow-sm text-[#1A1A1B]" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Сравнение
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            disabled={isLoading || !formattedText}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-all"
            title="Копировать"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading || !formattedText}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-all"
            title="Скачать .txt"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
              <h4 className="text-[#1A1A1B] font-bold mb-2">Анализ структуры...</h4>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                ИИ архитектор работает
              </p>
            </motion.div>
          ) : showComparison ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full"
            >
              <div className="flex flex-col gap-4 overflow-hidden border-r border-gray-100 pr-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Оригинал</span>
                <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed overflow-auto pr-4">
                  {originalText}
                </div>
              </div>
              <div className="flex flex-col gap-4 overflow-hidden">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Отформатированный контент</span>
                <div className="markdown-body prose-sm overflow-auto">
                  <ReactMarkdown>{formattedText || ""}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full max-w-3xl mx-auto"
            >
              <div className="markdown-body prose-sm">
                <ReactMarkdown>{formattedText || ""}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
