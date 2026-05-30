import { dict } from "../locales/dict";
import { useUIStore } from "../stores/useUIStore";

export const useTranslation = () => {
  const { lang } = useUIStore();
  return dict[lang];
}