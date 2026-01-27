import { Request, Response, NextFunction } from "express";

// A simple adapter to move file URL to body
export const handleImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.file) {
    // Check both properties to be safe
    const url = (req.file as any).path || (req.file as any).secure_url;
    req.body.image = url;
  }
  next();
};
