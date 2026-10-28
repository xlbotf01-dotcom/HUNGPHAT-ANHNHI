// Tiện ích tải ảnh / nhạc lên máy chủ từ trang quản trị.
// Vercel giới hạn body của mỗi request ~4.5MB, nên ảnh được thu nhỏ ngay trên trình duyệt
// trước khi gửi (ảnh điện thoại 5-10MB sẽ xuống còn ~300KB-1MB, vẫn rất nét cho thiệp online).

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB

const MAX_DIMENSION = 2000;
const SKIP_COMPRESS_UNDER = 1.5 * 1024 * 1024;

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + 'MB';
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function prepareImage(file: File): Promise<Blob> {
  const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!okTypes.includes(file.type)) {
    throw new Error(
      `"${file.name}": định dạng chưa hỗ trợ. Hãy chọn ảnh JPG, PNG, WEBP hoặc GIF (ảnh HEIC của iPhone cần đổi sang JPG).`
    );
  }

  // GIF giữ nguyên (thu nhỏ sẽ mất hoạt ảnh)
  if (file.type === 'image/gif') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" nặng ${formatMB(file.size)}, tối đa 4MB.`);
    return file;
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const longest = Math.max(bitmap.width, bitmap.height);

  // Ảnh đã nhỏ gọn thì giữ nguyên bản gốc
  if (file.size <= SKIP_COMPRESS_UNDER && longest <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }

  const isPng = file.type === 'image/png'; // PNG giữ nền trong suốt (họa tiết rồng phụng, nhành hoa...)
  const attempts = isPng
    ? [{ dim: 2000 }, { dim: 1500 }, { dim: 1000 }]
    : [
        { dim: 2000, q: 0.86 },
        { dim: 1600, q: 0.78 },
        { dim: 1200, q: 0.68 },
      ];

  let result: Blob | null = null;
  for (const attempt of attempts) {
    const scale = Math.min(1, attempt.dim / longest);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) break;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    result = await canvasToBlob(canvas, isPng ? 'image/png' : 'image/jpeg', 'q' in attempt ? attempt.q : undefined);
    if (result && result.size <= MAX_UPLOAD_BYTES) break;
  }
  bitmap.close();

  if (!result || result.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Không thể thu nhỏ "${file.name}" xuống dưới 4MB. Hãy chọn ảnh khác nhẹ hơn.`);
  }
  return result;
}

function prepareAudio(file: File): Blob {
  const looksAudio = file.type.startsWith('audio/') || /\.(mp3|ogg|wav|m4a|aac)$/i.test(file.name);
  if (!looksAudio) {
    throw new Error(`"${file.name}" không phải file nhạc. Hãy chọn file MP3, OGG, WAV hoặc M4A.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File nhạc nặng ${formatMB(file.size)}, tối đa 4MB. Hãy cắt ngắn đoạn nhạc (khoảng 2-3 phút) hoặc xuất MP3 chất lượng 128kbps.`
    );
  }
  return file;
}

export async function uploadFile(file: File, kind: 'image' | 'audio', token: string): Promise<string> {
  const blob = kind === 'image' ? await prepareImage(file) : prepareAudio(file);

  const res = await fetch(`/api/admin/upload?kind=${kind}&name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': blob.type || 'application/octet-stream',
    },
    body: blob,
  });

  let data: { url?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // Vercel có thể trả về trang lỗi dạng text khi file quá lớn
    if (res.status === 413) throw new Error('File quá lớn. Tối đa 4MB cho mỗi lần tải lên.');
  }
  if (!res.ok || !data.url) {
    throw new Error(data.error || `Tải lên thất bại (mã lỗi ${res.status}).`);
  }
  return data.url;
}
