import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check if the data (body/query/params) matches the Zod schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // 2. If valid, go to the next controller
      return next();
    } catch (error) {
      // 3. If invalid, return 400 Bad Request with the specific error message
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.issues.map((e) => ({
            // field: e.path[1], // e.g., "email"
            field: e.path.slice(1).join(".") || "unknown",
            message: e.message, // e.g., "Invalid email format"
          })),
        });
      }
      return next(error);
    }
  };
