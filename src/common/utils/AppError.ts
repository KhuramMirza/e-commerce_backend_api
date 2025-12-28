export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // This flag lets us know this is a "known" error (like User Not Found)
    // vs. a "programming" error (like a bug in code)
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
