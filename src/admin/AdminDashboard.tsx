import React, { useState, useEffect, useRef } from 'react';
import { WeddingConfig, RSVPSubmission, WeddingWish, AdminStats } from '../types/wedding';
import {
  LayoutDashboard,
  Users,
  Mail,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Music,
  CheckCircle2,
  MessageSquare,
  Globe,
  Settings,
  LogOut,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Search,
  Filter,
  Check,
  X,
  Volume2,
  Sparkles,
  Upload,
  QrCode,
  CreditCard,
  Heart,
} from 'lucide-react';

interface AdminDashboardProps {
  token: string;
  username: string;
  onLogout: () => void;
  onViewPublic: () => void;
}

type TabType =
  | 'overview'
  | 'couple'
  | 'cover'
  | 'hero'
  | 'lovestory'
  | 'families'
  | 'timeline'
  | 'portraits'
  | 'venue'
  | 'gallery'
  | 'banking'
  | 'music'
  | 'closing'
  | 'rsvp'
  | 'wishes'
  | 'seo'
  | 'settings';

interface ImageFieldProps {
  label: string;
  sizeHint: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
  placeholder?: string;
}

// Tự động tối ưu nén ảnh phía client (giảm ảnh từ 5MB-10MB xuống ~250KB JPEG sắc nét)
async function compressImageIfNeeded(file: File, maxDimension = 1600, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }
  // Nếu ảnh đã dưới 350KB thì giữ nguyên
  if (file.size < 350 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

const ImageFieldWithUpload: React.FC<ImageFieldProps> = ({
  label,
  sizeHint,
  value,
  onChange,
  token,
  placeholder = 'https://... hoặc /uploads/...',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Nén ảnh thông minh trước khi gửi
      const readyBlob = await compressImageIfNeeded(file);
      const res = await fetch(
        `/api/admin/upload?kind=image&name=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: readyBlob,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi tải ảnh lên.');
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải ảnh lên.';
      setUploadError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="text-xs font-semibold text-neutral-800">{label}</label>
        <span className="text-[11px] text-[#710001] bg-[#710001]/10 px-2 py-0.5 rounded font-medium">
          💡 Gợi ý: {sizeHint}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-800 font-mono"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 bg-neutral-800 hover:bg-[#710001] text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          title="Chọn tệp ảnh từ máy tính hoặc điện thoại"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Đang tải...' : 'Tải ảnh lên'}</span>
        </button>
      </div>

      {uploadError && <p className="text-[11px] text-rose-600">{uploadError}</p>}

      {value && (
        <div className="mt-2 flex items-center gap-3 p-2 bg-neutral-100 rounded border border-neutral-200">
          <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-neutral-200 border border-neutral-300 flex items-center justify-center">
            <img
              src={value}
              alt="Xem trước"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="text-[11px] text-neutral-600 truncate flex-1">
            <span className="font-semibold block text-neutral-800">Xem trước ảnh:</span>
            <span className="font-mono text-[10px] text-neutral-500 truncate block">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  username,
  onLogout,
  onViewPublic,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stats, RSVPs, Wishes
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rsvps, setRsvps] = useState<RSVPSubmission[]>([]);
  const [wishes, setWishes] = useState<WeddingWish[]>([]);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'attending' | 'not_attending'>('all');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audio Preview State in Admin
  const [audioPreviewing, setAudioPreviewing] = useState(false);
  const [adminAudio, setAdminAudio] = useState<HTMLAudioElement | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Config
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      // 2. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 3. RSVPs
      const rsvpRes = await fetch('/api/admin/rsvp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rsvpRes.ok) {
        const rsvpData = await rsvpRes.json();
        setRsvps(rsvpData);
      }

      // 4. Wishes
      const wishesRes = await fetch('/api/admin/wishes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (wishesRes.ok) {
        const wishesData = await wishesRes.json();
        setWishes(wishesData);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Save Config handler
  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi lưu cấu hình.');
      }

      setSaveMessage({ type: 'success', text: 'Đã lưu mọi thay đổi thành công vào máy chủ!' });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu thay đổi.';
      setSaveMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  // RSVP actions
  const handleDeleteRsvp = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi RSVP này?')) return;
    try {
      const res = await fetch(`/api/admin/rsvp/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert('Không thể xóa bản ghi.');
    }
  };

  const handleExportRsvpCsv = () => {
    window.open(`/api/admin/rsvp/export?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleExportConfig = () => {
    if (!config) return;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.couple || !parsed.cover) {
          alert('Tệp JSON không đúng định dạng cấu hình thiệp cưới.');
          return;
        }
        setConfig(parsed);
        setSaveMessage({
          type: 'success',
          text: 'Đã nhập cấu hình từ tệp thành công! Hãy bấm nút "Lưu Thay Đổi" để cập nhật lên máy chủ.',
        });
      } catch {
        alert('Không thể đọc tệp JSON này. Vui lòng kiểm tra lại.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Wishes actions
  const handleUpdateWishStatus = async (id: string, status: 'approved' | 'hidden' | 'pending') => {
    try {
      const res = await fetch(`/api/admin/wishes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setWishes((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status } : w))
        );
      }
    } catch (err) {
      alert('Không thể cập nhật trạng thái lời chúc.');
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lời chúc này?')) return;
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      alert('Không thể xóa lời chúc.');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể đổi mật khẩu.');
      }
      setPasswordMsg({ type: 'success', text: data.message });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đổi mật khẩu.';
      setPasswordMsg({ type: 'error', text: msg });
    }
  };

  // Audio preview toggle
  const toggleAudioPreview = (url: string) => {
    if (audioPreviewing && adminAudio) {
      adminAudio.pause();
      setAudioPreviewing(false);
    } else {
      if (adminAudio) adminAudio.pause();
      const audio = new Audio(url);
      audio.play().then(() => {
        setAdminAudio(audio);
        setAudioPreviewing(true);
        audio.onended = () => setAudioPreviewing(false);
      }).catch((e) => {
        alert('Không thể phát thử audio: ' + e.message);
      });
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#c79a55] mb-3" />
        <p className="text-sm font-serif">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  const filteredRsvps = rsvps.filter((r) => {
    const matchesFilter =
      rsvpFilter === 'all' ||
      (rsvpFilter === 'attending' && r.attending === 'attending') ||
      (rsvpFilter === 'not_attending' && r.attending === 'not_attending');

    const matchesSearch =
      !rsvpSearch.trim() ||
      r.guestName.toLowerCase().includes(rsvpSearch.toLowerCase()) ||
      (r.phone && r.phone.includes(rsvpSearch));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-800">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-neutral-900 text-neutral-300 flex flex-col shrink-0 border-r border-neutral-800">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Admin Thiệp Cưới
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Xin chào, {username}</p>
          </div>
          <button
            onClick={onViewPublic}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#710001] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Xem trang thiệp cưới công khai"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs">
          {[
            { id: 'overview', label: 'Tổng quan & Thống kê', icon: LayoutDashboard },
            { id: 'couple', label: 'Cô dâu & Chú rể', icon: Users },
            { id: 'cover', label: 'Thiệp mời mở đầu', icon: Mail },
            { id: 'hero', label: 'Tiêu đề Save the Date', icon: Sparkles },
            { id: 'lovestory', label: 'Câu chuyện tình yêu', icon: Heart },
            { id: 'families', label: 'Thông tin hai gia đình', icon: Users },
            { id: 'timeline', label: 'Lịch trình tiệc cưới', icon: Calendar },
            { id: 'portraits', label: 'Chân dung cặp đôi', icon: ImageIcon },
            { id: 'venue', label: 'Địa điểm & Bản đồ', icon: MapPin },
            { id: 'gallery', label: 'Album ảnh cưới (Gallery)', icon: ImageIcon },
            { id: 'banking', label: 'Mã QR & Mừng Cưới', icon: CreditCard },
            { id: 'closing', label: 'Đóng thiệp & Lời cảm tạ', icon: Mail },
            { id: 'music', label: 'Nhạc nền thiệp cưới', icon: Music },
            { id: 'rsvp', label: 'Quản lý RSVP xác nhận', icon: CheckCircle2, badge: rsvps.length },
            { id: 'wishes', label: 'Sổ lời chúc khách mời', icon: MessageSquare, badge: wishes.filter((w) => w.status === 'pending').length },
            { id: 'seo', label: 'SEO & Chia sẻ mạng xã hội', icon: Globe },
            { id: 'settings', label: 'Đổi mật khẩu & Hệ thống', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#710001] text-white shadow-md'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#c79a55] text-black font-bold' : 'bg-neutral-800 text-[#e7c988]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 p-2 rounded hover:bg-rose-950/40 w-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-100 overflow-y-auto">
        {/* TOP BAR WITH SAVE ACTION */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-neutral-800">
              {activeTab === 'overview' && 'Tổng quan hệ thống thiệp cưới'}
              {activeTab === 'couple' && 'Thông tin Cô dâu & Chú rể'}
              {activeTab === 'cover' && 'Cài đặt Thiệp mở đầu (Cover Card)'}
              {activeTab === 'hero' && 'Cài đặt Mục Save the Date & Lời chúc'}
              {activeTab === 'lovestory' && 'Cài đặt Câu chuyện tình yêu (Love Story)'}
              {activeTab === 'families' && 'Cài đặt Hai gia đình & Nghi lễ'}
              {activeTab === 'timeline' && 'Quản lý Lịch trình tiệc cưới'}
              {activeTab === 'portraits' && 'Quản lý Chân dung cô dâu chú rể'}
              {activeTab === 'venue' && 'Địa điểm, Bản đồ Google Maps & Đếm ngược'}
              {activeTab === 'gallery' && 'Quản lý Album ảnh cưới'}
              {activeTab === 'banking' && 'Cài đặt Mã QR & Tài khoản Mừng Cưới'}
              {activeTab === 'closing' && 'Cài đặt Đóng thiệp & Lời cảm tạ'}
              {activeTab === 'music' && 'Cài đặt Nhạc nền phát tự động'}
              {activeTab === 'rsvp' && 'Danh sách khách mời xác nhận tham dự'}
              {activeTab === 'wishes' && 'Kiểm duyệt và hiển thị Lời chúc'}
              {activeTab === 'seo' && 'Cấu hình SEO & Thẻ chia sẻ (OpenGraph)'}
              {activeTab === 'settings' && 'Bảo mật tài khoản & Đổi mật khẩu'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onViewPublic}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trang thiệp</span>
            </button>

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#710001] hover:bg-[#8e1012] disabled:opacity-50 rounded-md shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </header>

        {/* NOTIFICATION BANNER */}
        {saveMessage && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            <span>{saveMessage.text}</span>
            <button onClick={() => setSaveMessage(null)} className="p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 max-w-5xl space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-xs font-medium">Tổng phản hồi RSVP</span>
                    <CheckCircle2 className="w-4 h-4 text-[#710001]" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">{stats?.totalRsvp ?? rsvps.length}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">Lượt gửi phản hồi từ khách</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-xs font-medium">Khách sẽ tham dự</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">{stats?.attendingCount ?? rsvps.filter((r) => r.attending === 'attending').length}</div>
                  <div className="text-[11px] text-emerald-600 mt-1">Đã xác nhận có mặt</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-xs font-medium">Ước tính số lượng ghế</span>
                    <Users className="w-4 h-4 text-[#c79a55]" />
                  </div>
                  <div className="text-2xl font-bold text-[#710001]">{stats?.totalGuests ?? 0}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">Bao gồm người đi cùng</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 mb-2">
                    <span className="text-xs font-medium">Sổ lời chúc</span>
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">{wishes.length}</div>
                  <div className="text-[11px] text-sky-600 mt-1">{wishes.filter((w) => w.status === 'pending').length} lời chúc chờ duyệt</div>
                </div>
              </div>

              {/* Information Snapshot Card */}
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base font-serif font-bold text-neutral-900">
                      Thiệp cưới: {config.couple.groomDisplayName} &amp; {config.couple.brideDisplayName}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Hôn lễ vào lúc {config.couple.weddingTime} · Ngày {config.couple.weddingDate}
                    </p>
                  </div>
                  <button
                    onClick={onViewPublic}
                    className="px-4 py-2 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở trang thiệp thực tế</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <span className="text-neutral-500 block mb-1">Địa điểm tiệc cưới:</span>
                    <strong className="text-neutral-800 block">{config.venue.venueName}</strong>
                    <span className="text-neutral-600">{config.venue.venueAddress}</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <span className="text-neutral-500 block mb-1">Nhạc nền đang phát:</span>
                    <strong className="text-neutral-800 block truncate">{config.music.audioUrl}</strong>
                    <span className={config.music.enabled ? 'text-emerald-600' : 'text-neutral-400'}>
                      {config.music.enabled ? '● Đang kích hoạt' : '○ Đang tắt'}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <span className="text-neutral-500 block mb-1">Mừng cưới &amp; QR:</span>
                    <strong className="text-neutral-800 block">
                      {config.banking?.enabled ? 'Đã kích hoạt chuyển khoản' : 'Đang tắt'}
                    </strong>
                    <span className="text-neutral-600">Giúp khách ở xa có thể gửi mừng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COUPLE */}
          {activeTab === 'couple' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001] border-b pb-2">
                Thông tin cô dâu và chú rể
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tên hiển thị Chú Rể (trên thiệp) *
                  </label>
                  <input
                    type="text"
                    value={config.couple.groomDisplayName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        couple: { ...config.couple, groomDisplayName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900"
                    placeholder="Ví dụ: Hùng Phát"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tên hiển thị Cô Dâu (trên thiệp) *
                  </label>
                  <input
                    type="text"
                    value={config.couple.brideDisplayName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        couple: { ...config.couple, brideDisplayName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900"
                    placeholder="Ví dụ: Anh Nhi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Họ và tên đầy đủ Chú Rể (phần gia đình) *
                  </label>
                  <input
                    type="text"
                    value={config.couple.groomFullName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        couple: { ...config.couple, groomFullName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900"
                    placeholder="Ví dụ: Văn Hùng Phát"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Họ và tên đầy đủ Cô Dâu (phần gia đình) *
                  </label>
                  <input
                    type="text"
                    value={config.couple.brideFullName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        couple: { ...config.couple, brideFullName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900"
                    placeholder="Ví dụ: Nguyễn Huỳnh Anh Nhi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Ngày cưới chính thức * (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={config.couple.weddingDate}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        couple: { ...config.couple, weddingDate: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Giờ cử hành hôn lễ * (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={config.couple.weddingTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        couple: { ...config.couple, weddingTime: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COVER */}
          {activeTab === 'cover' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Thiệp mở đầu (Cover Card)
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.cover.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Bật màn hình mở thiệp</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nhãn lời mời thiệp
                  </label>
                  <input
                    type="text"
                    value={config.cover.invitationLabel}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, invitationLabel: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Kính mời đối tượng khách
                  </label>
                  <input
                    type="text"
                    value={config.cover.guestGreeting}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, guestGreeting: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Câu dẫn lời mời
                  </label>
                  <input
                    type="text"
                    value={config.cover.invitationMessage}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, invitationMessage: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Chữ trên nút bấm
                  </label>
                  <input
                    type="text"
                    value={config.cover.coverButtonText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, coverButtonText: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Chữ con dấu hỷ (Mặc định: 囍)
                  </label>
                  <input
                    type="text"
                    value={config.cover.sealText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, sealText: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-neutral-100">
                  <ImageFieldWithUpload
                    label="Họa tiết Long Phụng bìa thiệp (Cover Dragon Phoenix)"
                    sizeHint="600x600 px (Ảnh vuông PNG nền trong suốt)"
                    value={config.cover.dragonPhoenixUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        cover: { ...config.cover, dragonPhoenixUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HERO */}
          {activeTab === 'hero' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Mục Save the Date &amp; Lời chúc mở đầu
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.hero.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Hiển thị mục này</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nhãn dòng đầu (Topline)
                  </label>
                  <input
                    type="text"
                    value={config.hero.toplineLabel}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, toplineLabel: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tên nghi lễ trong dải ruy-băng
                  </label>
                  <input
                    type="text"
                    value={config.hero.ceremonyLabel}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, ceremonyLabel: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Câu châm ngôn tình yêu (Romantic Blessing Quote)
                  </label>
                  <textarea
                    rows={3}
                    value={config.hero.blessingQuote}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, blessingQuote: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  ></textarea>
                </div>

                <div className="md:col-span-2 pt-2 border-t border-neutral-100">
                  <ImageFieldWithUpload
                    label="Nhành hoa trang trí góc (Floral Sprig)"
                    sizeHint="400x300 px (PNG trong suốt)"
                    value={config.hero.floralImageUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, floralImageUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <ImageFieldWithUpload
                    label="Họa tiết Rồng chìm sau dải ruy-băng (Dragon Watermark)"
                    sizeHint="800x450 px (PNG trong suốt)"
                    value={config.hero.dragonImageUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, dragonImageUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4.5: LOVE STORY */}
          {activeTab === 'lovestory' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                    Câu chuyện tình yêu (Love Story)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Trang trí khoảng không gian thiệp cưới bằng các cột mốc tình yêu lãng mạn của cặp đôi trẻ
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={config.loveStory?.enabled ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          loveStory: {
                            ...(config.loveStory || {
                              enabled: true,
                              title: 'Câu Chuyện Tình Yêu',
                              subtitle: 'Hành trình từ hai người xa lạ đến ngày chung một mái nhà',
                              items: [],
                            }),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#710001] w-4 h-4"
                    />
                    <span>Bật mục này</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const currentItems = config.loveStory?.items || [];
                      const newItem = {
                        id: 'ls-' + Date.now(),
                        year: '2026',
                        title: 'Kỷ niệm mới',
                        description: 'Ghi lại kỷ niệm đáng nhớ của hai chúng mình...',
                        imageUrl: '/uploads/doi-2-5b25dc2f.jpg',
                      };
                      setConfig({
                        ...config,
                        loveStory: {
                          title: config.loveStory?.title || 'Câu Chuyện Tình Yêu',
                          subtitle: config.loveStory?.subtitle || '',
                          enabled: config.loveStory?.enabled ?? true,
                          items: [...currentItems, newItem],
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm cột mốc</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tiêu đề mục
                  </label>
                  <input
                    type="text"
                    value={config.loveStory?.title || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        loveStory: {
                          ...(config.loveStory || { items: [], enabled: true, subtitle: '' }),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Mô tả phụ
                  </label>
                  <input
                    type="text"
                    value={config.loveStory?.subtitle || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        loveStory: {
                          ...(config.loveStory || { items: [], enabled: true, title: '' }),
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 pt-3">
                {config.loveStory?.items?.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col md:flex-row gap-4 items-start"
                  >
                    <div className="w-28 shrink-0">
                      <ImageFieldWithUpload
                        label="Ảnh kỷ niệm"
                        sizeHint="600x450 px"
                        value={item.imageUrl || ''}
                        onChange={(url) => {
                          const updated = [...(config.loveStory?.items || [])];
                          updated[idx].imageUrl = url;
                          setConfig({
                            ...config,
                            loveStory: { ...(config.loveStory as any), items: updated },
                          });
                        }}
                        token={token}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 w-full">
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-0.5">Năm / Thời gian</label>
                        <input
                          type="text"
                          value={item.year}
                          onChange={(e) => {
                            const updated = [...(config.loveStory?.items || [])];
                            updated[idx].year = e.target.value;
                            setConfig({
                              ...config,
                              loveStory: { ...(config.loveStory as any), items: updated },
                            });
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded text-xs"
                          placeholder="Ví dụ: 2022"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-neutral-500 mb-0.5">Tiêu đề cột mốc</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...(config.loveStory?.items || [])];
                            updated[idx].title = e.target.value;
                            setConfig({
                              ...config,
                              loveStory: { ...(config.loveStory as any), items: updated },
                            });
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded text-xs font-semibold"
                          placeholder="Ví dụ: Lần Đầu Gặp Gỡ"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[11px] text-neutral-500 mb-0.5">Câu chuyện kỷ niệm</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...(config.loveStory?.items || [])];
                            updated[idx].description = e.target.value;
                            setConfig({
                              ...config,
                              loveStory: { ...(config.loveStory as any), items: updated },
                            });
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded text-xs"
                        ></textarea>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.loveStory?.items.filter((_, i) => i !== idx);
                        setConfig({
                          ...config,
                          loveStory: { ...(config.loveStory as any), items: updated || [] },
                        });
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded self-end md:self-center cursor-pointer"
                      title="Xóa cột mốc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FAMILIES */}
          {activeTab === 'families' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Thông tin Hai Gia Đình &amp; Hôn lễ
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.families.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Hiển thị mục này</span>
                </label>
              </div>

              {/* General headings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tiêu đề thư mời
                  </label>
                  <input
                    type="text"
                    value={config.families.heading}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, heading: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Lời dẫn mời
                  </label>
                  <input
                    type="text"
                    value={config.families.invitationSubtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, invitationSubtitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tên khách mời chung
                  </label>
                  <input
                    type="text"
                    value={config.families.guestName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, guestName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Thứ trong tuần
                  </label>
                  <input
                    type="text"
                    value={config.families.dayOfWeek}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, dayOfWeek: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Mô tả giờ hôn lễ
                  </label>
                  <input
                    type="text"
                    value={config.families.timeDescription}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, timeDescription: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Ngày Âm Lịch
                  </label>
                  <input
                    type="text"
                    value={config.families.lunarDate}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, lunarDate: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* Groom family */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#710001]">
                  Thông tin Nhà Trai
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tiêu đề Nhà Trai
                    </label>
                    <input
                      type="text"
                      value={config.families.groomFamilyHeading}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          families: { ...config.families, groomFamilyHeading: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tên Phụ Huynh Nhà Trai (mỗi người một dòng)
                    </label>
                    <textarea
                      rows={2}
                      value={config.families.groomParents.join('\n')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          families: {
                            ...config.families,
                            groomParents: e.target.value.split('\n').filter(Boolean),
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm"
                      placeholder="Ví dụ: Ông Văn Hùng Dũng&#10;Bà Trần Ngọc Giàu"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Địa chỉ Nhà Trai
                    </label>
                    <textarea
                      rows={2}
                      value={config.families.groomAddress}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          families: { ...config.families, groomAddress: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Bride family */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#710001]">
                  Thông tin Nhà Gái
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tiêu đề Nhà Gái
                    </label>
                    <input
                      type="text"
                      value={config.families.brideFamilyHeading}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          families: { ...config.families, brideFamilyHeading: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tên Phụ Huynh Nhà Gái (mỗi người một dòng)
                    </label>
                    <textarea
                      rows={2}
                      value={config.families.brideParents.join('\n')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          families: {
                            ...config.families,
                            brideParents: e.target.value.split('\n').filter(Boolean),
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm"
                      placeholder="Ví dụ: Ông Nguyễn Văn Quang&#10;Bà Huỳnh Xuân Anh"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Địa chỉ Nhà Gái
                    </label>
                    <textarea
                      rows={2}
                      value={config.families.brideAddress}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          families: { ...config.families, brideAddress: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Decorative images */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#710001]">
                  Họa tiết trang trí mục Hai Gia Đình
                </h4>
                <div className="space-y-3">
                  <ImageFieldWithUpload
                    label="Rồng vàng trang trí góc (Corner Dragon)"
                    sizeHint="540x500 px (PNG trong suốt)"
                    value={config.families.detailsDragonUrl || ''}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, detailsDragonUrl: url },
                      })
                    }
                    token={token}
                  />

                  <ImageFieldWithUpload
                    label="Nhành hoa góc trên (Floral Top)"
                    sizeHint="350x250 px (PNG trong suốt)"
                    value={config.families.detailsFloralTopUrl || ''}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, detailsFloralTopUrl: url },
                      })
                    }
                    token={token}
                  />

                  <ImageFieldWithUpload
                    label="Nhành hoa góc dưới (Floral Bottom)"
                    sizeHint="350x250 px (PNG trong suốt)"
                    value={config.families.detailsFloralBottomUrl || ''}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        families: { ...config.families, detailsFloralBottomUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Lịch trình tiệc cưới (Timeline)
                </h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={config.timeline.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          timeline: { ...config.timeline, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-[#710001] w-4 h-4"
                    />
                    <span>Bật lịch trình</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const newEvents = [
                        ...config.timeline.events,
                        {
                          id: 'ev-' + Date.now(),
                          time: '18:00',
                          title: 'Sự kiện mới',
                          description: '',
                          enabled: true,
                        },
                      ];
                      setConfig({
                        ...config,
                        timeline: { ...config.timeline, events: newEvents },
                      });
                    }}
                    className="px-3 py-1.5 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm mốc thời gian</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {config.timeline.events.map((event, index) => (
                  <div
                    key={event.id}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 w-full">
                      <input
                        type="text"
                        value={event.time}
                        onChange={(e) => {
                          const updated = [...config.timeline.events];
                          updated[index].time = e.target.value;
                          setConfig({
                            ...config,
                            timeline: { ...config.timeline, events: updated },
                          });
                        }}
                        className="p-2 bg-white border border-neutral-300 rounded text-xs"
                        placeholder="Thời gian (ví dụ: 16:00 - 18:00)"
                      />

                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => {
                          const updated = [...config.timeline.events];
                          updated[index].title = e.target.value;
                          setConfig({
                            ...config,
                            timeline: { ...config.timeline, events: updated },
                          });
                        }}
                        className="p-2 bg-white border border-neutral-300 rounded text-xs font-semibold"
                        placeholder="Tiêu đề hoạt động"
                      />

                      <input
                        type="text"
                        value={event.description || ''}
                        onChange={(e) => {
                          const updated = [...config.timeline.events];
                          updated[index].description = e.target.value;
                          setConfig({
                            ...config,
                            timeline: { ...config.timeline, events: updated },
                          });
                        }}
                        className="p-2 bg-white border border-neutral-300 rounded text-xs"
                        placeholder="Mô tả chi tiết..."
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <label className="flex items-center gap-1 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={event.enabled}
                          onChange={(e) => {
                            const updated = [...config.timeline.events];
                            updated[index].enabled = e.target.checked;
                            setConfig({
                              ...config,
                              timeline: { ...config.timeline, events: updated },
                            });
                          }}
                          className="rounded text-[#710001]"
                        />
                        <span>Hiện</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.timeline.events.filter((_, i) => i !== index);
                          setConfig({
                            ...config,
                            timeline: { ...config.timeline, events: updated },
                          });
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                        title="Xóa mốc thời gian"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PORTRAITS */}
          {activeTab === 'portraits' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Chân dung Cô dâu &amp; Chú rể
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.portraits.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        portraits: { ...config.portraits, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Hiển thị mục này</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Groom photo */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                  <ImageFieldWithUpload
                    label="Ảnh Chú Rể (Groom Portrait)"
                    sizeHint="600x900 px (Tỉ lệ 2:3 hoặc 3:4 chân dung dọc)"
                    value={config.portraits.groomImageUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        portraits: { ...config.portraits, groomImageUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>

                {/* Bride photo */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                  <ImageFieldWithUpload
                    label="Ảnh Cô Dâu (Bride Portrait)"
                    sizeHint="600x900 px (Tỉ lệ 2:3 hoặc 3:4 chân dung dọc)"
                    value={config.portraits.brideImageUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        portraits: { ...config.portraits, brideImageUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>

                {/* Verse */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Câu thơ kết duyên (Romantic Verse)
                  </label>
                  <input
                    type="text"
                    value={config.portraits.verse}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        portraits: { ...config.portraits, verse: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: VENUE */}
          {activeTab === 'venue' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Địa điểm, Google Maps &amp; Đếm ngược
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.venue.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        venue: { ...config.venue, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Hiển thị mục này</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tên địa điểm / Tư gia *
                  </label>
                  <input
                    type="text"
                    value={config.venue.venueName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        venue: { ...config.venue, venueName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Địa chỉ chi tiết *
                  </label>
                  <input
                    type="text"
                    value={config.venue.venueAddress}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        venue: { ...config.venue, venueAddress: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    URL Google Maps Embed (Iframe)
                  </label>
                  <input
                    type="text"
                    value={config.venue.mapEmbedUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        venue: { ...config.venue, mapEmbedUrl: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono"
                    placeholder="https://www.google.com/maps?q=...&output=embed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Đường dẫn chỉ đường (Google Maps Link)
                  </label>
                  <input
                    type="text"
                    value={config.venue.directionsUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        venue: { ...config.venue, directionsUrl: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-neutral-100">
                  <ImageFieldWithUpload
                    label="Ảnh cặp đôi khu vực bản đồ (Venue Couple Portrait)"
                    sizeHint="800x600 px (Khung ngang 4:3 hoặc 16:9)"
                    value={config.venue.couplePortraitUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        venue: { ...config.venue, couplePortraitUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>
              </div>

              {/* Countdown & Calendar settings */}
              <div className="pt-4 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800 mb-2">
                    <input
                      type="checkbox"
                      checked={config.countdown.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          countdown: { ...config.countdown, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-[#710001]"
                    />
                    <span>Bật đồng hồ đếm ngược ngày cưới</span>
                  </label>
                  <input
                    type="text"
                    value={config.countdown.completedMessage}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        countdown: { ...config.countdown, completedMessage: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-white border border-neutral-300 rounded text-xs"
                    placeholder="Thông báo khi hôn lễ đã qua..."
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800 mb-2">
                    <input
                      type="checkbox"
                      checked={config.calendar.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          calendar: { ...config.calendar, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-[#710001]"
                    />
                    <span>Bật lịch tháng đánh dấu ngày cưới bằng trái tim</span>
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Lịch sẽ tự động hiển thị đúng tháng và đánh dấu ngày{' '}
                    <strong className="text-[#710001]">{config.couple.weddingDate}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Album ảnh cưới (Gallery)
                </h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={config.gallery.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          gallery: { ...config.gallery, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-[#710001] w-4 h-4"
                    />
                    <span>Bật album ảnh</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [
                        ...config.gallery.items,
                        {
                          id: 'g-' + Date.now(),
                          url: '/uploads/doi-2-5b25dc2f.jpg',
                          alt: 'Ảnh cưới mới',
                          caption: 'Khoảnh khắc đáng nhớ',
                          enabled: true,
                        },
                      ];
                      setConfig({
                        ...config,
                        gallery: { ...config.gallery, items: newItems },
                      });
                    }}
                    className="px-3 py-1.5 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm ảnh mới</span>
                  </button>
                </div>
              </div>

              <div>
                <ImageFieldWithUpload
                  label="Ảnh nền lớn mờ ảo phía sau Album (Backdrop)"
                  sizeHint="1200x800 px (Ảnh ngang chất lượng cao)"
                  value={config.gallery.backdropUrl}
                  onChange={(url) =>
                    setConfig({
                      ...config,
                      gallery: { ...config.gallery, backdropUrl: url },
                    })
                  }
                  token={token}
                />
              </div>

              <div className="space-y-4 pt-3">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                  Danh sách ảnh trong Album ({config.gallery.items.length} ảnh)
                </label>
                {config.gallery.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col md:flex-row gap-4 items-center"
                  >
                    <div className="w-24 h-24 shrink-0 rounded overflow-hidden border border-neutral-300 bg-neutral-200">
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 w-full">
                      <div className="md:col-span-2">
                        <ImageFieldWithUpload
                          label={`Ảnh #${index + 1}`}
                          sizeHint="800x1000 px (dọc) hoặc 800x600 px (ngang)"
                          value={item.url}
                          onChange={(url) => {
                            const updated = [...config.gallery.items];
                            updated[index].url = url;
                            setConfig({
                              ...config,
                              gallery: { ...config.gallery, items: updated },
                            });
                          }}
                          token={token}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-600 mb-0.5">Mô tả ảnh (Alt)</label>
                        <input
                          type="text"
                          value={item.alt}
                          onChange={(e) => {
                            const updated = [...config.gallery.items];
                            updated[index].alt = e.target.value;
                            setConfig({
                              ...config,
                              gallery: { ...config.gallery, items: updated },
                            });
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded text-xs mb-2"
                        />

                        <label className="block text-[11px] text-neutral-600 mb-0.5">Chú thích (Caption)</label>
                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => {
                            const updated = [...config.gallery.items];
                            updated[index].caption = e.target.value;
                            setConfig({
                              ...config,
                              gallery: { ...config.gallery, items: updated },
                            });
                          }}
                          className="w-full p-2 bg-white border border-neutral-300 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => {
                            const updated = [...config.gallery.items];
                            updated[index].enabled = e.target.checked;
                            setConfig({
                              ...config,
                              gallery: { ...config.gallery, items: updated },
                            });
                          }}
                          className="rounded text-[#710001]"
                        />
                        <span>Hiện</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.gallery.items.filter((_, i) => i !== index);
                          setConfig({
                            ...config,
                            gallery: { ...config.gallery, items: updated },
                          });
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: BANKING QR */}
          {activeTab === 'banking' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                    Cài đặt Mã QR &amp; Tài khoản Mừng Cưới (Banking)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Cho phép quan khách ở xa hoặc không tiện tham dự trực tiếp gửi quà mừng &amp; lời chúc phúc
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.banking?.enabled ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        banking: {
                          ...(config.banking || {
                            title: 'Hộp Mừng Cưới & Chúc Phúc',
                            subtitle: '',
                            groom: { enabled: true, bankName: '', accountNumber: '', accountHolder: '', qrImageUrl: '' },
                            bride: { enabled: true, bankName: '', accountNumber: '', accountHolder: '', qrImageUrl: '' },
                          }),
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Bật mục Mừng Cưới</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tiêu đề chính mục
                  </label>
                  <input
                    type="text"
                    value={config.banking?.title || 'Hộp Mừng Cưới & Chúc Phúc'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        banking: { ...(config.banking as any), title: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Lời dẫn tâm sự gửi tới khách mời
                  </label>
                  <input
                    type="text"
                    value={config.banking?.subtitle || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        banking: { ...(config.banking as any), subtitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* Groom Banking Card */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#710001] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#710001]" />
                    <span>Tài khoản Chú Rể (Nhà Trai)</span>
                  </h4>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.banking?.groom?.enabled ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            groom: {
                              ...config.banking?.groom,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded text-[#710001]"
                    />
                    <span>Hiện thẻ Nhà Trai</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Vietcombank, MB Bank, Techcombank..."
                      value={config.banking?.groom?.bankName || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            groom: { ...config.banking?.groom, bankName: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập số tài khoản..."
                      value={config.banking?.groom?.accountNumber || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            groom: { ...config.banking?.groom, accountNumber: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: VAN HUNG PHAT"
                      value={config.banking?.groom?.accountHolder || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            groom: { ...config.banking?.groom, accountHolder: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs uppercase"
                    />
                  </div>

                  <div className="md:col-span-3 pt-2">
                    <ImageFieldWithUpload
                      label="Ảnh mã QR Ngân hàng Chú Rể"
                      sizeHint="500x500 px (Ảnh vuông rõ nét tải từ App Ngân hàng về)"
                      value={config.banking?.groom?.qrImageUrl || ''}
                      onChange={(url) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            groom: { ...config.banking?.groom, qrImageUrl: url },
                          },
                        })
                      }
                      token={token}
                    />
                  </div>
                </div>
              </div>

              {/* Bride Banking Card */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#710001] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#710001]" />
                    <span>Tài khoản Cô Dâu (Nhà Gái)</span>
                  </h4>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.banking?.bride?.enabled ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            bride: {
                              ...config.banking?.bride,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded text-[#710001]"
                    />
                    <span>Hiện thẻ Nhà Gái</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: MB Bank, VietinBank, ACB..."
                      value={config.banking?.bride?.bankName || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            bride: { ...config.banking?.bride, bankName: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập số tài khoản..."
                      value={config.banking?.bride?.accountNumber || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            bride: { ...config.banking?.bride, accountNumber: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: NGUYEN HUYNH ANH NHI"
                      value={config.banking?.bride?.accountHolder || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            bride: { ...config.banking?.bride, accountHolder: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs uppercase"
                    />
                  </div>

                  <div className="md:col-span-3 pt-2">
                    <ImageFieldWithUpload
                      label="Ảnh mã QR Ngân hàng Cô Dâu"
                      sizeHint="500x500 px (Ảnh vuông rõ nét tải từ App Ngân hàng về)"
                      value={config.banking?.bride?.qrImageUrl || ''}
                      onChange={(url) =>
                        setConfig({
                          ...config,
                          banking: {
                            ...(config.banking as any),
                            bride: { ...config.banking?.bride, qrImageUrl: url },
                          },
                        })
                      }
                      token={token}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: CLOSING */}
          {activeTab === 'closing' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Đóng thiệp &amp; Lời cảm tạ (Closing Section)
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.closing.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        closing: { ...config.closing, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Hiển thị mục này</span>
                </label>
              </div>

              <div className="space-y-4">
                <ImageFieldWithUpload
                  label="Ảnh lớn kết thúc thiệp cưới (Closing Couple Portrait)"
                  sizeHint="800x1000 px (Tỉ lệ 4:5 hoặc 3:4 chất lượng cao)"
                  value={config.closing.portraitUrl}
                  onChange={(url) =>
                    setConfig({
                      ...config,
                      closing: { ...config.closing, portraitUrl: url },
                    })
                  }
                  token={token}
                />

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Lời cảm tạ tri ân (Closing Quote)
                  </label>
                  <textarea
                    rows={3}
                    value={config.closing.quote}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        closing: { ...config.closing, quote: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Đại diện gia đình / Chủ hôn
                    </label>
                    <input
                      type="text"
                      value={config.closing.hostName}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          closing: { ...config.closing, hostName: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Dòng chữ phụ
                    </label>
                    <input
                      type="text"
                      value={config.closing.hostSubtitle}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          closing: { ...config.closing, hostSubtitle: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Câu kết thiệp mời
                  </label>
                  <input
                    type="text"
                    value={config.closing.closingInvitation}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        closing: { ...config.closing, closingInvitation: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: MUSIC */}
          {activeTab === 'music' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                  Cài đặt Nhạc nền (Background Music)
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.music.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        music: { ...config.music, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Bật nhạc nền khi mở thiệp</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Đường dẫn Audio URL (MP3/OGG) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.music.audioUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          music: { ...config.music, audioUrl: e.target.value },
                        })
                      }
                      className="flex-1 p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm font-mono text-xs"
                      placeholder="https://... hoặc /uploads/bai-hat.mp3"
                    />
                    <button
                      type="button"
                      onClick={() => toggleAudioPreview(config.music.audioUrl)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{audioPreviewing ? 'Tạm dừng nghe thử' : 'Nghe thử audio'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <label className="block text-xs font-medium text-neutral-700 mb-2">
                      Âm lượng mặc định: {Math.round((config.music.volume ?? 0.7) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.music.volume ?? 0.7}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          music: { ...config.music, volume: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-[#710001]"
                    />
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800">
                      <input
                        type="checkbox"
                        checked={config.music.loop ?? true}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            music: { ...config.music, loop: e.target.checked },
                          })
                        }
                        className="rounded text-[#710001] w-4 h-4"
                      />
                      <span>Tự động phát lặp lại (Loop) khi hết bài</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: RSVP */}
          {activeTab === 'rsvp' && (
            <div className="space-y-6">
              {/* CARD 1: CẤU HÌNH & GHI CHÚ RSVP */}
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#710001]" />
                      Cài đặt &amp; Ghi chú mục Xác nhận tham dự (RSVP)
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tùy chỉnh tiêu đề, lời cảm ơn và các dòng thông tin lưu ý (Bãi đỗ xe, Photobooth chụp ảnh...)
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={config.rsvp.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rsvp: { ...config.rsvp, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-[#710001] w-4 h-4"
                    />
                    <span>Hiển thị mục này</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Tiêu đề mục (Title)
                      </label>
                      <input
                        type="text"
                        value={config.rsvp.title}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rsvp: { ...config.rsvp, title: e.target.value },
                          })
                        }
                        placeholder="Xác nhận tham dự"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Chữ trên nút gửi (Button Text)
                      </label>
                      <input
                        type="text"
                        value={config.rsvp.buttonText}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rsvp: { ...config.rsvp, buttonText: e.target.value },
                          })
                        }
                        placeholder="Gửi xác nhận"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Mô tả / Lời dẫn mời khách xác nhận
                    </label>
                    <input
                      type="text"
                      value={config.rsvp.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rsvp: { ...config.rsvp, description: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs"
                    />
                  </div>

                  {/* Lời Cảm Ơn Từ Cô Dâu & Chú Rể */}
                  <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#710001]" />
                      <span className="text-xs font-bold text-[#710001] uppercase tracking-wider">
                        Khung Lời Cảm Ơn Từ Cô Dâu &amp; Chú Rể
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Tiêu đề khung lời cảm ơn
                      </label>
                      <input
                        type="text"
                        value={config.rsvp.thankYouTitle ?? 'Lời Cảm Ơn Từ Cô Dâu & Chú Rể'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rsvp: { ...config.rsvp, thankYouTitle: e.target.value },
                          })
                        }
                        placeholder="Lời Cảm Ơn Từ Cô Dâu & Chú Rể"
                        className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Nội dung tâm tình / Lời tri ân gửi khách mời
                      </label>
                      <textarea
                        rows={3}
                        value={
                          config.rsvp.thankYouMessage ??
                          '“Cảm ơn bạn đã luôn là một phần thật đẹp trong chặng đường trưởng thành và tình yêu của chúng mình. Sự hiện diện và lời chúc phúc của bạn trong ngày trọng đại hôm nay chính là món quà ý nghĩa nhất. Chúng mình rất mong được cùng bạn sẻ chia và lưu giữ những khoảnh khắc hạnh phúc trọn vẹn này!”'
                        }
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rsvp: { ...config.rsvp, thankYouMessage: e.target.value },
                          })
                        }
                        className="w-full p-2.5 bg-white border border-neutral-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  {/* Ghi chú lưu ý & Tiện ích (Bãi đỗ xe, Photobooth chụp ảnh...) */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                          Ghi chú lưu ý &amp; Tiện ích quan khách
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          Các dòng thông tin tiện ích (Bãi đỗ xe, Photobooth chụp ảnh, lưu ý đón tiếp...)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentNotes = config.rsvp.notes || [
                            'Bãi đỗ xe ô tô & xe máy an ninh, miễn phí tại tư gia',
                            'Photobooth chụp ảnh mở cửa từ 11:00 đón tiếp quan khách',
                          ];
                          setConfig({
                            ...config,
                            rsvp: {
                              ...config.rsvp,
                              notes: [...currentNotes, ''],
                            },
                          });
                        }}
                        className="px-2.5 py-1.5 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm dòng ghi chú</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {(config.rsvp.notes ?? [
                        'Bãi đỗ xe ô tô & xe máy an ninh, miễn phí tại tư gia',
                        'Photobooth chụp ảnh mở cửa từ 11:00 đón tiếp quan khách',
                      ]).map((note, index) => {
                        const notesArray = config.rsvp.notes ?? [
                          'Bãi đỗ xe ô tô & xe máy an ninh, miễn phí tại tư gia',
                          'Photobooth chụp ảnh mở cửa từ 11:00 đón tiếp quan khách',
                        ];

                        return (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-neutral-500 w-5 shrink-0 text-center font-bold">
                              #{index + 1}
                            </span>
                            <input
                              type="text"
                              value={note}
                              placeholder="Nhập ghi chú tiện ích (ví dụ: Bãi đỗ xe ô tô & xe máy...)"
                              onChange={(e) => {
                                const updated = [...notesArray];
                                updated[index] = e.target.value;
                                setConfig({
                                  ...config,
                                  rsvp: { ...config.rsvp, notes: updated },
                                });
                              }}
                              className="flex-1 p-2 bg-white border border-neutral-300 rounded text-xs text-neutral-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = notesArray.filter((_, i) => i !== index);
                                setConfig({
                                  ...config,
                                  rsvp: { ...config.rsvp, notes: updated },
                                });
                              }}
                              className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Xóa dòng này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200/80 text-[11px] text-neutral-500">
                      <span>💡 Các dòng này sẽ hiển thị trực tiếp trên thiệp ở khung Xác nhận tham dự</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfig({
                            ...config,
                            rsvp: {
                              ...config.rsvp,
                              notes: [
                                'Bãi đỗ xe ô tô & xe máy an ninh, miễn phí tại tư gia',
                                'Photobooth chụp ảnh mở cửa từ 11:00 đón tiếp quan khách',
                              ],
                            },
                          });
                        }}
                        className="text-[#710001] hover:underline font-medium cursor-pointer"
                      >
                        Khôi phục 2 ghi chú gốc
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: DANH SÁCH KHÁCH MỜI PHẢN HỒI */}
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                      Danh sách khách mời phản hồi ({filteredRsvps.length} bản ghi)
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Quản lý danh sách xác nhận tham dự và số lượng khách mời
                    </p>
                  </div>

                  <button
                    onClick={handleExportRsvpCsv}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất file Excel CSV (UTF-8)</span>
                  </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      value={rsvpSearch}
                      onChange={(e) => setRsvpSearch(e.target.value)}
                      placeholder="Tìm theo tên khách mời hoặc số điện thoại..."
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
                    <select
                      value={rsvpFilter}
                      onChange={(e) => setRsvpFilter(e.target.value as any)}
                      className="py-2 px-3 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-700"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="attending">Sẽ tham dự</option>
                      <option value="not_attending">Không thể tham dự</option>
                    </select>
                  </div>
                </div>

                {/* RSVP Table */}
                <div className="overflow-x-auto rounded-lg border border-neutral-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-600 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Họ và tên</th>
                        <th className="p-3">Số điện thoại</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3">Số khách</th>
                        <th className="p-3">Khách của</th>
                        <th className="p-3">Lời nhắn</th>
                        <th className="p-3">Thời gian</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredRsvps.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-neutral-400 italic">
                            Chưa có phản hồi nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredRsvps.map((rsvp) => (
                          <tr key={rsvp.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-3 font-semibold text-neutral-900">{rsvp.guestName}</td>
                            <td className="p-3 text-neutral-600">{rsvp.phone || '—'}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  rsvp.attending === 'attending'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {rsvp.attending === 'attending' ? 'Sẽ tham dự' : 'Không tham dự'}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-neutral-800">
                              {rsvp.attending === 'attending' ? `${rsvp.guestCount} người` : '—'}
                            </td>
                            <td className="p-3 text-neutral-600">
                              {rsvp.side === 'groom' ? 'Nhà Trai' : rsvp.side === 'bride' ? 'Nhà Gái' : 'Bạn chung'}
                            </td>
                            <td className="p-3 text-neutral-600 max-w-xs truncate" title={rsvp.message}>
                              {rsvp.message || '—'}
                            </td>
                            <td className="p-3 text-neutral-500 whitespace-nowrap">
                              {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteRsvp(rsvp.id)}
                                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                                title="Xóa bản ghi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: WISHES */}
          {activeTab === 'wishes' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                    Quản lý Sổ Lời Chúc ({wishes.length} lời chúc)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Kiểm duyệt và chọn lọc lời chúc hiển thị công khai trên thiệp cưới
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={config.wishes.requireApproval}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        wishes: { ...config.wishes, requireApproval: e.target.checked },
                      })
                    }
                    className="rounded text-[#710001] w-4 h-4"
                  />
                  <span>Bắt buộc duyệt trước khi hiển thị</span>
                </label>
              </div>

              <div className="space-y-3">
                {wishes.length === 0 ? (
                  <p className="text-center text-neutral-400 italic py-6">Chưa có lời chúc nào.</p>
                ) : (
                  wishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <strong className="text-xs text-[#710001] font-bold">{wish.senderName}</strong>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                              wish.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : wish.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {wish.status === 'approved' ? 'Đã duyệt' : wish.status === 'pending' ? 'Chờ duyệt' : 'Đang ẩn'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(wish.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 italic">&ldquo;{wish.message}&rdquo;</p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end md:self-center">
                        {wish.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateWishStatus(wish.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                        )}

                        {wish.status !== 'hidden' && (
                          <button
                            onClick={() => handleUpdateWishStatus(wish.id, 'hidden')}
                            className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs rounded transition-colors cursor-pointer"
                          >
                            Ẩn
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteWish(wish.id)}
                          className="p-1 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                          title="Xóa lời chúc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 15: SEO */}
          {activeTab === 'seo' && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001] border-b pb-3">
                SEO &amp; Thẻ chia sẻ mạng xã hội (OpenGraph / Zalo / Facebook)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tiêu đề trang (Browser Title) *
                  </label>
                  <input
                    type="text"
                    value={config.seo.pageTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, pageTitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Mô tả trang (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={config.seo.metaDescription}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, metaDescription: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tiêu đề khi chia sẻ link (Social Title)
                  </label>
                  <input
                    type="text"
                    value={config.seo.socialTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, socialTitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                  />
                </div>

                <div>
                  <ImageFieldWithUpload
                    label="Ảnh xem trước khi chia sẻ link (OG Image URL)"
                    sizeHint="1200x630 px (Tỉ lệ chuẩn 1.91:1 khi chia sẻ Facebook/Zalo)"
                    value={config.seo.socialImageUrl}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        seo: { ...config.seo, socialImageUrl: url },
                      })
                    }
                    token={token}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 16: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Card 1: Đổi mật khẩu */}
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001] border-b pb-3">
                  Bảo mật &amp; Đổi Mật Khẩu Quản Trị
                </h3>

                {passwordMsg && (
                  <div
                    className={`p-3 text-xs rounded-lg ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Mật khẩu hiện tại *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                      placeholder="Mật khẩu hiện tại..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Mật khẩu mới * (ít nhất 6 ký tự)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm"
                      placeholder="Nhập mật khẩu mới..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Đổi Mật Khẩu
                  </button>
                </form>
              </div>

              {/* Card 2: Sao lưu & Đồng bộ Cấu hình (GitHub / File) */}
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#710001]">
                    Sao lưu &amp; Đồng bộ Cấu hình (File &amp; GitHub)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Xuất hoặc nhập toàn bộ nội dung thiệp cưới dưới dạng tệp tin JSON để lưu trữ hoặc commit lên GitHub.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="text-xs font-bold text-neutral-800 block">
                      1. Xuất file cấu hình thiệp cưới
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Tải về tệp <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">wedding-config.json</code> chứa toàn bộ thông tin ngày giờ, địa điểm, ảnh, mã QR, lời chúc... Bạn có thể dùng tệp này để chép đè vào thư mục <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">data/wedding-config.json</code> trên GitHub.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportConfig}
                      className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-[#710001] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải file wedding-config.json</span>
                    </button>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="text-xs font-bold text-neutral-800 block">
                      2. Nhập file cấu hình từ máy tính
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Khôi phục nhanh cấu hình từ tệp JSON đã lưu trước đó. Sau khi chọn tệp, nội dung sẽ được nạp vào trang quản trị để bạn kiểm tra trước khi bấm &quot;Lưu Thay Đổi&quot;.
                    </p>
                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#710001] hover:bg-[#8e1012] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn file JSON để khôi phục</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleImportConfig}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 3: Lưu ý lưu trữ ảnh vĩnh viễn trên Vercel */}
              <div className="bg-amber-50/60 p-6 rounded-xl border border-amber-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#710001] flex items-center gap-2">
                  <span>💡</span> Lưu ý lưu trữ ảnh vĩnh viễn khi chạy trên Vercel &amp; GitHub
                </h4>
                <div className="text-xs text-neutral-700 leading-relaxed space-y-2">
                  <p>
                    <strong>1. Ảnh tải lên qua Admin CMS:</strong> Hệ thống đã tự động kích hoạt tính năng nén ảnh thông minh và lưu dưới dạng <em>Base64 Data URI</em> trực tiếp vào cấu hình thiệp. Ảnh này tự thân hiển thị vĩnh viễn trên mọi thiết bị và trình duyệt mà không bao giờ bị mất khi Vercel khởi động lại.
                  </p>
                  <p>
                    <strong>2. Muốn dùng kho lưu trữ CDN chuyên nghiệp (Khuyên dùng):</strong> Bạn vào trang quản lý dự án trên <strong>Vercel &gt; Storage &gt; Connect Store &gt; Blob (miễn phí)</strong> rồi bấm <em>Redeploy</em>. Mọi ảnh tải lên sau đó sẽ tự động được lưu trên CDN tốc độ cao của Vercel vĩnh viễn.
                  </p>
                  <p>
                    <strong>3. Tự động đồng bộ lên GitHub (Tùy chọn):</strong> Nếu bạn thêm biến môi trường <code className="bg-amber-100 px-1 py-0.5 rounded text-neutral-800 font-mono">GITHUB_TOKEN</code> (Personal Access Token có quyền repo) vào Vercel Settings &gt; Environment Variables, mỗi khi bạn lưu thay đổi, hệ thống sẽ tự động commit tệp cấu hình và ảnh lên GitHub!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
