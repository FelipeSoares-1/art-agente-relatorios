import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TagCategory {
  name: string;
  keywords: string[];
  color: string;
}

// Cache das categorias para evitar múltiplas consultas
let categoriesCache: TagCategory[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Carrega as categorias de tags do banco de dados
 */
export async function loadTagCategories(): Promise<TagCategory[]> {
  const now = Date.now();
  
  // Retorna cache se ainda válido
  if (categoriesCache && (now - cacheTime < CACHE_DURATION)) {
    return categoriesCache;
  }

  try {
    const categories = await prisma.tagCategory.findMany({
      where: { enabled: true },
      select: {
        name: true,
        keywords: true,
        color: true
      }
    });

    categoriesCache = categories.map(cat => ({
      name: cat.name,
      keywords: JSON.parse(cat.keywords),
      color: cat.color
    }));
    
    cacheTime = now;
    return categoriesCache;
  } catch (error) {
    console.error('Erro ao carregar categorias de tags:', error);
    
    // Fallback para categorias padrão se o banco falhar
    return getDefaultCategories();
  }
}

/**
 * Identifica tags em um texto baseado nas palavras-chave cadastradas
 */
export async function identificarTags(texto: string): Promise<string[]> {
  if (!texto) return [];
  
  const textoLower = texto.toLowerCase();
  const categories = await loadTagCategories();
  const tagsEncontradas: string[] = [];

  for (const category of categories) {
    const temKeyword = category.keywords.some(keyword =>
      textoLower.includes(keyword.toLowerCase())
    );

    if (temKeyword) {
      tagsEncontradas.push(category.name);
    }
  }

  return tagsEncontradas;
}

/**
 * Força recarregamento do cache na próxima chamada
 */
export function invalidateTagCache() {
  categoriesCache = null;
  cacheTime = 0;
}

/**
 * Categorias padrão (fallback)
 */
function getDefaultCategories(): TagCategory[] {
  return [
    {
      name: 'Novos Clientes',
      keywords: ['novo cliente', 'conquista', 'contrato', 'fechou conta', 'venceu concorrência'],
      color: '#10b981'
    },
    {
      name: 'Campanhas',
      keywords: ['campanha', 'lançamento', 'ação', 'projeto', 'iniciativa'],
      color: '#3b82f6'
    },
    {
      name: 'Prêmios',
      keywords: ['prêmio', 'premiado', 'venceu', 'troféu', 'medalha', 'leão', 'ouro', 'prata', 'bronze'],
      color: '#f59e0b'
    },
    {
      name: 'Concorrentes',
      keywords: [
        'africa', 'almap', 'bbdo', 'talent', 'ddb', 'grey', 'havas',
        'lew lara', 'mccann', 'ogilvy', 'publicis', 'wunderman',
        'africa creative', 'sunset', 'soko', 'gut', 'galeria'
      ],
      color: '#ef4444'
    },
    {
      name: 'Digital',
      keywords: ['digital', 'social media', 'influencer', 'redes sociais', 'instagram', 'tiktok', 'youtube'],
      color: '#8b5cf6'
    },
    {
      name: 'Inovação',
      keywords: ['ia', 'inteligência artificial', 'tecnologia', 'inovação', 'metaverso', 'nft', 'web3'],
      color: '#06b6d4'
    },
    {
      name: 'Eventos',
      keywords: ['festival', 'congresso', 'seminário', 'palestra', 'cannes', 'ccsp', 'rio2c'],
      color: '#ec4899'
    },
    {
      name: 'Mercado',
      keywords: ['mercado', 'investimento', 'fusão', 'aquisição', 'faturamento', 'resultado'],
      color: '#6366f1'
    }
  ];
}
