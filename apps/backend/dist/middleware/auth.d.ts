import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    parentId?: string;
}
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => void;
