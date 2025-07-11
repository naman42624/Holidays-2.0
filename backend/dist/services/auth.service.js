"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("@/models/User"));
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ JWT_SECRET not set in environment variables, using default');
        }
    }
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    async register(userData) {
        const { email, password, firstName, lastName } = userData;
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const user = new User_1.default({
            email: email.toLowerCase(),
            password: password,
            firstName,
            lastName,
            preferences: {
                currency: 'INR',
                language: 'en',
                timezone: 'UTC',
            },
            profile: {},
        });
        await user.save();
        const savedUser = await User_1.default.findById(user._id);
        if (!savedUser) {
            throw new Error('Failed to retrieve saved user');
        }
        const token = this.generateToken({
            userId: user._id,
            email: user.email,
        });
        const userResponse = savedUser.toObject();
        const { password: _, ...safeUserResponse } = userResponse;
        return { user: safeUserResponse, token };
    }
    async login(credentials) {
        const { email, password } = credentials;
        console.log('Login attempt for:', email);
        const user = await User_1.default.findOne({ email: email.toLowerCase() }).select('+password');
        console.log('User found:', user ? user.email : 'No user found');
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        user.lastLogin = new Date();
        await user.save();
        const completeUser = await User_1.default.findById(user._id);
        if (!completeUser) {
            throw new Error('User not found');
        }
        const token = this.generateToken({
            userId: user._id,
            email: user.email,
        });
        const userResponse = completeUser.toObject();
        const { password: _, ...safeUserResponse } = userResponse;
        return { user: safeUserResponse, token };
    }
    async getUserProfile(userId) {
        const user = await User_1.default.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateProfile(userId, updates) {
        delete updates.password;
        delete updates.email;
        delete updates._id;
        const user = await User_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async changePassword(userId, passwords) {
        const { currentPassword, newPassword } = passwords;
        const user = await User_1.default.findById(userId).select('+password');
        if (!user) {
            throw new Error('User not found');
        }
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        user.password = newPassword;
        await user.save();
    }
    async refreshToken(token) {
        try {
            const decoded = this.verifyToken(token);
            const user = await User_1.default.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            const newToken = this.generateToken({
                userId: user._id,
                email: user.email,
            });
            return { token: newToken, user };
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map