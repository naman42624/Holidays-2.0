import { IUser } from '@/models/User';
export declare class AuthService {
    private jwtSecret;
    private jwtExpiresIn;
    constructor();
    generateToken(payload: object): string;
    verifyToken(token: string): any;
    register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        user: IUser;
        token: string;
    }>;
    login(credentials: {
        email: string;
        password: string;
    }): Promise<{
        user: IUser;
        token: string;
    }>;
    getUserProfile(userId: string): Promise<IUser>;
    updateProfile(userId: string, updates: Partial<IUser>): Promise<IUser>;
    changePassword(userId: string, passwords: {
        currentPassword: string;
        newPassword: string;
    }): Promise<void>;
    refreshToken(token: string): Promise<{
        token: string;
        user: IUser;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map