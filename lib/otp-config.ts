export const OTP_CONFIG = {
  // Email configuration
  EMAIL: {
    FROM: process.env.SENDGRID_FROM_EMAIL || "noreply@scribbl3d.com",
    SUBJECT: "Your Verification Code",
    COMPANY_NAME: "Scribbl3D",
    COMPANY_LOGO: "https://scribbl3d.com/logo.png", // Replace with actual logo URL
  },

  // OTP settings
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 3,
    RESEND_COOLDOWN_MINUTES: 1,
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
};

export const getOTPEmailTemplate = (otp: string, action: string) => {
  const actionText =
    {
      verify_email: "email verification",
      verify_new_email: "new email verification",
      verify_password: "password change",
      reset_password: "password reset",
      register: "registration",
    }[action] || "verification";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 32px;
          margin: 20px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 24px;
        }
        .otp-container {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
          position: relative;
        }
        .otp-code {
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 8px;
          color: #111827;
          margin: 16px 0;
          font-family: monospace;
        }
        .expiry {
          color: #6b7280;
          font-size: 14px;
          margin-top: 16px;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 32px;
        }
        .security-note {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 12px;
          margin: 24px 0;
          font-size: 14px;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <img src="${OTP_CONFIG.EMAIL.COMPANY_LOGO}" class="logo">
            <h1 style="color: #111827; margin: 0;">Your Verification Code</h1>
          </div>
          
          <p style="color: #374151;">Please use the following verification code to complete your ${actionText}:</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="expiry">This code will expire in ${
              OTP_CONFIG.OTP.EXPIRY_MINUTES
            } minutes</div>
          </div>
          
          <div class="security-note">
            <strong>Security Note:</strong> Never share this code with anyone. Our team will never ask for this code.
          </div>
          
          <p style="color: #374151;">If you didn't request this code, you can safely ignore this email.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${
    OTP_CONFIG.EMAIL.COMPANY_NAME
  }. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
