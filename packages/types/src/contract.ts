import { z } from 'zod'

export const contractSchema = z.object({
  address: z.string().startsWith('0x'),
  abi: z.array(z.any()),
  chainId: z.number(),
})

export type ContractInput = z.infer<typeof contractSchema>

// Schema for saving a collection
export const collectionSchema = z.object({
  name: z.string().min(1),
  data: z.any(),
})

export type CollectionInput = z.infer<typeof collectionSchema>

