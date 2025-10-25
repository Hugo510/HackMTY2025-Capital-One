import { Response } from 'express';

export const ok = (res: Response, data: unknown) => res.status(200).json(data);
export const created = (res: Response, data: unknown) => res.status(201).json(data);
export const noContent = (res: Response) => res.status(204).send();
