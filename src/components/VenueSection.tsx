import React, { useState, useEffect } from 'react';
import { WeddingConfig } from '../types/wedding';
import { MapPin, Navigation, Calendar, Heart, ExternalLink } from 'lucide-react';

interface VenueSectionProps {
  config: WeddingConfig;
}

export const VenueSection: React.FC<VenueSectionProps> = ({ config }) => {
  const { venue, couple, countdown, calendar } = config;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    isPast: boolean;
  }>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isPast: false,
  });

  useEffect(() => {
    function updateCountdown() {
      try {
        const weddingDateTime = new Date(`${couple.weddingDate}T${couple.weddingTime || '11:30'}:00+07:00`).getTime();
        const now = Date.now();
        const diff = weddingDateTime - now;

        if (isNaN(diff) || diff <= 0) {
          setTimeLeft({
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00',
            isPast: true,
          });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
          isPast: false,
        });
      } catch {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00', isPast: false });
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [couple.weddingDate, couple.weddingTime]);

  if (!venue.enabled) return null;

  // Calendar calculations
  const weddingDate = new Date(couple.weddingDate);
  const targetYear = !isNaN(weddingDate.getTime()) ? weddingDate.getFullYear() : 2026;
  const targetMonth = !isNaN(weddingDate.getTime()) ? weddingDate.getMonth() : 11; // 0-indexed (Dec = 11)
  const targetDay = !isNaN(weddingDate.getTime()) ? weddingDate.getDate() : 26;

  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayWeekday = new Date(targetYear, targetMonth, 1).getDay();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  const emptyCells = Array.from({ length: firstDayWeekday });
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <section className="address-section relative py-16 px-4 md:px-8 bg-[#fffaf5] text-[#421212] overflow-hidden" aria-labelledby="address-title">
      <div className="petals address-petals" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="address-layout max-w-3xl mx-auto">
        {/* Couple Portrait Card */}
        <figure className="address-portrait rounded-2xl overflow-hidden shadow-lg border border-[#c79a55]/40 mb-8 max-w-md mx-auto aspect-[4/5] bg-neutral-100">
          <img
            alt={`${couple.groomDisplayName} và ${couple.brideDisplayName} trong ảnh cưới`}
            loading="lazy"
            src={venue.couplePortraitUrl || '/src/assets/images/story_wedding_prewedding_1793182916346.jpg'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/story_wedding_prewedding_1793182916346.jpg';
            }}
          />
        </figure>

        <div className="address-content text-center pt-2">
          {/* Section Heading in TAHOMA */}
          <h2 id="address-title" className="text-2xl sm:text-3xl md:text-4xl font-['Tahoma',sans-serif] font-bold text-[#710001] uppercase tracking-wide mb-4">
            {venue.heading || 'Địa Điểm Tiệc Cưới'}
          </h2>

          {/* Venue Name & Address in proper Vietnamese font */}
          <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-white border border-[#c79a55]/50 shadow-sm mb-8 text-center">
            <span className="text-xl sm:text-2xl font-['Tahoma',sans-serif] font-bold text-[#710001] block mb-2">
              {venue.venueName || 'Tư gia nhà gái'}
            </span>

            {/* Address with proper Vietnamese font */}
            <p className="text-sm sm:text-base font-['Be_Vietnam_Pro',sans-serif] font-semibold text-[#421212] flex items-center justify-center gap-2 not-italic">
              <MapPin className="w-4 h-4 text-[#710001] shrink-0" />
              <span>{venue.venueAddress || 'Ấp Việt Kiều, P. Xuân Lộc, TP. Đồng Nai'}</span>
            </p>
          </div>

          {/* Google Maps iFrame inside an elegant luxury wedding frame */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white border-2 border-[#c79a55]/60 rounded-3xl p-2.5 sm:p-3 shadow-xl overflow-hidden relative">
              {/* Header inside map frame */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#fffaf5] border-b border-[#c79a55]/30 rounded-t-2xl mb-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#710001] font-['Tahoma',sans-serif] font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Bản Đồ Chỉ Đường: Tư gia nhà gái</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-['Be_Vietnam_Pro',sans-serif] font-medium">
                  Xuân Lộc, Đồng Nai
                </span>
              </div>

              {/* Map iFrame */}
              <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#c79a55]/20 bg-neutral-100 relative">
                <iframe
                  src={venue.mapEmbedUrl || 'https://maps.google.com/maps?q=Ấp+Việt+Kiều,+Xuân+Lộc,+Đồng+Nai&t=&z=15&ie=UTF8&iwloc=&output=embed'}
                  title="Bản đồ địa điểm tiệc cưới"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Direct Directions Button */}
              {venue.directionsUrl && (
                <div className="mt-2.5 pt-2 border-t border-[#c79a55]/20 flex justify-center">
                  <a
                    href={venue.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#710001] hover:bg-[#8e1012] border border-[#e7c988] text-white text-xs font-['Tahoma',sans-serif] uppercase tracking-wider font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#e7c988]" />
                    <span>Mở Chỉ Đường Trên Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-75" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {countdown.enabled && (
          <div
            className="address-countdown my-8 rounded-2xl bg-white border border-[#c79a55]/40 shadow-sm"
            role="timer"
            aria-label={`Đếm ngược đến ngày cưới ${couple.weddingDate}`}
          >
            {timeLeft.isPast ? (
              <div className="col-span-4 text-center py-4 text-[#710001] font-['Tahoma',sans-serif] font-bold text-sm">
                {countdown.completedMessage || 'Hôn lễ đã diễn ra tràn ngập hạnh phúc!'}
              </div>
            ) : (
              <>
                <div className="countdown-item">
                  <strong className="font-['Tahoma',sans-serif] text-2xl sm:text-3xl font-bold text-[#710001]">{timeLeft.days}</strong>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-xs uppercase tracking-wider text-[#421212]/75">Ngày</span>
                </div>
                <div className="countdown-item">
                  <strong className="font-['Tahoma',sans-serif] text-2xl sm:text-3xl font-bold text-[#710001]">{timeLeft.hours}</strong>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-xs uppercase tracking-wider text-[#421212]/75">Giờ</span>
                </div>
                <div className="countdown-item">
                  <strong className="font-['Tahoma',sans-serif] text-2xl sm:text-3xl font-bold text-[#710001]">{timeLeft.minutes}</strong>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-xs uppercase tracking-wider text-[#421212]/75">Phút</span>
                </div>
                <div className="countdown-item">
                  <strong className="font-['Tahoma',sans-serif] text-2xl sm:text-3xl font-bold text-[#710001]">{timeLeft.seconds}</strong>
                  <span className="font-['Be_Vietnam_Pro',sans-serif] text-xs uppercase tracking-wider text-[#421212]/75">Giây</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Wedding Month Calendar */}
        {calendar.enabled && (
          <div className="max-w-md mx-auto my-6 p-4 rounded-2xl bg-white border border-[#c79a55]/40 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-3 text-xs font-['Tahoma',sans-serif] font-bold uppercase tracking-wider text-[#710001]">
              <Calendar className="w-4 h-4 text-[#c79a55]" />
              <span>Tháng 12 Năm 2026</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs font-['Be_Vietnam_Pro',sans-serif]">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                <div key={d} className="font-bold text-[#c79a55] py-1 text-[11px]">
                  {d}
                </div>
              ))}

              {emptyCells.map((_, i) => (
                <div key={`empty-${i}`} className="py-1" />
              ))}

              {dayNumbers.map((d) => {
                const isWeddingDay = d === targetDay;
                return (
                  <div
                    key={d}
                    className={`py-1.5 rounded-full text-xs font-medium flex items-center justify-center ${
                      isWeddingDay
                        ? 'bg-[#710001] text-white font-bold ring-2 ring-[#e7c988] shadow-md'
                        : 'text-[#421212] hover:bg-neutral-100'
                    }`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
