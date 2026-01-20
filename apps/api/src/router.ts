import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import type { Context, User } from './context.js'
import {
  createCollectionInputSchema,
  updateCollectionInputSchema,
  syncCollectionInputSchema,
  updateSharingInputSchema,
  forkCollectionInputSchema,
  collectionABISchema,
} from '@contractlab/types'

const t = initTRPC.context<Context>().create()

// Middleware to check if user is authenticated
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user as User,
    },
  })
})

const publicProcedure = t.procedure
const protectedProcedure = t.procedure.use(isAuthenticated)

// ============================================================================
// Collection Routes
// ============================================================================

const collectionsRouter = t.router({
  // List user's collections
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, collections, collectionAbis, user } = ctx

    const userCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isPublic: collections.isPublic,
        shareId: collections.shareId,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
      })
      .from(collections)
      .where(eq(collections.userId, user.id))
      .orderBy(desc(collections.updatedAt))

    // Get ABI counts for each collection
    const result = await Promise.all(
      userCollections.map(async (collection: any) => {
        const abis = await db
          .select({ id: collectionAbis.id })
          .from(collectionAbis)
          .where(eq(collectionAbis.collectionId, collection.id))

        return {
          ...collection,
          abiCount: abis.length,
          createdAt: collection.createdAt.getTime(),
          updatedAt: collection.updatedAt.getTime(),
        }
      })
    )

    return result
  }),

  // Get single collection with all details
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, user } = ctx

      const collection = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.id), eq(collections.userId, user.id)))
        .limit(1)

      if (!collection.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        })
      }

      // Get ABIs for this collection
      const abis = await db
        .select()
        .from(collectionAbis)
        .where(eq(collectionAbis.collectionId, input.id))
        .orderBy(collectionAbis.order)

      // Get functions and presets for each ABI
      const abisWithDetails = await Promise.all(
        abis.map(async (abi: any) => {
          const functions = await db
            .select()
            .from(collectionFunctions)
            .where(eq(collectionFunctions.collectionAbiId, abi.id))

          const presets = await db
            .select()
            .from(collectionInputPresets)
            .where(eq(collectionInputPresets.collectionAbiId, abi.id))

          return {
            ...abi,
            functions: functions.map((f: any) => ({
              name: f.functionName,
              isShared: f.isShared,
            })),
            inputPresets: presets.map((p: any) => ({
              id: p.id,
              functionName: p.functionName,
              name: p.name,
              inputs: p.inputs,
              isShared: p.isShared,
            })),
          }
        })
      )

      const col = collection[0]!
      return {
        ...col,
        abis: abisWithDetails,
        syncStatus: 'synced' as const,
        createdAt: col.createdAt.getTime(),
        updatedAt: col.updatedAt.getTime(),
      }
    }),

  // Create new collection
  create: protectedProcedure
    .input(createCollectionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, user } = ctx

      const collectionId = crypto.randomUUID()
      const shareId = crypto.randomUUID().slice(0, 8)

      await db.insert(collections).values({
        id: collectionId,
        userId: user.id,
        name: input.name,
        description: input.description,
        isPublic: false,
        shareId,
      })

      // Insert ABIs if provided
      if (input.abis?.length) {
        for (let i = 0; i < input.abis.length; i++) {
          const abi = input.abis[i]
          if (!abi) continue
          
          const abiId = crypto.randomUUID()

          await db.insert(collectionAbis).values({
            id: abiId,
            collectionId,
            name: abi.name,
            content: abi.content,
            contractAddress: abi.contractAddress,
            chainId: abi.chainId,
            isShared: abi.isShared ?? true,
            order: i,
          })

          // Insert functions
          if (abi.functions?.length) {
            for (const func of abi.functions) {
              await db.insert(collectionFunctions).values({
                collectionAbiId: abiId,
                functionName: func.name,
                isShared: func.isShared ?? true,
              })
            }
          }

          // Insert input presets
          if (abi.inputPresets?.length) {
            for (const preset of abi.inputPresets) {
              await db.insert(collectionInputPresets).values({
                collectionAbiId: abiId,
                functionName: preset.functionName,
                name: preset.name,
                inputs: preset.inputs,
                isShared: preset.isShared ?? true,
              })
            }
          }
        }
      }

      return { id: collectionId, shareId }
    }),

  // Update collection metadata
  update: protectedProcedure
    .input(updateCollectionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, collections, user } = ctx

      const existing = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.id), eq(collections.userId, user.id)))
        .limit(1)

      if (!existing.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        })
      }

      const ex = existing[0]!
      await db
        .update(collections)
        .set({
          name: input.name ?? ex.name,
          description: input.description ?? ex.description,
          isPublic: input.isPublic ?? ex.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(collections.id, input.id))

      return { success: true }
    }),

  // Delete collection
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, collections, user } = ctx

      const existing = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.id), eq(collections.userId, user.id)))
        .limit(1)

      if (!existing.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        })
      }

      await db.delete(collections).where(eq(collections.id, input.id))

      return { success: true }
    }),

  // Sync local collection to cloud
  sync: protectedProcedure
    .input(syncCollectionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, user } = ctx

      const collectionId = crypto.randomUUID()
      const shareId = crypto.randomUUID().slice(0, 8)

      await db.insert(collections).values({
        id: collectionId,
        userId: user.id,
        name: input.name,
        description: input.description,
        isPublic: false,
        shareId,
      })

      // Insert ABIs
      for (let i = 0; i < input.abis.length; i++) {
        const abi = input.abis[i]
        if (!abi) continue
        
        const abiId = crypto.randomUUID()

        await db.insert(collectionAbis).values({
          id: abiId,
          collectionId,
          name: abi.name,
          content: abi.content,
          contractAddress: abi.contractAddress,
          chainId: abi.chainId,
          isShared: abi.isShared,
          order: i,
        })

        // Insert functions
        for (const func of abi.functions) {
          await db.insert(collectionFunctions).values({
            collectionAbiId: abiId,
            functionName: func.name,
            isShared: func.isShared,
          })
        }

        // Insert input presets
        for (const preset of abi.inputPresets) {
          await db.insert(collectionInputPresets).values({
            collectionAbiId: abiId,
            functionName: preset.functionName,
            name: preset.name,
            inputs: preset.inputs,
            isShared: preset.isShared,
          })
        }
      }

      return {
        success: true,
        cloudId: collectionId,
        shareId,
      }
    }),

  // Update sharing settings
  updateSharing: protectedProcedure
    .input(updateSharingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, user } = ctx

      // Verify ownership
      const existing = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.userId, user.id)))
        .limit(1)

      if (!existing.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        })
      }

      // Update collection public status
      await db
        .update(collections)
        .set({ isPublic: input.isPublic, updatedAt: new Date() })
        .where(eq(collections.id, input.collectionId))

      // Update ABI sharing
      for (const abiShare of input.sharedAbis) {
        await db
          .update(collectionAbis)
          .set({ isShared: abiShare.isShared })
          .where(eq(collectionAbis.id, abiShare.abiId))

        // Update function sharing
        for (const funcShare of abiShare.sharedFunctions) {
          await db
            .update(collectionFunctions)
            .set({ isShared: funcShare.isShared })
            .where(
              and(
                eq(collectionFunctions.collectionAbiId, abiShare.abiId),
                eq(collectionFunctions.functionName, funcShare.name)
              )
            )
        }

        // Update preset sharing
        for (const presetShare of abiShare.sharedPresets) {
          await db
            .update(collectionInputPresets)
            .set({ isShared: presetShare.isShared })
            .where(eq(collectionInputPresets.id, presetShare.presetId))
        }
      }

      return { success: true }
    }),

  // Get shared collection (public)
  getShared: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, users } = ctx

      const collection = await db
        .select({
          id: collections.id,
          shareId: collections.shareId,
          name: collections.name,
          description: collections.description,
          isPublic: collections.isPublic,
          createdAt: collections.createdAt,
          ownerName: users.name,
        })
        .from(collections)
        .leftJoin(users, eq(collections.userId, users.id))
        .where(and(eq(collections.shareId, input.shareId), eq(collections.isPublic, true)))
        .limit(1)

      if (!collection.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found or not public',
        })
      }

      const col = collection[0]!

      // Get shared ABIs
      const abis = await db
        .select()
        .from(collectionAbis)
        .where(and(eq(collectionAbis.collectionId, col.id), eq(collectionAbis.isShared, true)))
        .orderBy(collectionAbis.order)

      const abisWithDetails = await Promise.all(
        abis.map(async (abi: any) => {
          // Get shared functions
          const functions = await db
            .select()
            .from(collectionFunctions)
            .where(and(eq(collectionFunctions.collectionAbiId, abi.id), eq(collectionFunctions.isShared, true)))

          // Get shared presets
          const presets = await db
            .select()
            .from(collectionInputPresets)
            .where(and(eq(collectionInputPresets.collectionAbiId, abi.id), eq(collectionInputPresets.isShared, true)))

          return {
            id: abi.id,
            name: abi.name,
            content: abi.content,
            contractAddress: abi.contractAddress,
            chainId: abi.chainId,
            functions: functions.map((f: any) => f.functionName),
            inputPresets: presets.map((p: any) => ({
              id: p.id,
              functionName: p.functionName,
              name: p.name,
              inputs: p.inputs,
              isShared: true,
            })),
          }
        })
      )

      return {
        id: col.id,
        shareId: col.shareId,
        name: col.name,
        description: col.description,
        ownerName: col.ownerName,
        abis: abisWithDetails,
        createdAt: col.createdAt.getTime(),
      }
    }),

  // Fork a shared collection
  fork: protectedProcedure
    .input(forkCollectionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, user } = ctx

      // Get the original collection
      const original = await db
        .select()
        .from(collections)
        .where(and(eq(collections.shareId, input.shareId), eq(collections.isPublic, true)))
        .limit(1)

      if (!original.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found or not public',
        })
      }

      const orig = original[0]!
      const newCollectionId = crypto.randomUUID()
      const newShareId = crypto.randomUUID().slice(0, 8)

      // Create forked collection
      await db.insert(collections).values({
        id: newCollectionId,
        userId: user.id,
        name: input.newName || `${orig.name} (Fork)`,
        description: orig.description,
        isPublic: false,
        shareId: newShareId,
      })

      // Get shared ABIs from original
      const abis = await db
        .select()
        .from(collectionAbis)
        .where(and(eq(collectionAbis.collectionId, orig.id), eq(collectionAbis.isShared, true)))
        .orderBy(collectionAbis.order)

      // Copy ABIs
      for (let i = 0; i < abis.length; i++) {
        const abi = abis[i]
        if (!abi) continue
        
        const newAbiId = crypto.randomUUID()

        await db.insert(collectionAbis).values({
          id: newAbiId,
          collectionId: newCollectionId,
          name: abi.name,
          content: abi.content,
          contractAddress: abi.contractAddress,
          chainId: abi.chainId,
          isShared: true,
          order: i,
        })

        // Copy shared functions
        const functions = await db
          .select()
          .from(collectionFunctions)
          .where(and(eq(collectionFunctions.collectionAbiId, abi.id), eq(collectionFunctions.isShared, true)))

        for (const func of functions) {
          await db.insert(collectionFunctions).values({
            collectionAbiId: newAbiId,
            functionName: func.functionName,
            isShared: true,
          })
        }

        // Copy shared presets
        const presets = await db
          .select()
          .from(collectionInputPresets)
          .where(and(eq(collectionInputPresets.collectionAbiId, abi.id), eq(collectionInputPresets.isShared, true)))

        for (const preset of presets) {
          await db.insert(collectionInputPresets).values({
            collectionAbiId: newAbiId,
            functionName: preset.functionName,
            name: preset.name,
            inputs: preset.inputs,
            isShared: true,
          })
        }
      }

      return {
        success: true,
        id: newCollectionId,
        shareId: newShareId,
      }
    }),

  // Add ABI to collection
  addAbi: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        abi: collectionABISchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, collectionFunctions, collectionInputPresets, user } = ctx

      // Verify ownership
      const existing = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.userId, user.id)))
        .limit(1)

      if (!existing.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        })
      }

      // Get current max order
      const maxOrder = await db
        .select({ order: collectionAbis.order })
        .from(collectionAbis)
        .where(eq(collectionAbis.collectionId, input.collectionId))
        .orderBy(desc(collectionAbis.order))
        .limit(1)

      const newOrder = maxOrder.length ? (maxOrder[0]?.order ?? 0) + 1 : 0
      const abiId = crypto.randomUUID()

      await db.insert(collectionAbis).values({
        id: abiId,
        collectionId: input.collectionId,
        name: input.abi.name,
        content: input.abi.content,
        contractAddress: input.abi.contractAddress,
        chainId: input.abi.chainId,
        isShared: input.abi.isShared,
        order: newOrder,
      })

      // Insert functions
      for (const func of input.abi.functions) {
        await db.insert(collectionFunctions).values({
          collectionAbiId: abiId,
          functionName: func.name,
          isShared: func.isShared,
        })
      }

      // Insert presets
      for (const preset of input.abi.inputPresets) {
        await db.insert(collectionInputPresets).values({
          collectionAbiId: abiId,
          functionName: preset.functionName,
          name: preset.name,
          inputs: preset.inputs,
          isShared: preset.isShared,
        })
      }

      // Update collection timestamp
      await db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, input.collectionId))

      return { id: abiId }
    }),

  // Remove ABI from collection
  removeAbi: protectedProcedure
    .input(z.object({ collectionId: z.string(), abiId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, collections, collectionAbis, user } = ctx

      // Verify ownership
      const existing = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.userId, user.id)))
        .limit(1)

      if (!existing.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        })
      }

      await db.delete(collectionAbis).where(eq(collectionAbis.id, input.abiId))

      // Update collection timestamp
      await db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, input.collectionId))

      return { success: true }
    }),
})

// ============================================================================
// Main Router
// ============================================================================

export const appRouter = t.router({
  health: t.procedure.query(() => 'ok'),
  collections: collectionsRouter,
})

export type AppRouter = typeof appRouter
