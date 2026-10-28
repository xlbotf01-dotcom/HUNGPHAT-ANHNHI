import React, { useState } from 'react';
import { WeddingConfig } from '../types/wedding';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GallerySectionProps {
  config: WeddingConfig;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ config }) => {
  const { gallery } = config;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!gallery.enabled) return null;

  const activeItems = gallery.items.filter((item) => item.enabled);
  const primaryItem = activeItems[0];
  const secondaryItem = activeItems[1];
  const additionalItems = activeItems.slice(2);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % activeItems.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + activeItems.length) % activeItems.length);
    }
  };

  return (
    <section className="gallery-section" aria-labelledby="gallery-title">
      <img
        className="gallery-backdrop"
        alt=""
        aria-hidden="true"
        loading="lazy"
        src={gallery.backdropUrl || '/assets/welcome-couple-CPJbdpkc.jpg'}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/welcome-couple-CPJbdpkc.jpg';
        }}
      />
      <div className="gallery-wash" aria-hidden="true"></div>
      <div className="petals gallery-petals" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h2 id="gallery-title" className="visually-hidden">
        Ảnh kỷ niệm của cô dâu và chú rể
      </h2>

      <div className="gallery-collage">
        {primaryItem && (
          <figure
            className="gallery-board gallery-board-primary group cursor-pointer relative overflow-hidden"
            onClick={() => openLightbox(0)}
          >
            <img
              alt={primaryItem.alt || 'Ảnh cưới'}
              loading="lazy"
              src={primaryItem.url}
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="p-2.5 rounded-full bg-[#710001]/80 text-white backdrop-blur-sm">
                <ZoomIn className="w-5 h-5" />
              </span>
            </div>
          </figure>
        )}

        {secondaryItem && (
          <figure
            className="gallery-board gallery-board-secondary group cursor-pointer relative overflow-hidden"
            onClick={() => openLightbox(1)}
          >
            <img
              alt={secondaryItem.alt || 'Ảnh cưới'}
              loading="lazy"
              src={secondaryItem.url}
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="p-2.5 rounded-full bg-[#710001]/80 text-white backdrop-blur-sm">
                <ZoomIn className="w-5 h-5" />
              </span>
            </div>
          </figure>
        )}
      </div>

      {/* Additional gallery thumbnails if available */}
      {additionalItems.length > 0 && (
        <div className="relative z-10 px-6 max-w-2xl mx-auto mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {additionalItems.map((item, idx) => {
              const actualIndex = idx + 2;
              return (
                <div
                  key={item.id}
                  onClick={() => openLightbox(actualIndex)}
                  className="group relative aspect-[3/4] overflow-hidden border border-[#c79a55]/40 rounded cursor-pointer shadow-md"
                >
                  <img
                    src={item.url}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                      {item.caption}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-10 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-8 h-8" />
          </button>

          {activeItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10 cursor-pointer"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10 cursor-pointer"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeItems[lightboxIndex].url}
              alt={activeItems[lightboxIndex].alt}
              className="max-h-[75vh] max-w-full object-contain rounded shadow-2xl"
            />
            {activeItems[lightboxIndex].caption && (
              <p className="text-white/90 text-sm mt-3 font-serif italic text-center px-4">
                {activeItems[lightboxIndex].caption}
              </p>
            )}
            <span className="text-white/50 text-xs mt-1">
              {lightboxIndex + 1} / {activeItems.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
