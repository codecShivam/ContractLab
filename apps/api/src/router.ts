import { initTRPC } from '@trpc/server'
import { collectionSchema } from '@contractlab/types'

const t = initTRPC.create()
export const appRouter = t.router({
  health: t.procedure.query(() => 'ok'),
  saveCollection: t.procedure
    .input(collectionSchema)
    .mutation(({ input }) => {
      return { success: true, data: input }
    }),
})
export type AppRouter = typeof appRouter
