import { create } from "zustand";
import type { Language } from "./useQuizStore";

interface UIState {
    lang: Language;
    setLang: (newLang: Language) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}


export const useUIStore = create<UIState>((set) => ({
    // Mặc định là "vi"
    lang: "vi",

    // Hàm để cập nhật ngôn ngữ
    setLang: (newLang) => set({ lang: newLang }),
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
}));