'use client';

import { useState, useEffect } from 'react';

type NewsArticle = {
  id: number;
  title: string;
  link: string;
  summary: string;
  publishedDate: string; // ISO string
  feedName: string;
  tags?: string; // Tags are stored as a JSON string
};

const TAG_OPTIONS = [
  'Novos Clientes',
  'Campanhas',
  'Prêmios',
  'Movimentação de Talentos',
];

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const fetchNews = async (period: string | null = null, tag: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/news';
      const params = new URLSearchParams();
      if (period) {
        params.append('period', period);
      }
      if (tag) {
        params.append('tag', tag);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: NewsArticle[] = await response.json();
      setNews(data);
    } catch (e: any) {
      setError(`Falha ao carregar notícias: ${e.message}`);
      console.error('Erro ao buscar notícias:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(filterPeriod, filterTag);
  }, [filterPeriod, filterTag]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">A.R.T. Dashboard de Notícias</h1>
          
          {/* Filtros de Período */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterPeriod(null)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${!filterPeriod ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterPeriod('24h')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterPeriod === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Últimas 24h
            </button>
            <button
              onClick={() => setFilterPeriod('d-1')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterPeriod === 'd-1' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Dia Anterior
            </button>
            <button
              onClick={() => setFilterPeriod('7d')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterPeriod === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Últimos 7d
            </button>
            <button
              onClick={() => setFilterPeriod('15d')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filterPeriod === '15d' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Últimos 15d
            </button>
          </div>

          {/* Filtros de Tags */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${!filterTag ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Todas as Tags
            </button>
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filterTag === tag ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {loading && <p className="text-center text-lg">Carregando notícias...</p>}
        {error && <p className="text-center text-lg text-red-500">{error}</p>}
        {!loading && news.length === 0 && !error && (
          <p className="text-center text-lg">Nenhuma notícia encontrada para o período/tag selecionado(a).</p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {new Date(article.publishedDate).toLocaleDateString()} - {article.feedName}
                </p>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{article.summary}</p>
                {article.tags && JSON.parse(article.tags).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {JSON.parse(article.tags).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
