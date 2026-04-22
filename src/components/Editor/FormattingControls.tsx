import { FormattingMode, OutputStyle, FormattingOptions } from "@/src/types";
import { ChevronDown, Settings2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Props {
  mode: FormattingMode;
  setMode: (m: FormattingMode) => void;
  style: OutputStyle;
  setStyle: (s: OutputStyle) => void;
  options: FormattingOptions;
  setOptions: (o: FormattingOptions) => void;
}

export function FormattingControls({ mode, setMode, style, setStyle, options, setOptions }: Props) {
  const modes: { id: FormattingMode; label: string }[] = [
    { id: "light", label: "Легкое форматирование" },
    { id: "standard", label: "Стандартное форматирование" },
    { id: "deep", label: "Глубокий анализ структуры" }
  ];

  const styles: { id: OutputStyle; label: string }[] = [
    { id: "article", label: "Статья для сайта" },
    { id: "blog", label: "Профессиональный пост" },
    { id: "product", label: "Страница продукта/услуги" },
    { id: "faq", label: "Структура FAQ" },
    { id: "neutral", label: "Техническая документация" }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Режим обработки</label>
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as FormattingMode)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-gray-700 font-medium"
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Стиль вывода</label>
          <div className="relative">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as OutputStyle)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-gray-700 font-medium"
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.autoHeadings}
            onChange={(e) => setOptions({ ...options, autoHeadings: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">Создавать смысловые заголовки</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.preserveWording}
            onChange={(e) => setOptions({ ...options, preserveWording: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">Сохранять точные формулировки</span>
        </label>
      </div>
    </div>
  );
}
