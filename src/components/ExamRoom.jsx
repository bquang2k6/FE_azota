import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, AlertTriangle, CheckCircle2, Home, Loader2, Eye, ClipboardList } from 'lucide-react';

const ExamRoom = ({ userName }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API}/api/exams/${id}`);
        const data = res.data;
        
        if (!data || !data.questions || data.questions.length === 0) {
          setExam(data || { title: 'Không tìm thấy' });
          setQuestions([]);
          setLoading(false);
          return;
        }

        setExam(data);
        
        // Shuffling questions and their options
        const shuffledQuestions = [...data.questions]
          .sort(() => Math.random() - 0.5)
          .map(q => ({
            ...q,
            shuffledOptions: (q.options || [])
              .map((opt, originalIdx) => ({ ...opt, originalIdx }))
              .sort(() => Math.random() - 0.5)
          }));
        
        setQuestions(shuffledQuestions);
      } catch (err) {
        console.error('Lỗi khi tải đề:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleSelect = (qIdx, optOriginalIdx) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [qIdx]: optOriginalIdx
    });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    
    // No confirmation as requested, submit directly.
    try {
      const orderedAnswers = exam.questions.map(originalQ => {
          const shuffledIdx = questions.findIndex(sq => sq._id === originalQ._id);
          return (shuffledIdx !== -1 && answers[shuffledIdx] !== undefined) ? answers[shuffledIdx] : undefined;
      });

      const res = await axios.post(`${API}/api/exams/${id}/submit`, {
          studentName: userName,
          answers: orderedAnswers
      });

      setResult(res.data);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      alert('Nộp bài thất bại. Vui lòng thử lại.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="opacity-70">Đang chuẩn bị đề thi...</p>
    </div>
  );
  
  if (!exam || !questions || questions.length === 0) return (
    <div className="max-w-md mx-auto mt-20 card bg-base-100 shadow-xl border border-error/20 font-sans">
      <div className="card-body items-center text-center">
        <AlertTriangle size={48} className="text-error mb-2" />
        <h2 className="card-title text-xl font-bold">Lỗi tải đề thi</h2>
        <p className="opacity-70 text-sm">Đề thi này không có câu hỏi hoặc dữ liệu bị hỏng. Vui lòng liên hệ Admin để upload lại.</p>
        <div className="card-actions mt-4">
          <button onClick={() => navigate('/')} className="btn btn-primary gap-2">
            <Home size={18} /> Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );

  if (submitted && !reviewMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-300 pb-20">
        <div className="card bg-base-100 shadow-2xl border-t-8 border-success">
          <div className="card-body text-center items-center p-10">
            <CheckCircle2 size={64} className="text-success mb-2" />
            <h2 className="card-title text-3xl font-bold">Nộp bài thành công!</h2>
            <p className="text-xl mt-2 opacity-70">Chúc mừng bạn đã hoàn thiện bài thi.</p>
            
            <div className="bg-primary/5 rounded-2xl p-8 my-6 w-full border border-primary/10">
                <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-2">Điểm của bạn:</p>
                <div className="text-7xl font-black text-primary">
                    {result?.score ?? 0} <span className="text-2xl text-base-content/40">/ {result?.totalQuestions ?? 0}</span>
                </div>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button onClick={() => setReviewMode(true)} className="btn btn-secondary btn-lg gap-2">
                <Eye size={20} />
                Xem lại bài làm
              </button>
              <button onClick={() => navigate('/')} className="btn btn-ghost btn-lg gap-2">
                <Home size={20} />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-content/5">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-sm opacity-60">Thí sinh: {userName}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="badge badge-lg badge-neutral gap-2 p-4">
                <ClipboardList size={16} />
                {questions.length} câu hỏi
            </span>
            {!reviewMode ? (
                <button onClick={handleSubmit} className="btn btn-primary gap-2 px-8 shadow-lg shadow-primary/20">
                    <Send size={18} />
                    Nộp bài
                </button>
            ) : (
                <button onClick={() => setReviewMode(false)} className="btn btn-ghost border border-base-content/10">
                    Thoát Review
                </button>
            )}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={q._id || qIdx} className="card bg-base-100 shadow-xl border border-base-content/5 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-start gap-4">
                <span className="badge badge-primary font-bold px-3 py-4">Câu {qIdx + 1}</span>
                <p className="font-semibold text-lg leading-relaxed">{q.content}</p>
            </div>
            <div className="card-body p-6 space-y-3">
              {q.shuffledOptions.map((opt) => {
                const isSelected = answers[qIdx] === opt.originalIdx;
                const isCorrect = opt.isCorrect;
                const isUnanswered = reviewMode && answers[qIdx] === undefined;
                
                let optionClass = "flex items-center gap-4 p-4 rounded-xl border-2 transition-all ";
                if (reviewMode) {
                    if (isCorrect) optionClass += "border-success bg-success/10 font-bold ";
                    else if (isSelected) optionClass += "border-error bg-error/10 text-error-content ";
                    else optionClass += "border-transparent opacity-40 ";
                } else {
                    optionClass += isSelected ? "border-primary bg-primary/5" : "border-transparent bg-base-100 hover:bg-base-200";
                }

                return (
                  <label 
                    key={opt.originalIdx} 
                    className={optionClass + " cursor-pointer"}
                    onClick={() => !reviewMode && handleSelect(qIdx, opt.originalIdx)}
                  >
                    {!reviewMode && (
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          className="radio radio-primary radio-sm"
                          checked={isSelected}
                          readOnly
                        />
                    )}
                    <span className="text-lg flex-1">{opt.text}</span>
                    {reviewMode && isCorrect && <CheckCircle2 className="text-success" size={20} />}
                    {reviewMode && isSelected && !isCorrect && <AlertTriangle className="text-error" size={20} />}
                  </label>
                );
              })}
              {reviewMode && answers[qIdx] === undefined && (
                <div className="flex items-center gap-3 mt-2 p-3 rounded-xl bg-error/10 border-2 border-error text-error font-semibold text-sm">
                  <AlertTriangle size={18} />
                  Bạn chưa chọn đáp án cho câu này!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!reviewMode && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none px-4">
              <div className="bg-base-100/80 backdrop-blur shadow-2xl rounded-full p-2 border border-primary/20 pointer-events-auto flex gap-2">
                <button onClick={handleSubmit} className="btn btn-primary btn-wide rounded-full gap-2 px-10">
                    <Send size={18} />
                    Hoàn thành và Nộp bài
                </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default ExamRoom;
