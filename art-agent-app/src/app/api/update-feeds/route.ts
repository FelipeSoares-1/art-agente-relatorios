import { NextResponse } from 'next/server';
import { runFeedUpdate } from '@/lib/feed-updater';

export async function GET() {
  try {
    const { message } = await runFeedUpdate();
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Erro na rota /api/update-feeds:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar feeds.' },
      { status: 500 }
    );
  }
}