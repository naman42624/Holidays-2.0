import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map