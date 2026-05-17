import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'https://script.google.com/macros/s/AKfycbzSgdnMfpJ4h2EAdBJi8U7n5uiphFxuQFpuxFGbyhmFyiY2Fo3ZMhW51HnNficMQ2no4Q/exec';

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
    icon: '1',
    shell: 'from-[#FFF7CC] to-[#FFE7A3] border-[#FFD166]',
    badge: 'bg-[#FFB703] text-white',
    text: 'text-[#8A5A00]',
  },
  {
    icon: '2',
    shell: 'from-[#EEF7FA] to-[#DDEFF4] border-[#B7D8E3]',
    badge: 'bg-[#8BB7C5] text-white',
    text: 'text-[#47636D]',
  },
  {
    icon: '3',
    shell: 'from-[#FFE8D6] to-[#F7C7A4] border-[#E8A06E]',
    badge: 'bg-[#D9824A] text-white',
    text: 'text-[#80512F]',
  },
];

const TrophyIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M8 4h8v4.6a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M8 6H4v1.5A3.5 3.5 0 0 0 7.5 11H8M16 6h4v1.5a3.5 3.5 0 0 1-3.5 3.5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 13v4M8.5 20h7M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ClockIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TargetIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const formatAccuracy = (value: number) => {
  if (!Number.isFinite(value)) return '0%';
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'Chưa có dữ liệu';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
};

const Ranking: React.FC = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName] = useState(() => localStorage.getItem('quizUserName') || '');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}?resource=ranking`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = [...data].sort((a: RankingEntry, b: RankingEntry) => {
            if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
            if (b.correct !== a.correct) return b.correct - a.correct;
            if (a.time !== b.time) return a.time - b.time;
            return (b.played_at || 0) - (a.played_at || 0);
          });

          setRanking(sorted);
          if (userName) {
            const idx = sorted.findIndex((entry) => entry.name === userName);
            setUserRank(idx >= 0 ? idx + 1 : null);
          }
        } else {
          setError('Dữ liệu bảng xếp hạng không hợp lệ.');
        }
      } catch {
        setError('Không thể tải bảng xếp hạng.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [userName]);

  const visibleRanking = useMemo(() => ranking.slice(0, 10), [ranking]);
  const topThree = visibleRanking.slice(0, 3);
  const rest = visibleRanking.slice(3);
  const totalPlayers = ranking.length;
  const bestAccuracy = ranking[0] ? formatAccuracy(ranking[0].accuracy) : '0%';
  const bestTime = ranking.length ? Math.min(...ranking.map((entry) => entry.time || 0)) : 0;

  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-white/85 px-5 py-6 shadow-[0_22px_50px_rgba(0,131,143,0.14)] backdrop-blur sm:px-8">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#00ACC1] via-[#7DD3C7] to-[#FFD166]" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E0F7FA] px-4 py-2 text-sm font-extrabold text-[#007C89]">
              <TrophyIcon />
              Hue Challenge
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-[#006C78] sm:text-5xl">
              Bảng xếp hạng
            </h1>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#546E7A] sm:text-base">
              Top người chơi có độ chính xác cao nhất, ưu tiên thời gian hoàn thành nhanh hơn khi bằng điểm.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#006C78] px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/20 transition active:scale-95"
          >
            <span aria-hidden="true">←</span>
            Về trang chủ
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#F1FBFC] p-4">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#00ACC1]">Người chơi</div>
            <div className="mt-1 text-2xl font-black text-[#263238]">{totalPlayers}</div>
          </div>
          <div className="rounded-3xl bg-[#FFF8DD] p-4">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#B77900]">Độ chính xác cao nhất</div>
            <div className="mt-1 text-2xl font-black text-[#263238]">{bestAccuracy}</div>
          </div>
          <div className="rounded-3xl bg-[#EFF8F0] p-4">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#2E7D32]">Thời gian tốt nhất</div>
            <div className="mt-1 text-2xl font-black text-[#263238]">{bestTime}s</div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border-4 border-white bg-white/80 p-8 text-center text-lg font-black text-[#00838F] shadow-lg">
          Đang tải bảng xếp hạng...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-[2rem] border-4 border-white bg-white/80 p-8 text-center font-black text-red-500 shadow-lg">
          {error}
        </div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {topThree.map((entry, index) => {
              const style = rankStyles[index];
              const isCurrentUser = userName && entry.name === userName;

              return (
                <article
                  key={`${entry.name}-${entry.played_at || index}`}
                  className={`rounded-[1.75rem] border-4 bg-gradient-to-br p-5 shadow-lg ${style.shell} ${index === 0 ? 'md:-mt-3' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black ${style.badge}`}>
                      {style.icon}
                    </div>
                    <TrophyIcon className={`h-8 w-8 ${style.text}`} />
                  </div>
                  <h2 className="mt-5 truncate text-2xl font-black text-[#263238]">{entry.name}</h2>
                  {isCurrentUser && (
                    <div className="mt-2 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-black text-[#00838F]">
                      Bạn
                    </div>
                  )}
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-extrabold">
                    <div className="rounded-2xl bg-white/70 p-3">
                      <div className="flex items-center gap-1 text-[#00838F]">
                        <TargetIcon />
                        Đúng
                      </div>
                      <div className="mt-1 text-lg text-[#263238]">
                        {entry.correct}/{entry.total}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-3">
                      <div className="text-[#00838F]">Chính xác</div>
                      <div className="mt-1 text-lg text-[#263238]">{formatAccuracy(entry.accuracy)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm font-extrabold text-[#546E7A]">
                    <ClockIcon />
                    {entry.time}s
                  </div>
                </article>
              );
            })}
          </section>

          {visibleRanking.length === 0 ? (
            <section className="mt-6 rounded-[2rem] border-4 border-white bg-white/90 p-8 text-center font-bold text-[#546E7A] shadow-[0_18px_44px_rgba(0,131,143,0.12)]">
              Chưa có dữ liệu xếp hạng.
            </section>
          ) : rest.length > 0 ? (
          <section className="mt-6 overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 shadow-[0_18px_44px_rgba(0,131,143,0.12)]">
            <div className="hidden grid-cols-[72px_1.4fr_120px_120px_120px_180px] items-center gap-3 bg-[#E0F7FA] px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-[#007C89] lg:grid">
              <span>Hạng</span>
              <span>Tên</span>
              <span>Đúng/Tổng</span>
              <span>Chính xác</span>
              <span>Thời gian</span>
              <span>Ngày chơi</span>
            </div>

            <div className="divide-y divide-[#D5F2F5]">
              {rest.map((entry, index) => {
                  const rank = index + 4;
                  const isCurrentUser = userName && entry.name === userName;

                  return (
                    <div
                      key={`${entry.name}-${entry.played_at || rank}`}
                      className={`grid gap-3 p-4 transition sm:p-5 lg:grid-cols-[72px_1.4fr_120px_120px_120px_180px] lg:items-center ${
                        isCurrentUser ? 'bg-[#FFF9C4]/75' : 'bg-white/70 hover:bg-[#F7FDFE]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 lg:block">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E0F7FA] text-sm font-black text-[#00838F]">
                          #{rank}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded-full bg-[#00838F] px-3 py-1 text-xs font-black text-white lg:hidden">Bạn</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-lg font-black text-[#263238]">{entry.name}</div>
                        {isCurrentUser && (
                          <div className="mt-1 hidden text-xs font-black uppercase tracking-[0.12em] text-[#00838F] lg:block">Bạn</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl bg-[#F1FBFC] px-3 py-2 font-black text-[#263238] lg:bg-transparent lg:p-0">
                        <TargetIcon className="h-4 w-4 text-[#00ACC1]" />
                        {entry.correct}/{entry.total}
                      </div>
                      <div className="rounded-2xl bg-[#FFF8DD] px-3 py-2 font-black text-[#8A5A00] lg:bg-transparent lg:p-0">
                        {formatAccuracy(entry.accuracy)}
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-[#EFF8F0] px-3 py-2 font-black text-[#2E7D32] lg:bg-transparent lg:p-0">
                        <ClockIcon />
                        {entry.time}s
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-[#607D8B]">
                        <CalendarIcon />
                        {formatDate(entry.played_at)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
          ) : null}

          {userName && userRank && userRank > 10 && (
            <div className="mt-5 rounded-3xl border-4 border-white bg-[#FFF9C4] p-4 text-center font-black text-[#8A5A00] shadow-lg">
              Vị trí của bạn: #{userRank}
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Ranking;
