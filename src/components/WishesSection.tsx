import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WeddingConfig, WeddingWish } from '../types/wedding';
import { Heart, Send, MessageSquareQuote } from 'lucide-react';

interface WishesSectionProps {
  config: WeddingConfig;
}

export const WishesSection: React.FC<WishesSectionProps> = ({ config }) => {
  const { wishes: wishesConfig } = config;

  const [wishesList, setWishesList] = useState<WeddingWish[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const data = await res.json();
        setWishesList(data);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    if (wishesConfig.enabled) {
      fetchWishes();
    }
  }, [wishesConfig.enabled]);

  if (!wishesConfig.enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ họ tên và lời chúc.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim(),
          message: message.trim(),
          honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi gửi lời chúc.');
      }

      setStatusMsg({ type: 'success', text: data.message });
      setSenderName('');
      setMessage('');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c79a55', '#e7c988', '#fff0e7'],
      });

      fetchWishes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi lời chúc.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wishes-wrapper relative py-8 px-4 text-center">
      <div
        className="wish-invitation cursor-pointer group transition-transform hover:scale-105 active:scale-95 inline-block"
        onClick={() => setModalOpen(true)}
      >
        <svg className="wish-illustration" viewBox="0 0 240 210" aria-hidden="true">
          <path className="wish-envelope-back" d="M69 92 173 77l15 101-103 16L69 92Z"></path>
          <path className="wish-letter" d="m92 43 77 8-11 101-78-9L92 43Z"></path>
          <path className="wish-letter-line" d="m105 81 38 4M103 96l30 3"></path>
          <path className="wish-envelope-front" d="m70 94 58 45 46-60 14 99-103 16-15-100Z"></path>
          <path className="wish-envelope-fold" d="m85 193 43-54 60 39"></path>
          <path className="wish-flower-stem" d="M81 152c-15 12-25 25-31 43"></path>
          <path className="wish-leaf" d="M58 171c-22-8-35 3-37 17 17 7 31 1 37-17ZM64 165c3-22 18-29 32-24 1 18-11 29-32 24Z"></path>
          <path className="wish-flower" d="M48 147c-15-8-28-1-28 12-12-3-20 7-15 18 7 15 29 13 43-5 14 18 36 20 43 5 5-11-3-21-15-18 0-13-13-20-28-12Z"></path>
          <path className="wish-flower-center" d="M41 158h14M48 151v14"></path>
          <path className="wish-heart" d="M184 50c-13-14-32 4-12 22l12 11 12-11c20-18 1-36-12-22Z"></path>
          <path className="wish-heart wish-heart-small" d="M205 24c-8-8-19 2-8 13l8 7 8-7c11-11 0-21-8-13Z"></path>
        </svg>

        <p>
          Gửi lời chúc tới<span>cô dâu chú rể</span>
        </p>

        <button
          type="button"
          className="mt-3 px-5 py-2 text-xs uppercase tracking-wider font-medium text-[#fff0e7] bg-[#710001] border border-[#c79a55] hover:bg-[#8e1012] transition-colors rounded-none"
        >
          Nhấn vào đây để viết lời chúc
        </button>
      </div>

      {/* Guestbook List */}
      {wishesList.length > 0 && (
        <div className="max-w-xl mx-auto mt-10 text-left">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <MessageSquareQuote className="w-5 h-5 text-[#c79a55]" />
            <h3 className="font-['Tahoma',sans-serif] text-[#710001] text-xl font-bold uppercase tracking-wider">
              Sổ Lời Chúc Yêu Thương
            </h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {wishesList.map((wish) => (
              <div
                key={wish.id}
                className="bg-[#fffaf6] border border-[#c79a55]/30 p-4 rounded shadow-sm hover:border-[#c79a55] transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-sm font-serif text-[#710001]">{wish.senderName}</strong>
                  <time className="text-[10px] text-[#421212]/60">
                    {new Date(wish.createdAt).toLocaleDateString('vi-VN')}
                  </time>
                </div>
                <p className="text-xs text-[#421212] leading-relaxed italic">
                  &ldquo;{wish.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wish submission modal */}
      {modalOpen && (
        <div
          className="wish-modal-backdrop"
          onClick={() => {
            if (!submitting) {
              setModalOpen(false);
              setStatusMsg(null);
            }
          }}
        >
          <div className="wish-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="wish-modal-close"
              onClick={() => {
                setModalOpen(false);
                setStatusMsg(null);
              }}
              aria-label="Đóng"
            >
              <span>&times;</span>
            </button>

            <p className="wish-modal-kicker">Gửi trọn yêu thương</p>
            <h2 className="wish-modal-title">Sổ Lời Chúc Cưới</h2>

            {statusMsg && (
              <div
                className={`p-3 text-xs mb-4 text-center ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <label htmlFor="wish-sender">Họ và tên của bạn *</label>
              <input
                id="wish-sender"
                type="text"
                required
                placeholder="Tên của bạn hoặc gia đình..."
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />

              <label htmlFor="wish-text">Lời chúc gửi tới đôi uyên ương *</label>
              <textarea
                id="wish-text"
                rows={4}
                required
                placeholder="Viết những lời chúc tốt đẹp nhất dành cho cô dâu chú rể..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>

              <button
                type="submit"
                disabled={submitting}
                className="response-button wish-modal-submit flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Đang gửi lời chúc...' : 'Gửi lời chúc ngay'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
