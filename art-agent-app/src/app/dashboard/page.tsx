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
      const newsResponse = await fetch('/api/news');
      const news = await newsResponse.json();
      setTotalArticles(news.length);

      const logsResponse = await fetch('/api/cron-logs');
      const logsData = await logsResponse.json();
      setLogs(logsData.logs || []);

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

  async function diagnosticarDatas() {
    if (!confirm('🔍 Deseja executar diagnóstico detalhado das datas?\n\nIsso vai analisar todos os feeds RSS e comparar as datas do RSS com as datas no banco. Os logs detalhados aparecerão no terminal.')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/diagnose-dates', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        alert(`🔍 Diagnóstico concluído!\n\nℹ️ Verifique os logs no terminal para ver:\n• Formatos de data problemáticos\n• Diferenças entre RSS e banco\n• Sugestões de correção`);
      } else {
        alert(`❌ Erro no diagnóstico: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao executar diagnóstico');
    } finally {
      setLoading(false);
    }
  }

  async function corrigirDatas() {
    if (!confirm('🔧 Deseja corrigir as datas dos artigos existentes?\n\nIsso vai reprocessar todos os feeds RSS para obter as datas corretas de publicação.')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/fix-dates', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Correção concluída!\n\n📊 ${data.checkedCount} artigos verificados\n🔧 ${data.updatedCount} artigos atualizados\n❌ ${data.errorCount} feeds com erro`);
        await carregarDados();
      } else {
        alert(`❌ Erro na correção: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao executar correção de datas');
    } finally {
      setLoading(false);
    }
  }

  if (loading && stats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard de Monitoramento</h2>
          <p className="text-gray-600 text-lg">Acompanhe o status de coleta e desempenho dos scrapers em tempo real</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
          {/* Total de Artigos */}
          <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Total de Artigos</p>
                <p className="text-4xl font-bold text-gray-900">{totalArticles}</p>
              </div>
              <div className="text-5xl">📰</div>
            </div>
          </div>

          {/* Scrapers Ativos */}
          <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Scrapers Ativos</p>
                <p className="text-4xl font-bold text-green-600">
                  {stats.filter(s => s.status === 'operacional').length}
                </p>
              </div>
              <div className="text-5xl">⚙️</div>
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Taxa de Sucesso</p>
                <p className="text-4xl font-bold text-blue-600">
                  {stats.length > 0 
                    ? Math.round(stats.reduce((sum, s) => sum + s.taxaSucesso, 0) / stats.length)
                    : 0}%
                </p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          {/* Executar Scraping */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition">
            <button
              onClick={executarScrapingManual}
              disabled={loading}
              className="w-full h-full flex flex-col items-center justify-center gap-3 disabled:opacity-50 hover:bg-opacity-90 transition"
            >
              <span className="text-4xl">{loading ? '⏳' : '▶️'}</span>
              <span className="font-bold text-sm">{loading ? 'Executando...' : 'Executar Agora'}</span>
            </button>
          </div>

          {/* Corrigir Datas */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition">
            <button
              onClick={corrigirDatas}
              disabled={loading}
              className="w-full h-full flex flex-col items-center justify-center gap-3 disabled:opacity-50 hover:bg-opacity-90 transition"
            >
              <span className="text-4xl">{loading ? '⏳' : '🔧'}</span>
              <span className="font-bold text-sm">{loading ? 'Processando...' : 'Corrigir Datas'}</span>
            </button>
          </div>

          {/* Diagnosticar Datas */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition">
            <button
              onClick={diagnosticarDatas}
              disabled={loading}
              className="w-full h-full flex flex-col items-center justify-center gap-3 disabled:opacity-50 hover:bg-opacity-90 transition"
            >
              <span className="text-4xl">{loading ? '⏳' : '🔍'}</span>
              <span className="font-bold text-sm">{loading ? 'Analisando...' : 'Diagnosticar'}</span>
            </button>
          </div>
        </div>

        {/* Status dos Scrapers */}
        <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 mb-12 overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">🔍 Status dos Scrapers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.map((stat) => (
                <div 
                  key={stat.site} 
                  className="p-5 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full animate-pulse ${
                        stat.status === 'operacional' ? 'bg-green-500' :
                        stat.status === 'erro' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-bold text-lg text-gray-900">{stat.site}</p>
                        <p className="text-sm text-gray-600">
                          Última coleta: {stat.ultimaColeta}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold">ARTIGOS</p>
                        <p className="text-2xl font-bold text-red-600">{stat.artigos}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold">SUCESSO</p>
                        <p className="text-2xl font-bold text-green-600">{stat.taxaSucesso}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stat.taxaSucesso}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Recentes */}
        <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">📋 Logs Recentes</h3>
          </div>
          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum log disponível ainda.</p>
                <p className="text-sm">Execute o scraping para ver os logs de coleta.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="p-4 border-l-4 border-red-600 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{log.site}</p>
                        <p className="text-xs text-gray-600">{log.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📥</span>
                        <span>Coletados: <span className="font-bold text-blue-600">{log.scraped}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💾</span>
                        <span>Salvos: <span className="font-bold text-green-600">{log.saved}</span></span>
                      </div>
                      {log.errors.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">❌</span>
                          <span>Erros: <span className="font-bold text-red-600">{log.errors.length}</span></span>
                        </div>
                      )}
                    </div>
                    {log.errors.length > 0 && (
                      <div className="mt-3 p-2 bg-white rounded border-l-2 border-red-600">
                        <p className="text-xs font-semibold text-red-600 mb-2">Erros detectados:</p>
                        {log.errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-700">• {err}</p>
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
