import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log error stack for debugging

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && (err as any).kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((val: any) => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(400).json({ message: `Duplicate field value entered for: ${field}` });
  }
  
  // Multer error (e.g., file too large)
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  // Custom error from fileFilter in multer
  if (err.message === 'Not an image! Please upload only images.') {
    return res.status(400).json({ message: err.message });
  }


  res.status(500).json({
    message: err.message || 'Something went wrong on the server.',
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optionally send stack in dev
  });
};

export default errorHandler;