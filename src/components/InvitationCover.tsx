import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { WeddingConfig } from '../types/wedding';
import { MailOpen, Sparkles, Heart } from 'lucide-react';

interface InvitationCoverProps {
  config: WeddingConfig;
  isOpen: boolean;
  onOpen: () => void;
}

type OpeningStage = 'idle' | 'unsealing' | 'opening' | 'finished';

export const InvitationCover: React.FC<InvitationCoverProps> = ({ config, isOpen, onOpen }) => {
  const { cover, couple } = config;
  const [stage, setStage] = useState<OpeningStage>('idle');

  if (!cover.enabled && isOpen) {
    return null;
  }

  // Pháo hoa kim tuyến và cánh hoa mừng ngày vui
  const triggerWeddingConfetti = () => {
    // 1. Pháo hoa bung từ tâm con dấu sáp
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.48, x: 0.5 },
      colors: ['#c79a55', '#e7c988', '#fff0e7', '#8e1012', '#a3181a', '#f43f5e'],
      scalar: 1.1,
      ticks: 200,
    });

    // 2. Hai chùm kim tuyến bắn từ hai góc màn hình
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.08, y: 0.72 },
        colors: ['#c79a55', '#e7c988', '#fff0e7', '#710001'],
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.92, y: 0.72 },
        colors: ['#c79a55', '#e7c988', '#fff0e7', '#710001'],
      });
    }, 200);
  };

  // Kích hoạt chuỗi hiệu ứng mở thiệp
  const handleStartOpening = () => {
    if (stage !== 'idle') return;

    // Giai đoạn 1: Bấm nút -> Phá niêm phong sáp, bắn pháo hoa
    setStage('unsealing');
    triggerWeddingConfetti();

    // Giai đoạn 2: Nắp phong bì mở và thiệp trượt mở 3D
    setTimeout(() => {
      setStage('opening');
    }, 320);

    // Giai đoạn 3: Hoàn tất chuyển cảnh và bật nhạc vào trang chính
    setTimeout(() => {
      setStage('finished');
      onOpen();
    }, 1000);
  };

  const formattedDate = couple.weddingDate
    ? new Date(couple.weddingDate)
        .toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '.')
    : '26.12.2026';

  const isAnimating = stage !== 'idle';

  return (
    <div
      className={`cover-screen fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden transition-all duration-900 ${
        stage === 'finished' || isOpen
          ? 'opacity-0 pointer-events-none scale-105 invisible'
          : 'opacity-100 pointer-events-auto scale-100 visible'
      }`}
      aria-label="Màn hình thiệp mời cưới"
    >
      {/* 1. Mưa biểu tượng chữ Hỷ & bụi vàng bồng bềnh nền */}
      <div className="cover-happiness-field pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
      </div>

      {/* 2. KHUNG PHONG BÌ & TẤM THIỆP MỜI HOÀNG GIA CHỜ ĐƯỢC MỞ */}
      <div
        className={`relative w-full max-w-[760px] min-h-[500px] sm:min-h-[540px] rounded-2xl shadow-[0_30px_90px_rgba(12,0,0,0.85)] flex flex-col items-center justify-center transition-all duration-800 ${
          stage === 'opening'
            ? 'scale-105 -translate-y-4 opacity-0 pointer-events-none'
            : stage === 'unsealing'
            ? 'scale-[1.02]'
            : 'scale-100 hover:scale-[1.008]'
        }`}
        style={{
          background: 'linear-gradient(135deg, #fffaf6 0%, #fff0e7 100%)',
          perspective: '1200px',
        }}
      >
        {/* Nắp phong bì trang trí phía trên (Top Flap Accent) */}
        <div
          className={`absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-[#710001] to-[#8c080b] rounded-t-2xl border-b-2 border-[#e7c988] shadow-md flex items-center justify-center overflow-hidden transition-transform duration-700 origin-top ${
            stage === 'opening' ? '-rotate-x-90 opacity-0' : 'rotate-x-0'
          }`}
        >
          {/* Họa tiết viền vàng trên nắp phong bì */}
          <div className="absolute inset-x-4 top-2 h-[1px] bg-[#e7c988]/40" />
          <div className="absolute inset-x-8 top-3 h-[1px] bg-[#e7c988]/20" />
          <span className="text-[#fce8c5]/80 text-[11px] sm:text-xs font-['Tahoma',sans-serif] uppercase tracking-[0.3em] font-semibold">
            ✦ WEDDING INVITATION ✦
          </span>
        </div>

        {/* Viền chỉ kép vàng hoàng gia & đỏ rượu quanh thiệp */}
        <div className="absolute inset-3.5 border border-[#710001]/25 rounded-xl pointer-events-none" />
        <div className="absolute inset-5 border border-[#c79a55]/45 rounded-lg pointer-events-none" />

        {/* Họa tiết Long Phụng chìm truyền thống */}
        <img
          className="absolute inset-6 w-[88%] h-[88%] object-contain opacity-12 pointer-events-none mix-blend-multiply m-auto"
          alt=""
          aria-hidden="true"
          src={cover.dragonPhoenixUrl || '/assets/dragon-phoenix-lRLuYHBg.png'}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* 3. CON DẤU SÁP SONG HỶ (囍) Ở VỊ TRÍ NIÊM PHONG */}
        <div
          onClick={handleStartOpening}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStartOpening();
            }
          }}
          title="Nhấn vào đây hoặc nút bên dưới để mở thiệp"
          className={`absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-30 cursor-pointer select-none transition-all duration-400 ${
            stage === 'unsealing'
              ? 'scale-125 rotate-6'
              : stage === 'opening'
              ? 'scale-150 opacity-0'
              : ''
          }`}
        >
          {/* Vòng sóng năng lượng vàng khi phá niêm phong */}
          {stage === 'unsealing' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-[#e7c988] animate-shockwave pointer-events-none" />
          )}

          {/* Thân con dấu sáp đỏ viền vàng */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#5a0001] via-[#8c080b] to-[#b81b1e] border-3 border-[#e7c988] shadow-[0_10px_28px_rgba(77,0,0,0.55)] flex items-center justify-center text-[#fff0e7] group animate-seal-breath">
            <div className="absolute inset-1 rounded-full border border-[#f3dcb1]/70 pointer-events-none" />
            <span className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#fce8c5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
              {cover.sealText || '囍'}
            </span>
          </div>
        </div>

        {/* 4. NỘI DUNG TẤM THIỆP MỜI TRANG TRỌNG */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 sm:px-12 pt-28 sm:pt-34 pb-8 max-w-xl mx-auto w-full">
          {/* Tiêu đề loại lễ */}
          <p className="text-[11px] sm:text-xs font-['Tahoma',sans-serif] uppercase tracking-[0.28em] font-semibold text-[#710001] mb-2">
            {cover.invitationLabel || 'Thiệp Mời Lễ Thành Hôn'}
          </p>

          {/* Tên Chú Rể & Cô Dâu */}
          <h1 className="font-['Dancing_Script',cursive] text-4xl sm:text-6xl font-bold text-[#710001] tracking-tight my-1 flex items-center justify-center gap-2.5 sm:gap-4">
            <span className="whitespace-nowrap">{couple.groomDisplayName}</span>
            <span className="text-[#c79a55] font-['Playfair_Display',serif] text-2xl sm:text-3xl font-normal">&amp;</span>
            <span className="whitespace-nowrap">{couple.brideDisplayName}</span>
          </h1>

          {/* Thời gian & Ngày cưới */}
          <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#710001]/10 border border-[#c79a55]/40 text-[#710001] text-xs sm:text-sm font-['Playfair_Display',serif] font-bold">
            <span>{couple.weddingTime || '11:30'}</span>
            <span className="text-[#c79a55]">✦</span>
            <span>{formattedDate}</span>
          </div>

          {/* Kính mời quan khách */}
          <div className="mt-4 sm:mt-5 flex flex-col items-center gap-1.5">
            <span className="text-[10px] sm:text-xs font-['Tahoma',sans-serif] uppercase tracking-widest text-[#710001]/75 font-semibold">
              Kính Mời
            </span>
            <strong className="px-6 py-2 rounded-2xl bg-[#f5ded5] text-[#760607] text-base sm:text-lg font-serif font-bold shadow-2xs border border-[#c79a55]/40">
              {cover.guestGreeting || 'QUÝ QUAN KHÁCH'}
            </strong>
          </div>

          {/* Lời nhắn mời cưới */}
          <p className="mt-3 text-xs sm:text-sm text-[#421212]/80 font-['Be_Vietnam_Pro',sans-serif] italic max-w-md">
            {cover.invitationMessage || 'Đến dự buổi tiệc chung vui cùng gia đình chúng tôi'}
          </p>

          {/* 5. NÚT "MỞ THIỆP" NỔI BẬT NHẤT Ở MẶT TIỀN (CHẠM ĐỂ MỞ) */}
          <button
            type="button"
            onClick={handleStartOpening}
            disabled={isAnimating}
            className="mt-6 sm:mt-7 group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#710001] via-[#941417] to-[#710001] hover:from-[#8e1012] hover:to-[#a81a1d] border-2 border-[#e7c988] text-[#fff0e7] text-xs sm:text-sm font-['Tahoma',sans-serif] font-bold tracking-wider uppercase cursor-pointer shadow-[0_12px_30px_rgba(113,0,1,0.45)] hover:shadow-[0_16px_38px_rgba(113,0,1,0.6)] transition-all active:scale-95 overflow-hidden flex items-center justify-center gap-3 animate-pulse-glow"
          >
            {/* Vệt sáng quét ngang (Shimmer Sweep) */}
            <div className="absolute inset-0 -top-4 w-12 h-24 bg-white/25 blur-xs animate-shimmer-sweep pointer-events-none" />

            <MailOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5d799] group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-widest">
              {isAnimating ? 'Đang Mở Thiệp...' : (cover.coverButtonText || 'Mở Thiệp')}
            </span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5d799] group-hover:rotate-12 transition-transform" />
          </button>

          {/* Gợi ý nhẹ */}
          <p className="mt-2 text-[10px] text-[#710001]/60 font-['Be_Vietnam_Pro',sans-serif] tracking-wider uppercase">
            Chạm vào con dấu hoặc nhấn Mở Thiệp để xem
          </p>
        </div>
      </div>
    </div>
  );
};
