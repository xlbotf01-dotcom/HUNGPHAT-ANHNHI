import React, { useState } from 'react';
import { WeddingConfig } from '../types/wedding';
import { Heart, Sparkles, Calendar, Maximize2, X, ZoomIn } from 'lucide-react';

interface LoveStorySectionProps {
  config: WeddingConfig;
}

export const LoveStorySection: React.FC<LoveStorySectionProps> = ({ config }) => {
  const { loveStory } = config;
  const [selectedPhoto, setSelectedPhoto] = useState<{
    imageUrl: string;
    title: string;
    year: string;
    description: string;
  } | null>(null);

  if (!loveStory || !loveStory.enabled || !loveStory.items || loveStory.items.length === 0) {
    return null;
  }

  return (
    <section className="love-story-section relative py-16 px-4 md:px-8 bg-[#fffaf6] text-[#421212] overflow-hidden border-t border-b border-[#c79a55]/30">
      {/* Decorative floral watermark backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#c79a5518_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Ribbon Kicker */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-10 h-px bg-[#c79a55]"></span>
          <span className="text-[#710001] text-xs uppercase tracking-[0.25em] font-semibold flex items-center gap-1.5 font-['Tahoma',sans-serif]">
            <Heart className="w-3.5 h-3.5 fill-current text-[#710001]" />
            Hành Trình Yêu Thương
          </span>
          <span className="w-10 h-px bg-[#c79a55]"></span>
        </div>

        {/* Title in TAHOMA font as specifically requested */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-['Tahoma',sans-serif] font-bold text-[#710001] mb-3 tracking-wide uppercase">
          {loveStory.title || 'Câu Chuyện Tình Yêu'}
        </h2>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-[#421212]/80 max-w-lg mx-auto mb-12 font-['Be_Vietnam_Pro',sans-serif] italic">
          {loveStory.subtitle || 'Hành trình từ hai người xa lạ đến ngày chung một mái nhà.'}
        </p>

        {/* Story Grid Cards - Elegant Wedding Album Portrait Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {loveStory.items.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => {
                if (item.imageUrl) {
                  setSelectedPhoto({
                    imageUrl: item.imageUrl,
                    title: item.title,
                    year: item.year,
                    description: item.description,
                  });
                }
              }}
              className="bg-white/90 border border-[#c79a55]/40 hover:border-[#710001]/80 rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between cursor-pointer relative"
            >
              <div>
                {/* Portrait Image (Taller / Longer aspect ratio as requested: 3:4 portrait) */}
                {item.imageUrl && (
                  <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3.5 bg-neutral-100 border border-[#c79a55]/30 relative shadow-inner">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    
                    {/* Hover Zoom Overlay Icon */}
                    <div className="absolute inset-0 bg-[#710001]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-[#710001] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Elegant year stamp badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#710001]/85 text-[#fff0e7] text-[11px] font-['Tahoma',sans-serif] font-bold shadow-md backdrop-blur-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#e7c988]" />
                      <span>{item.year}</span>
                    </div>
                  </div>
                )}

                {/* Milestone Title */}
                <h3 className="text-base font-['Tahoma',sans-serif] font-bold text-[#710001] mb-1.5 group-hover:text-[#991b1b] transition-colors">
                  {item.title}
                </h3>

                {/* Milestone Description */}
                <p className="text-xs text-[#421212]/85 leading-relaxed font-['Be_Vietnam_Pro',sans-serif] font-light">
                  {item.description}
                </p>
              </div>

              {/* Bottom decorative hint */}
              <div className="mt-3 pt-2.5 border-t border-[#c79a55]/20 flex items-center justify-between text-[11px] text-[#c79a55]">
                <span className="font-['Be_Vietnam_Pro',sans-serif] text-[10px] opacity-75 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[#710001]">
                  <Maximize2 className="w-3 h-3" />
                  Nhấn để phóng to
                </span>
                <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Zooming In Photos */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#fffaf6] border-2 border-[#e7c988] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#710001] text-white flex items-center justify-center hover:bg-[#8e1012] transition-colors shadow-lg"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Magnified Image */}
            <div className="flex-1 overflow-hidden bg-neutral-900 flex items-center justify-center max-h-[68vh]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[68vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Caption & Story Details */}
            <div className="p-5 bg-white border-t border-[#c79a55]/30 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#710001]/10 text-[#710001] text-xs font-['Tahoma',sans-serif] font-bold">
                  Năm {selectedPhoto.year}
                </span>
                <h4 className="text-lg font-['Tahoma',sans-serif] font-bold text-[#710001]">
                  {selectedPhoto.title}
                </h4>
              </div>
              <p className="text-xs md:text-sm text-[#421212]/85 font-['Be_Vietnam_Pro',sans-serif] leading-relaxed">
                {selectedPhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
