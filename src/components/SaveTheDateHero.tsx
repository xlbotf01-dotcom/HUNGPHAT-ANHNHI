import React from 'react';
import { WeddingConfig } from '../types/wedding';

interface SaveTheDateHeroProps {
  config: WeddingConfig;
}

export const SaveTheDateHero: React.FC<SaveTheDateHeroProps> = ({ config }) => {
  const { hero, couple } = config;

  if (!hero.enabled) return null;

  const formattedDate = couple.weddingDate
    ? new Date(couple.weddingDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '.')
    : '28.09.2026';

  return (
    <section className="hero-section" aria-labelledby="couple-names">
      <img
        className="hero-floral"
        alt=""
        aria-hidden="true"
        src={hero.floralImageUrl || '/assets/floral-sprig-BhEAsx2y.png'}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      <div className="hero-topline">
        <span>{hero.toplineLabel || 'SAVE THE DATE'}</span>
        <time dateTime={couple.weddingDate}>{formattedDate}</time>
      </div>

      <div className="hero-names">
        <h1 id="couple-names">
          <span>{couple.groomDisplayName}</span>
          <b>&amp;</b>
          <span>{couple.brideDisplayName}</span>
        </h1>
      </div>

      <img
        className="hero-dragon"
        alt=""
        aria-hidden="true"
        src={hero.dragonImageUrl || '/assets/dragon-phoenix-lRLuYHBg.png'}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      <div className="hero-ribbon">
        <span className="hero-happiness" aria-hidden="true">囍</span>
        <strong className="hero-ceremony-label font-['Tahoma',sans-serif] uppercase tracking-wider">{hero.ceremonyLabel || 'Lễ tân hôn'}</strong>
      </div>

      <p className="hero-blessing">{hero.blessingQuote}</p>
    </section>
  );
};
