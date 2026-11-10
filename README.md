# Học tiếng Tày – V2 (website + quản trị + schema DB)

## Chạy thử
Mở `index.html` bằng trình duyệt hoặc chạy server tĩnh trong thư mục này:
`python -m http.server 8000`
Sau đó vào `http://localhost:8000`.

Trang quản trị: `http://localhost:8000/admin.html`.

## Phần đã có trong V2
- Trang học tập responsive.
- Khung 3 cấp độ và 8 chủ đề bài học.
- Trang quản trị demo: thêm/xóa khung bài học, thêm từ vựng, ghi nhận metadata bản thu âm, đánh dấu trạng thái duyệt.
- Dữ liệu demo lưu localStorage trên trình duyệt đang sử dụng.
- SQL schema Supabase: profile/role, dialect, course, lesson, vocabulary, recording, quiz, enrollment, progress, RLS và audio storage bucket.
- Khung chương trình JSON.

## Giới hạn quan trọng
Trang quản trị hiện tại là bản demo cục bộ, chưa phải quản trị đa người dùng; dữ liệu không tự đồng bộ giữa máy tính và chưa upload file audio. Để dùng thật cần tạo project Supabase, chạy SQL, cấu hình Auth/Storage, tích hợp Supabase JS vào frontend, tạo tài khoản admin và triển khai hosting. `config.js` hiện để trống có chủ ý. Tuyệt đối không đưa `service_role` key vào frontend.

## Thiết lập Supabase
1. Tạo project Supabase.
2. Mở SQL Editor và chạy `supabase/schema.sql`.
3. Tạo tài khoản quản trị bằng Supabase Auth.
4. Lấy UUID tài khoản từ Authentication > Users.
5. Trong SQL Editor, chạy: `insert into public.profiles(id,display_name,role) values ('UUID','Quản trị viên','admin');`
6. Lấy Project URL và anon/publishable key, điền vào `config.js`.
7. Tích hợp Supabase client và thay các hàm localStorage trong `admin.js` bằng thao tác CRUD qua Supabase; cấu hình upload file lên bucket `tay-audio`.
8. Đưa toàn bộ thư mục lên Vercel/Netlify hoặc static hosting.

## Luồng biên soạn tiếng Tày
Bản nháp → Chờ duyệt → Đã duyệt → Xuất bản.
Mỗi mục từ cần: dạng viết tiếng Tày, nghĩa tiếng Việt, ghi chú phương ngữ/địa bàn, ví dụ, người xác minh, ngày xác minh. Mỗi file ghi âm cần: người đọc/mã người đọc, địa bàn, nội dung đọc, định dạng, sự đồng ý cho phép lưu trữ/phát hành.
Không đưa nội dung chưa xác minh vào từ điển công khai.

## Việc cần quyết định trước khi thu âm chính thức
“Tiếng Tày khu vực Thái Nguyên” còn rộng. Cần chọn xã/cộng đồng cụ thể làm điểm thu thập đầu tiên và thống nhất cách ghi âm/chính tả với nhóm cộng tác viên bản ngữ. Nên có ít nhất 2 người bản ngữ kiểm tra chéo mỗi mục quan trọng.


## Chức năng cộng tác viên (V3)
- Mở `collaborator.html` để đăng ký cộng tác viên hoặc gửi từ/câu tiếng Tày kèm địa bàn, ngữ cảnh và tên file ghi âm.
- Mục `Cộng tác viên` trong `admin.html` hiển thị hồ sơ và đóng góp để quản trị viên đánh dấu đã xem/duyệt trong bản demo.
- Dữ liệu demo lưu bằng `localStorage` trên chính trình duyệt. Nếu mở trang cộng tác viên và trang quản trị ở hai máy hoặc hai trình duyệt khác nhau, dữ liệu sẽ không tự đồng bộ.
- File ghi âm chưa được tải lên máy chủ; bản demo chỉ ghi tên file. Không nhập thông tin liên hệ thật cho đến khi hệ thống có backend và chính sách quyền riêng tư.
- `supabase/schema.sql` đã bổ sung bảng `contributor_applications` và `community_submissions`, kèm chính sách cho phép gửi nhưng chỉ editor/admin mới được đọc và kiểm duyệt. Frontend hiện chưa kết nối các bảng này.
- Việc đánh dấu duyệt trong bản demo không tự xuất bản nội dung. Chỉ công bố từ/câu sau khi có người bản ngữ Định Hóa xác minh.
