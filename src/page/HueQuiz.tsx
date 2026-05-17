
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import '../LoadingSpinner.css';
import '../quiz-anim.css';

const API_URL = 'https://script.google.com/macros/s/AKfycbxIa6RYcOSXveGhJb6b9i-cP0Onm9dSNKsevehe0hsSQFBVZpjngxDykvKI10MmO_AJwg/exec';

// Sample data (fallback if fetch fails)
const sampleQuestions: Question[] = [
  {
    q: "What is this famous bridge in Hue?",
    img: "https://images.unsplash.com/photo-1599708153386-62e2637a7703?w=500",
    opts: ["Golden Bridge", "Tràng Tiền Bridge", "Dragon Bridge", "Sài Gòn Bridge"],
    ans: 1,
    optsType: "text"
  },
  {
    q: "Which image is the famous 'Bánh Bột Lọc' of Hue?",
    img: "",
    opts: [
      "https://statics.vinpearl.com/banh-bot-loc-hue-1_1628661597.png",
      "https://khamphahue.com.vn/Portals/0/ThiTNT/TongHop_6QuanBanhKhoaiHue/Khamphahue_banh-khoai_hue.jpg",
      "https://cdn.hstatic.net/products/200001015557/16115_8b2d77aad8824352bedf549cc251af61_master.jpg",
      "https://kenhhomestay.com/wp-content/uploads/2022/07/Banh-beo-Hue-5.jpg"
    ],
    ans: 0,
    optsType: "image"
  },
  {
    q: "What is this spicy noodle soup called?",
    img: "https://images.unsplash.com/photo-1620921515993-99990e667828?w=500",
    opts: ["Phở", "Bún Bò Huế", "Bún Chả", "Hủ Tiếu"],
    ans: 1,
    optsType: "text"
  }
];

type Question = {
  q: string;
  img: string;
  opts: string[];
  ans: number;
  optsType: 'text' | 'image';
};


const HueQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [ui, setUi] = useState<'welcome' | 'loading' | 'quiz' | 'result'>('welcome');
  const [userName, setUserName] = useState(() => {
    // Lấy tên từ localStorage nếu có
    return localStorage.getItem('quizUserName') || '';
  });
  const [saving, setSaving] = useState(false);
  const [showAnswer, setShowAnswer] = useState<{ idx: number; correct: boolean } | null>(null);
  const [loadingTime, setLoadingTime] = useState(3); // seconds
  const loadingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}?resource=questions`);
      
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      }
      
    } catch {
      // Use sample data
      console.warn('Không thể tải câu hỏi từ server, dùng dữ liệu mẫu.');
      setQuestions(sampleQuestions);
    }
  };


  const startQuiz = async () => {
    setUi('loading');
    setCur(0);
    setScore(0);
    setEndTime(null);
    setUserName('');
    setShowAnswer(null);
    setLoadingTime(3);
    await fetchQuestions();
    // Countdown timer for loading
    let t = 3;
    setLoadingTime(t);
    loadingTimer.current && clearInterval(loadingTimer.current);
    loadingTimer.current = setInterval(() => {
      t--;
      setLoadingTime(t);
      if (t <= 0) {
        clearInterval(loadingTimer.current!);
        setUi('quiz');
        setStartTime(Date.now());
      }
    }, 1000);
  };


  const handleAnswer = (i: number) => {
    const correct = questions[cur].ans === i;
    if (correct) setScore((s) => s + 1);
    setShowAnswer({ idx: i, correct });
    setTimeout(() => {
      setShowAnswer(null);
      if (cur + 1 >= questions.length) {
        setUi('result');
      } else {
        setCur((c) => c + 1);
      }
    }, 1200);
  };

  // Set endTime when switching to result UI
  React.useEffect(() => {
    if (ui === 'result' && endTime === null) {
      setEndTime(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui]);

  const saveRank = async () => {
    if (!userName) {
      alert('Please enter your name! 😊');
      return;
    }
    if (!startTime || !endTime) return;
    setSaving(true);
    // Lưu tên vào localStorage
    localStorage.setItem('quizUserName', userName);
    const timeSec = Math.round((endTime - startTime) / 1000);
    const accuracy = questions.length ? Math.round((score / questions.length) * 100) : 0;
    const payload = {
      name: userName,
      correct: score,
      total: questions.length,
      accuracy,
      time: timeSec,
      played_at: Date.now()
    };
    console.log("Giá trị trước khi gửi: ", payload);
    
    try {
      const res = await fetch(`${API_URL}?action=saveRanking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sweet! ${userName}, score: ${(score / questions.length) * 100}%. Time: ${timeSec}s. Have a safe flight! ✈️`);
      } else {
        alert('Lưu bảng xếp hạng thất bại!');
      }
    } catch {
      alert('Không thể kết nối server để lưu bảng xếp hạng!');
    }
    setSaving(false);
  };

  // UI rendering
  if (ui === 'loading') {
    return <LoadingSpinner message="Đang tải câu hỏi..." timeLeft={loadingTime} />;
  }

  if (ui === 'welcome') {
    return (
      <div className="w-full max-w-md mx-auto text-center py-10">
        <div className="relative inline-block mb-6">
          <span className="text-8xl">🥥</span>
          <span className="absolute -top-2 -right-2 text-4xl animate-pulse">✨</span>
        </div>
        <h1 className="text-4xl font-black text-[#00838F] mb-2 uppercase tracking-tight">Hue Challenge</h1>
        <p className="text-lg text-[#455A64] font-bold mb-8">Are you a real local? 🫶</p>
        <button
          onClick={startQuiz}
          className="animate-pulse w-full py-5 btn-primary text-white text-2xl font-black rounded-3xl transition-all active:scale-95"
        >
          START! 🌊
        </button>
        <Link
          to="/ranking"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-white bg-white/85 px-5 py-4 text-base font-black text-[#007C89] shadow-lg shadow-cyan-900/10 transition active:scale-95"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#E0F7FA]" aria-hidden="true">
            ★
          </span>
          Xem bảng xếp hạng
        </Link>
        <p className="mt-8 text-[#00ACC1] font-bold italic">See you again, Hue misses you! ❤️</p>
      </div>
    );
  }

  if (ui === 'quiz') {
    const q = questions[cur];
    const isImgAnswers = q.optsType === 'image';
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-end mb-4 px-2">
          <h2 className="text-2xl font-black text-[#00838F]">Fun Quiz!</h2>
          <span className="bg-white px-4 py-1 rounded-full text-[#00ACC1] font-bold shadow-sm text-sm border-2 border-[#B2EBF2]">
            {cur + 1}/{questions.length}
          </span>
        </div>
        <div className="progress-bar mb-6">
          <div
            className="progress-inner h-full transition-all duration-700"
            style={{ width: `${((cur + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="tropical-card p-5 mb-6">
          {q.img && q.img.trim() !== '' ? (
            <div className="w-full h-48 rounded-4xl bg-[#E0F7FA] mb-6 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
              <img src={q.img} className="w-full h-full object-cover shadow-lg" alt="question" />
            </div>
          ) : null}
          <h2 className="text-xl font-bold text-center mb-6 text-[#263238] min-h-12 flex items-center justify-center leading-snug">
            {q.q}
          </h2>
          <div className={isImgAnswers ? 'grid-layout' : 'space-y-4'}>
            {q.opts.map((o, i) => {
              let btnClass = `ans-btn w-full shadow-md active:scale-95 transition-all ${isImgAnswers ? 'p-2' : 'p-5 font-bold text-lg'}`;
              let imgClass = 'img-answer rounded-xl';
              let icon = null;
              if (showAnswer) {
                if (i === questions[cur].ans) {
                  btnClass += ' correct-ans';
                  if (isImgAnswers) imgClass += ' img-correct-ans';
                }
                if (showAnswer.idx === i && !showAnswer.correct) {
                  btnClass += ' wrong-ans';
                  if (isImgAnswers) imgClass += ' img-wrong-ans';
                }
                if (showAnswer && i === questions[cur].ans) {
                  icon = <span className={isImgAnswers ? "img-ans-icon correct" : "ml-2 text-green-600 font-bold animate-bounce"}>✔</span>;
                }
                if (showAnswer && showAnswer.idx === i && !showAnswer.correct) {
                  icon = <span className={isImgAnswers ? "img-ans-icon wrong" : "ml-2 text-red-500 font-bold animate-shake"}>✖</span>;
                }
              }
              return (
                <button
                  key={i}
                  className={btnClass}
                  onClick={() => handleAnswer(i)}
                  disabled={!!showAnswer}
                  style={isImgAnswers ? { position: 'relative', padding: 0, borderRadius: 16, overflow: 'hidden' } : {}}
                >
                  {isImgAnswers ? (
                    <>
                      <img src={o} className={imgClass} alt={`option ${i + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 16 }} />
                      {icon}
                    </>
                  ) : (
                    <>
                      {o}
                      {icon}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Result UI
  if (ui === 'result') {
    const p = Math.round((score / questions.length) * 100);
    let icon: string;
    let msg: string;
    if (p >= 75) {
      icon = '👑';
      msg = "Hue Master! You're basically a local now! 🏯💜";
    } else if (p >= 50) {
      icon = '😎';
      msg = 'Hue Lover! You know the city well. See you soon! ✈️🌸';
    } else {
      icon = '🎒';
      msg = 'Explorer! Hue has more for you to discover next time! 🍵';
    }
    const timeSec = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="tropical-card p-8 mt-10">
          <div className="text-7xl mb-4">{icon}</div>
          <h2 className="text-3xl font-black text-[#00838F] mb-2">DONE!</h2>
          <div className="text-7xl font-black text-[#4DD0E1] my-4 drop-shadow-sm">{p}%</div>
          <div className="text-lg font-bold text-[#00ACC1] mb-2">⏱️ Time: {timeSec} seconds</div>
          <p className="text-[#546E7A] font-bold mb-8 px-4">{msg}</p>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full p-4 bg-[#F1F8E9] border-2 border-[#C5E1A5] rounded-2xl text-center font-bold outline-none focus:border-[#00ACC1] mb-6"
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => window.location.reload()}
              className="p-4 bg-gray-100 rounded-2xl font-bold text-gray-500"
            >
              Retry
            </button>
            <button
              onClick={saveRank}
              className="p-4 btn-primary text-white rounded-2xl font-bold shadow-lg"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="text-center mt-2">
            <a href="/ranking" className="btn-primary px-6 py-3 rounded-2xl text-white font-bold inline-block">Xem bảng xếp hạng</a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HueQuiz;
