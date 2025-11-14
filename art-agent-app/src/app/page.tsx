'use client';

import { useState, useEffect, useMemo } from 'react';

type NewsArticle = {
  id: number;
  title: string;
  link: string;
  summary: string;
  publishedDate: string;
  feedName: string;
  feedId: number;
  tags?: string;
};

type RSSFeed = {
  id: number;
  name: string;
  url: string;
};

type TagCategory = {
  id: number;
  name: string;
  keywords: string;
  color: string;
  enabled: boolean;
};

const periodOptions: { label: string; value: string | null }[] = [
  { label: 'Todas', value: null },
  { label: 'Últimas 24h', value: '24h' },
  { label: 'Dia anterior', value: 'd-1' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 15 dias', value: '15d' },
];

const parseTags = (raw?: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterFeedId, setFilterFeedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const fetchNews = async (
    period: string | null = null,
    tag: string | null = null,
    feedId: string | null = null,
    search: string = ''
  ) => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/news';
      const params = new URLSearchParams();

      if (period) params.append('period', period);
      if (tag) params.append('tag', tag);
      if (feedId) params.append('feedId', feedId);
      if (search) params.append('search', search);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsArticle[] = await response.json();
      setNews(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(`Falha ao carregar notícias: ${message}`);
      console.error('Erro ao buscar notícias:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeds = async () => {
    try {
      const response = await fetch('/api/feeds');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: RSSFeed[] = await response.json();
      setFeeds(data);
    } catch (e) {
      console.error('Erro ao buscar feeds:', e);
    }
  };

  const fetchTagCategories = async () => {
    try {
      const response = await fetch('/api/tag-categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TagCategory[] = await response.json();
      const activeTagNames = data.filter(cat => cat.enabled).map(cat => cat.name);
      setTagOptions(activeTagNames);
    } catch (e) {
      console.error('Erro ao buscar categorias de tags:', e);
    }
  };

  useEffect(() => {
    fetchFeeds();
    fetchTagCategories();
  }, []);

  useEffect(() => {
    fetchNews(filterPeriod, filterTag, filterFeedId, searchTerm);
  }, [filterPeriod, filterTag, filterFeedId, searchTerm]);

  const summary = useMemo(() => {
    const totalArticles = news.length;
    const uniqueFeeds = new Set(news.map(article => article.feedName)).size;
    const tagSet = new Set<string>();
    news.forEach(article => {
      parseTags(article.tags).forEach(tag => tagSet.add(tag));
    });
    const lastPublished = news.reduce<Date | null>((latest, article) => {
      const published = new Date(article.publishedDate);
      if (!latest || published > latest) {
        return published;
      }
      return latest;
    }, null);

    return {
      totalArticles,
      uniqueFeeds,
      uniqueTags: tagSet.size,
      lastPublished,
    };
  }, [news]);

  const topSources = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];

    news.forEach(article => {
      if (!seen.has(article.feedName)) {
        seen.add(article.feedName);
        ordered.push(article.feedName);
      }
    });

    return ordered.slice(0, 5);
  }, [news]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Section */}
        <section className="mb-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">Monitoramento Inteligente</h2>
              <p className="text-red-100 text-lg leading-relaxed mb-6">
                Acompanhe em tempo real as principais tendências, concorrentes e oportunidades do mercado de publicidade e marketing.
              </p>
              <div className="flex gap-4">
                <a href="/feeds" className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Gerenciar Fontes
                </a>
                <a href="/dashboard" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition">
                  Ver Relatórios
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{summary.totalArticles}</p>
                <p className="text-red-100 text-sm mt-2">Artigos Coletados</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{summary.uniqueFeeds}</p>
                <p className="text-red-100 text-sm mt-2">Fontes Ativas</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{summary.uniqueTags}</p>
                <p className="text-red-100 text-sm mt-2">Tags Identificadas</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-lg font-bold">
                  {summary.lastPublished
                    ? summary.lastPublished.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </p>
                <p className="text-red-100 text-sm mt-2">Última Atualização</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-6">🔍 Refinar Busca</h3>

              <div className="space-y-6">
                {/* Period Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Período</label>
                  <div className="flex flex-wrap gap-2">
                    {periodOptions.map(option => (
                      <button
                        key={option.label}
                        onClick={() => setFilterPeriod(option.value)}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                          filterPeriod === option.value
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterTag(null)}
                      className={`px-4 py-2 rounded-full font-medium transition ${
                        !filterTag
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      Todas
                    </button>
                    {tagOptions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                          filterTag === tag
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Source */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setSearchTerm(searchInput);
                        }}
                        placeholder="Palavras-chave..."
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setSearchTerm(searchInput)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                      >
                        🔍
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fonte</label>
                    <select
                      value={filterFeedId || ''}
                      onChange={(e) => setFilterFeedId(e.target.value || null)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Todas as fontes</option>
                      {feeds.map(feed => (
                        <option key={feed.id} value={feed.id.toString()}>
                          {feed.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-6">📰 Últimas Notícias</h3>

              {loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">⏳ Carregando notícias...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded">
                  <p className="text-red-700">⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && news.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhuma notícia encontrada para estes filtros.</p>
                </div>
              )}

              {!loading && !error && news.length > 0 && (
                <div className="space-y-4">
                  {news.map(article => {
                    const tags = parseTags(article.tags);
                    return (
                      <a
                        key={article.id}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition group"
                      >
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-bold text-gray-800 group-hover:text-red-600 transition line-clamp-2">
                            {article.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(article.publishedDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.summary}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                            {article.feedName}
                          </span>
                          {tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap justify-end">
                              {tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                              {tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Resumo</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>Artigos totais:</span>
                  <span className="font-bold text-red-600">{summary.totalArticles}</span>
                </li>
                <li className="flex justify-between">
                  <span>Fontes monitoradas:</span>
                  <span className="font-bold text-red-600">{summary.uniqueFeeds}</span>
                </li>
                <li className="flex justify-between">
                  <span>Tags identificadas:</span>
                  <span className="font-bold text-red-600">{summary.uniqueTags}</span>
                </li>
                <li className="flex justify-between pt-3 border-t-2 border-gray-200">
                  <span>Última coleta:</span>
                  <span className="font-bold text-red-600">
                    {summary.lastPublished
                      ? summary.lastPublished.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Sources Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📡 Principais Fontes</h3>
              {topSources.length > 0 ? (
                <ul className="space-y-2">
                  {topSources.map(source => (
                    <li key={source} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      {source}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Carregando...</p>
              )}
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2">⚙️ Gerenciar</h3>
              <p className="text-red-100 text-sm mb-4">Configure suas fontes e categorias de tags</p>
              <div className="space-y-2">
                <a href="/feeds" className="block w-full bg-white text-red-600 py-2 rounded-lg text-center font-semibold hover:bg-gray-100 transition">
                  Fontes RSS
                </a>
                <a href="/tags" className="block w-full bg-white bg-opacity-20 text-white py-2 rounded-lg text-center font-semibold hover:bg-opacity-30 transition">
                  Categorias
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
