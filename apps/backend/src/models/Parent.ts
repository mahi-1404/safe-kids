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
  comparePassword(password: string): Promise<boolean>;
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
}, { timestamps: true });

ParentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

ParentSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IParent>('Parent', ParentSchema);
