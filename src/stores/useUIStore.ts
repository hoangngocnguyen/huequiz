import { create } from "zustand";
import type { Language } from "./useQuizStore";

interface UIState {
    lang: Language;
    setLang: (newLang: Language) => void;
}


export const useUIStore = create<UIState>((set) => ({
    // Mặc định là "vi"
    lang: "vi",

    // Hàm để cập nhật ngôn ngữ
    setLang: (newLang) => set({ lang: newLang }),
}));