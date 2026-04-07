import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verifyUrl = `http://${process.env.SERVER_IP || '135.235.255.47'}:5000/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"SafeKids" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your SafeKids account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4ecca3;">SafeKids Account Verification</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to verify your email and activate your account:</p>
        <a href="${verifyUrl}"
           style="display:inline-block; background:#4ecca3; color:#1a1a2e;
                  padding:14px 28px; border-radius:8px; text-decoration:none;
                  font-weight:bold; font-size:16px; margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#666; font-size:13px;">This link expires in 24 hours.</p>
        <p style="color:#666; font-size:13px;">If you did not create this account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetAlert(email: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: `"SafeKids" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'SafeKids — Account Locked',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #e94560;">Account Temporarily Locked</h2>
        <p>Hi ${name},</p>
        <p>Your SafeKids account has been temporarily locked due to 5 failed login attempts.</p>
        <p>Please wait <strong>15 minutes</strong> before trying again.</p>
        <p style="color:#666; font-size:13px;">If this wasn't you, please change your password immediately.</p>
      </div>
    `,
  });
}

export default transporter;
