import React, { useState } from 'react';
import { WeddingConfig } from '../types/wedding';
import { Copy, Check, QrCode, Gift, Sparkles, Heart } from 'lucide-react';

interface BankingSectionProps {
  config: WeddingConfig;
}

export const BankingSection: React.FC<BankingSectionProps> = ({ config }) => {
  const { banking, couple } = config;
  const [copied, setCopied] = useState(false);

  if (!banking || !banking.enabled) return null;

  // As requested by user: "1 Mã QR thôi." (Only 1 QR code!)
  const account = banking.groom || banking.bride;
  const bankName = account.bankName || 'Vietcombank';
  const accountNumber = account.accountNumber || '1029384756';
  const accountHolder = account.accountHolder || couple.groomFullName || 'VĂN HÙNG PHÁT';
  const qrUrl = account.qrImageUrl || `https://img.vietqr.io/image/VCB-${accountNumber}-compact2.png?amount=0&addInfo=Mung%20Cuoi%20Hung%20Phat%20Anh%20Nhi&accountName=${encodeURIComponent(accountHolder)}`;

  const copyToClipboard = () => {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="banking-section relative py-16 px-4 md:px-8 bg-[#220505] text-[#fff0e7] overflow-hidden border-t border-[#c79a55]/30">
      {/* Background glow & subtle patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#531515]/70 via-[#220505] to-[#120202] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Decorative wedding seal */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#710001] border-2 border-[#e7c988] text-[#e7c988] mb-3 shadow-xl">
          <Gift className="w-5 h-5" />
        </div>

        {/* Title in TAHOMA font */}
        <h2 className="text-2xl sm:text-3xl font-['Tahoma',sans-serif] font-bold text-[#e7c988] tracking-wide mb-2 uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c79a55]" />
          <span>{banking.title || 'Hộp Mừng Cưới & Chúc Phúc'}</span>
          <Sparkles className="w-4 h-4 text-[#c79a55]" />
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#f4ded0]/85 max-w-lg mx-auto mb-10 leading-relaxed font-['Be_Vietnam_Pro',sans-serif] font-light">
          {banking.subtitle ||
            'Sự hiện diện của bạn là niềm vinh hạnh của chúng mình. Nếu không thể đến chung vui, bạn có thể gửi quà mừng chúc phúc qua tài khoản bên dưới:'}
        </p>

        {/* 1 Single QR Card (As specifically requested: "1 Mã QR thôi.") */}
        <div className="bg-[#2e0909]/95 border-2 border-[#c79a55]/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md max-w-md mx-auto hover:border-[#e7c988] transition-all duration-300">
          {/* Top golden ribbon */}
          <div className="flex items-center justify-center gap-2 mb-4 text-[#e7c988] text-xs font-['Tahoma',sans-serif] uppercase font-bold tracking-widest">
            <Heart className="w-3.5 h-3.5 fill-current text-[#e7c988]" />
            <span>Mừng Cưới Đôi Uyên Ương</span>
            <Heart className="w-3.5 h-3.5 fill-current text-[#e7c988]" />
          </div>

          {/* 1 QR Code Image */}
          <div className="w-56 h-56 mx-auto mb-6 p-3 bg-white rounded-2xl shadow-xl border-2 border-[#c79a55]/40 flex items-center justify-center relative group">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Mã QR Mừng Cưới"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to VietQR default
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STK:${accountNumber}+${bankName}`;
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400">
                <QrCode className="w-12 h-12 mb-2 text-[#710001]" />
                <span className="text-xs">Mã QR VietQR</span>
              </div>
            )}
          </div>

          {/* Bank Account Details in Clean Typography */}
          <div className="space-y-2.5 text-xs text-left bg-[#1f0505]/90 p-4 rounded-xl border border-[#c79a55]/30 mb-5 font-['Be_Vietnam_Pro',sans-serif]">
            <div className="flex justify-between items-center">
              <span className="text-[#f4ded0]/60">Ngân hàng:</span>
              <strong className="text-white font-['Tahoma',sans-serif] font-bold text-sm">{bankName}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#f4ded0]/60">Chủ tài khoản:</span>
              <strong className="text-[#e7c988] uppercase font-['Tahoma',sans-serif] font-bold">{accountHolder}</strong>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-[#f4ded0]/60">Số tài khoản:</span>
              <strong className="text-white font-mono text-base tracking-wider font-bold">
                {accountNumber}
              </strong>
            </div>
          </div>

          {/* Copy Account Button */}
          <button
            type="button"
            onClick={copyToClipboard}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#710001] to-[#8e1012] hover:from-[#8e1012] hover:to-[#a3181a] border border-[#e7c988] text-[#fff0e7] text-xs font-['Tahoma',sans-serif] font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-lg"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Đã sao chép số tài khoản thành công!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#e7c988]" />
                <span>Sao chép số tài khoản</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
