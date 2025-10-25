import { ZodSchema, ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodSchema<ZodTypeAny>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      // provide structured validation errors
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    return res.status(400).json({ error: (err as Error).message });
  }
};

export default validate;
