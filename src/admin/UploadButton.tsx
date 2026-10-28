import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadFile } from './uploadClient';

interface UploadButtonProps {
  token: string;
  kind: 'image' | 'audio';
  /** Nhận danh sách URL của các file vừa tải lên thành công */
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
  className?: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  token,
  kind,
  onUploaded,
  multiple = false,
  label,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const accept = kind === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'audio/*,.mp3,.ogg,.wav,.m4a';
  const defaultLabel = kind === 'image' ? (multiple ? 'Tải nhiều ảnh lên' : 'Tải ảnh lên') : 'Tải nhạc lên (MP3)';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setMessage(null);

    const urls: string[] = [];
    const errors: string[] = [];
    const list = Array.from(files);

    for (let i = 0; i < list.length; i++) {
      setBusy(list.length > 1 ? `Đang tải ${i + 1}/${list.length}...` : 'Đang tải lên...');
      try {
        urls.push(await uploadFile(list[i], kind, token));
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Tải lên thất bại.');
      }
    }

    setBusy(null);
    if (inputRef.current) inputRef.current.value = '';

    if (urls.length > 0) {
      onUploaded(urls);
    }
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(' ') });
    } else {
      setMessage({ type: 'ok', text: 'Đã tải lên. Nhớ bấm "Lưu thay đổi" để áp dụng cho thiệp.' });
    }
  };

  return (
    <div className={`mt-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={!!busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#710001] hover:bg-[#8e1012] disabled:opacity-60 disabled:cursor-wait text-white text-xs font-medium rounded transition-colors cursor-pointer"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        <span>{busy || label || defaultLabel}</span>
      </button>
      {message && (
        <p className={`mt-1.5 text-[11px] leading-snug ${message.type === 'ok' ? 'text-emerald-700' : 'text-rose-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};
