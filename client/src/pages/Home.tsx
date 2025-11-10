import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, History, Sparkles, TrendingUp } from "lucide-react";
import { APP_LOGO, APP_TITLE, APP_SUBTITLE, ARTPLAN_RED, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"24_horas" | "7_dias">("7_dias");
  const [showHistory, setShowHistory] = useState(false);

  const generateReportMutation = trpc.news.generateReport.useMutation();
  const historyQuery = trpc.news.getHistory.useQuery(undefined, {
    enabled: showHistory && isAuthenticated,
  });

  const handleGenerateReport = async () => {
    await generateReportMutation.mutateAsync({
      period: selectedPeriod,
    });
  };

  const downloadReport = () => {
    if (!generateReportMutation.data?.content) return;

    const element = document.createElement("a");
    const file = new Blob([generateReportMutation.data.content], {
      type: "text/markdown",
    });
    element.href = URL.createObjectURL(file);
    element.download = `A.R.T-relatorio-${selectedPeriod}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: ARTPLAN_RED }}></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: ARTPLAN_RED }}></div>
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 rounded-lg shadow-lg" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ARTPLAN_RED }}>
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold" style={{ color: ARTPLAN_RED }}>
              {APP_TITLE}
            </CardTitle>
            <CardDescription className="text-base mt-2 font-medium text-slate-600">
              {APP_SUBTITLE}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              Gere relatórios consolidados de notícias sobre <strong>Futebol</strong>, <strong>iGaming</strong> e <strong>Marketing</strong> com um clique. Análise inteligente de tendências e notícias em tempo real.
            </p>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
              style={{ background: ARTPLAN_RED }}
            >
              Começar Agora
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Powered by Artplan • Análise de Tendências Inteligente
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b" style={{ borderColor: `${ARTPLAN_RED}20` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 rounded-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: ARTPLAN_RED }}>
                <TrendingUp className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: ARTPLAN_RED }}>
                {APP_TITLE}
              </h1>
              <p className="text-xs text-slate-500">{APP_SUBTITLE}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Bem-vindo, <strong>{user?.name || "Usuário"}</strong></span>
            <Button variant="outline" size="sm" onClick={() => logout()} className="border-slate-300 hover:bg-slate-50">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Card */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1" style={{ background: ARTPLAN_RED }}></div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: ARTPLAN_RED }} />
                  <CardTitle>Gerar Novo Relatório</CardTitle>
                </div>
                <CardDescription>
                  Selecione o período e gere um relatório consolidado de notícias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900">Período de Busca</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedPeriod === "24_horas" ? "default" : "outline"}
                      onClick={() => setSelectedPeriod("24_horas")}
                      className="w-full font-medium"
                      style={
                        selectedPeriod === "24_horas"
                          ? { background: ARTPLAN_RED, color: "white" }
                          : { borderColor: ARTPLAN_RED, color: ARTPLAN_RED }
                      }
                    >
                      Últimas 24 Horas
                    </Button>
                    <Button
                      variant={selectedPeriod === "7_dias" ? "default" : "outline"}
                      onClick={() => setSelectedPeriod("7_dias")}
                      className="w-full font-medium"
                      style={
                        selectedPeriod === "7_dias"
                          ? { background: ARTPLAN_RED, color: "white" }
                          : { borderColor: ARTPLAN_RED, color: ARTPLAN_RED }
                      }
                    >
                      Últimos 7 Dias
                    </Button>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  className="w-full text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
                  style={{ background: ARTPLAN_RED }}
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Relatório...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>

                {/* Report Content */}
                {generateReportMutation.data?.content && (
                  <div className="space-y-4 mt-8 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" style={{ color: ARTPLAN_RED }} />
                        Relatório Gerado
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadReport}
                        className="gap-2 border-slate-300 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-slate-200">
                      <Streamdown>{generateReportMutation.data.content}</Streamdown>
                    </div>
                  </div>
                )}

                {generateReportMutation.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    ⚠️ Erro ao gerar relatório: {generateReportMutation.error.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1" style={{ background: ARTPLAN_RED }}></div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: ARTPLAN_RED }} />
                  Sobre A.R.T
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <p>
                  O agente inteligente que consolida notícias sobre:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: ARTPLAN_RED }}></span>
                    ⚽ Futebol (Resultados, Transferências, Lesões)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: ARTPLAN_RED }}></span>
                    🎰 iGaming e Mercado de Apostas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: ARTPLAN_RED }}></span>
                    📢 Marketing e Campanhas Publicitárias
                  </li>
                </ul>
                <p className="pt-2 border-t border-slate-200 text-xs">
                  ✓ Todos os links são verificados e diretos para as notícias originais
                </p>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1" style={{ background: ARTPLAN_RED }}></div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" style={{ color: ARTPLAN_RED }} />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-slate-50"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? "Ocultar Histórico" : "Ver Histórico"}
                </Button>

                {showHistory && (
                  <div className="mt-4 space-y-2">
                    {historyQuery.isLoading ? (
                      <p className="text-sm text-slate-500 text-center py-4">Carregando...</p>
                    ) : historyQuery.data && historyQuery.data.length > 0 ? (
                      <ul className="space-y-2">
                        {historyQuery.data.map((report) => (
                          <li
                            key={report.id}
                            className="text-xs bg-white p-3 rounded border transition-all hover:shadow-md"
                            style={{ borderColor: `${ARTPLAN_RED}30` }}
                          >
                            <div className="font-semibold text-slate-900">
                              {report.period === "24_horas" ? "📅 24 Horas" : "📊 7 Dias"}
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">Nenhum relatório gerado ainda</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 pt-4">
              <p>Powered by <strong style={{ color: ARTPLAN_RED }}>Artplan</strong></p>
              <p className="mt-1">Análise de Tendências Inteligente</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
