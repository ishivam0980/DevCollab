// Server actions for authentication (signup)
'use server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
export async function signUpAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!name || !email || !password) {
    return { error: 'All fields are required' };
  }
  try {
    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) return { error: 'Email already registered' };
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, provider: 'credentials' });
    return { success: true };
  } catch (error) {
    return { error: 'Something went wrong' };
  }
}
