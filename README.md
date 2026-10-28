# THIỆP CƯỚI ONLINE – HÙNG PHÁT & ANH NHI

Thiệp cưới truyền thống Việt Nam (React + Vite) kèm trang quản trị `/admin`.

## Có gì mới trong bản này

- **Font tên cô dâu chú rể** ở màn hình bìa đổi sang *Dancing Script* (đủ dấu tiếng Việt, dễ đọc, hợp thiệp cưới).
  Muốn đổi font khác, sửa biến `--font-cover-names` trong `src/wedding.css`.
- **Tải ảnh trực tiếp** từ máy/điện thoại trong trang quản trị (ảnh chân dung, album, nền, ảnh chia sẻ...).
  Ảnh được tự thu nhỏ trước khi tải nên nhẹ và vẫn nét. Album có nút **"Tải nhiều ảnh lên"**.
- **Tải nhạc nền MP3** trực tiếp (tối đa 4MB, nên dùng đoạn 2–3 phút, 128kbps).
- Vẫn dán được link URL như cũ.
- Mục **Sao lưu & Khôi phục cấu hình** (tab "Bảo mật & Đổi mật khẩu").

## Triển khai lên Vercel (từ GitHub)

Vercel không cho ghi file lên ổ đĩa, nên dữ liệu và file upload được lưu ở 2 dịch vụ miễn phí gắn ngay trong Vercel:

1. Đưa code lên GitHub, vào vercel.com > **Add New > Project** > chọn repo > **Deploy**.
2. Trong dự án Vercel, mở tab **Storage**:
   - **Create > Blob** (chọn chế độ **Public**) – chứa ảnh và nhạc.
   - **Create > Upstash Redis** (Marketplace, gói Free) – chứa cấu hình thiệp, RSVP, lời chúc, tài khoản admin.
   - Cả hai đều bấm **Connect Project** để Vercel tự thêm biến môi trường.
3. Tab **Settings > Environment Variables**, thêm (nên đổi mật khẩu trước khi deploy lần đầu):
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = mật khẩu của bạn
4. Tab **Deployments > Redeploy** để nhận các biến mới.
5. Vào `https://ten-mien-cua-ban.vercel.app/admin`, đăng nhập, tải ảnh/nhạc, bấm **Lưu Thay Đổi**.

> Lưu ý: tên, ngày giờ, địa chỉ... bạn đã chỉnh trên bản cũ nằm trong file dữ liệu của máy chủ cũ, không nằm trong code.
> Hãy mở `/admin` của bản cũ > "Bảo mật & Đổi mật khẩu" > **Tải bản sao lưu**, rồi vào admin bản mới > **Khôi phục từ file .json** > **Lưu Thay Đổi**.

## Chạy trên máy

```bash
npm install
npm run dev      # http://localhost:3000
```

Khi chạy máy mình (không có biến Redis/Blob), dữ liệu lưu ở thư mục `data/` và file tải lên lưu ở `uploads/`.
Hai thư mục này đã nằm trong `.gitignore`, **không đưa lên GitHub**.

## Tài khoản admin mặc định

`admin` / `wedding2026!admin` (nếu chưa đặt `ADMIN_PASSWORD`). Hãy đổi ngay sau khi đăng nhập lần đầu.
