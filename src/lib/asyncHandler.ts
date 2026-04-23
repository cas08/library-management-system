import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler = (req: Request, res: Response) => Promise<unknown>;

export function asyncHandler(fn: AsyncRouteHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}
