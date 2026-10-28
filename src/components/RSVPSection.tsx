import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { WeddingConfig } from '../types/wedding';
import { Check, Heart, UserCheck, UserX, Calendar, MapPin, Sparkles, Send, MessageCircle } from 'lucide-react';

interface RSVPSectionProps {
  config: WeddingConfig;
}

const QUICK_WISHES = [
  'Trăm năm hạnh phúc! ❤️',
  'Chúc hai bạn mãi mãi bên nhau!',
  'Tình yêu luôn đong đầy & viên mãn!',
  'Sớm có quý tử nha!',
  'Chúc đôi tân lang tân nương đầu bạc răng long!',
];

export const RSVPSection: React.FC<RSVPSectionProps> = ({ config }) => {
  const { rsvp, couple, families, venue } = config;
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<'attending' | 'not_attending'>('attending');
  const [guestCount, setGuestCount] = useState(1);
  const [side, setSide] = useState<'groom' | 'bride' | 'mutual'>('mutual');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!rsvp.enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          phone: phone.trim(),
          attending,
          guestCount: attending === 'attending' ? guestCount : 0,
          side,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi xác nhận.');
      }

      setSuccessMessage(data.message || 'Cảm ơn bạn đã phản hồi!');

      if (attending === 'attending') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#710001', '#c79a55', '#e7c988', '#fff0e7', '#f43f5e'],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối máy chủ.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Đám Cưới ${couple.groomDisplayName} & ${couple.brideDisplayName}`);
    const details = encodeURIComponent(`Lễ thành hôn & tiệc mừng của ${couple.groomFullName} và ${couple.brideFullName}`);
    const location = encodeURIComponent(`${families.groomAddress || 'Xuân Lộc, Đồng Nai'}`);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=20261226T043000Z/20261226T080000Z`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <section className="response-section relative py-20 px-4 md:px-8 bg-[#240606] text-[#fff0e7] overflow-hidden border-t border-[#c79a55]/30" aria-labelledby="response-title">
      {/* Decorative backdrop glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4a1212]/80 via-[#240606] to-[#140202] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header with TAHOMA Title */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-2 text-[#e7c988] text-xs font-['Tahoma',sans-serif] uppercase tracking-[0.25em] font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>R.S.V.P</span>
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>

          <h2 id="response-title" className="text-2xl sm:text-3xl md:text-4xl font-['Tahoma',sans-serif] font-bold text-[#e7c988] tracking-wide uppercase mb-3">
            {rsvp.title || 'Xác Nhận Tham Dự'}
          </h2>

          <p className="text-xs sm:text-sm text-[#f4ded0]/85 max-w-xl mx-auto leading-relaxed font-['Be_Vietnam_Pro',sans-serif] font-light">
            {rsvp.description ||
              'Sự hiện diện của Quý khách là niềm vinh hạnh to lớn cho gia đình chúng tôi. Xin vui lòng gửi phản hồi để gia đình chuẩn bị đón tiếp chu đáo nhất!'}
          </p>
        </header>

        {/* Rich Two-Column Wedding RSVP Grid (No longer empty!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Wedding Etiquette & Information Card */}
          <div className="lg:col-span-5 bg-[#2f0909]/90 border border-[#c79a55]/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm relative overflow-hidden">
            {/* Top Badge */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#e7c988] text-xs font-['Tahoma',sans-serif] uppercase font-bold tracking-wider">
                <Sparkles className="w-4 h-4 text-[#e7c988]" />
                <span>Thông Tin Chung Vui</span>
              </div>

              {/* Romantic couple photo frame */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#c79a55]/40 shadow-inner relative group">
                <img
                  src="/src/assets/images/hero_wedding_couple_1793182915577.jpg"
                  alt="Cô dâu chú rể"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white text-xs font-['Be_Vietnam_Pro',sans-serif]">
                    <p className="font-['Tahoma',sans-serif] font-bold text-sm text-[#e7c988]">
                      {couple.groomDisplayName} &amp; {couple.brideDisplayName}
                    </p>
                    <p className="opacity-80">Rất hân hạnh được đón tiếp Quý khách</p>
                  </div>
                </div>
              </div>

              {/* Lời Cảm Ơn Từ Cô Dâu & Chú Rể */}
              <div className="bg-[#1f0505]/85 border border-[#c79a55]/40 rounded-2xl p-4.5 mb-5 text-left relative overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-3.5 h-3.5 text-[#e7c988] fill-current" />
                  <span className="text-[11px] font-['Tahoma',sans-serif] font-bold text-[#e7c988] uppercase tracking-wider">
                    {rsvp.thankYouTitle || 'Lời Cảm Ơn Từ Cô Dâu & Chú Rể'}
                  </span>
                </div>
                <p className="text-xs text-[#f4ded0]/90 font-['Be_Vietnam_Pro',sans-serif] leading-relaxed italic mb-3 whitespace-pre-line">
                  {rsvp.thankYouMessage ||
                    '“Cảm ơn bạn đã luôn là một phần thật đẹp trong chặng đường trưởng thành và tình yêu của chúng mình. Sự hiện diện và lời chúc phúc của bạn trong ngày trọng đại hôm nay chính là món quà ý nghĩa nhất. Chúng mình rất mong được cùng bạn sẻ chia và lưu giữ những khoảnh khắc hạnh phúc trọn vẹn này!”'}
                </p>
                <div className="flex justify-end items-center gap-1.5 text-[11px] font-['Tahoma',sans-serif] font-bold text-[#e7c988]">
                  <span>Thân thương,</span>
                  <span className="text-white">{couple.groomDisplayName} &amp; {couple.brideDisplayName}</span>
                  <Heart className="w-3 h-3 text-red-400 fill-current" />
                </div>
              </div>

              {/* Useful Details */}
              <div className="space-y-2 text-xs text-[#f4ded0]/85 font-['Be_Vietnam_Pro',sans-serif] text-left">
                {(rsvp.notes && rsvp.notes.length > 0
                  ? rsvp.notes
                  : [
                      'Bãi đỗ xe ô tô & xe máy an ninh, miễn phí tại tư gia',
                      'Photobooth chụp ảnh mở cửa từ 11:00 đón tiếp quan khách',
                    ]
                ).map((note, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e7c988] shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-6 mt-6 border-t border-[#c79a55]/30 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#710001] hover:bg-[#8e1012] border border-[#e7c988] text-white text-xs font-['Tahoma',sans-serif] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#e7c988]" />
                <span>Thêm Vào Lịch</span>
              </button>

              <a
                href={venue.directionsUrl || 'https://maps.google.com'}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#1f0505] hover:bg-[#2d0707] border border-[#c79a55]/60 text-[#e7c988] text-xs font-['Tahoma',sans-serif] font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#e7c988]" />
                <span>Xem Bản Đồ</span>
              </a>
            </div>
          </div>

          {/* Right Column: Direct RSVP Form */}
          <div className="lg:col-span-7 bg-[#2f0909]/95 border-2 border-[#c79a55]/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative flex flex-col justify-between">
            {successMessage ? (
              <div className="py-12 text-center flex flex-col items-center justify-center flex-1">
                <div className="w-16 h-16 rounded-full bg-[#710001] border-2 border-[#e7c988] text-[#e7c988] flex items-center justify-center text-2xl font-bold mb-4 shadow-xl">
                  囍
                </div>
                <h3 className="text-xl sm:text-2xl font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-2 uppercase">
                  Gửi Phản Hồi Thành Công!
                </h3>
                <p className="text-sm text-[#f4ded0]/90 max-w-md font-['Be_Vietnam_Pro',sans-serif] leading-relaxed mb-6">
                  {successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage(null);
                    setGuestName('');
                    setPhone('');
                    setMessage('');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#710001] border border-[#e7c988] text-white text-xs font-['Tahoma',sans-serif] font-bold hover:bg-[#8e1012] transition-colors"
                >
                  Gửi Phản Hồi Khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-[#c79a55]/30">
                  <span className="text-xs font-['Tahoma',sans-serif] uppercase font-bold text-[#e7c988] tracking-wider">
                    Phiếu Phản Hồi Tham Dự
                  </span>
                  <span className="text-[11px] text-[#f4ded0]/60 font-['Be_Vietnam_Pro',sans-serif] italic">
                    * Vui lòng điền thông tin
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                    {error}
                  </div>
                )}

                {/* Attending Selection */}
                <div>
                  <label className="block text-xs font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-2">
                    Bạn sẽ đến chung vui chứ?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending('attending')}
                      className={`p-3 rounded-xl border text-xs font-['Tahoma',sans-serif] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        attending === 'attending'
                          ? 'bg-[#710001] border-[#e7c988] text-white shadow-md'
                          : 'bg-[#1f0505]/70 border-[#c79a55]/30 text-[#f4ded0]/70 hover:border-[#c79a55]'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Có, tôi sẽ tham dự</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttending('not_attending')}
                      className={`p-3 rounded-xl border text-xs font-['Tahoma',sans-serif] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        attending === 'not_attending'
                          ? 'bg-[#710001] border-[#e7c988] text-white shadow-md'
                          : 'bg-[#1f0505]/70 border-[#c79a55]/30 text-[#f4ded0]/70 hover:border-[#c79a55]'
                      }`}
                    >
                      <UserX className="w-4 h-4 text-red-400" />
                      <span>Rất tiếc, tôi vắng mặt</span>
                    </button>
                  </div>
                </div>

                {/* Name & Phone Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-1.5">
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f0505] border border-[#c79a55]/40 text-white placeholder-[#f4ded0]/40 text-xs focus:outline-none focus:border-[#e7c988] font-['Be_Vietnam_Pro',sans-serif]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0912 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f0505] border border-[#c79a55]/40 text-white placeholder-[#f4ded0]/40 text-xs focus:outline-none focus:border-[#e7c988] font-mono"
                    />
                  </div>
                </div>

                {attending === 'attending' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Side */}
                    <div>
                      <label className="block text-xs font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-1.5">
                        Khách mời của ai?
                      </label>
                      <select
                        value={side}
                        onChange={(e) => setSide(e.target.value as 'groom' | 'bride' | 'mutual')}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f0505] border border-[#c79a55]/40 text-white text-xs focus:outline-none focus:border-[#e7c988] font-['Be_Vietnam_Pro',sans-serif]"
                      >
                        <option value="groom">Nhà Trai (Ấp Lò Than)</option>
                        <option value="bride">Nhà Gái (Ấp Việt Kiều)</option>
                        <option value="mutual">Bạn chung của cả hai</option>
                      </select>
                    </div>

                    {/* Guest Count */}
                    <div>
                      <label className="block text-xs font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-1.5">
                        Số lượng người tham dự
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f0505] border border-[#c79a55]/40 text-white text-xs focus:outline-none focus:border-[#e7c988] font-['Be_Vietnam_Pro',sans-serif]"
                      >
                        <option value={1}>Tôi tham dự 1 mình</option>
                        <option value={2}>Đi cùng người thương (+1)</option>
                        <option value={3}>Đi cùng gia đình (3 người)</option>
                        <option value={4}>Đi cùng gia đình (4 người trở lên)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Wishes textarea & quick suggestions */}
                <div>
                  <label className="block text-xs font-['Tahoma',sans-serif] font-bold text-[#e7c988] mb-1.5">
                    Lời chúc gửi tới đôi uyên ương
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Gửi gắm lời chúc ngọt ngào nhất tới cô dâu & chú rể..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f0505] border border-[#c79a55]/40 text-white placeholder-[#f4ded0]/40 text-xs focus:outline-none focus:border-[#e7c988] font-['Be_Vietnam_Pro',sans-serif] resize-none"
                  />

                  {/* Quick wish buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_WISHES.map((w, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMessage(w)}
                        className="px-2.5 py-1 rounded-full bg-[#1f0505] border border-[#c79a55]/30 hover:border-[#e7c988] text-[11px] text-[#f4ded0]/80 transition-colors"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#710001] via-[#8e1012] to-[#710001] hover:from-[#8e1012] hover:to-[#a3181a] border-2 border-[#e7c988] text-white text-xs font-['Tahoma',sans-serif] font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang gửi phản hồi...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#e7c988]" />
                      <span>Gửi Xác Nhận Tham Dự</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
