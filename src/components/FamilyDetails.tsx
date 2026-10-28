import React from 'react';
import { WeddingConfig } from '../types/wedding';
import { Clock, MapPin, Calendar, Heart, Sparkles } from 'lucide-react';

interface FamilyDetailsProps {
  config: WeddingConfig;
}

export const FamilyDetails: React.FC<FamilyDetailsProps> = ({ config }) => {
  const { families, couple, timeline } = config;

  if (!families.enabled) return null;

  // Split date into day, month, year
  const dateObj = new Date(couple.weddingDate);
  const day = !isNaN(dateObj.getTime()) ? String(dateObj.getDate()).padStart(2, '0') : '26';
  const month = !isNaN(dateObj.getTime()) ? `Tháng ${String(dateObj.getMonth() + 1).padStart(2, '0')}` : 'Tháng 12';
  const year = !isNaN(dateObj.getTime()) ? `Năm ${dateObj.getFullYear()}` : 'Năm 2026';

  return (
    <section className="details-section relative py-16 px-4 md:px-8 bg-[#fffaf5] text-[#421212] overflow-hidden" aria-labelledby="invitation-title">
      {/* Background traditional watermark & delicate frame */}
      <div className="absolute inset-0 bg-[radial-gradient(#c79a5520_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Main Wedding Invitation Card Surface */}
      <div className="max-w-3xl mx-auto bg-white/95 border-2 border-[#c79a55]/50 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl relative z-10 backdrop-blur-xs">
        {/* Ornate Gold Inset Border */}
        <div className="absolute inset-3 sm:inset-4 border border-[#c79a55]/30 rounded-2xl pointer-events-none" />

        {/* Top Header - Thư mời tiệc cưới */}
        <header className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-px bg-[#c79a55]"></span>
            <span className="text-[#c79a55] text-xs font-['Tahoma',sans-serif] uppercase tracking-[0.2em] font-semibold">
              Thiệp Mời Thành Hôn
            </span>
            <span className="w-8 h-px bg-[#c79a55]"></span>
          </div>

          <h2 id="invitation-title" className="text-2xl sm:text-3xl md:text-4xl font-['Tahoma',sans-serif] font-bold text-[#710001] tracking-wide uppercase mb-2">
            {families.heading || 'Thư Mời Tiệc Cưới'}
          </h2>

          <p className="text-xs sm:text-sm text-[#421212]/75 font-['Be_Vietnam_Pro',sans-serif] italic">
            {families.invitationSubtitle || 'Trân trọng kính mời'}
          </p>

          <div className="mt-3 inline-block px-5 py-1.5 rounded-full bg-[#710001]/10 border border-[#710001]/20">
            <strong className="text-base sm:text-lg font-['Tahoma',sans-serif] font-bold text-[#710001] tracking-wider">
              {families.guestName || 'QUÝ QUAN KHÁCH'}
            </strong>
          </div>
        </header>

        {/* Section 1: Thông tin lễ cưới (Nhà Trai & Nhà Gái) */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-[#c79a55] to-transparent"></span>
            <h3 className="text-lg sm:text-xl font-['Tahoma',sans-serif] font-bold text-[#710001] uppercase tracking-wider text-center">
              {families.sectionTitle || 'Thông tin lễ cưới'}
            </h3>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-[#c79a55] to-transparent"></span>
          </div>

          {/* Dual Families Grid with Full Vietnamese Font Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative">
            {/* Nhà Trai Card */}
            <article className="family-card p-5 sm:p-6 rounded-2xl bg-[#fffaf5] border border-[#c79a55]/40 text-center flex flex-col justify-between shadow-xs hover:border-[#710001]/60 transition-colors">
              <div>
                <span className="text-[11px] font-['Tahoma',sans-serif] font-bold uppercase tracking-widest text-[#c79a55] block mb-1">
                  Đại Diện
                </span>
                <h4 className="text-xl sm:text-2xl font-['Tahoma',sans-serif] font-bold text-[#710001] mb-3">
                  {families.groomFamilyHeading || 'Nhà Trai'}
                </h4>

                {/* Parents Names - High-quality Vietnamese typography */}
                <div className="space-y-1 mb-4 font-['Be_Vietnam_Pro',sans-serif]">
                  {families.groomParents && families.groomParents.map((parent, idx) => (
                    <p key={idx} className="text-sm sm:text-base font-semibold text-[#421212]">
                      {parent}
                    </p>
                  ))}
                </div>
              </div>

              {/* Address with MapPin Icon */}
              <address className="not-italic text-xs text-[#421212]/80 font-['Be_Vietnam_Pro',sans-serif] pt-3 border-t border-[#c79a55]/25 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#710001] shrink-0" />
                <span>
                  {families.groomAddress?.split('\n').join(' - ')}
                </span>
              </address>
            </article>

            {/* Central Double Happiness Seal 囍 */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#710001] text-[#e7c988] items-center justify-center text-sm font-bold shadow-lg border-2 border-[#e7c988] z-10 pointer-events-none">
              囍
            </div>

            {/* Nhà Gái Card */}
            <article className="family-card p-5 sm:p-6 rounded-2xl bg-[#fffaf5] border border-[#c79a55]/40 text-center flex flex-col justify-between shadow-xs hover:border-[#710001]/60 transition-colors">
              <div>
                <span className="text-[11px] font-['Tahoma',sans-serif] font-bold uppercase tracking-widest text-[#c79a55] block mb-1">
                  Đại Diện
                </span>
                <h4 className="text-xl sm:text-2xl font-['Tahoma',sans-serif] font-bold text-[#710001] mb-3">
                  {families.brideFamilyHeading || 'Nhà Gái'}
                </h4>

                {/* Parents Names - High-quality Vietnamese typography */}
                <div className="space-y-1 mb-4 font-['Be_Vietnam_Pro',sans-serif]">
                  {families.brideParents && families.brideParents.map((parent, idx) => (
                    <p key={idx} className="text-sm sm:text-base font-semibold text-[#421212]">
                      {parent}
                    </p>
                  ))}
                </div>
              </div>

              {/* Address with MapPin Icon */}
              <address className="not-italic text-xs text-[#421212]/80 font-['Be_Vietnam_Pro',sans-serif] pt-3 border-t border-[#c79a55]/25 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#710001] shrink-0" />
                <span>
                  {families.brideAddress?.split('\n').join(' - ')}
                </span>
              </address>
            </article>
          </div>
        </div>

        {/* Couple Names Banner */}
        <div className="py-4 my-6 text-center border-y border-[#c79a55]/30 bg-[#fffdfa] rounded-xl flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          <span className="text-xl sm:text-2xl font-['Tahoma',sans-serif] font-bold text-[#710001]">
            {couple.groomFullName}
          </span>
          <span className="w-8 h-8 rounded-full bg-[#710001]/10 text-[#710001] flex items-center justify-center text-sm font-serif italic font-bold">
            &amp;
          </span>
          <span className="text-xl sm:text-2xl font-['Tahoma',sans-serif] font-bold text-[#710001]">
            {couple.brideFullName}
          </span>
        </div>

        {/* Decorative Divider between Families & Lễ Tân Hôn (as requested: "Background và cách điệu giữa phần này với phần Lễ tân hôn cho đẹp hơn") */}
        <div className="relative my-10 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#c79a55]/40 border-dashed"></div>
          </div>
          <div className="relative px-6 py-2 bg-white border border-[#c79a55] rounded-full text-[#710001] flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#c79a55]" />
            <span className="text-xs font-['Tahoma',sans-serif] font-bold uppercase tracking-wider text-[#710001]">
              Trăm Năm Tình Viên Mãn
            </span>
            <Sparkles className="w-4 h-4 text-[#c79a55]" />
          </div>
        </div>

        {/* Section 2: LỄ TÂN HÔN (With Tahoma title & proper Vietnamese fonts for 'Thứ 7 \n Vào lúc 11:30') */}
        <div className="wedding-schedule-container text-center bg-gradient-to-b from-[#fffaf5] to-white p-6 sm:p-8 rounded-2xl border border-[#c79a55]/40 shadow-sm">
          <span className="text-xs uppercase tracking-[0.25em] text-[#c79a55] font-['Tahoma',sans-serif] font-bold block mb-1">
            Hôn Lễ Trọng Đại
          </span>

          {/* Ceremony Title in Tahoma */}
          <h3 className="text-2xl sm:text-3xl font-['Tahoma',sans-serif] font-bold text-[#710001] uppercase tracking-wide mb-4">
            {families.ceremonyTitle || 'Lễ Tân Hôn'}
          </h3>

          {/* Day & Time formatted in proper Vietnamese typography */}
          <div className="inline-flex flex-col items-center justify-center gap-1.5 px-8 py-3 rounded-2xl bg-[#710001]/5 border border-[#710001]/15 mb-6">
            <span className="text-lg sm:text-xl font-['Tahoma',sans-serif] font-bold text-[#710001] tracking-wide">
              {families.dayOfWeek || 'Thứ 7'}
            </span>
            <span className="text-base sm:text-lg font-['Be_Vietnam_Pro',sans-serif] font-semibold text-[#421212] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c79a55]" />
              {families.timeDescription || 'Vào lúc 11:30'}
            </span>
          </div>

          {/* Calendar Day Highlight */}
          <div className="grid grid-cols-3 items-center max-w-xs mx-auto py-3 px-4 border-y border-[#c79a55]/40 font-['Be_Vietnam_Pro',sans-serif] text-sm font-bold text-[#710001]">
            <span>{month}</span>
            <span className="text-4xl sm:text-5xl font-['Tahoma',sans-serif] font-bold text-[#710001] px-2">
              {day}
            </span>
            <span>{year}</span>
          </div>

          {/* Lunar Date */}
          {families.lunarDate && (
            <p className="mt-3 text-xs sm:text-sm text-[#421212]/80 font-['Be_Vietnam_Pro',sans-serif] italic">
              {families.lunarDate}
            </p>
          )}

          {/* Section 3: Lịch trình tiệc cưới (Timeline with requested text: "Đón tiếp quan khách và chụp ảnh lưu niệm cùng cô dâu chú rể") */}
          {timeline.enabled && timeline.events && timeline.events.length > 0 && (
            <div className="mt-10 pt-8 border-t border-[#c79a55]/30">
              <h4 className="text-lg sm:text-xl font-['Tahoma',sans-serif] font-bold text-[#710001] uppercase tracking-wider mb-6">
                {timeline.title || 'Lịch Trình Tiệc Cưới'}
              </h4>

              <div className="max-w-md mx-auto space-y-4 text-left">
                {timeline.events
                  .filter((ev) => ev.enabled)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[#c79a55]/30 shadow-2xs hover:border-[#710001]/50 transition-colors"
                    >
                      <div className="px-2.5 py-1 rounded-lg bg-[#710001]/10 text-[#710001] font-['Tahoma',sans-serif] text-xs font-bold whitespace-nowrap shrink-0 mt-0.5">
                        {event.time}
                      </div>

                      <div className="min-w-0">
                        <strong className="block text-sm font-['Tahoma',sans-serif] font-bold text-[#421212] mb-0.5">
                          {event.title}
                        </strong>
                        {event.description && (
                          <p className="text-xs text-[#421212]/85 font-['Be_Vietnam_Pro',sans-serif] leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
