import { auth, signInWithGoogle } from "@/src/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { LogIn, LogOut, User as UserIcon, Activity, Sparkles, FileEdit } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface NavbarProps {
  activeTab: 'formatter' | 'editor';
  setActiveTab: (tab: 'formatter' | 'editor') => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A1A1B] hidden lg:inline">Text Formatter AI</span>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('formatter')}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'formatter' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            )}
          >
            <Sparkles size={14} />
            <span>AI Форматер</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'editor' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            )}
          >
            <FileEdit size={14} />
            <span>HTML Редактор</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-700">История</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:inline">{user.displayName}</span>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                  {user.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              )}
              <button
                onClick={() => signOut(auth)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGoogle}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <LogIn size={16} />
            <span>Войти</span>
          </motion.button>
        )}
      </div>
    </nav>
  );
}
