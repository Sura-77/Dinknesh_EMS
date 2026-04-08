import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createAndSendOTP, verifyOTP } from '../services/otp';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone_number: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { first_name, last_name, email, password, phone_number } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      first_name, last_name,
      full_name: `${first_name} ${last_name}`,
      email, password_hash, phone_number,
    },
    select: { id: true, first_name: true, last_name: true, full_name: true, email: true, role: true, status: true, created_at: true },
  });

  await createAndSendOTP(user.id, email, 'signup');

  res.status(201).json({ message: 'Registration successful. Check your email for OTP.', user });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, code, purpose } = req.body;
  if (!email || !code) { res.status(400).json({ error: 'email and code required' }); return; }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const valid = await verifyOTP(user.id, purpose || 'signup', code);
  if (!valid) { res.status(400).json({ error: 'Invalid or expired OTP' }); return; }

  if (purpose === 'signup' || purpose === 'verify_email') {
    await prisma.user.update({ where: { id: user.id }, data: { email_verified: true, status: 'active' } });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN as any || '7d' });

  // Return full user object so frontend can store it properly
  const { password_hash: _, ...safeUser } = user;
  res.json({ token, user: { ...safeUser, email_verified: true, status: 'active' } });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  if (user.status === 'suspended') { res.status(403).json({ error: 'Account suspended' }); return; }
  if (user.status === 'deleted') { res.status(403).json({ error: 'Account not found' }); return; }
  if (user.status === 'pending' && !user.email_verified) {
    res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox for the OTP.' }); return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN as any || '7d' });

  const { password_hash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.json({ message: 'If that email exists, a reset link was sent.' }); return; }

  await createAndSendOTP(user.id, email, 'reset_password');
  res.json({ message: 'Password reset OTP sent to your email.' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, code, new_password } = req.body;
  if (!email || !code || !new_password) { res.status(400).json({ error: 'email, code, and new_password required' }); return; }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const valid = await verifyOTP(user.id, 'reset_password', code);
  if (!valid) { res.status(400).json({ error: 'Invalid or expired OTP' }); return; }

  const password_hash = await bcrypt.hash(new_password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password_hash } });

  res.json({ message: 'Password reset successful.' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, first_name: true, last_name: true, full_name: true, email: true, phone_number: true, role: true, status: true, email_verified: true, phone_verified: true, default_language: true, theme_preference: true, created_at: true, last_login_at: true },
  });
  res.json(user);
});

// POST /api/auth/logout
router.post('/logout', authenticate, (_req, res) => {
  // JWT is stateless; client drops the token. Optionally blacklist in Redis here.
  res.json({ message: 'Logged out successfully.' });
});

export default router;
