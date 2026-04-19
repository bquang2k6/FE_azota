import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, Clock, ArrowRight, Loader2 } from 'lucide-react';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams`);

        setExams(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách đề:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-semibold text-lg opacity-70">Đang tải danh sách đề thi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Danh sách đề thi</h1>
        <p className="text-base-content/60">Chọn một bài thi bên dưới để bắt đầu làm bài.</p>
      </div>

      {exams.length === 0 ? (
        <div className="alert shadow-lg bg-base-100 border-dashed border-2">
          <ClipboardList className="text-base-content/40" />
          <div>
            <h3 className="font-bold">Hiện chưa có đề thi nào!</h3>
            <div className="text-xs opacity-60">Vui lòng quay lại sau hoặc liên hệ Admin.</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all group border border-base-content/5">
              <div className="card-body">
                <div className="badge badge-primary badge-outline mb-2">Trắc nghiệm</div>
                <h3 className="card-title text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  {exam.title}
                </h3>
                <p className="text-sm opacity-60 line-clamp-3 my-2">
                  {exam.description || 'Không có mô tả cho đề thi này.'}
                </p>
                
                <div className="flex items-center gap-4 text-xs opacity-50 my-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="card-actions justify-end mt-2">
                  <Link to={`/exam/${exam._id}`} className="btn btn-primary btn-block gap-2 group">
                    Vào thi ngay
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
