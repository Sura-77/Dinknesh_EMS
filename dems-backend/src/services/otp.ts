import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndSendOTP(userId: string, email: string, purpose: string): Promise<string> {
  const code = generateOTP();
  const code_hash = await bcrypt.hash(code, 10);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpVerification.create({
    data: { user_id: userId, purpose: purpose as any, code_hash, expires_at },
  });

  // Try to send email — log failure but don't crash
  try {
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_USER !== 'your_mailtrap_user';
    if (smtpConfigured) {
      await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your Dinkinesh Events verification code',
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>Expires in 10 minutes.</p>`,
      });
    } else {
      // Dev mode: print OTP to console so you can test without email setup
      console.log(`\n📧 OTP for ${email} [${purpose}]: ${code}\n`);
    }
  } catch (err) {
    console.error('Email send failed (OTP still valid):', (err as Error).message);
    console.log(`📧 OTP for ${email} [${purpose}]: ${code}`);
  }

  return code; // returned for testing convenience
}

export async function verifyOTP(userId: string, purpose: string, code: string): Promise<boolean> {
  const record = await prisma.otpVerification.findFirst({
    where: {
      user_id: userId,
      purpose: purpose as any,
      verified_at: null,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: 'desc' },
  });

  if (!record) return false;

  const valid = await bcrypt.compare(code, record.code_hash);
  if (!valid) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempt_count: { increment: 1 } },
    });
    return false;
  }

  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified_at: new Date() },
  });

  return true;
}
