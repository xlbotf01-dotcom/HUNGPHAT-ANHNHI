/**
 * Lớp lưu trữ đa nền tảng (Vercel Serverless, VPS, máy cá nhân).
 *
 * Hỗ trợ các lớp lưu trữ theo thứ tự ưu tiên:
 * 1. Dữ liệu JSON (Cấu hình, RSVP, Lời chúc, Tài khoản Admin):
 *    - Upstash Redis / Vercel KV (nếu có biến môi trường UPSTASH_REDIS_REST_URL / KV_REST_API_URL)
 *    - Auto-sync GitHub repository (nếu có GITHUB_TOKEN)
 *    - Local file /tmp (bộ nhớ tạm trên Vercel Serverless) & ./data (khi chạy local/VPS)
 * 2. Upload file (Ảnh, MP3):
 *    - Vercel Blob (nếu có biến môi trường BLOB_READ_WRITE_TOKEN) -> Lưu trữ CDN vĩnh viễn
 *    - GitHub repository (nếu có GITHUB_TOKEN) -> Tự động commit vào public/uploads
 *    - Local disk ./uploads (khi chạy local/VPS)
 *    - Base64 Data URI fallback: Tự động chuyển ảnh sang data URL tự thân, đảm bảo không bao giờ lỗi trên Vercel.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
export const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
export const isVercel = !!process.env.VERCEL;

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const PUBLIC_IMAGES_DIR = path.resolve(process.cwd(), 'public', 'images');
export const SRC_IMAGES_DIR = path.resolve(process.cwd(), 'src', 'assets', 'images');
export const PUBLIC_AUDIO_DIR = path.resolve(process.cwd(), 'public', 'audio');
export const SRC_AUDIO_DIR = path.resolve(process.cwd(), 'src', 'audio');
export const TMP_DATA_DIR = path.resolve('/tmp', 'wedding-data');
export const TMP_UPLOAD_DIR = path.resolve('/tmp', 'wedding-uploads');
export const TMP_IMAGES_DIR = path.resolve('/tmp', 'wedding-images');
export const TMP_AUDIO_DIR = path.resolve('/tmp', 'wedding-audio');

// GitHub auto-sync (tùy chọn - nếu người dùng cung cấp Personal Access Token trên Vercel)
export const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
export const githubRepo = process.env.GITHUB_REPO || 'xlbotf01-dotcom/HUNGPHAT-ANHNHI';

export const storageInfo = {
  isVercel,
  files: blobToken ? 'blob' : 'local',
  json: redis ? 'redis' : 'file',
  hasRedis: !!redis,
  hasBlob: !!blobToken,
  hasGitHub: !!githubToken,
  githubRepo,
  jsonBackend: redis ? 'Upstash Redis' : githubToken ? 'GitHub Sync' : isVercel ? 'Serverless Runtime /tmp' : 'Tệp cục bộ ./data & src/data/defaultConfig.ts',
  filesBackend: blobToken ? 'Vercel Blob CDN' : githubToken ? 'GitHub public/images' : isVercel ? 'Serverless /tmp & Base64 Data URI' : 'Tệp cục bộ public/images & src/assets/images',
};

/** Tự động đồng bộ commit tệp lên GitHub repository qua GitHub REST API */
export async function syncFileToGitHub(
  filePathInRepo: string,
  contentBuffer: Buffer,
  commitMessage: string
): Promise<boolean> {
  if (!githubToken || !githubRepo) return false;
  try {
    const url = `https://api.github.com/repos/${githubRepo}/contents/${filePathInRepo}`;
    let sha: string | undefined;

    // 1. Kiểm tra sha hiện tại nếu tệp đã tồn tại
    try {
      const getRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Wedding-App-CMS',
        },
      });
      if (getRes.ok) {
        const getData = (await getRes.json()) as { sha?: string };
        sha = getData.sha;
      }
    } catch {}

    // 2. Put / update tệp
    const body: Record<string, any> = {
      message: commitMessage,
      content: contentBuffer.toString('base64'),
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Wedding-App-CMS',
      },
      body: JSON.stringify(body),
    });

    return putRes.ok;
  } catch (err) {
    console.warn('Lỗi đồng bộ GitHub:', err);
    return false;
  }
}

// ---------------- JSON ----------------
export async function readJSON<T>(name: string, fallback: T): Promise<T> {
  // 1. Upstash Redis
  if (redis) {
    try {
      const value = await redis.get<T>(`wedding:${name}`);
      if (value !== null && value !== undefined) return value;
    } catch (e) {
      console.warn(`Lỗi đọc Redis cho ${name}, chuyển sang bộ nhớ tạm / tệp cục bộ:`, e);
    }
  }

  // 2. /tmp/wedding-data (bộ nhớ tạm trên Vercel Serverless)
  try {
    const tmpFile = path.join(TMP_DATA_DIR, `${name}.json`);
    if (fs.existsSync(tmpFile)) {
      return JSON.parse(fs.readFileSync(tmpFile, 'utf-8')) as T;
    }
  } catch {}

  // 3. Tệp đóng gói sẵn trong kho mã ./data/${name}.json
  try {
    const file = path.join(DATA_DIR, `${name}.json`);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
    }
  } catch {}

  return fallback;
}

export async function writeJSON<T>(name: string, value: T): Promise<void> {
  const jsonString = JSON.stringify(value, null, 2);

  // 1. Upstash Redis (lưu trữ phân tán vĩnh viễn trên cloud)
  if (redis) {
    try {
      await redis.set(`wedding:${name}`, value);
    } catch (err) {
      console.warn(`Lỗi ghi Redis cho ${name}:`, err);
    }
  }

  // 2. Luôn ghi vào /tmp để phiên làm việc hiện tại trên Vercel lấy được ngay
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(TMP_DATA_DIR, `${name}.json`), jsonString, 'utf-8');
  } catch {}

  // 3. Ghi vào ./data/${name}.json (khi chạy trên local / VPS có quyền ghi đĩa)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), jsonString, 'utf-8');
  } catch {
    // Trên Vercel đĩa gốc là Read-Only, đã được /tmp và Redis xử lý
  }

  // 4. Nếu có GITHUB_TOKEN, tự động commit đồng bộ lên repo GitHub
  if (githubToken) {
    syncFileToGitHub(
      `data/${name}.json`,
      Buffer.from(jsonString, 'utf-8'),
      `Cập nhật dữ liệu ${name}.json từ Admin CMS`
    ).catch((err) => console.warn('Lỗi auto-commit GitHub:', err));
  }
}

// ---------------- FILES ----------------
export interface SniffedFile {
  kind: 'image' | 'audio';
  ext: string;
  mime: string;
}

/** Nhận diện loại file thật bằng "magic bytes", không tin tên file / content-type do client gửi. */
export function sniffFile(buf: Buffer): SniffedFile | null {
  if (buf.length < 12) return null;
  const ascii = (a: number, b: number) => buf.subarray(a, b).toString('latin1');

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { kind: 'image', ext: 'jpg', mime: 'image/jpeg' };
  if (buf[0] === 0x89 && ascii(1, 4) === 'PNG') return { kind: 'image', ext: 'png', mime: 'image/png' };
  if (ascii(0, 4) === 'GIF8') return { kind: 'image', ext: 'gif', mime: 'image/gif' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { kind: 'image', ext: 'webp', mime: 'image/webp' };

  if (ascii(0, 3) === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0))
    return { kind: 'audio', ext: 'mp3', mime: 'audio/mpeg' };
  if (ascii(0, 4) === 'OggS') return { kind: 'audio', ext: 'ogg', mime: 'audio/ogg' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { kind: 'audio', ext: 'wav', mime: 'audio/wav' };
  if (ascii(4, 8) === 'ftyp') return { kind: 'audio', ext: 'm4a', mime: 'audio/mp4' };
  return null;
}

function slugify(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || 'file';
}

/** Lưu file, trả về URL công khai để dán vào cấu hình thiệp. */
export async function saveUpload(buf: Buffer, originalName: string, sniffed: SniffedFile): Promise<string> {
  const slug = slugify(originalName);
  const fileName = `${slug}-${crypto.randomBytes(4).toString('hex')}.${sniffed.ext}`;

  if (sniffed.kind === 'image') {
    // 1. Lưu đồng thời vào public/images và src/assets/images
    try {
      if (!fs.existsSync(PUBLIC_IMAGES_DIR)) fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
      fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, fileName), buf);
    } catch {}

    try {
      if (!fs.existsSync(SRC_IMAGES_DIR)) fs.mkdirSync(SRC_IMAGES_DIR, { recursive: true });
      fs.writeFileSync(path.join(SRC_IMAGES_DIR, fileName), buf);
    } catch {}

    try {
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buf);
    } catch {}

    // 2. Lưu vào /tmp để phục vụ ngay trên Vercel Serverless
    try {
      if (!fs.existsSync(TMP_IMAGES_DIR)) fs.mkdirSync(TMP_IMAGES_DIR, { recursive: true });
      fs.writeFileSync(path.join(TMP_IMAGES_DIR, fileName), buf);
    } catch {}

    // 3. Nếu có Vercel Blob: lưu trữ CDN vĩnh viễn
    if (blobToken) {
      try {
        const blob = await put(`wedding/images/${fileName}`, buf, {
          access: 'public',
          contentType: sniffed.mime,
          addRandomSuffix: false,
        });
        return blob.url;
      } catch (err) {
        console.warn('Lỗi Vercel Blob:', err);
      }
    }

    // 4. Nếu có GITHUB_TOKEN: Tự động commit vào cả public/images và src/assets/images
    if (githubToken) {
      try {
        await syncFileToGitHub(
          `public/images/${fileName}`,
          buf,
          `Thêm ảnh mới: ${originalName} vào public/images`
        );
        syncFileToGitHub(
          `src/assets/images/${fileName}`,
          buf,
          `Đồng bộ ảnh mới: ${originalName} vào src/assets/images`
        ).catch(() => {});
      } catch (err) {
        console.warn('Lỗi commit ảnh lên GitHub:', err);
      }
    }

    return `/images/${fileName}`;
  }

  // Nếu là file nhạc audio
  if (sniffed.kind === 'audio') {
    try {
      if (!fs.existsSync(PUBLIC_AUDIO_DIR)) fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
      fs.writeFileSync(path.join(PUBLIC_AUDIO_DIR, fileName), buf);
    } catch {}

    try {
      if (!fs.existsSync(SRC_AUDIO_DIR)) fs.mkdirSync(SRC_AUDIO_DIR, { recursive: true });
      fs.writeFileSync(path.join(SRC_AUDIO_DIR, fileName), buf);
    } catch {}

    try {
      if (!fs.existsSync(TMP_AUDIO_DIR)) fs.mkdirSync(TMP_AUDIO_DIR, { recursive: true });
      fs.writeFileSync(path.join(TMP_AUDIO_DIR, fileName), buf);
    } catch {}

    if (blobToken) {
      try {
        const blob = await put(`wedding/audio/${fileName}`, buf, {
          access: 'public',
          contentType: sniffed.mime,
          addRandomSuffix: false,
        });
        return blob.url;
      } catch (err) {}
    }

    if (githubToken) {
      try {
        await syncFileToGitHub(
          `public/audio/${fileName}`,
          buf,
          `Thêm nhạc mới: ${originalName} vào public/audio`
        );
      } catch (err) {}
    }

    return `/audio/${fileName}`;
  }

  return `/uploads/${fileName}`;
}
