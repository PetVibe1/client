# Cài đặt EmailJS cho Form Liên hệ

Tài liệu này hướng dẫn bạn cách cài đặt EmailJS để gửi dữ liệu từ form liên hệ về email của bạn.

## Bước 1: Tạo tài khoản EmailJS

1. Truy cập [https://www.emailjs.com](https://www.emailjs.com) và tạo tài khoản miễn phí
2. Sau khi đăng nhập, bạn sẽ thấy bảng điều khiển (dashboard)

## Bước 2: Tạo Email Service

1. Từ bảng điều khiển, chọn "Email Services" từ menu bên trái
2. Nhấp vào nút "Add New Service"
3. Chọn nhà cung cấp email của bạn (Gmail, Outlook, hoặc dịch vụ SMTP khác)
4. Điền thông tin đăng nhập email của bạn (đây là email sẽ gửi thông báo)
5. Lưu dịch vụ và ghi lại Service ID (vd: `service_xxxxxxx`)

## Bước 3: Tạo Email Template

1. Từ bảng điều khiển, chọn "Email Templates" từ menu bên trái
2. Nhấp vào nút "Create New Template"
3. Điền thông tin cần thiết:
   - **Template Name**: "Contact Form" hoặc tên mong muốn
   - **Subject**: "Liên hệ mới từ {{user_name}}"
   - **Content**: Sử dụng mẫu email đẹp dưới đây

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 12px">
  <div>Một tin nhắn mới từ {{user_name}} đã được nhận. Vui lòng phản hồi trong thời gian sớm nhất.</div>
  <div
    style="
      margin-top: 20px;
      padding: 15px 0;
      border-width: 1px 0;
      border-style: dashed;
      border-color: lightgrey;
    "
  >
    <table role="presentation">
      <tr>
        <td style="vertical-align: top">
          <div
            style="
              padding: 6px 10px;
              margin: 0 10px;
              background-color: aliceblue;
              border-radius: 5px;
              font-size: 26px;
            "
            role="img"
          >
            &#x1F464;
          </div>
        </td>
        <td style="vertical-align: top">
          <div style="color: #2c3e50; font-size: 16px">
            <strong>{{user_name}}</strong>
            <span style="font-size: 14px; margin-left: 10px; color: #3498db;">{{user_email}}</span>
          </div>
          <div style="color: #cccccc; font-size: 13px">Thời gian: {{time}}</div>
          <div style="color: #7f8c8d; font-size: 13px; margin-top: 5px;">
            <span style="background-color: #f8f9fa; padding: 3px 6px; border-radius: 3px;">
              Chủ đề: {{subject}}
            </span>
            <span style="margin-left: 8px; background-color: #f8f9fa; padding: 3px 6px; border-radius: 3px;">
              SĐT: {{user_phone}}
            </span>
          </div>
          <p style="font-size: 16px; line-height: 1.5; background-color: #f9f9f9; padding: 12px; border-left: 4px solid #3498db; margin-top: 10px;">{{message}}</p>
        </td>
      </tr>
    </table>
  </div>
  <div style="margin-top: 20px; font-size: 11px; color: #95a5a6;">
    <p>Email này được gửi tự động từ form liên hệ của website Monitö Pet Store.</p>
  </div>
</div>
```

4. Chỉnh sửa biến `{{time}}`: EmailJS không tự động cung cấp thời gian, nên chúng ta sẽ thêm vào file `contact.tsx`:

```javascript
// Thêm vào hàm handleSubmit trước khi gọi emailjs.sendForm
const now = new Date();
const formattedTime = now.toLocaleString('vi-VN', {
  year: 'numeric', 
  month: 'numeric', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

// Thêm hidden input vào form
const timeInput = document.createElement('input');
timeInput.type = 'hidden';
timeInput.name = 'time';
timeInput.value = formattedTime;
form.current.appendChild(timeInput);
```

5. Lưu template và ghi lại Template ID (vd: `template_xxxxxxx`)

## Bước 4: Lấy Public Key

1. Từ bảng điều khiển, chọn "Account" từ menu bên trái
2. Tìm mục "API Keys"
3. Copy "Public Key" (vd: `XXXXXXXXXXXXXXXXXXXX`)

## Bước 5: Cập nhật thông tin trong file liên hệ

Mở file `client/src/pages/contact.tsx` và cập nhật các biến sau với thông tin của bạn:

```javascript
const EMAILJS_SERVICE_ID = "service_xxxxxxx"; // Thay thế bằng Service ID của bạn
const EMAILJS_TEMPLATE_ID = "template_xxxxxxx"; // Thay thế bằng Template ID của bạn
const EMAILJS_PUBLIC_KEY = "XXXXXXXXXXXXXXXXXXXX"; // Thay thế bằng Public Key của bạn
```

## Kiểm tra

1. Chạy website với lệnh `npm run dev`
2. Điền thông tin vào form liên hệ và gửi
3. Kiểm tra email để xác nhận rằng form đang hoạt động đúng

## Lưu ý

- EmailJS cung cấp gói miễn phí với giới hạn 200 email mỗi tháng
- Nếu cần gửi nhiều email hơn, bạn cần nâng cấp lên gói trả phí
- Đảm bảo không chia sẻ Public Key và thông tin đăng nhập email của bạn

## Tùy chỉnh email template

- Bạn có thể tùy chỉnh template email bằng cách thêm CSS và HTML theo ý muốn
- Các biến trong template được đặt trong cặp dấu ngoặc nhọn kép {{variable_name}}
- Bạn có thể thêm logo công ty, thay đổi màu sắc, font chữ để phản ánh thương hiệu của bạn 