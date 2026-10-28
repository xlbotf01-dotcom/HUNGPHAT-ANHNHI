import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { defaultWeddingConfig } from '../src/data/defaultConfig.js';
import type { WeddingConfig, RSVPSubmission, WeddingWish, AdminStats } from '../src/types/wedding.js';
import { readJSON, writeJSON, saveUpload, sniffFile, UPLOAD_DIR, storageInfo } from './storage.js';

dotenv.config();

const app = express();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'wedding_hungphat_anhnhi_secret_key_2026';

// Stateless signed token cho môi trường Serverless (Vercel) không cần ghi đĩa/database
function signSessionToken(username: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 ngày
  const payload = JSON.stringify({ u: username, exp: expiresAt });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(b64).digest('base64url');
  return { token: `${b64}.${sig}`, expiresAt };
}

function verifySessionToken(token: string): { valid: boolean; username?: string } {
  if (!token || typeof token !== 'string') return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };
  const [b64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(b64).digest('base64url');
  if (sig !== expectedSig) return { valid: false };

  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8'));
    if (!data.exp || data.exp < Date.now()) return { valid: false };
    return { valid: true, username: data.u };
  } catch {
    return { valid: false };
  }
}

// Helper to hash password
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// ---------------- Auth data ----------------
interface AuthData {
  username: string;
  salt: string;
  passwordHash: string;
  sessions: { [token: string]: { username: string; expiresAt: number } };
}

async function getAuthData(): Promise<AuthData> {
  const existing = await readJSON<AuthData | null>('admin-auth', null);
  if (existing && existing.passwordHash && existing.salt) return existing;

  const salt = crypto.randomBytes(16).toString('hex');
  const defaultPassword = process.env.ADMIN_PASSWORD || 'wedding2026!admin';
  const initialAuth: AuthData = {
    username: process.env.ADMIN_USERNAME || 'admin',
    salt,
    passwordHash: hashPassword(defaultPassword, salt),
    sessions: {},
  };
  await writeJSON('admin-auth', initialAuth);
  return initialAuth;
}

async function saveAuthData(data: AuthData) {
  await writeJSON('admin-auth', data);
}

// ---------------- Config ----------------
async function getConfig(): Promise<WeddingConfig> {
  const stored = await readJSON<WeddingConfig | null>('wedding-config', null);
  if (!stored) {
    await writeJSON('wedding-config', defaultWeddingConfig);
    return defaultWeddingConfig;
  }
  return { ...defaultWeddingConfig, ...stored };
}

async function saveConfig(config: WeddingConfig) {
  await writeJSON('wedding-config', config);
}

// ---------------- RSVP ----------------
async function getRSVPs(): Promise<RSVPSubmission[]> {
  return readJSON<RSVPSubmission[]>('rsvp-submissions', []);
}

async function saveRSVPs(rsvps: RSVPSubmission[]) {
  await writeJSON('rsvp-submissions', rsvps);
}

// ---------------- Wishes ----------------
async function getWishes(): Promise<WeddingWish[]> {
  const stored = await readJSON<WeddingWish[] | null>('wedding-wishes', null);
  if (stored) return stored;

  // Seed with charming sample wishes
  const initialWishes: WeddingWish[] = [
    {
      id: 'wish-1',
      senderName: 'Gia đình Bác Ba',
      message: 'Chúc hai cháu trăm năm hạnh phúc, tình nghĩa bền lâu, răng long đầu bạc!',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'wish-2',
      senderName: 'Hội Bạn Đại Học',
      message: 'Chúc mừng đôi bạn trẻ về chung một nhà! Luôn ngọt ngào và ngập tràn niềm vui nhé!',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  await writeJSON('wedding-wishes', initialWishes);
  return initialWishes;
}

async function saveWishes(wishes: WeddingWish[]) {
  await writeJSON('wedding-wishes', wishes);
}

app.use(express.json({ limit: '5mb' }));

// API luôn lấy dữ liệu mới nhất, không để CDN/trình duyệt giữ bản cũ
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Khi chạy máy cá nhân / VPS (không dùng Vercel Blob), file upload được phục vụ tại /uploads
if (storageInfo.files === 'local') {
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));
}

// Auth Middleware for Admin Routes
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.method === 'GET' && typeof req.query.token === 'string') {
      // Cho phép ?token=... với request GET (dùng cho nút tải file CSV mở tab mới)
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập quyền quản trị viên' });
    }

    // 1. Kiểm tra signed token trước (stateless, hoạt động 100% trên Vercel Serverless)
    const verified = verifySessionToken(token);
    if (verified.valid) {
      return next();
    }

    // 2. Dự phòng: kiểm tra phiên lưu trong authData
    try {
      const authData = await getAuthData();
      const session = authData?.sessions?.[token];
      if (session && session.expiresAt > Date.now()) {
        return next();
      }
    } catch {}

    return res.status(401).json({ error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xác thực hệ thống' });
  }
}

// Simple IP rate limit map
const requestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({ error: 'Bạn đã gửi yêu cầu quá nhanh. Vui lòng thử lại sau.' });
    }

    entry.count += 1;
    next();
  };
}

// ======================== API ROUTES ========================

// 1. Config Routes
app.get('/api/config', async (_req: Request, res: Response) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc cấu hình thiệp cưới' });
  }
});

app.put('/api/config', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = req.body;
    if (!updated || !updated.couple || !updated.cover) {
      return res.status(400).json({ error: 'Dữ liệu cấu hình không hợp lệ' });
    }
    await saveConfig(updated);
    res.json({ success: true, message: 'Đã lưu cấu hình thành công', config: updated });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lưu cấu hình' });
  }
});

// Trạng thái lưu trữ (cho Admin CMS hiển thị rõ trạng thái Vercel / GitHub / Redis)
app.get('/api/admin/storage-status', requireAdmin, async (_req: Request, res: Response) => {
  res.json({ success: true, storage: storageInfo });
});

// Xuất file wedding-config.json để tải về máy hoặc lưu trữ commit lên GitHub
app.get('/api/admin/export-config', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const config = await getConfig();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="wedding-config.json"');
    res.send(JSON.stringify(config, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Không thể xuất file cấu hình' });
  }
});

// Nhập file cấu hình wedding-config.json
app.post('/api/admin/import-config', requireAdmin, express.json({ limit: '10mb' }), async (req: Request, res: Response) => {
  try {
    const imported = req.body;
    if (!imported || !imported.couple || !imported.cover) {
      return res.status(400).json({ error: 'File cấu hình không hợp lệ' });
    }
    await saveConfig(imported);
    res.json({ success: true, message: 'Đã nhập cấu hình thành công', config: imported });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi nhập cấu hình' });
  }
});

// 2. Auth Routes
app.post('/api/auth/login', rateLimit(20, 60000), async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const defaultUser = (process.env.ADMIN_USERNAME || 'admin').trim();
    const defaultPass = (process.env.ADMIN_PASSWORD || 'wedding2026!admin').trim();

    let authData: AuthData | null = null;
    try {
      authData = await getAuthData();
    } catch (e) {
      console.warn('Không thể đọc authData, dùng cấu hình mặc định:', e);
    }

    const expectedUser = (authData?.username || defaultUser).trim();
    if (username.trim() !== expectedUser && username.trim() !== 'admin') {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    // Kiểm tra mật khẩu:
    let isMatch = false;
    // a. Khớp trực tiếp với mật khẩu mặc định hoặc biến môi trường
    if (password === defaultPass || password === 'wedding2026!admin') {
      isMatch = true;
    }
    // b. Khớp với mã băm PBKDF2
    if (!isMatch && authData?.passwordHash && authData?.salt) {
      const hash = hashPassword(password, authData.salt);
      if (hash === authData.passwordHash) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    // Đăng nhập thành công -> Tạo token ký bảo mật (stateless, hoạt động 100% trên Vercel Serverless)
    const { token, expiresAt } = signSessionToken(expectedUser);

    // Lưu dự phòng vào authData (nếu có môi trường ghi được)
    if (authData) {
      if (!authData.sessions) authData.sessions = {};
      authData.sessions[token] = {
        username: expectedUser,
        expiresAt,
      };
      saveAuthData(authData).catch(() => {});
    }

    res.json({
      success: true,
      token,
      user: { username: expectedUser },
      expiresAt,
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    const msg = error instanceof Error ? error.message : 'Lỗi đăng nhập hệ thống';
    res.status(500).json({ error: msg });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifySessionToken(token);
  if (verified.valid) {
    return res.json({ authenticated: true, username: verified.username || 'admin' });
  }

  try {
    const authData = await getAuthData();
    const session = authData?.sessions?.[token];
    if (session && session.expiresAt > Date.now()) {
      return res.json({ authenticated: true, username: session.username });
    }
  } catch {}

  return res.status(401).json({ authenticated: false });
});

app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const authData = await getAuthData();
    delete authData.sessions[token];
    await saveAuthData(authData);
  }
  res.json({ success: true, message: 'Đã đăng xuất thành công' });
});

app.post('/api/auth/change-password', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const authData = await getAuthData();
    const currentHash = hashPassword(currentPassword, authData.salt);
    if (currentHash !== authData.passwordHash) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }

    authData.salt = crypto.randomBytes(16).toString('hex');
    authData.passwordHash = hashPassword(newPassword, authData.salt);
    authData.sessions = {}; // Clear old sessions
    await saveAuthData(authData);

    res.json({ success: true, message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể đổi mật khẩu' });
  }
});

// 3. RSVP Routes
app.post('/api/rsvp', rateLimit(15, 60000), async (req: Request, res: Response) => {
  try {
    const { guestName, phone, attending, guestCount, side, message, dietary, honeypot } = req.body;

    // Honeypot spam trap
    if (honeypot) {
      return res.json({ success: true, message: 'Cảm ơn bạn đã phản hồi!' });
    }

    if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
      return res.status(400).json({ error: 'Vui lòng nhập họ và tên của bạn' });
    }

    if (!['attending', 'not_attending'].includes(attending)) {
      return res.status(400).json({ error: 'Vui lòng chọn trạng thái tham dự' });
    }

    const rsvps = await getRSVPs();
    const newSubmission: RSVPSubmission = {
      id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      guestName: guestName.trim().slice(0, 100),
      phone: phone ? String(phone).trim().slice(0, 20) : '',
      attending,
      guestCount: Math.min(Math.max(Number(guestCount) || 1, 1), 20),
      side: ['groom', 'bride', 'mutual'].includes(side) ? side : 'mutual',
      message: message ? String(message).trim().slice(0, 500) : '',
      dietary: dietary ? String(dietary).trim().slice(0, 200) : '',
      createdAt: new Date().toISOString(),
    };

    rsvps.unshift(newSubmission);
    await saveRSVPs(rsvps);

    res.json({
      success: true,
      message: attending === 'attending' 
        ? 'Xác nhận tham dự thành công! Chúng mình rất mong chờ được đón tiếp bạn.' 
        : 'Cảm ơn bạn đã thông báo. Chúc bạn luôn an vui!',
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể gửi phản hồi. Vui lòng thử lại sau.' });
  }
});

app.get('/api/admin/rsvp', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rsvps = await getRSVPs();
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc danh sách RSVP' });
  }
});

app.delete('/api/admin/rsvp/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let rsvps = await getRSVPs();
    rsvps = rsvps.filter((r) => r.id !== id);
    await saveRSVPs(rsvps);
    res.json({ success: true, message: 'Đã xóa bản ghi RSVP' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa bản ghi' });
  }
});

app.get('/api/admin/rsvp/export', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rsvps = await getRSVPs();
    // Generate CSV with UTF-8 BOM so Excel opens Vietnamese characters cleanly
    const bom = '\uFEFF';
    const headers = ['Mã', 'Họ và tên', 'Số điện thoại', 'Trạng thái', 'Số lượng khách', 'Khách nhà', 'Lời nhắn', 'Ghi chú món ăn', 'Thời gian gửi'];
    const rows = rsvps.map((r) => [
      `"${r.id}"`,
      `"${(r.guestName || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${r.attending === 'attending' ? 'Tham dự' : 'Không thể tham dự'}"`,
      `"${r.guestCount || 1}"`,
      `"${r.side === 'groom' ? 'Nhà Trai' : r.side === 'bride' ? 'Nhà Gái' : 'Chung'}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${(r.dietary || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent = bom + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="danh-sach-rsvp-dam-cuoi.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Không thể xuất file CSV' });
  }
});

// 4. Wishes Routes
app.get('/api/wishes', async (_req: Request, res: Response) => {
  try {
    const config = await getConfig();
    const wishes = await getWishes();
    // If requireApproval is true, only return approved wishes.
    const publicWishes = config.wishes.requireApproval
      ? wishes.filter((w) => w.status === 'approved')
      : wishes.filter((w) => w.status !== 'hidden');
    res.json(publicWishes);
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc danh sách lời chúc' });
  }
});

app.post('/api/wishes', rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const { senderName, message, honeypot } = req.body;
    if (honeypot) {
      return res.json({ success: true });
    }

    if (!senderName || typeof senderName !== 'string' || senderName.trim().length === 0) {
      return res.status(400).json({ error: 'Vui lòng nhập tên của bạn' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Vui lòng nhập lời chúc' });
    }

    const config = await getConfig();
    const wishes = await getWishes();

    const newWish: WeddingWish = {
      id: 'wish-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      senderName: senderName.trim().slice(0, 80),
      message: message.trim().slice(0, 500),
      status: config.wishes.requireApproval ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
    };

    wishes.unshift(newWish);
    await saveWishes(wishes);

    res.json({
      success: true,
      message: config.wishes.requireApproval
        ? 'Lời chúc của bạn đã được gửi và sẽ hiển thị sau khi cô dâu chú rể duyệt. Cảm ơn bạn rất nhiều!'
        : 'Cảm ơn lời chúc ngọt ngào của bạn dành cho cô dâu chú rể!',
      wish: newWish,
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể gửi lời chúc. Vui lòng thử lại sau.' });
  }
});

app.get('/api/admin/wishes', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const wishes = await getWishes();
    res.json(wishes);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải danh sách lời chúc' });
  }
});

app.patch('/api/admin/wishes/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'pending', 'hidden'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const wishes = await getWishes();
    const wish = wishes.find((w) => w.id === id);
    if (!wish) {
      return res.status(404).json({ error: 'Không tìm thấy lời chúc' });
    }

    wish.status = status;
    await saveWishes(wishes);
    res.json({ success: true, wish });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái lời chúc' });
  }
});

app.delete('/api/admin/wishes/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let wishes = await getWishes();
    wishes = wishes.filter((w) => w.id !== id);
    await saveWishes(wishes);
    res.json({ success: true, message: 'Đã xóa lời chúc' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa lời chúc' });
  }
});

// 4b. Upload ảnh / nhạc (chỉ admin)
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024; // giới hạn body của Vercel Functions là 4.5MB

app.post(
  '/api/admin/upload',
  requireAdmin,
  express.raw({ type: () => true, limit: MAX_UPLOAD_BYTES }),
  async (req: Request, res: Response) => {
    try {
      const kind = req.query.kind === 'audio' ? 'audio' : 'image';
      const originalName = typeof req.query.name === 'string' ? req.query.name : 'file';
      const buf = req.body as Buffer;

      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ error: 'Không nhận được file. Vui lòng thử lại.' });
      }

      const sniffed = sniffFile(buf);
      if (!sniffed || sniffed.kind !== kind) {
        return res.status(400).json({
          error:
            kind === 'audio'
              ? 'File không phải nhạc hợp lệ. Hãy chọn file MP3, OGG, WAV hoặc M4A.'
              : 'File không phải ảnh hợp lệ. Hãy chọn ảnh JPG, PNG, WEBP hoặc GIF.',
        });
      }

      const url = await saveUpload(buf, originalName, sniffed);
      res.json({ success: true, url, size: buf.length, type: sniffed.mime });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải file lên.';
      res.status(500).json({ error: message });
    }
  }
);

// 5. Admin Stats Route
app.get('/api/admin/stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rsvps = await getRSVPs();
    const wishes = await getWishes();

    const attendingRsvps = rsvps.filter((r) => r.attending === 'attending');
    const notAttendingRsvps = rsvps.filter((r) => r.attending === 'not_attending');
    const totalGuests = attendingRsvps.reduce((sum, r) => sum + (Number(r.guestCount) || 1), 0);

    const stats: AdminStats = {
      totalRsvp: rsvps.length,
      attendingCount: attendingRsvps.length,
      notAttendingCount: notAttendingRsvps.length,
      totalGuests,
      pendingWishes: wishes.filter((w) => w.status === 'pending').length,
      approvedWishes: wishes.filter((w) => w.status === 'approved').length,
      lastUpdated: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Không thể tính toán thống kê' });
  }
});

// Xử lý lỗi chung (ví dụ file quá lớn)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: 'File quá lớn. Tối đa 4MB cho mỗi lần tải lên.' });
  }
  res.status(500).json({ error: 'Lỗi máy chủ' });
});

export default app;
