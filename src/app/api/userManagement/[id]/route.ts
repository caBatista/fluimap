import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import User from '@/models/User';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const deletedUser = await User.findByIdAndDelete(params.id);

    if (!deletedUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
