// src/components/LanguageSwitcher.tsx
import { useUIStore } from "../stores/useUIStore";

export const LanguageSwitcher = () => {
  const { lang, setLang } = useUIStore();

  return (
    <div className="">
      <button
        onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-[#E0F7FA] text-[#00838F] font-bold text-sm sm:text-base hover:scale-105 transition-all"
      >
        <span>{lang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
        <span className="uppercase">{lang}</span>
      </button>
    </div>
  );
};