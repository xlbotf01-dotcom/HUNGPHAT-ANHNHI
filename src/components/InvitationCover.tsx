import React from 'react';
import { WeddingConfig } from '../types/wedding';

interface InvitationCoverProps {
  config: WeddingConfig;
  isOpen: boolean;
  onOpen: () => void;
}

export const InvitationCover: React.FC<InvitationCoverProps> = ({ config, isOpen, onOpen }) => {
  const { cover, couple } = config;

  if (!cover.enabled && isOpen) {
    return null;
  }

  return (
    <div
      className={`cover-screen ${isOpen ? 'cover-opened' : ''}`}
      style={{
        opacity: isOpen ? 0 : 1,
        pointerEvents: isOpen ? 'none' : 'auto',
        transition: 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isOpen ? 'scale(1.06)' : 'scale(1)',
        visibility: isOpen ? 'hidden' : 'visible',
      }}
      aria-busy="false"
    >
      <div className="cover-happiness-field" aria-hidden="true">
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
        <span>{cover.sealText || '囍'}</span>
      </div>

      <div className="cover-card">
        <img
          className="cover-dragon-phoenix"
          alt=""
          aria-hidden="true"
          src={cover.dragonPhoenixUrl || '/assets/dragon-phoenix-lRLuYHBg.png'}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="cover-seal" aria-hidden="true">
          <span>{cover.sealText || '囍'}</span>
        </div>

        <div className="cover-copy">
          <p className="cover-invitation-label">{cover.invitationLabel || 'Thiệp mời lễ tân hôn'}</p>
          <h1>
            <span>{couple.groomDisplayName}</span>
            <b>&amp;</b>
            <span>{couple.brideDisplayName}</span>
          </h1>

          <time dateTime={`${couple.weddingDate}T${couple.weddingTime}:00+07:00`}>
            {couple.weddingTime} · {new Date(couple.weddingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
          </time>

          <div className="cover-guest">
            <span>Kính mời</span>
            <strong>{cover.guestGreeting || 'QUÝ GIA ĐÌNH'}</strong>
          </div>

          <p className="cover-invite-note">{cover.invitationMessage || 'Đến dự buổi tiệc chung vui cùng gia đình'}</p>

          <button
            type="button"
            onClick={onOpen}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            {cover.coverButtonText || 'Mở thiệp'}
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 ml-1 inline-block">
              <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
