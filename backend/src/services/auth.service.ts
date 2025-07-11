import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User, { IUser } from '@/models/User';
import { ApiResponse } from '@/types/amadeus';

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not set in environment variables, using default');
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret as string);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: IUser; token: string }> {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    // const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: password,
      firstName,
      lastName,
      preferences: {
        currency: 'INR',
        language: 'en',
        timezone: 'UTC',
      },
      profile: {
        // Initialize empty profile
      },
    });

    await user.save();

    // Get the complete saved user without password
    const savedUser = await User.findById(user._id);
    if (!savedUser) {
      throw new Error('Failed to retrieve saved user');
    }

    // Generate token
    const token = this.generateToken({
      userId: user._id,
      email: user.email,
    });

    // Remove password from response
    const userResponse = savedUser.toObject();
    const { password: _, ...safeUserResponse } = userResponse;

    return { user: safeUserResponse as any, token };
  }

  /**
   * Login user
   */
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: IUser; token: string }> {
    const { email, password } = credentials;
    console.log('Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('User found:', user ? user.email : 'No user found');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get complete user data without password for response
    const completeUser = await User.findById(user._id);
    if (!completeUser) {
      throw new Error('User not found');
    }

    // Generate token
    const token = this.generateToken({
      userId: user._id,
      email: user.email,
    });

    // Remove password from response and ensure all fields are included
    const userResponse = completeUser.toObject();
    const { password: _, ...safeUserResponse } = userResponse;

    return { user: safeUserResponse as any, token };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<IUser>): Promise<IUser> {
    // Remove sensitive fields from updates
    delete (updates as any).password;
    delete (updates as any).email;
    delete (updates as any)._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const { currentPassword, newPassword } = passwords;

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password (User model will hash it via pre-save hook)
    user.password = newPassword;
    await user.save();
  }

  /**
   * Refresh token
   */
  async refreshToken(token: string): Promise<{ token: string; user: IUser }> {
    try {
      const decoded = this.verifyToken(token);
      
      // Get fresh user data
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = this.generateToken({
        userId: user._id,
        email: user.email,
      });

      return { token: newToken, user };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();
