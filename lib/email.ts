import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your DevCollab Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
          }
          .content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-top: 20px;
          }
          .logo {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
            margin: 0 auto 20px auto;
          }
          h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666;
          }
          .link {
            color: #667eea;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">&lt;/&gt;</div>
          <h1>DevCollab</h1>
          <div class="content">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <span class="link">${resetUrl}</span>
            </p>
            
            <div class="footer">
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
}
