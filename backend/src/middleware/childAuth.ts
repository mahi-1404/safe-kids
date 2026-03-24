import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface ChildAuthRequest extends Request {
  childId?: string;
  parentId?: string;
  deviceId?: string;
}

// Middleware for routes called by the child app
// Child tokens contain: { childId, parentId, deviceId }
export const protectChild = (req: ChildAuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      childId: string;
      parentId: string;
      deviceId: string;
    };
    req.childId = decoded.childId;
    req.parentId = decoded.parentId;
    req.deviceId = decoded.deviceId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
