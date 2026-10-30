import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Volume2, VolumeX, Music, Play } from 'lucide-react';
import { WeddingConfig } from '../types/wedding';
import defaultWeddingAudio from '../audio/mai-mai-ben-nhau.mp3';

export interface MusicPlayerHandle {
  playMusic: () => Promise<boolean>;
  stopMusic: () => void;
}

interface MusicPlayerProps {
  config: WeddingConfig;
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(({ config }, ref) => {
  const { music } = config;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Chọn nguồn nhạc: nếu là tệp mặc định hoặc rỗng, ưu tiên dùng tệp Vite bundle từ src/audio/mai-mai-ben-nhau.mp3
  const isDefaultSong =
    !music.audioUrl ||
    music.audioUrl === '/audio/mai-mai-ben-nhau.mp3' ||
    music.audioUrl === '/src/audio/mai-mai-ben-nhau.mp3' ||
    music.audioUrl.includes('mai-mai-ben-nhau');

  const resolvedSource = isDefaultSong ? defaultWeddingAudio : music.audioUrl;
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedSource);

  useEffect(() => {
    setCurrentSrc(resolvedSource);
  }, [resolvedSource]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, music.volume ?? 0.7));
      audioRef.current.loop = music.loop ?? true;
    }
  }, [music.volume, music.loop]);

  useImperativeHandle(ref, () => ({
    playMusic: async () => {
      if (!music.enabled || !audioRef.current) return false;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setShowControls(true);
        return true;
      } catch (err) {
        console.warn('Autoplay prevented or failed:', err);
        setIsPlaying(false);
        setShowControls(true);
        return false;
      }
    },
    stopMusic: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
  }));

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback error:', err);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAudioError = () => {
    // Nếu nguồn tùy chỉnh bị lỗi và chưa dùng defaultWeddingAudio, thử chuyển sang defaultWeddingAudio
    if (currentSrc !== defaultWeddingAudio) {
      console.warn('Custom audio failed to load, falling back to default wedding audio:', defaultWeddingAudio);
      setCurrentSrc(defaultWeddingAudio);
    } else if (currentSrc !== '/audio/mai-mai-ben-nhau.mp3') {
      setCurrentSrc('/audio/mai-mai-ben-nhau.mp3');
    } else {
      setIsPlaying(false);
    }
  };

  if (!music.enabled) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSrc}
        preload="auto"
        loop={music.loop ?? true}
        onError={handleAudioError}
      />

      {/* Floating Music Control */}
      <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-2">
        {showControls && (
          <button
            type="button"
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-[#4a1212]/90 border border-[#e7c988]/60 text-[#fff0e7] flex items-center justify-center shadow-md hover:bg-[#710001] transition-all cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-[#e7c988]" />}
          </button>
        )}

        <button
          type="button"
          onClick={togglePlay}
          className={`music-toggle-btn group ${isPlaying ? 'music-disc-spin' : ''}`}
          title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
          aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
        >
          {isPlaying ? (
            <Music className="w-5 h-5 text-[#e7c988] transition-transform group-hover:scale-110" />
          ) : (
            <Play className="w-5 h-5 ml-0.5 text-[#e7c988] transition-transform group-hover:scale-110" />
          )}
        </button>
      </div>
    </>
  );
});

MusicPlayer.displayName = 'MusicPlayer';
