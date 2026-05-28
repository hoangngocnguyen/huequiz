import { useQuizStore } from "../../stores/useQuizStore";
import { NoticePopup } from "./NoticePopup";

export default function ResultScreen() {
    const {
        questions,
        score,
        startTime,
        endTime,
        userName,
        saving,
        savedRank,
        saveRank,
        setUserName,
      } = useQuizStore();


    const percent = questions.length
        ? Math.round((score / questions.length) * 100)
        : 0;
    const timeSec =
        startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
    let icon = "🎒";
    let msg = "Nhà thám hiểm! Huế còn nhiều điều chờ bạn khám phá lần sau!";

    if (percent >= 75) {
        icon = "👑";
        msg = "Bậc thầy Huế! Bạn gần như là người bản địa rồi!";
    } else if (percent >= 50) {
        icon = "😎";
        msg = "Yêu Huế! Bạn biết khá rõ về thành phố này. Hẹn gặp lại!";
    }

    return (
        <div className="text-center">
            <div className="tropical-card p-8 mt-10">
                <div className="text-7xl mb-4">{icon}</div>
                <h2 className="text-3xl font-black text-[#00838F] mb-2">HOÀN THÀNH!</h2>
                <div className="text-7xl font-black text-[#4DD0E1] my-4 drop-shadow-sm">
                    {percent}%
                </div>
                <div className="text-lg font-bold text-[#00ACC1] mb-2">
                    Thời gian: {timeSec} giây
                </div>
                <p className="text-[#546E7A] font-bold mb-8 px-4">{msg}</p>
                <input
                    type="text"
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    placeholder="Nhập tên của bạn..."
                    disabled={savedRank}
                    className="w-full p-4 bg-[#F1F8E9] border-2 border-[#C5E1A5] rounded-2xl text-center font-bold outline-none focus:border-[#00ACC1] mb-6 disabled:opacity-70"
                />
                <div className={savedRank ? "mb-4" : "grid grid-cols-2 gap-4 mb-4"}>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full p-4 bg-gray-100 rounded-2xl font-bold text-gray-500"
                    >
                        Chơi lại
                    </button>
                    {!savedRank && (
                        <button
                            onClick={saveRank}
                            className="p-4 btn-primary text-white rounded-2xl font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={saving}
                        >
                            {saving ? "Đang lưu..." : "Lưu điểm"}
                        </button>
                    )}
                </div>
                {savedRank && (
                    <div className="mb-4 rounded-2xl bg-[#E0F7FA] px-4 py-3 text-sm font-black text-[#007C89]">
                        Điểm của bạn đã được lưu.
                    </div>
                )}
                <div className="text-center mt-2">
                    <a
                        href="/ranking"
                        className="btn-primary px-6 py-3 rounded-2xl text-white font-bold inline-block"
                    >
                        Xem bảng xếp hạng
                    </a>
                </div>
            </div>
            <NoticePopup />
        </div>
    );
}
