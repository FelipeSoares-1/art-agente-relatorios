import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const feeds = await prisma.rSSFeed.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Erro ao buscar feeds:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar feeds.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, url } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Nome e URL do feed são obrigatórios.' },
        { status: 400 }
      );
    }

    const newFeed = await prisma.rSSFeed.create({
      data: {
        name,
        url,
      },
    });
    return NextResponse.json(newFeed, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') { // Unique constraint failed
      return NextResponse.json(
        { error: 'Já existe um feed com este nome ou URL.' },
        { status: 409 }
      );
    }
    console.error('Erro ao adicionar feed:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao adicionar feed.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID do feed é obrigatório para exclusão.' },
        { status: 400 }
      );
    }

    await prisma.rSSFeed.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Feed excluído com sucesso.' }, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') { // Record not found
      return NextResponse.json(
        { error: 'Feed não encontrado.' },
        { status: 404 }
      );
    }
    console.error('Erro ao excluir feed:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir feed.' },
      { status: 500 }
    );
  }
}
