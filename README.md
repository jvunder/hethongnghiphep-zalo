# Hệ thống Quản lý Nghỉ phép - Zalo Mini App
# 请假管理系统 - Zalo 小程序

Ứng dụng quản lý nghỉ phép và đặt cơm nội bộ công ty, chạy trên nền tảng Zalo Mini App.

## Tính năng / Features

### Nhân viên (Employee)
- 📝 Đăng ký nghỉ phép (cả ngày/sáng/chiều)
- 🍚 Hủy cơm khi nghỉ hoặc không ăn
- 📊 Xem lịch sử đăng ký của bản thân
- ⚠️ Cảnh báo đăng ký đột xuất (sau 9h sáng)

### Quản lý (Manager)
- ✅ Duyệt/từ chối đơn nghỉ phép
- 📈 Báo cáo nghỉ phép: theo ngày/tuần/tháng
- 📊 Thống kê theo nhân viên, phòng ban
- 🍚 Báo cáo số suất cơm

### Nhà bếp (Kitchen)
- 🍚 Xem danh sách đặt cơm hôm nay
- 📊 Báo cáo theo tuần/tháng
- 📋 Thống kê theo phòng ban

## Tech Stack

- **Frontend:** React + TypeScript
- **Platform:** Zalo Mini App (ZMP Framework)
- **Backend:** Firebase Firestore (REST API)
- **Authentication:** Zalo OAuth + Custom password

## Cấu trúc dự án

```
src/
├── app.tsx              # Main app component
├── app.css              # Global styles
├── types/
│   └── index.ts         # TypeScript interfaces
├── state/
│   └── index.ts         # State management + Firebase API
└── pages/
    ├── Login.tsx        # Login/Register với Zalo integration
    ├── employee/
    │   ├── Leave.tsx    # Đăng ký nghỉ phép
    │   ├── Meal.tsx     # Đăng ký cơm
    │   └── History.tsx  # Lịch sử
    ├── manager/
    │   ├── Approve.tsx  # Duyệt đơn
    │   ├── Leaves.tsx   # Báo cáo nghỉ phép
    │   └── Meals.tsx    # Báo cáo cơm
    └── kitchen/
        └── Meals.tsx    # Báo cáo cơm nhà bếp
```

## Cài đặt / Installation

### Yêu cầu
- Node.js 16+
- npm hoặc yarn
- Zalo Mini App CLI (`zmp-cli`)

### Bước 1: Clone repo
```bash
git clone https://github.com/YOUR_USERNAME/hethongnghiphep-zalo.git
cd hethongnghiphep-zalo
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình Firebase

Tạo file `src/config/firebase.ts`:
```typescript
export const FIREBASE_CONFIG = {
  projectId: 'YOUR_PROJECT_ID',
  apiKey: 'YOUR_API_KEY'
};
```

Hoặc sử dụng biến môi trường trong `app-config.json`.

### Bước 4: Đăng ký Zalo Mini App

1. Truy cập [Zalo Mini App Studio](https://mini.zalo.me/studio)
2. Tạo app mới
3. Copy App ID vào `app-config.json`

### Bước 5: Chạy development
```bash
npm start
# hoặc
zmp start
```

## Deploy lên Zalo

### Development mode (test local)
```bash
zmp deploy --mode dev
```

### Testing mode (share cho tester)
```bash
zmp deploy --mode testing
```
Sau đó vào Zalo Mini App Studio → Settings → Thêm tester bằng số điện thoại.

### Production mode (public)
```bash
zmp deploy --mode prod
```
Sau đó submit để Zalo review (1-3 ngày).

## Cấu hình Firebase Firestore

### Collections cần tạo:

**users**
```json
{
  "id": 1,
  "username": "nhanvien1",
  "password": "1234",
  "name": "Nguyễn Văn A",
  "role": "employee",
  "department": "Phòng Kỹ thuật",
  "zaloId": "zalo_user_id",
  "avatar": "https://..."
}
```

**leaves**
```json
{
  "id": "leave_123",
  "userId": 1,
  "userName": "Nguyễn Văn A",
  "department": "Phòng Kỹ thuật",
  "date": "2024-01-15",
  "time": "full",
  "reason": "Việc gia đình",
  "status": "approved",
  "cancelMeal": true,
  "isLate": false,
  "createdAt": "2024-01-14T08:00:00Z"
}
```

**meals**
```json
{
  "userId": 1,
  "userName": "Nguyễn Văn A",
  "date": "2024-01-15",
  "status": "cancelled",
  "reason": "Nghỉ phép"
}
```

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Chỉ dùng cho demo
    }
  }
}
```

⚠️ **Lưu ý:** Trong production, cần cấu hình rules chặt chẽ hơn.

## Tài khoản mẫu

| Username | Password | Role | Mô tả |
|----------|----------|------|-------|
| admin | admin123 | manager | Quản lý |
| nhabep | nhabep123 | kitchen | Nhà bếp |
| nhanvien1 | 1234 | employee | Nhân viên |

## Lưu ý quan trọng

### Về Zalo Mini App
- **KHÔNG** sử dụng các component `App`, `ZMPRouter`, `AnimationRoutes` từ `zmp-ui` - sẽ gây blank screen trên device thật
- Sử dụng `closeLoading()` trong `app.tsx` để đóng splash screen
- Test trên device thật cần deploy trước (không chạy từ local được)

### Về Firebase
- Zalo Mini App block Firebase SDK, phải dùng REST API
- Endpoint: `https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/{collection}`

## Screenshots

*(Thêm screenshots của app ở đây)*

## License

MIT License - Tự do sử dụng và chỉnh sửa.

## Tác giả

Được phát triển với sự hỗ trợ của Claude AI.

---

🇻🇳 **Tiếng Việt** | 🇨🇳 **中文支持**
