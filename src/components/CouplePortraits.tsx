import React from 'react';
import { WeddingConfig } from '../types/wedding';

interface CouplePortraitsProps {
  config: WeddingConfig;
}

export const CouplePortraits: React.FC<CouplePortraitsProps> = ({ config }) => {
  const { portraits, couple } = config;

  if (!portraits.enabled) return null;

  return (
    <section className="welcome-section" aria-labelledby="welcome-title">
      <h2 id="welcome-title" className="visually-hidden">
        Chân dung cô dâu và chú rể
      </h2>

      <img
        className="welcome-floral"
        alt=""
        aria-hidden="true"
        src="/assets/floral-sprig-BhEAsx2y.png"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      <div className="welcome-pair">
        <figure className="welcome-portrait">
          <img
            alt={portraits.groomAlt || `Chú rể ${couple.groomFullName}`}
            loading="lazy"
            src={portraits.groomImageUrl || '/src/assets/images/hero_wedding_couple_1793182915577.jpg'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/hero_wedding_couple_1793182915577.jpg';
            }}
          />
        </figure>

        <figure className="welcome-portrait">
          <img
            alt={portraits.brideAlt || `Cô dâu ${couple.brideFullName}`}
            loading="lazy"
            src={portraits.brideImageUrl || '/src/assets/images/story_wedding_prewedding_1793182916346.jpg'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/story_wedding_prewedding_1793182916346.jpg';
            }}
          />
        </figure>
      </div>

      <p className="welcome-verse">{portraits.verse}</p>
    </section>
  );
};
