import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express';
export declare const createContext: ({ req, res }: CreateExpressContextOptions) => {
    req: Request;
    res: Response;
};
export type Context = Awaited<ReturnType<typeof createContext>>;
//# sourceMappingURL=context.d.ts.map