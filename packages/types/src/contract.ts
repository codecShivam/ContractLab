import { z } from 'zod'

export const contractSchema = z.object({
  address: z.string().startsWith('0x'),
  abi: z.array(z.any()),
  chainId: z.number(),
})

export type ContractInput = z.infer<typeof contractSchema>
