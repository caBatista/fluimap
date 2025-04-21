import { NextRequest, NextResponse } from 'next/server';
import Survey from '@/models/Survey';
import dbConnect from '@/server/database/db';

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    await dbConnect();
    const body = await request.json();

    const { status } = body;

    if (!['ativo', 'fechado'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const survey = await Survey.findByIdAndUpdate(id, { status }, { new: true });

    if (!survey) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Erro ao atualizar status do formulário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
