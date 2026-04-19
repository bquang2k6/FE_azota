import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, Users, Eye, Trash2, AlertCircle, 
  Loader2, CheckCircle, ClipboardList, ChevronLeft 
} from 'lucide-react';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'results', or 'preview'
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const API = import.meta.env.VITE_API_URL;
  const adminName = localStorage.getItem('userName');

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await axios.get(`${API}/api/exams`);
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleParse = async (e) => {
    e.preventDefault();
    if (!file) return alert('Vui lòng chọn file');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API}/api/exams/parse`, formData, {
        headers: { 'x-admin-name': adminName }
      });
      setPreviewQuestions(res.data.questions);
      setView('preview');
    } catch (err) {
      alert('Lỗi khi đọc file: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const saveExam = async () => {
    if (!title) return alert('Vui lòng nhập tiêu đề đề thi');
    setSaving(true);
    try {
      await axios.post(`${API}/api/exams`, {
        title,
        description,
        questions: previewQuestions
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-name': adminName 
        }
      });
      alert('Đã lưu đề thi thành công!');
      setFile(null);
      setTitle('');
      setDescription('');
      setPreviewQuestions([]);
      setView('list');
      fetchExams();
    } catch (err) {
      alert('Lỗi khi lưu đề: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...previewQuestions];
    updated[index][field] = value;
    setPreviewQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    const updated = [...previewQuestions];
    updated[qIdx].options[oIdx][field] = value;
    
    // If setting isCorrect to true, ensure others are false for that question
    if (field === 'isCorrect' && value === true) {
      updated[qIdx].options.forEach((opt, idx) => {
        if (idx !== oIdx) opt.isCorrect = false;
      });
    }
    
    setPreviewQuestions(updated);
  };

  const deleteExam = async (examId) => {
    console.log('Đang thực hiện xóa đề ngay lập tức, ID:', examId);
    try {
      const res = await axios.delete(`${API}/api/exams/${examId}`, {
        headers: { 'x-admin-name': adminName }
      });
      console.log('Kết quả từ server:', res.data);
      alert('Đã xóa đề thi thành công');
      fetchExams();
    } catch (err) {
      console.error('Lỗi khi xóa đề:', err);
      alert('Lỗi khi xóa đề: ' + (err.response?.data?.error || err.message));
    }
  };

  const viewResults = async (exam) => {
    setSelectedExam(exam);
    try {
      const res = await axios.get(`${API}/api/exams/${exam._id}/results`, {
        headers: { 'x-admin-name': adminName }
      });
      setResults(res.data);
      setView('results');
    } catch (err) {
      alert('Không thể tải kết quả');
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Trang Quản Trị</h1>
        <button onClick={() => setView('list')} className={`btn ${view === 'list' ? 'btn-ghost disabled' : 'btn-ghost'}`}>
          <FileText size={20} className="mr-2" />
          Danh sách đề
        </button>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl border border-primary/20">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 gap-2">
                  <Upload className="text-primary" />
                  Bước 1: Tải lên đề
                </h2>
                <form onSubmit={handleParse} className="space-y-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Tên đề thi</span></label>
                    <input 
                      type="text" 
                      className="input input-bordered focus:input-primary" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="Ví dụ: Kiểm tra 15p Toán"
                      required 
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Mô tả</span></label>
                    <textarea 
                      className="textarea textarea-bordered h-20" 
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ghi chú thêm..."
                    ></textarea>
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">File Word (.docx)</span></label>
                    <input 
                      type="file" 
                      className="file-input file-input-bordered file-input-primary w-full" 
                      accept=".docx"
                      onChange={e => setFile(e.target.files[0])}
                      required
                    />
                    <label className="label">
                      <span className="label-text-alt text-warning flex gap-1">
                        <AlertCircle size={14} /> Đáp đúng mang màu đỏ
                      </span>
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    className={`btn btn-primary w-full mt-4 ${uploading ? 'loading' : ''}`}
                    disabled={uploading}
                  >
                    {uploading ? 'Đang đọc file...' : 'Tiếp theo: Review & Lưu'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Exams List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList size={24} className="text-secondary" />
                Đề đã tạo
            </h2>
            {loadingExams ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-content/5">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th>Tiêu đề</th>
                                <th>Ngày tạo</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(exam => (
                                <tr key={exam._id} className="hover">
                                    <td className="font-semibold">{exam.title}</td>
                                    <td className="text-xs opacity-60">
                                        {new Date(exam.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="text-center flex justify-center gap-2">
                                        <button 
                                            onClick={() => viewResults(exam)}
                                            className="btn btn-sm btn-ghost gap-2 text-info"
                                        >
                                            <Eye size={16} />
                                            Xem điểm
                                        </button>
                                        <button 
                                            onClick={() => deleteExam(exam._id)}
                                            className="btn btn-sm btn-ghost gap-2 text-error hover:bg-error/10"
                                        >
                                            <Trash2 size={16} />
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {exams.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center p-10 opacity-50 italic">Chưa có đề nào được tải lên.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>
      ) : view === 'preview' ? (
        /* Preview Section */
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center bg-base-100 p-6 rounded-2xl shadow-sm border border-primary/20">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Bước 2: Review câu hỏi</h2>
                    <p className="opacity-60 text-sm">Vui lòng kiểm tra lại nội dung và đáp án trước khi lưu.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setView('list')} className="btn btn-ghost">Hủy</button>
                    <button 
                        onClick={saveExam} 
                        className={`btn btn-primary px-10 ${saving ? 'loading' : ''}`}
                        disabled={saving}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Đề Thi'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {previewQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="card bg-base-100 shadow-xl border border-base-content/5 overflow-hidden">
                        <div className="p-4 bg-primary/5 flex items-start gap-4">
                            <span className="badge badge-primary font-bold">Câu {qIdx + 1}</span>
                            <textarea 
                                className="textarea textarea-bordered w-full font-semibold text-lg" 
                                value={q.content}
                                onChange={(e) => updateQuestion(qIdx, 'content', e.target.value)}
                            />
                        </div>
                        <div className="card-body p-6 space-y-3">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-4 p-2 rounded-xl transition-all bg-base-200/50">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox checkbox-success" 
                                        checked={opt.isCorrect}
                                        onChange={(e) => updateOption(qIdx, oIdx, 'isCorrect', e.target.checked)}
                                    />
                                    <span className="font-bold text-sm opacity-50">{String.fromCharCode(65 + oIdx)}.</span>
                                    <input 
                                        type="text" 
                                        className="input input-sm input-ghost w-full focus:bg-base-100" 
                                        value={opt.text}
                                        onChange={(e) => updateOption(qIdx, oIdx, 'text', e.target.value)}
                                    />
                                </div>
                            ))}
                            {!q.options.some(o => o.isCorrect) && (
                                <div className="alert alert-error text-xs p-2 py-1">
                                    <AlertCircle size={14} /> Chú ý: Câu này chưa có đáp án đúng!
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('list')} className="btn btn-circle btn-ghost">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">{selectedExam?.title}</h2>
                    <p className="text-sm opacity-60">Danh sách bảng điểm</p>
                </div>
            </div>

            <div className="stats shadow bg-base-100 w-full border border-base-content/5">
                <div className="stat">
                    <div className="stat-figure text-primary"><Users size={32} /></div>
                    <div className="stat-title">Tổng số bài nộp</div>
                    <div className="stat-value text-primary">{results.length}</div>
                </div>
                <div className="stat">
                    <div className="stat-figure text-secondary"><CheckCircle size={32} /></div>
                    <div className="stat-title">Điểm TB</div>
                    <div className="stat-value text-secondary">
                        {results.length > 0 
                            ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)
                            : 0}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-content/5">
                <table className="table w-full">
                    <thead>
                        <tr className="bg-base-200">
                            <th>Tên thí sinh</th>
                            <th>Điểm số</th>
                            <th>Tỉ lệ</th>
                            <th>Thời gian nộp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r, i) => (
                            <tr key={i} className="hover">
                                <td className="font-bold">{r.studentName}</td>
                                <td className="text-lg font-mono text-primary">{r.score} / {r.totalQuestions}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <progress 
                                            className={`progress w-20 ${r.score / r.totalQuestions > 0.5 ? 'progress-success' : 'progress-error'}`} 
                                            value={r.score} 
                                            max={r.totalQuestions}
                                        ></progress>
                                        <span className="text-xs">{Math.round((r.score / r.totalQuestions) * 100)}%</span>
                                    </div>
                                </td>
                                <td className="text-xs opacity-60">
                                    {new Date(r.submittedAt).toLocaleString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
