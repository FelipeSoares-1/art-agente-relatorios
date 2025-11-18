import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todas as categorias de tags
export async function GET() {
  try {
    const categories = await prisma.tagCategory.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

// POST - Criar nova categoria
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, keywords, color, enabled } = body;

    if (!name || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Nome e palavras-chave são obrigatórios' },
        { status: 400 }
      );
    }

    const category = await prisma.tagCategory.create({
      data: {
        name,
        keywords: JSON.stringify(keywords),
        color: color || '#3b82f6',
        enabled: enabled !== undefined ? enabled : true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao criar categoria:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar categoria existente
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, keywords, color, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const updateData: Prisma.TagCategoryUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (keywords !== undefined) updateData.keywords = JSON.stringify(keywords);
    if (color !== undefined) updateData.color = color;
    if (enabled !== undefined) updateData.enabled = enabled;

    const category = await prisma.tagCategory.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error('Erro ao atualizar categoria:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

// DELETE - Remover categoria
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.tagCategory.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Categoria removida com sucesso' });
  } catch (error: unknown) {
    console.error('Erro ao deletar categoria:', error);
    
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}
