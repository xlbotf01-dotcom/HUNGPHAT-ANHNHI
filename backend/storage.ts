/**
 * Lớp lưu trữ dùng chung.
 *
 * - Trên Vercel (hoặc khi có biến môi trường Upstash/Blob):
 *     + Dữ liệu JSON (cấu hình, RSVP, lời chúc, tài khoản admin) -> Upstash Redis
 *     + File upload (ảnh, mp3)                                   -> Vercel Blob
 * - Khi chạy trên máy / VPS không có biến môi trường trên:
 *     + Dữ liệu JSON -> thư mục ./data
 *     + File upload  -> thư mục ./uploads (được phục vụ tại /uploads)
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
const isVercel = !!process.env.VERCEL;

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export const storageInfo = {
  json: redis ? 'redis' : 'file',
  files: blobToken ? 'blob' : 'local',
};

function assertWritableEnvironment(what: 'json' | 'files') {
  if (!isVercel) return;
  if (what === 'json' && !redis) {
    throw new Error(
      'Chưa kết nối Upstash Redis cho dự án Vercel. Vào Vercel > Storage > tạo Upstash Redis rồi Redeploy.'
    );
  }
  if (what === 'files' && !blobToken) {
    throw new Error(
      'Chưa kết nối Vercel Blob. Vào Vercel > Storage > tạo Blob store (Public) rồi Redeploy.'
    );
  }
}

// ---------------- JSON ----------------
export async function readJSON<T>(name: string, fallback: T): Promise<T> {
  assertWritableEnvironment('json');
  if (redis) {
    const value = await redis.get<T>(`wedding:${name}`);
    return value ?? fallback;
  }
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(name: string, value: T): Promise<void> {
  assertWritableEnvironment('json');
  if (redis) {
    await redis.set(`wedding:${name}`, value);
    return;
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(value, null, 2), 'utf-8');
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
  assertWritableEnvironment('files');
  const slug = slugify(originalName);

  if (blobToken) {
    const blob = await put(`wedding/${sniffed.kind}/${slug}.${sniffed.ext}`, buf, {
      access: 'public',
      contentType: sniffed.mime,
      addRandomSuffix: true,
    });
    return blob.url;
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `${slug}-${crypto.randomBytes(4).toString('hex')}.${sniffed.ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buf);
  return `/uploads/${fileName}`;
}
