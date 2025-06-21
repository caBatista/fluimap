// app/api/helpcheck/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Você pode inserir lógica adicional aqui (DB, cache, etc.)
  return NextResponse.json({ status: 'ok' })
}

// Se quiser lidar com outros métodos:
export async function POST() {
  return NextResponse.json(
    { status: 'ok (via POST)' },
    { status: 200 }
  )
}
