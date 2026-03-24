import { Request, Response, NextFunction } from 'express';
export interface ChildAuthRequest extends Request {
    childId?: string;
    parentId?: string;
    deviceId?: string;
}
export declare const protectChild: (req: ChildAuthRequest, res: Response, next: NextFunction) => void;
