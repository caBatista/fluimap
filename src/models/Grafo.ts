import { z } from 'zod';

export const grafoSchema = z.object({
  nodes: z.array(
    z.object({
      Pessoa: z.string(),
      Papel: z.string(),
      Frequencia: z.union([z.number(), z.string().transform((val) => Number(val))]),
      Direcao: z.string().optional(),
      Clareza: z.number().optional(),
      Objetividade: z.number().optional(),
      Efetividade: z.number().optional(),
      Comunicacao: z.string().optional(),
    })
  ),
  edges: z.array(
    z.object({
      Pessoa: z.string(),
      Pessoa2: z.string(),
      Equipe: z.string(),
      weight: z.number(),
    })
  ),
});
