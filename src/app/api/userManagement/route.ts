import { NextResponse } from 'next/server';
import dbConnect from '@/server/database/db';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find(
      {},
      '_id clerkId email name credits creditsExpirationDate'
    ).lean();

    const result = users.map((user) => ({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      credits: user.credits?.toString() ?? '-',
      expirationDate: user.creditsExpirationDate
        ? new Date(user.creditsExpirationDate).toLocaleDateString('pt-BR')
        : '-',
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
