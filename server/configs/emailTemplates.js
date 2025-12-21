export const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Email Verification</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f0fdf4; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0;">
  <div style="background-color: #ffffff; padding: 40px; text-align: center; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 40px auto;">
    <h1 style="color: #16a34a; margin-bottom: 20px;">Verify Your Account</h1>
    <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
      Your OTP for account verification is:
    </p>
    <div style="background-color: #dcfce7; color: #15803d; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 8px; display: inline-block; letter-spacing: 5px;">
      {{otp}}
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      If you didn't request this verification, please ignore this email.
    </p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #eff6ff; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0;">
  <div style="background-color: #ffffff; padding: 40px; text-align: center; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 40px auto;">
    <h1 style="color: #2563eb; margin-bottom: 20px;">Reset Your Password</h1>
    <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
      Use the OTP below to reset your password:
    </p>
    <div style="background-color: #dbeafe; color: #1e40af; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 8px; display: inline-block; letter-spacing: 5px;">
      {{otp}}
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      This OTP is valid for 15 minutes. If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
`;
