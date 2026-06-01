interface Props {
  content: string;
  isImg: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const AnswerOption = ({ content, isImg, isCorrect, isWrong, onClick, disabled }: Props) => {
  // Gom nhóm class dựa trên trạng thái
  const baseClass = isImg 
    ? "p-0 rounded-2xl overflow-hidden" 
    : "p-4 font-bold text-lg text-left rounded-2xl";
  
  const statusClass = isCorrect 
    ? "correct-ans" 
    : isWrong 
      ? "wrong-ans" 
      : "bg-white";

  return (
    <button
      className={`ans-btn relative w-full shadow-md active:scale-95 transition-all ${baseClass} ${statusClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {isImg ? (
        <img src={content} className="w-full h-25 object-cover" alt="option" />
      ) : (
        <span>{content}</span>
      )}
    </button>
  );
};