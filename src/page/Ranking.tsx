import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzSgdnMfpJ4h2EAdBJi8U7n5uiphFxuQFpuxFGbyhmFyiY2Fo3ZMhW51HnNficMQ2no4Q/exec";
const RANKING_CACHE_KEY = "hueQuizRanking";

type RankingEntry = {
  name: string;
  correct: number;
  total: number;
  accuracy: number;
  time: number;
  played_at?: number;
};

const rankStyles = [
  {
    icon: "1",
    shell: "from-[#FFF7CC] to-[#FFE7A3] border-[#FFD166]",
    badge: "bg-[#FFB703] text-white",
    text: "text-[#8A5A00]",
  },
  {
    icon: "2",
    shell: "from-[#EEF7FA] to-[#DDEFF4] border-[#B7D8E3]",
    badge: "bg-[#8BB7C5] text-white",
    text: "text-[#47636D]",
  },
  {
    icon: "3",
    shell: "from-[#FFE8D6] to-[#F7C7A4] border-[#E8A06E]",
    badge: "bg-[#D9824A] text-white",
    text: "text-[#80512F]",
  },
];

const TrophyIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M8 4h8v4.6a4 4 0 0 1-8 0V4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M8 6H4v1.5A3.5 3.5 0 0 0 7.5 11H8M16 6h4v1.5a3.5 3.5 0 0 1-3.5 3.5H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 13v4M8.5 20h7M10 17h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ClockIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 7v5l3 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TargetIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2v3M12 19v3M2 12h3M19 12h3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <rect
      x="4"
      y="5"
      width="16"
      height="15"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 3v4M16 3v4M4 10h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const formatAccuracy = (value: number) => {
  if (!Number.isFinite(value)) return "0%";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const formatDate = (timestamp: number | undefined, emptyText: string, locale: string) => {
  if (!timestamp) return emptyText;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

const sortRanking = (entries: RankingEntry[]) => {
  return [...entries].sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (b.correct !== a.correct) return b.correct - a.correct;
    if (a.time !== b.time) return a.time - b.time;
    return (b.played_at || 0) - (a.played_at || 0);
  });
};

const readCachedRanking = () => {
  try {
    const cached = sessionStorage.getItem(RANKING_CACHE_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? sortRanking(parsed as RankingEntry[]) : [];
  } catch {
    return [];
  }
};

const writeCachedRanking = (ranking: RankingEntry[]) => {
  try {
    sessionStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(ranking));
  } catch {
    // Ignore storage quota/private mode failures; server data remains the source of truth.
  }
};

const isSameRanking = (a: RankingEntry[], b: RankingEntry[]) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const getUserRank = (ranking: RankingEntry[], userName: string) => {
  if (!userName) return null;
  const idx = ranking.findIndex((entry) => entry.name === userName);
  return idx >= 0 ? idx + 1 : null;
};

const Ranking: React.FC = () => {
  const t = useTranslation();
  const [ranking, setRanking] = useState<RankingEntry[]>(() => readCachedRanking());
  const [loading, setLoading] = useState(() => readCachedRanking().length === 0);
  const [error, setError] = useState("");
  const [userName] = useState(() => localStorage.getItem("quizUserName") || "");
  const [userRank, setUserRank] = useState<number | null>(() =>
    getUserRank(readCachedRanking(), localStorage.getItem("quizUserName") || "")
  );

  useEffect(() => {
    const fetchRanking = async () => {
      const cachedRanking = readCachedRanking();
      if (cachedRanking.length > 0) {
        setRanking((current) => isSameRanking(current, cachedRanking) ? current : cachedRanking);
        setUserRank(getUserRank(cachedRanking, userName));
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const res = await fetch(`${API_URL}?resource=ranking`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = sortRanking(data as RankingEntry[]);

          setRanking((current) => {
            if (isSameRanking(current, sorted)) return current;
            writeCachedRanking(sorted);
            return sorted;
          });
          setUserRank(getUserRank(sorted, userName));
        } else if (cachedRanking.length === 0) {
          setError(t.ranking.invalidData);
        }
      } catch {
        setError(t.ranking.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [t, userName]);

  const visibleRanking = useMemo(() => ranking.slice(0, 10), [ranking]);
  const totalPlayers = ranking.length;
  const bestAccuracy = ranking[0] ? formatAccuracy(ranking[0].accuracy) : "0%";
  const bestTime = ranking.length
    ? Math.min(...ranking.map((entry) => entry.time || 0))
    : 0;

  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-4xl border-4 border-white bg-white/85 px-5 py-6 shadow-[0_22px_50px_rgba(0,131,143,0.14)] backdrop-blur sm:px-8">
        <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-[#00ACC1] via-[#7DD3C7] to-[#FFD166]" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E0F7FA] px-4 py-2 text-sm font-extrabold text-[#007C89]">
              <TrophyIcon />
              {t.ranking.brand}
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-[#006C78] sm:text-5xl">
              {t.ranking.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#546E7A] sm:text-base">
              {t.ranking.description}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#006C78] px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/20 transition active:scale-95"
          >
            <span aria-hidden="true">←</span>
            {t.ranking.backHome}
          </Link>
        </div>
        {/* Thay đổi grid-cols-2 trên mobile và sm:grid-cols-3 */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {/* Thẻ 1 */}
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#F1FBFC] px-3 py-2.5 sm:px-4">
            <div className="min-w-0 truncate text-[10px] font-black uppercase tracking-wider text-[#00ACC1] sm:text-[11px] sm:tracking-widest">
              {t.ranking.players}
            </div>
            <div className="shrink-0 text-lg font-black text-[#263238] sm:text-xl md:text-2xl">
              {totalPlayers}
            </div>
          </div>

          {/* Thẻ 2 */}
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#FFF8DD] px-3 py-2.5 sm:px-4">
            <div className="min-w-0 truncate text-[10px] font-black uppercase tracking-wider text-[#B77900] sm:text-[11px] sm:tracking-widest">
              {t.ranking.accuracy}
            </div>
            <div className="shrink-0 text-lg font-black text-[#263238] sm:text-xl md:text-2xl">
              {bestAccuracy}
            </div>
          </div>

          {/* Thẻ 3: Thêm col-span-2 trên mobile để nó dàn đều đẹp mắt, lên sm thì trả về bình thường */}
          <div className="col-span-2 flex items-center justify-between gap-2 rounded-2xl bg-[#EFF8F0] px-3 py-2.5 sm:col-span-1 sm:px-4">
            <div className="min-w-0 truncate text-[10px] font-black uppercase tracking-wider text-[#2E7D32] sm:text-[11px] sm:tracking-widest">
              {t.ranking.bestTime}
            </div>
            <div className="shrink-0 text-lg font-black text-[#263238] sm:text-xl md:text-2xl">
              {bestTime}s
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mt-8 rounded-4xl border-4 border-white bg-white/80 p-8 text-center text-lg font-black text-[#00838F] shadow-lg animate-pulse">
          {t.ranking.loading}
        </div>
      ) : error && ranking.length === 0 ? (
        <div className="mt-8 rounded-4xl border-4 border-white bg-white/80 p-8 text-center font-black text-red-500 shadow-lg">
          {error}
        </div>
      ) : (
        <>
          {visibleRanking.length === 0 ? (
            <section className="mt-6 rounded-4xl border-4 border-white bg-white/90 p-8 text-center font-bold text-[#546E7A] shadow-[0_18px_44px_rgba(0,131,143,0.12)]">
              {t.ranking.empty}
            </section>
          ) : (
            /* Bỏ overflow-hidden và bg-white của section ngoài để biến các item bên trong thành thẻ độc lập */
            <section className="mt-6 space-y-3">
              {/* Header ẩn trên mobile, hiện trên desktop với giao diện sạch sẽ */}
              <div className="hidden grid-cols-[64px_minmax(0,1.3fr)_96px_92px_88px_150px] items-center gap-3 px-6 py-2 text-[11px] font-black uppercase tracking-widest text-[#007C89]/70 sm:grid">
                <span>{t.ranking.rank}</span>
                <span>{t.ranking.playerName}</span>
                <span className="text-center">{t.ranking.correctTotal}</span>
                <span className="text-center">{t.ranking.accuracy}</span>
                <span className="text-center">{t.ranking.time}</span>
                <span className="text-right">{t.ranking.playedAt}</span>
              </div>

              {/* Danh sách các thẻ xếp hạng */}
              <div className="space-y-2.5">
                {visibleRanking.map((entry, index) => {
                  const rank = index + 1;
                  const style = rankStyles[index];
                  const isCurrentUser = userName && entry.name === userName;

                  return (
                    <div
                      key={`${entry.name}-${entry.played_at || rank}`}
                      className={`grid grid-cols-[48px_minmax(0,1fr)_64px_64px] items-center gap-2 rounded-2xl border-2 border-white px-3 py-3 shadow-[0_4px_12px_rgba(0,131,143,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,131,143,0.08)] sm:grid-cols-[64px_minmax(0,1.3fr)_96px_92px_88px_150px] sm:gap-3 sm:px-5 sm:py-3.5 ${
                        style
                          ? `bg-linear-to-r ${style.shell} border-l-4`
                          : isCurrentUser
                            ? "bg-[#FFFDE7] border-l-4 border-l-[#FBC02D]"
                            : "bg-white/90 hover:bg-white"
                      }`}
                    >
                      {/* CỘT 1: HẠNG / BADGE */}
                      <div className="flex items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black shadow-sm sm:h-10 sm:w-10 sm:text-sm ${
                            style ? style.badge : "bg-[#EFFBFC] text-[#00838F]"
                          }`}
                        >
                          {rank}
                        </span>
                      </div>

                      {/* CỘT 2: TÊN & THÔNG TIN PHỤ (MOBILE) */}
                      <div className="min-w-0 pr-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <div
                            className={`truncate font-black sm:text-base ${isCurrentUser ? "text-[#00838F]" : "text-[#263238]"}`}
                          >
                            {entry.name}
                          </div>
                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full bg-[#00838F] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                              {t.ranking.currentUser}
                            </span>
                          )}
                        </div>

                        {/* Chỉ hiển thị Meta Info này ở Mobile */}
                        <div className="mt-1 flex min-w-0 items-center gap-2 text-[10px] font-bold text-[#78909C] sm:hidden">
                          <span className="flex min-w-0 items-center gap-0.5">
                            <CalendarIcon className="h-3 w-3 shrink-0 opacity-70" />
                            <span className="truncate">
                              {formatDate(entry.played_at, t.ranking.noData, t.ranking.dateLocale)}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-0.5 text-[#2E7D32]">
                            <ClockIcon className="h-3 w-3 opacity-70" />
                            {entry.time}s
                          </span>
                        </div>
                      </div>

                      {/* CỘT 3: ĐÚNG / TỔNG */}
                      <div className="flex items-center justify-center gap-1 font-black text-[#37474F] text-sm sm:text-base">
                        <TargetIcon className="hidden h-4 w-4 text-[#00ACC1] sm:block" />
                        <span>
                          {entry.correct}/{entry.total}
                        </span>
                      </div>

                      {/* CỘT 4: ĐỘ CHÍNH XÁC */}
                      <div className="text-center font-black text-[#A16F04] text-sm sm:text-base">
                        {formatAccuracy(entry.accuracy)}
                      </div>

                      {/* CỘT 5: THỜI GIAN (DESKTOP ONLY) */}
                      <div className="hidden items-center justify-center gap-1 font-black text-[#2E7D32] sm:flex">
                        <ClockIcon className="h-4 w-4 opacity-80" />
                        <span>{entry.time}s</span>
                      </div>

                      {/* CỘT 6: NGÀY CHƠI (DESKTOP ONLY) */}
                      <div className="hidden items-center justify-end gap-1 text-xs font-bold text-[#546E7A] sm:flex">
                        <CalendarIcon className="h-4 w-4 opacity-70" />
                        <span>{formatDate(entry.played_at, t.ranking.noData, t.ranking.dateLocale)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Vị trí của bạn (Nếu ngoài top 10) */}
          {userName && userRank && userRank > 10 && (
            <div className="mt-6 rounded-2xl border-4 border-white bg-linear-to-r from-[#FFF9C4] to-[#FFF59D] p-4 text-center font-black text-[#8A5A00] shadow-md animate-bounce-short">
              🎯 {t.ranking.currentPosition}{" "}
              <span className="text-xl text-[#6D4C41]">#{userRank}</span>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Ranking;
