import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleInputErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0] as any;
    res.status(400).json({
      status: "error",
      field: firstError.param,
      message: firstError.msg,
    });
    return;
  }

  next();
};
