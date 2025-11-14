'use client';

import { useEffect, useState } from 'react';

interface ScraperStats {
  site: string;
  status: 'operacional' | 'erro' | 'pausado';
  ultimaColeta: string;
  artigos: number;
  taxaSucesso: number;
}

interface CronLog {
  timestamp: string;
  site: string;
  scraped: number;
  saved: number;
  errors: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ScraperStats[]>([]);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      // Carregar total de artigos
      const newsResponse = await fetch('/api/news');
      const news = await newsResponse.json();
      setTotalArticles(news.length);

      // Carregar logs do cron
      const logsResponse = await fetch('/api/cron-logs');
      const logsData = await logsResponse.json();
      setLogs(logsData.logs || []);

      // Stats dos scrapers (mockado por enquanto)
      setStats([
        {
          site: 'Propmark',
          status: 'operacional',
          ultimaColeta: new Date().toLocaleString('pt-BR'),
          artigos: 44,
          taxaSucesso: 100,
        },
        {
          site: 'Meio & Mensagem',
          status: 'operacional',
          ultimaColeta: new Date().toLocaleString('pt-BR'),
          artigos: 9,
          taxaSucesso: 100,
        },
        {
          site: 'AdNews',
          status: 'operacional',
          ultimaColeta: new Date().toLocaleString('pt-BR'),
          artigos: 41,
          taxaSucesso: 100,
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function executarScrapingManual() {
    if (!confirm('Deseja executar o scraping manualmente?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/cron-logs', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Scraping executado com sucesso!');
        await carregarDados();
      } else {
        alert('❌ Erro ao executar scraping');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao executar scraping');
    } finally {
      setLoading(false);
    }
  }

  if (loading && stats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 Dashboard de Scraping
          </h1>
          <p className="text-gray-600">
            Monitoramento em tempo real dos scrapers de notícias
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total de Artigos</div>
            <div className="text-3xl font-bold text-blue-600">{totalArticles}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Scrapers Ativos</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.filter(s => s.status === 'operacional').length}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Taxa de Sucesso</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.length > 0 
                ? Math.round(stats.reduce((sum, s) => sum + s.taxaSucesso, 0) / stats.length)
                : 0}%
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <button
              onClick={executarScrapingManual}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? '⏳ Executando...' : '▶️ Executar Scraping'}
            </button>
          </div>
        </div>

        {/* Status dos Scrapers */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Status dos Scrapers</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.site} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      stat.status === 'operacional' ? 'bg-green-500' :
                      stat.status === 'erro' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-gray-900">{stat.site}</div>
                      <div className="text-sm text-gray-600">
                        Última coleta: {stat.ultimaColeta}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <div className="text-sm text-gray-600">Artigos</div>
                      <div className="font-bold text-gray-900">{stat.artigos}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Sucesso</div>
                      <div className="font-bold text-green-600">{stat.taxaSucesso}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Logs Recentes</h2>
          </div>
          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum log disponível ainda. Execute o scraping para ver os logs.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900">{log.site}</div>
                      <div className="text-sm text-gray-600">{log.timestamp}</div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span className="text-blue-600">
                        📥 Coletados: {log.scraped}
                      </span>
                      <span className="text-green-600">
                        💾 Salvos: {log.saved}
                      </span>
                      {log.errors.length > 0 && (
                        <span className="text-red-600">
                          ❌ Erros: {log.errors.length}
                        </span>
                      )}
                    </div>
                    {log.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        {log.errors.map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
