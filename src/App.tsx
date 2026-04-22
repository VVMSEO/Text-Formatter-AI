import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { Navbar } from "@/src/components/layout/Navbar";
import { FormattingControls } from "@/src/components/Editor/FormattingControls";
import { ResultArea } from "@/src/components/Editor/ResultArea";
import { FormattingMode, OutputStyle, FormattingOptions, FormattingHistoryItem } from "@/src/types";
import { aiService } from "@/src/services/api";
import { historyService } from "@/src/services/db";
import { History, Sparkles, Wand2, Clock, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { HTMLEditor } from "./components/HTMLEditor/HTMLEditor";

export default function App() {
  const [activeTab, setActiveTab] = useState<'formatter' | 'editor'>('formatter');
  const [user, setUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState("");
  const [formattedText, setFormattedText] = useState<string | null>(null);
  const [mode, setMode] = useState<FormattingMode>("standard");
  const [style, setStyle] = useState<OutputStyle>("neutral");
  const [options, setOptions] = useState<FormattingOptions>({
    preserveWording: false,
    webReadable: true,
    autoHeadings: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<FormattingHistoryItem[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadHistory(u.uid);
    });
  }, []);

  const loadHistory = async (uid: string) => {
    try {
      const data = await historyService.getHistory(uid);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const handleFormat = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setFormattedText(null);

    try {
      const result = await aiService.formatText(inputText, mode, style, options);
      setFormattedText(result);
      setSuccess("Текст успешно отформатирован!");
      setTimeout(() => setSuccess(null), 3000);

      if (user) {
        await historyService.saveHistory({
          originalText: inputText,
          formattedText: result,
          mode,
          style,
          options,
          userId: user.uid,
        });
        loadHistory(user.uid);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setFormattedText(null);
    setError(null);
  };

  const handleHistorySelect = (item: FormattingHistoryItem) => {
    setInputText(item.originalText);
    setFormattedText(item.formattedText);
    setMode(item.mode);
    setStyle(item.style);
    setOptions(item.options);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await historyService.deleteHistory(id);
      loadHistory(user.uid);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1B] font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'formatter' ? (
        <>
          <main className="flex-1 p-6 grid grid-cols-12 gap-6 h-[calc(100vh-64px)] overflow-hidden">
            {/* Global Notifications (Floated) */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-lg mb-4 flex items-center gap-3 shadow-sm"
                  >
                    <Trash2 size={14} />
                    <span className="text-xs font-medium">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-lg mb-4 flex items-center gap-3 shadow-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-medium">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Left Column: Input and Controls */}
            <div className="col-span-5 flex flex-col space-y-4 h-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-grow flex flex-col p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Исходный текст</label>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {inputText.length} символов
                  </span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Вставьте ваш текст здесь..."
                  className="flex-grow w-full resize-none border-none focus:ring-0 text-sm text-gray-700 leading-relaxed overflow-y-auto px-0 font-sans"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                <FormattingControls
                  mode={mode}
                  setMode={setMode}
                  style={style}
                  setStyle={setStyle}
                  options={options}
                  setOptions={setOptions}
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleFormat}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Wand2 size={16} />
                  )}
                  <span>Форматировать контент</span>
                </motion.button>
              </div>
            </div>

            {/* Right Column: Result Area & History Actions */}
            <div className="col-span-12 lg:col-span-7 flex flex-col h-full">
              <div className="flex-grow flex flex-col overflow-hidden">
                <ResultArea
                  originalText={inputText}
                  formattedText={formattedText}
                  onClear={handleClear}
                  isLoading={isLoading}
                />
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Очистить всё
                </button>
                {user && (
                  <button
                    onClick={() => setSuccess("Ваша история сохраняется автоматически.")}
                    className="px-6 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                  >
                    Сохранить в историю
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* History Grid (Only if user scrolls down or specifically selects it) */}
          {user && history.length > 0 && (
            <div className="max-w-7xl mx-auto px-8 py-16 w-full border-t border-gray-200 bg-white">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#1A1A1B] flex items-center gap-3">
                  <Clock size={20} className="text-indigo-600" />
                  Последние обработки
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistorySelect(item)}
                    className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                        {item.style}
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistory(e, item.id!)}
                        className="p-1 text-gray-300 hover:text-red-500 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug">
                      {item.originalText}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>{item.createdAt?.seconds 
                        ? formatDistanceToNow(new Date(item.createdAt.seconds * 1000), { addSuffix: true }) 
                        : "Только что"}</span>
                      <ChevronRight size={12} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="fixed bottom-6 right-6 flex items-center space-x-3 bg-white text-green-700 px-4 py-2 rounded-full border border-gray-200 shadow-lg z-50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">ИИ Готов</span>
          </div>
        </>
      ) : (
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]">
          <HTMLEditor />
        </main>
      )}
    </div>
  );
}
