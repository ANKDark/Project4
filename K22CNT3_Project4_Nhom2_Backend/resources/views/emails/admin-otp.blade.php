<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Xác minh đăng nhập - Mã OTP</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background-color: #f4f6f9;
      padding: 40px 15px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .email-container {
      max-width: 600px;
      background: #ffffff;
      padding: 35px;
      border-radius: 16px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
      margin: auto;
    }

    h2, h3 {
      margin-bottom: 10px;
    }

    .header-text {
      color: #0d6efd;
      font-weight: 600;
    }

    .sub-header {
      font-size: 18px;
      font-weight: 500;
      color: #495057;
      margin-left: 40px;
    }

    .otp-box {
      background: linear-gradient(135deg, #e0f7fa, #f3e5f5);
      color: #6a1b9a;
      font-size: 34px;
      font-weight: 700;
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      letter-spacing: 6px;
      margin: 30px 0;
      border: 2px dashed #ce93d8;
    }

    .warning {
      color: #d32f2f;
      font-weight: 600;
    }

    .note {
      font-size: 14px;
      color: #6c757d;
    }

    .footer {
      font-size: 13px;
      text-align: center;
      color: #adb5bd;
      margin-top: 40px;
    }
  </style>
</head>
<body>

  <div class="email-container">
    <h2 class="header-text">👋 Xin chào Quản trị viên,</h2>
    <h3 class="sub-header">Trang quản lý cộng đồng sinh viên</h3>

    <p class="mt-3">Bạn vừa yêu cầu đăng nhập vào <strong>trang quản trị</strong>. Đây là mã OTP của bạn:</p>

    <div class="otp-box">
      {{ $otp_code }}
    </div>

    <p class="warning">⚠️ Mã OTP có hiệu lực trong vòng <strong>5 phút</strong>.</p>
    <p class="note mt-3">Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này.</p>

    <div class="footer">
      &copy; {{ date('Y') }} Hệ thống quản trị Cộng đồng Sinh viên. Tất cả quyền được bảo lưu.
    </div>
  </div>

</body>
</html>
