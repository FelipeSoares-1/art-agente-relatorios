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
      fetchFeeds(); // Recarrega a lista de feeds
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

      fetchFeeds(); // Recarrega a lista de feeds
    } catch (e: any) {
      alert(`Erro ao remover feed: ${e.message}`);
      console.error('Erro ao remover feed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento de Feeds RSS</h1>

        {/* Formulário para Adicionar Novo Feed */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Feed</h2>
          <form onSubmit={handleAddFeed} className="space-y-4">
            <div>
              <label htmlFor="feedName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome do Feed
              </label>
              <input
                type="text"
                id="feedName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
                disabled={addFeedLoading}
              />
            </div>
            <div>
              <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL do RSS
              </label>
              <input
                type="url"
                id="feedUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                disabled={addFeedLoading}
              />
            </div>
            {addFeedError && <p className="text-red-500 text-sm">{addFeedError}</p>}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={addFeedLoading}
            >
              {addFeedLoading ? 'Adicionando...' : 'Adicionar Feed'}
            </button>
          </form>
        </div>

        {/* Lista de Feeds Existentes */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Feeds Cadastrados</h2>
          {loading && <p>Carregando feeds...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && feeds.length === 0 && !error && <p>Nenhum feed cadastrado ainda.</p>}
          
          {!loading && feeds.length > 0 && (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {feeds.map((feed) => (
                <li key={feed.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium">{feed.name}</p>
                    <a href={feed.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                      {feed.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteFeed(feed.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
