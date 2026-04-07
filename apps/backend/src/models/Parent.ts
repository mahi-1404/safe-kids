import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IParent extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  fcmToken?: string;
  consentSigned: boolean;
  consentSignedAt?: Date;
  subscription: 'free' | 'standard' | 'premium' | 'family_plus';
  children: mongoose.Types.ObjectId[];
  createdAt: Date;

  // Email verification
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;

  // Login security
  loginAttempts: number;
  lockUntil?: Date;

  comparePassword(password: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const ParentSchema = new Schema<IParent>({
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  phone:           { type: String, required: true },
  password:        { type: String, required: true },
  fcmToken:        { type: String },
  consentSigned:   { type: Boolean, default: false },
  consentSignedAt: { type: Date },
  subscription:    { type: String, enum: ['free', 'standard', 'premium', 'family_plus'], default: 'free' },
  children:        [{ type: Schema.Types.ObjectId, ref: 'Child' }],

  // Email verification
  emailVerified:            { type: Boolean, default: false },
  verificationToken:        { type: String },
  verificationTokenExpiry:  { type: Date },

  // Login security
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date },
}, { timestamps: true });

ParentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

ParentSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

ParentSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

ParentSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If lock has expired, reset
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= MAX_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }
  }
  await this.save();
};

ParentSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

export default mongoose.model<IParent>('Parent', ParentSchema);
