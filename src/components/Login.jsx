import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="card w-96 bg-base-100 shadow-xl border border-primary/20">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-4 text-primary">Azota Mini</h2>
          <p className="text-center opacity-70 mb-6">Vui lòng nhập tên của bạn để bắt đầu</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tên của bạn</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-base-content/40" />
                </div>
                <input
                  type="text"
                  placeholder="Họ và tên..."
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full gap-2 transition-all hover:scale-[1.02]">
              <LogIn size={20} />
              Bắt đầu
            </button>
          </form>

          <div className="mt-8 text-xs text-center opacity-50 space-y-1">
            <p>Admin: Quang</p>
            <p>© 20266 Azota fake</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
