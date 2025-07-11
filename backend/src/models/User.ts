import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'super-admin' | 'website-editor';
  lastLogin?: Date;
  preferences: {
    currency: string;
    language: string;
    timezone: string;
  };
  profile: {
    dateOfBirth?: Date;
    phone?: string;
    address?: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): object;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super-admin', 'website-editor'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      currency: {
        type: String,
        default: 'USD',
        length: 3,
      },
      language: {
        type: String,
        default: 'en',
        length: 2,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    profile: {
      dateOfBirth: {
        type: Date,
      },
      phone: {
        type: String,
        trim: true,
      },
      address: {
        street: String,
        city: String,
        country: String,
        postalCode: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  console.log('User model comparePassword called');
  console.log('Candidate password:', candidatePassword);
  console.log('Stored hash:', this.password);
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('bcrypt.compare result:', result);
  return result;
};

// Get public profile (exclude sensitive data)
UserSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    preferences: this.preferences,
    profile: {
      phone: this.profile?.phone,
      address: this.profile?.address,
    },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model<IUser>('User', UserSchema);
