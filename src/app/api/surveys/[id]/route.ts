import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import Survey from '@/models/Survey';
import type { SurveyType } from '@/models/Survey';
import type { Document } from 'mongoose';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['ativo', 'fechado']),
});

const contextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export async function PATCH(request: Request, context: unknown) {
  // ✅ Valida o context com Zod
  const parsedContext = contextSchema.safeParse(context);
  if (!parsedContext.success) {
    return NextResponse.json({ error: 'Parâmetro inválido' }, { status: 400 });
  }

  const { id } = parsedContext.data.params;

  try {
    await dbConnect();

    const body: unknown = await request.json();
    const parsedBody = schema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const { status } = parsedBody.data;

    const survey: (Document & SurveyType) | null = await Survey.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!survey) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Erro ao atualizar status do formulário:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
