'use client';

import { useState, useEffect } from 'react';

type RSSFeed = {
  id: number;
  name: string;
  url: string;
};

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newFeedName, setNewFeedName] = useState<string>('');
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [addFeedLoading, setAddFeedLoading] = useState<boolean>(false);
  const [addFeedError, setAddFeedError] = useState<string | null>(null);

  const fetchFeeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/feeds');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: RSSFeed[] = await response.json();
      setFeeds(data);
    } catch (e: any) {
      setError(`Falha ao carregar feeds: ${e.message}`);
      console.error('Erro ao buscar feeds:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFeedLoading(true);
    setAddFeedError(null);

    if (!newFeedName || !newFeedUrl) {
      setAddFeedError('Nome e URL são obrigatórios.');
      setAddFeedLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFeedName, url: newFeedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setNewFeedName('');
      setNewFeedUrl('');
      fetchFeeds();
    } catch (e: any) {
      setAddFeedError(`Falha ao adicionar feed: ${e.message}`);
      console.error('Erro ao adicionar feed:', e);
    } finally {
      setAddFeedLoading(false);
    }
  };

  const handleDeleteFeed = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este feed?')) {
      return;
    }

    try {
      const response = await fetch('/api/feeds', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      fetchFeeds();
    } catch (e: any) {
      alert(`Erro ao remover feed: ${e.message}`);
      console.error('Erro ao remover feed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">📰 Gerenciar Fontes RSS</h2>
          <p className="text-gray-600 text-lg">Adicione, remova ou atualize as fontes de notícias monitoradas</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 p-6 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">➕ Adicionar Fonte</h3>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Fonte
                  </label>
                  <input
                    type="text"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    disabled={addFeedLoading}
                    placeholder="Ex: Propmark"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL do Feed RSS
                  </label>
                  <input
                    type="url"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    disabled={addFeedLoading}
                    placeholder="https://exemplo.com/feed"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                {addFeedError && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded">
                    <p className="text-sm text-red-700">⚠️ {addFeedError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={addFeedLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {addFeedLoading ? '⏳ Adicionando...' : '✅ Adicionar Fonte'}
                </button>
              </form>
            </div>
          </div>

          {/* Feeds List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📋 Fontes Cadastradas ({feeds.length})</h3>

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Carregando fontes...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded mb-4">
                  <p className="text-red-700">❌ {error}</p>
                </div>
              )}

              {!loading && feeds.length === 0 && !error && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Nenhuma fonte cadastrada ainda.</p>
                  <p className="text-gray-500">Use o formulário ao lado para adicionar uma nova fonte.</p>
                </div>
              )}

              {!loading && feeds.length > 0 && (
                <div className="space-y-4">
                  {feeds.map((feed) => (
                    <div
                      key={feed.id}
                      className="p-5 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition group"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition">
                            {feed.name}
                          </h4>
                          <a
                            href={feed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all"
                          >
                            {feed.url}
                          </a>
                        </div>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          ID: {feed.id}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition text-center"
                        >
                          🔗 Visitar
                        </a>
                        <button
                          onClick={() => handleDeleteFeed(feed.id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
