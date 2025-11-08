export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    health: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: string;
        meta: object;
    }>;
    saveCollection: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            data: any;
        };
        output: {
            success: boolean;
            data: {
                name: string;
                data: any;
            };
        };
        meta: object;
    }>;
}>>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=router.d.ts.map