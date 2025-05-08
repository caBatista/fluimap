import mongoose from 'mongoose';
import dbConnect from '@/server/database/db';
import Questionnaire from '@/models/Questionnaire';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

type RawWithEscala = {
  titulo: string;
  instrucoes: string;
  escala: Record<string, string>;
  pergunta: string;
  itens: string[];
};
type RawComunicao = {
  titulo: string;
  instrucoes: string;
  pergunta: string;
  questoes: { question: string; options: string[] }[];
};

const rawList: Array<{
  section: 'jobMeaning' | 'communicationPeers' | 'wellBeing';
  raw: RawWithEscala | RawComunicao;
}> = [
  {
    section: 'jobMeaning',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    raw: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/job-meaning.json'), 'utf-8')),
  },
  {
    section: 'communicationPeers',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    raw: JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/peer-communication.json'), 'utf-8')
    ),
  },
  {
    section: 'wellBeing',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    raw: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/well-being.json'), 'utf-8')),
  },
];

function buildOptions(scale: Record<string, string>) {
  return Object.entries(scale).map(([value, label]) => ({ value, label }));
}

async function seed() {
  await dbConnect();

  for (const { section, raw } of rawList) {
    let doc: {
      name: string;
      version: string;
      section: string;
      instructions: string;
      questions: unknown[];
    };

    if ('itens' in raw) {
      const escala = raw.escala;
      const perguntaBase = raw.pergunta;
      doc = {
        name: raw.titulo,
        version: '1.0.0',
        section,
        instructions: raw.instrucoes,
        questions: raw.itens.map((item, idx) => ({
          _id: nanoid(),
          text: `${perguntaBase} ${item}`,
          type: 'singleChoice' as const,
          options: buildOptions(escala),
          order: idx + 1,
        })),
      };
    } else {
      doc = {
        name: raw.titulo,
        version: '1.0.0',
        section,
        instructions: raw.instrucoes,
        questions: raw.questoes.map((q, idx) => ({
          _id: nanoid(),
          text: q.question,
          type: 'singleChoice' as const,
          options: q.options.map((o) => ({ value: o, label: o })),
          order: idx + 1,
        })),
      };
    }

    await Questionnaire.updateOne({ section: doc.section }, { $set: doc }, { upsert: true });
    console.log(`✅ Section ${section} updated`);
  }

  await mongoose.disconnect();
  console.log('✅ All sections seeded/upserted');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
