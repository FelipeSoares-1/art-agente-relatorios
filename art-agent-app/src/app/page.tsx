'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

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

const tagChipClasses = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'border-blue-500 bg-blue-500 text-white shadow'
      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-500'
  }`;

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
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Artplan_logo.png" alt="Artplan" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-slate-700">Radar de Notícias</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <a href="#feeds" className="hover:text-blue-600 transition font-medium">Fontes</a>
            <a href="#tags" className="hover:text-blue-600 transition font-medium">Tags</a>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-12 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <p className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">📊 INTELIGÊNCIA DE MERCADO</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900 leading-tight">
                  Monitoramento de notícias em tempo real
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  Acompanhe tendências, concorrentes e oportunidades do mercado de publicidade e marketing com dados consolidados.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-700">Artigos</p>
                  <p className="mt-2 text-3xl font-bold text-blue-900">{summary.totalArticles}</p>
                  <p className="text-xs text-blue-600 mt-1">Nos filtros atuais</p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                  <p className="text-sm font-semibold text-purple-700">Fontes</p>
                  <p className="mt-2 text-3xl font-bold text-purple-900">{summary.uniqueFeeds}</p>
                  <p className="text-xs text-purple-600 mt-1">Origem dos dados</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold text-emerald-700">Tags</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-900">{summary.uniqueTags}</p>
                  <p className="text-xs text-emerald-600 mt-1">Contextos</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                  <p className="text-sm font-semibold text-orange-700">Atualizado</p>
                  <p className="mt-2 text-2xl font-bold text-orange-900">
                    {summary.lastPublished
                      ? summary.lastPublished.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Agora</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h3 className="font-bold text-slate-900">Cobertura</h3>
              </div>
              <p className="text-sm text-slate-600 mb-5">
                Monitora <span className="font-semibold">{feeds.length} fontes</span> de publicidade e marketing.
              </p>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Principais</p>
                <ul className="space-y-2">
                  {topSources.length > 0 ? (
                    topSources.map(source => (
                      <li key={source} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {source}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">Carregando...</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-300 bg-blue-600 p-6 text-white transition hover:bg-blue-700 cursor-pointer">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Gerenciar</p>
              <h3 className="mt-2 text-lg font-bold">Suas Fontes</h3>
              <p className="mt-2 text-sm text-blue-100">Configure feeds RSS e novas fontes</p>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-slate-800 p-6 text-white transition hover:bg-slate-900 cursor-pointer">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Insights</p>
              <h3 className="mt-2 text-lg font-bold">Ver Histórico</h3>
              <p className="mt-2 text-sm text-slate-300">Acesse análises e relatórios</p>
            </div>
          </aside>
        </header>

        <main className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">🔍 Refine sua Busca</h3>
                  <p className="text-sm text-slate-500">Filtros por período, tags, fonte ou palavras</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Período</p>
                  <div className="flex flex-wrap gap-2">
                    {periodOptions.map(option => (
                      <button
                        key={option.label}
                        onClick={() => setFilterPeriod(option.value)}
                        className={tagChipClasses(filterPeriod === option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Tags</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setFilterTag(null)}
                      className={tagChipClasses(!filterTag)}
                    >
                      Todas
                    </button>
                    {tagOptions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className={tagChipClasses(filterTag === tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr,200px]">
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">Busca</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setSearchTerm(searchInput);
                        }}
                        placeholder="Palavras-chave..."
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        onClick={() => setSearchTerm(searchInput)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        🔍
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">Fonte</p>
                    <select
                      value={filterFeedId || ''}
                      onChange={(e) => setFilterFeedId(e.target.value || null)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400"
                    >
                      <option value="">Todas</option>
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

            <div className="space-y-4">
              {loading && (
                <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
                  <p className="text-sm text-blue-600 font-medium">⏳ Carregando...</p>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center">
                  <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && news.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">Nenhuma notícia encontrada.</p>
                </div>
              )}

              {!loading && !error && news.length > 0 && (
                <div className="space-y-3">
                  {news.map(article => {
                    const tags = parseTags(article.tags);
                    return (
                      <a
                        key={article.id}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2">
                            {article.title}
                          </h3>
                          <time className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(article.publishedDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                          </time>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{article.summary}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {article.feedName}
                          </span>
                          {tags.length > 0 && (
                            <div className="flex gap-1">
                              {tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                              {tags.length > 2 && <span className="text-xs text-slate-500">+{tags.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase text-slate-700 tracking-wide mb-4">📈 Resumo</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><span className="font-semibold">{summary.totalArticles}</span> artigos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><span className="font-semibold">{summary.uniqueFeeds}</span> fontes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><span className="font-semibold">{summary.uniqueTags}</span> tags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Última às <span className="font-semibold">{summary.lastPublished ? summary.lastPublished.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-slate-800 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">🎯 Roadmap</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>✓ Análise de sentimento</li>
                <li>✓ Alertas por email</li>
                <li>✓ Integração CRM</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
