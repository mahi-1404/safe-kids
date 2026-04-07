import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import Parent from '../models/Parent';
import Child from '../models/Child';
import { sendVerificationEmail, sendPasswordResetAlert } from '../config/email';

const router = Router();

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const exists = await Parent.findOne({ email });
    if (exists) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Generate verification token (expires in 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const parent = await Parent.create({
      name,
      email,
      phone,
      password,
      verificationToken,
      verificationTokenExpiry,
      emailVerified: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.warn('[Auth] Failed to send verification email:', emailErr);
    }

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      parentId: parent._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── GET /api/auth/verify-email ─────────────────────────────────────────────
router.get('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).send('<h2>Invalid verification link.</h2>');
      return;
    }

    const parent = await Parent.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!parent) {
      res.status(400).send('<h2>Verification link is invalid or has expired. Please register again.</h2>');
      return;
    }

    parent.emailVerified = true;
    parent.verificationToken = undefined;
    parent.verificationTokenExpiry = undefined;
    await parent.save();

    res.send(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:60px;background:#1a1a2e;color:#fff;">
          <h2 style="color:#4ecca3;">✓ Email Verified!</h2>
          <p>Your SafeKids account is now active.</p>
          <p>You can now log in to the parent dashboard.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('<h2>Server error. Please try again.</h2>');
  }
});

// ─── POST /api/auth/resend-verification ─────────────────────────────────────
router.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const parent = await Parent.findOne({ email });

    if (!parent) {
      res.status(404).json({ message: 'Email not found' });
      return;
    }

    if (parent.emailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    parent.verificationToken = verificationToken;
    parent.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await parent.save();

    await sendVerificationEmail(email, parent.name, verificationToken);
    res.json({ message: 'Verification email resent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if account is locked
    if (parent.isLocked()) {
      const minutesLeft = Math.ceil((parent.lockUntil!.getTime() - Date.now()) / 60000);
      res.status(429).json({
        message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        locked: true,
        lockUntil: parent.lockUntil,
      });
      return;
    }

    const valid = await parent.comparePassword(password);
    if (!valid) {
      await parent.incrementLoginAttempts();

      // Alert parent by email when account gets locked
      if (parent.loginAttempts >= 4) {
        try { await sendPasswordResetAlert(email, parent.name); } catch {}
      }

      const remaining = Math.max(0, 5 - parent.loginAttempts);
      res.status(401).json({
        message: remaining > 0
          ? `Invalid email or password. ${remaining} attempt(s) remaining.`
          : 'Account locked for 15 minutes due to too many failed attempts.',
      });
      return;
    }

    // Check email verification
    if (!parent.emailVerified) {
      res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox.',
        emailNotVerified: true,
      });
      return;
    }

    // Successful login — reset attempts
    await parent.resetLoginAttempts();

    const token = jwt.sign({ id: parent._id }, process.env.JWT_SECRET as string, {
      expiresIn: 86400,
    });

    res.json({ token, parent: { id: parent._id, name: parent.name, email: parent.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── POST /api/auth/child-login ──────────────────────────────────────────────
router.post('/child-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, childName, childAge, fcmToken, deviceModel, androidVersion, deviceId: providedDeviceId } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check account lock
    if (parent.isLocked()) {
      const minutesLeft = Math.ceil((parent.lockUntil!.getTime() - Date.now()) / 60000);
      res.status(429).json({ message: `Account locked. Try again in ${minutesLeft} minute(s).` });
      return;
    }

    const valid = await parent.comparePassword(password);
    if (!valid) {
      await parent.incrementLoginAttempts();
      const remaining = Math.max(0, 5 - parent.loginAttempts);
      res.status(401).json({
        message: remaining > 0
          ? `Invalid email or password. ${remaining} attempt(s) remaining.`
          : 'Account locked for 15 minutes.',
      });
      return;
    }

    // Email must be verified before child device can be paired
    if (!parent.emailVerified) {
      res.status(403).json({
        message: 'Parent email not verified. Please verify your email first.',
        emailNotVerified: true,
      });
      return;
    }

    await parent.resetLoginAttempts();

    const deviceId = providedDeviceId || uuidv4();

    let child = await Child.findOne({ parent: parent._id, name: childName });

    if (child) {
      child.fcmToken = fcmToken;
      child.deviceId = deviceId;
      child.deviceModel = deviceModel;
      child.androidVersion = androidVersion;
      child.isPaired = true;
      child.isOnline = true;
      child.lastSeen = new Date();
      await child.save();
    } else {
      child = await Child.create({
        name: childName,
        age: childAge || 10,
        parent: parent._id,
        deviceId,
        deviceModel,
        androidVersion,
        fcmToken,
        isPaired: true,
        isOnline: true,
      });
      await Parent.findByIdAndUpdate(parent._id, { $push: { children: child._id } });
    }

    const token = jwt.sign(
      { childId: child._id, parentId: parent._id, deviceId },
      process.env.JWT_SECRET as string,
      { expiresIn: 31536000 }
    );

    res.json({
      token,
      childId: child._id,
      deviceId,
      parentName: parent.name,
      screenTimeLimit: child.screenTimeLimit,
      bedtimeStart: child.bedtimeStart,
      bedtimeEnd: child.bedtimeEnd,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── POST /api/auth/verify-parent-password ───────────────────────────────────
// Called by child app when uninstall is attempted — verifies parent password
router.post('/verify-parent-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const parent = await Parent.findOne({ email });
    if (!parent) {
      res.status(401).json({ valid: false });
      return;
    }
    const valid = await parent.comparePassword(password);
    res.json({ valid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ─── POST /api/auth/consent ──────────────────────────────────────────────────
router.post('/consent', async (req: Request, res: Response): Promise<void> => {
  try {
    const { parentId } = req.body;
    await Parent.findByIdAndUpdate(parentId, { consentSigned: true, consentSignedAt: new Date() });
    res.json({ message: 'Consent recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
