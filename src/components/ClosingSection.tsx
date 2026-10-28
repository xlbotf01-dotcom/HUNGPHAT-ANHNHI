import React from 'react';
import { WeddingConfig } from '../types/wedding';

interface ClosingSectionProps {
  config: WeddingConfig;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({ config }) => {
  const { closing, couple } = config;

  if (!closing.enabled) return null;

  return (
    <section className="closing-section" aria-labelledby="closing-title">
      <figure className="closing-portrait">
        <img
          alt={`${couple.groomDisplayName} và ${couple.brideDisplayName} trong ảnh cưới`}
          loading="lazy"
          src={closing.portraitUrl || '/src/assets/images/hero_wedding_couple_1793182915577.jpg'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_wedding_couple_1793182915577.jpg';
          }}
        />
      </figure>

      <footer className="closing-footer">
        <blockquote className="closing-quote">
          <p>{closing.quote}</p>
        </blockquote>

        <div className="closing-host">
          {closing.hostName && <p>{closing.hostName}</p>}
          {closing.hostSubtitle && <p>{closing.hostSubtitle}</p>}
        </div>

        <p className="closing-invitation" id="closing-title">
          {closing.closingInvitation || 'Trân trọng kính mời!'}
        </p>
      </footer>
    </section>
  );
};
