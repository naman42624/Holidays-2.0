import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class UserController {
    getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    resetUserPassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    createUser(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map