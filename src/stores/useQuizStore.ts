import { create } from "zustand";
import { useUIStore } from "./useUIStore";


export type Language = "en" | "vi";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxIa6RYcOSXveGhJb6b9i-cP0Onm9dSNKsevehe0hsSQFBVZpjngxDykvKI10MmO_AJwg/exec";
const QUESTIONS_CACHE_KEY = "hueQuizQuestions";
const RANKING_CACHE_KEY = "hueQuizRanking";

export type Question = {
  q: string;
  img: string;
  opts: string[];
  ans: number;
  optsType: "text" | "image";
};

export type RankingEntry = {
  name: string;
  correct: number;
  total: number;
  accuracy: number;
  time: number;
  played_at?: number;
};

export type QuizNotice = {
  title: string;
  message: string;
  tone: "success" | "error" | "info";
};

type SaveRankCopy = {
  missingNameTitle: string;
  missingNameMessage: string;
  saveSuccessTitle: string;
  saveSuccessMessage: string;
  saveErrorTitle: string;
  saveErrorMessage: string;
  connectionErrorTitle: string;
  connectionErrorMessage: string;
};

export const sampleQuestions: Question[] = [];

const isQuestionList = (value: unknown): value is Question[] => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => {
      const question = item as Question;
      return (
        typeof question.q === "string" &&
        typeof question.img === "string" &&
        Array.isArray(question.opts) &&
        typeof question.ans === "number" &&
        (question.optsType === "text" || question.optsType === "image")
      );
    })
  );
};

const readCachedQuestions = () => {
  try {
    const cached = sessionStorage.getItem(QUESTIONS_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return isQuestionList(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeCachedQuestions = (questions: Question[]) => {
  try {
    sessionStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(questions));
  } catch {
    // Keep the quiz usable when sessionStorage is unavailable.
  }
};

// Preload images to avoid visible loading when switching questions.
const preloadImages = (urls: string[]) => {
  if (!urls || urls.length === 0) return;
  const imgs: HTMLImageElement[] = [];
  urls.forEach((u) => {
    try {
      const img = new Image();
      img.src = u;
      imgs.push(img);
    } catch {
      // ignore individual image failures
    }
  });
  // Keep references briefly to avoid immediate GC
  try {
    const globalRef = globalThis as unknown as { __hueQuizPreloaded?: HTMLImageElement[] };
    globalRef.__hueQuizPreloaded = (globalRef.__hueQuizPreloaded || []).concat(imgs);
  } catch {
    // If window isn't available for some reason, ignore
  }
};

const preloadImagesFromQuestions = (questions: Question[] | null) => {
  if (!questions || !Array.isArray(questions)) return;
  const urls: string[] = [];
  questions.forEach((q) => {
    if (q.img) urls.push(q.img);
    if (q.optsType === "image" && Array.isArray(q.opts)) urls.push(...q.opts);
  });
  preloadImages(urls);
};

const sortRanking = (entries: RankingEntry[]) => {
  return [...entries].sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (b.correct !== a.correct) return b.correct - a.correct;
    if (a.time !== b.time) return a.time - b.time;
    return (b.played_at || 0) - (a.played_at || 0);
  });
};

const updateCachedRanking = (entry: RankingEntry) => {
  try {
    const cached = sessionStorage.getItem(RANKING_CACHE_KEY);
    const current = cached ? JSON.parse(cached) : [];
    const ranking = Array.isArray(current) ? (current as RankingEntry[]) : [];
    const next = sortRanking([...ranking, entry]);
    sessionStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Ranking page will refresh from the server if cache update fails.
  }
};

type QuizStore = {
  questions: Question[];
  cur: number;
  score: number;
  startTime: number | null;
  endTime: number | null;
  userName: string;
  saving: boolean;
  savedRank: boolean;
  notice: QuizNotice | null;
  showAnswer: { idx: number; correct: boolean } | null;
  loadingTime: number;
  fetchQuestions: () => Promise<void>;
  startQuiz: () => Promise<void>;
  handleAnswer: (idx: number) => void;
  saveRank: (copy?: SaveRankCopy) => Promise<void>;
  setUserName: (name: string) => void;
  setNotice: (notice: QuizNotice | null) => void;
};

const loadingTimer: ReturnType<typeof setInterval> | null = null;



export const useQuizStore = create<QuizStore>((set, get) => ({
  questions: readCachedQuestions() || sampleQuestions,
  cur: 0,
  score: 0,
  startTime: null,
  endTime: null,
  userName: localStorage.getItem("quizUserName") || "",
  saving: false,
  savedRank: false,
  notice: null,
  showAnswer: null,
  loadingTime: 3,

  setUserName: (userName) => set({ userName }),
  setNotice: (notice) => set({ notice }),

  fetchQuestions: async () => {
    const cachedQuestions = readCachedQuestions();
    if (cachedQuestions) {
      set({ questions: cachedQuestions });
      preloadImagesFromQuestions(cachedQuestions);
      return;
    }

    try {
      const res = await fetch(`${API_URL}?resource=questions`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (isQuestionList(data)) {
        writeCachedQuestions(data);
        set({ questions: data });
        preloadImagesFromQuestions(data);
      }
    } catch {
      console.warn("Không thể tải câu hỏi từ server, dùng dữ liệu mẫu.");
      set({ questions: sampleQuestions });
      preloadImagesFromQuestions(sampleQuestions);
    }
  },

  startQuiz: async () => {
    if (loadingTimer) clearInterval(loadingTimer);

    // Bật loading và reset trạng thái quiz
    useUIStore.getState().setIsLoading(true);
    set({
      cur: 0,
      score: 0,
      startTime: null,
      endTime: null,
      userName: "",
      saving: false,
      savedRank: false,
      notice: null,
      showAnswer: null,
      loadingTime: 3,
    });

    await get().fetchQuestions();
    set({startTime: Date.now() });

    // Tắt loading
    useUIStore.getState().setIsLoading(false);
  },

  handleAnswer: (idx) => {
    const { questions, cur, showAnswer } = get();
    if (showAnswer || !questions[cur]) return;

    const correct = questions[cur].ans === idx;
    set((state) => ({
      score: correct ? state.score + 1 : state.score,
      showAnswer: { idx, correct },
    }));

    setTimeout(() => {
      const state = get();
      const isLastQuestion = state.cur + 1 >= state.questions.length;

      if (isLastQuestion) {
        // Chỉ reset showAnswer, còn endTime để lưu lại để tính toán kết quả và hỗ trợ logic navigate result page.
        set({ showAnswer: null, endTime: Date.now() });
      } else {
        set({ showAnswer: null, cur: state.cur + 1 });
      }
    }, 1200);
  },

  saveRank: async (copy) => {
    const state = get();
    if (state.saving || state.savedRank) return;

    if (!state.userName) {
      set({
        notice: {
          title: copy?.missingNameTitle || "Thiếu tên rồi",
          message:
            copy?.missingNameMessage ||
            "Vui lòng nhập tên của bạn trước khi lưu điểm nhé.",
          tone: "info",
        },
      });
      return;
    }

    if (!state.startTime || !state.endTime) return;

    set({ saving: true });
    localStorage.setItem("quizUserName", state.userName);

    const timeSec = Math.round((state.endTime - state.startTime) / 1000);
    const accuracy = state.questions.length
      ? Math.round((state.score / state.questions.length) * 100)
      : 0;
    const payload = {
      name: state.userName,
      correct: state.score,
      total: state.questions.length,
      accuracy,
      time: timeSec,
      played_at: Date.now(),
    };

    try {
      const res = await fetch(`${API_URL}?action=saveRanking`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        updateCachedRanking(payload);
        set({
          savedRank: true,
          notice: {
            title: copy?.saveSuccessTitle || "Đã lưu điểm thành công",
            message: (
              copy?.saveSuccessMessage ||
              "Chúc mừng {name}! Độ chính xác của bạn đạt {accuracy}%. Thời gian hoàn thành: {time} giây."
            )
              .replace("{name}", state.userName)
              .replace("{accuracy}", String(accuracy))
              .replace("{time}", String(timeSec)),
            tone: "success",
          },
        });
      } else {
        set({
          notice: {
            title: copy?.saveErrorTitle || "Không thể lưu điểm",
            message:
              copy?.saveErrorMessage ||
              "Hệ thống chưa ghi nhận được điểm số. Bạn vui lòng thử lại sau vài giây nhé.",
            tone: "error",
          },
        });
      }
    } catch {
      set({
        notice: {
          title: copy?.connectionErrorTitle || "Lỗi kết nối",
          message:
            copy?.connectionErrorMessage ||
            "Không thể kết nối tới máy chủ để cập nhật bảng xếp hạng. Hãy kiểm tra lại mạng nhé.",
          tone: "error",
        },
      });
    } finally {
      set({ saving: false });
    }
  },
}));
