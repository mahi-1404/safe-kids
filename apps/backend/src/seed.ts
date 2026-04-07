/**
 * Seed script — creates the default admin parent account.
 * Run: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Parent from './models/Parent';

dotenv.config();

const ADMIN = {
  name:          'Admin',
  email:         'admin@safekids.com',
  phone:         '0000000000',
  password:      'Admin@123',
  emailVerified: true,
  consentSigned: true,
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set in .env'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const existing = await Parent.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('Admin account already exists — skipping');
  } else {
    await Parent.create(ADMIN);
    console.log('Admin account created');
  }

  console.log('');
  console.log('  Email    : admin@safekids.com');
  console.log('  Password : Admin@123');
  console.log('');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
