import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldAlert, HeartHandshake, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, username: string) => void;
  onBackToInvitation: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToInvitation }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập không thành công.');
      }

      localStorage.setItem('wedding_admin_token', data.token);
      localStorage.setItem('wedding_admin_user', data.user.username);
      onLoginSuccess(data.token, data.user.username);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#710001]/30 rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#710001] border border-[#c79a55] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock className="w-6 h-6 text-[#fff0e7]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Quản Trị Thiệp Cưới
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Đăng nhập bảng điều khiển để chỉnh sửa thông tin &amp; quản lý khách mời
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-700/60 rounded-lg text-rose-200 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-300 mb-1.5">
              Tài khoản quản trị
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập (mặc định: admin)"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#c79a55] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full pl-9 pr-10 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#c79a55] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#710001] to-[#a3181a] hover:from-[#8e1012] hover:to-[#b92123] text-white font-medium text-sm rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập CMS'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-700/60 text-center">
          <div className="bg-neutral-900/80 p-3 rounded-lg border border-neutral-700/40 text-[11px] text-neutral-400 mb-4">
            <p className="font-semibold text-neutral-300 mb-0.5">Thông tin đăng nhập mặc định:</p>
            <p>Tài khoản: <code className="text-[#e7c988] bg-black/40 px-1 py-0.5 rounded">admin</code></p>
            <p className="mt-0.5">Mật khẩu: <code className="text-[#e7c988] bg-black/40 px-1 py-0.5 rounded">wedding2026!admin</code></p>
            <p className="text-[10px] text-neutral-500 mt-1 italic">Bạn có thể đổi mật khẩu sau khi đăng nhập.</p>
          </div>

          <button
            type="button"
            onClick={onBackToInvitation}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            ← Quay lại trang thiệp cưới
          </button>
        </div>
      </div>
    </div>
  );
};
