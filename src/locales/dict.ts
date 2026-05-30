import type { Language } from "../stores/useQuizStore";
import type { TranslationDict } from "./type";

export const dict: Record<Language, TranslationDict> = {
    vi: {
    welcome: { title: "Thử thách Huế", description: "Bạn có phải người Huế chính hiệu?", start: "BẮT ĐẦU!", viewRanking: "Xem bảng xếp hạng", footer: "Chơi thử thách này để khám phá thêm về Huế!" },
    quiz: { next: "Tiếp theo", finish: "Kết thúc" },
    result: { score: "Điểm của bạn", playAgain: "Chơi lại" }
  },
    en: {
    welcome: { title: "Hue Challenge", description: "Are you a true Hue local?", start: "START!", viewRanking: "View Ranking", footer: "Play this challenge to discover more about Hue!" },
    quiz: { next: "Next", finish: "Finish" },
    result: { score: "Your Score", playAgain: "Play Again" }
  },
}