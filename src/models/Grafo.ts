import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

// zod schema
export const GrafoSchemaZod = z.object({
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

export type GrafoType = z.infer<typeof GrafoSchemaZod>;

// mongoose schema
const grafoSchema = new Schema(
  {
    nodes: [
      {
        Pessoa: { type: String, required: true },
        Papel: { type: String, required: true },
        Frequencia: { type: Number, required: true },
        Direcao: { type: String },
        Clareza: { type: Number },
        Objetividade: { type: Number },
        Efetividade: { type: Number },
        Comunicacao: { type: String },
      },
    ],
    edges: [
      {
        Pessoa: { type: String, required: true },
        Pessoa2: { type: String, required: true },
        Equipe: { type: String, required: true },
        weight: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

// interface e model
interface IGrafo extends GrafoType, Document {}

function createGrafoModel(): Model<IGrafo> {
  if (mongoose.models.Grafo) {
    return mongoose.models.Grafo as Model<IGrafo>;
  }

  return mongoose.model<IGrafo>('Grafo', grafoSchema);
}

const Grafo = createGrafoModel();

export default Grafo;
