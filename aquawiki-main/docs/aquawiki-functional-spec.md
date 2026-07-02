# AquaWiki — Đặc tả chức năng

> **Dự án:** Full-stack Web Application for Aquatic Species Encyclopedia
> **Công nghệ:** Java Spring Boot (Backend) + ReactJS (Frontend) + MySQL (Database)
> **Mục đích tài liệu:** Đầu vào cho quy trình phát triển theo BMAD-method

---

## 1. Tổng quan dự án

AquaWiki là một nền tảng web bách khoa toàn thư về sinh vật thủy sinh, đi xa hơn các wiki truyền thống bằng cách cung cấp công cụ ra quyết định cho người chơi cá cảnh. Hệ thống tính toán độ tương thích môi trường sống, yêu cầu kỹ thuật của hồ và cảnh báo người dùng về các rủi ro sinh học trước khi họ thực sự thiết lập hồ cá.

**Đối tượng người dùng:**

- Người mới chơi cá cảnh cần hướng dẫn quyết định
- Người chơi có kinh nghiệm muốn mô phỏng setup mới
- Quản trị viên nội dung (Admin)

**Giá trị cốt lõi:** Thay thế việc tự Google rời rạc bằng một công cụ tích hợp tính toán tương thích loài, thể tích, bioload và lưu lượng lọc trong thời gian thực.

---

## 2. Kiến trúc tổng thể

| Tầng | Công nghệ | Vai trò |
|------|-----------|---------|
| Frontend | ReactJS, React Router, Axios, TailwindCSS | UI, state management, gọi REST API |
| Backend | Java Spring Boot, Spring Web, Spring Data JPA, Spring Security, JWT | REST API, business logic, xác thực |
| Database | MySQL 8 | Lưu trữ quan hệ loài, thiết bị, hồ, người dùng |
| Dev tools | Maven, VS Code, Postman, MySQL Workbench, Git | Build, test, quản lý mã nguồn |

---

## 3. Phân nhóm chức năng

Toàn bộ chức năng được nhóm thành **7 module** chính.

### Module 1 — Xác thực và quản lý tài khoản

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 1.1 | Đăng ký | Tạo tài khoản mới bằng email + mật khẩu, xác thực qua email |
| 1.2 | Đăng nhập | Đăng nhập bằng email/mật khẩu, nhận JWT token |
| 1.3 | Đăng xuất | Vô hiệu hóa token phía client |
| 1.4 | Quên mật khẩu | Gửi link đặt lại mật khẩu qua email |
| 1.5 | Cập nhật hồ sơ | Sửa tên hiển thị, ảnh đại diện, mật khẩu |
| 1.6 | Phân quyền | Hai vai trò: `USER` và `ADMIN` |

### Module 2 — Bách khoa loài (Species Encyclopedia)

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 2.1 | Danh sách loài | Hiển thị grid/list các loài cá, tép, ốc, cây thủy sinh |
| 2.2 | Tìm kiếm loài | Tìm theo tên thường, tên khoa học, hoặc từ khóa |
| 2.3 | Lọc loài | Lọc theo nhóm (cá hiền/dữ), kích cỡ, pH, nhiệt độ, độ khó nuôi |
| 2.4 | Phân trang | Hiển thị 12-24 loài mỗi trang, có nút Next/Prev |
| 2.5 | Chi tiết loài | Trang chi tiết: ảnh, tên khoa học, môi trường sống, thức ăn, hành vi, kích cỡ trưởng thành |
| 2.6 | Bookmark loài | Người dùng lưu loài yêu thích vào danh sách cá nhân |
| 2.7 | So sánh loài | Chọn 2-3 loài để xem bảng so sánh thông số cạnh nhau |

### Module 3 — Tank Simulator (Mô phỏng hồ cá)

Đây là chức năng đặc trưng nhất của dự án.

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 3.1 | Nhập kích thước hồ | Form nhập dài × rộng × cao (cm), hệ thống tự tính thể tích (lít) |
| 3.2 | Chọn loài cho hồ | Thêm các loài vào hồ với số lượng cụ thể |
| 3.3 | Chọn thiết bị | Chọn máy lọc, đèn, sưởi từ danh mục thiết bị |
| 3.4 | Tính bioload | Tính tổng tải sinh học so với thể tích hồ, trả về % |
| 3.5 | Kiểm tra lưu lượng lọc | So sánh công suất lọc với thể tích (turnover rate 4-6 lần/giờ) |
| 3.6 | Cảnh báo tương thích | Đỏ/vàng/xanh tùy mức độ rủi ro (tính lãnh thổ, pH, nhiệt độ xung đột) |
| 3.7 | Hiển thị trực quan | Hình hồ 2D với cá trong hồ, viền đổi màu theo trạng thái |
| 3.8 | Lưu cấu hình hồ | Người dùng lưu setup để xem lại/chỉnh sửa |

### Module 4 — Smart Compatibility Engine

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 4.1 | Ma trận tương thích | Bảng dữ liệu định nghĩa cặp loài nào nuôi chung được |
| 4.2 | Kiểm tra cặp đôi | API nhận 2 loài, trả về điểm tương thích 0-100 |
| 4.3 | Kiểm tra nhóm | API nhận N loài, trả về danh sách xung đột nội bộ |
| 4.4 | Đề xuất loài | Dựa trên loài đã chọn, gợi ý các loài phù hợp |
| 4.5 | Giải thích lý do | Mỗi cảnh báo kèm lý do (vd: "Betta có tính lãnh thổ với cá có vây dài") |

### Module 5 — Quản lý hồ cá cá nhân

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 5.1 | Tạo hồ mới | Người dùng tạo bản ghi hồ với tên, kích thước, mô tả |
| 5.2 | Danh sách hồ | Xem tất cả hồ cá đang quản lý |
| 5.3 | Chỉnh sửa hồ | Cập nhật thông số, thêm/bớt loài, đổi thiết bị |
| 5.4 | Xóa hồ | Xóa bản ghi hồ (có xác nhận) |
| 5.5 | Bảng điều khiển hồ | Dashboard hiển thị chỉ số bioload, pH, lọc của từng hồ |
| 5.6 | Nhật ký hồ | Ghi chú sự kiện (thay nước, cá mới, bệnh) theo timeline |

### Module 6 — Quản trị (Admin Panel)

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 6.1 | Quản lý loài | Thêm/sửa/xóa loài trong bách khoa |
| 6.2 | Upload ảnh loài | Tải ảnh đại diện cho từng loài |
| 6.3 | Quản lý thiết bị | Thêm/sửa/xóa máy lọc, đèn, sưởi |
| 6.4 | Quản lý ma trận | Sửa các giá trị trong Compatibility Matrix |
| 6.5 | Quản lý người dùng | Xem danh sách user, khóa/mở tài khoản |
| 6.6 | Thống kê hệ thống | Số user, số hồ đã tạo, loài được xem nhiều nhất |

### Module 7 — Tiện ích chung

| # | Chức năng | Mô tả ngắn |
|---|-----------|------------|
| 7.1 | Tính thể tích hồ | Tool độc lập: nhập 3 chiều → ra lít |
| 7.2 | Quy đổi đơn vị | Chuyển cm/inch, lít/gallon, °C/°F |
| 7.3 | Thông báo (Notification) | Cảnh báo realtime trong app khi hồ vượt ngưỡng |
| 7.4 | Tìm kiếm toàn cục | Search bar tìm xuyên loài/thiết bị/hồ |
| 7.5 | Trang chủ (Landing) | Giới thiệu dự án, CTA đăng ký |
| 7.6 | Trang giới thiệu | Thông tin về dự án và tác giả |

---

## 4. Danh sách màn hình (Pages)

| # | Màn hình | Phân quyền |
|---|----------|------------|
| P-01 | Trang chủ / Landing | Công khai |
| P-02 | Đăng nhập | Công khai |
| P-03 | Đăng ký | Công khai |
| P-04 | Quên mật khẩu | Công khai |
| P-05 | Dashboard | USER, ADMIN |
| P-06 | Danh sách loài | Công khai |
| P-07 | Chi tiết loài | Công khai |
| P-08 | So sánh loài | USER |
| P-09 | Tank Simulator | USER |
| P-10 | Danh sách hồ của tôi | USER |
| P-11 | Chi tiết hồ | USER |
| P-12 | Hồ sơ cá nhân | USER |
| P-13 | Admin — Quản lý loài | ADMIN |
| P-14 | Admin — Quản lý người dùng | ADMIN |
| P-15 | Admin — Quản lý ma trận | ADMIN |
| P-16 | 404 / Lỗi | Công khai |

---

## 5. Tổng kết phạm vi

**Tổng số module:** 7
**Tổng số chức năng:** ~40
**Tổng số màn hình:** 16

**Phạm vi cốt lõi (MVP) — ưu tiên làm trước:**

- Module 1 (Auth) — 1.1, 1.2, 1.3
- Module 2 (Encyclopedia) — 2.1, 2.2, 2.3, 2.5
- Module 3 (Tank Simulator) — 3.1, 3.2, 3.4, 3.6, 3.7
- Module 4 (Compatibility) — 4.1, 4.2
- Module 6 (Admin) — 6.1 (chỉ CRUD loài)

**Phạm vi mở rộng (sau MVP):** các chức năng còn lại.

---

## 6. Hướng dẫn sử dụng tài liệu này với BMAD-method

Tài liệu này phù hợp với giai đoạn **Brainstorming / Analysis** của BMAD. Bạn có thể:

1. Đưa file này cho `analyst` agent để nó hiểu phạm vi dự án
2. Yêu cầu `pm` agent tạo PRD chi tiết từ tài liệu này
3. Yêu cầu `architect` agent đề xuất kiến trúc Spring Boot + React
4. Để `sm` agent chia thành các epic và story cụ thể

Nếu cần bản chi tiết hơn (user story, API endpoint, DB schema, ERD), có thể yêu cầu mở rộng từng module.
