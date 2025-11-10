import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, History } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
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
    element.download = `relatorio-noticias-${selectedPeriod}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />
            </div>
            <CardTitle>{APP_TITLE}</CardTitle>
            <CardDescription>Gerador Automatizado de Relatórios de Notícias</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Gere relatórios consolidados de notícias sobre Futebol, iGaming e Marketing com um clique.
            </p>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full"
              size="lg"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Bem-vindo, {user?.name || "Usuário"}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo Relatório</CardTitle>
                <CardDescription>
                  Selecione o período e gere um relatório consolidado de notícias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Período de Busca</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedPeriod === "24_horas" ? "default" : "outline"}
                      onClick={() => setSelectedPeriod("24_horas")}
                      className="w-full"
                    >
                      Últimas 24 Horas
                    </Button>
                    <Button
                      variant={selectedPeriod === "7_dias" ? "default" : "outline"}
                      onClick={() => setSelectedPeriod("7_dias")}
                      className="w-full"
                    >
                      Últimos 7 Dias
                    </Button>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Relatório...
                    </>
                  ) : (
                    "Gerar Relatório"
                  )}
                </Button>

                {/* Report Content */}
                {generateReportMutation.data?.content && (
                  <div className="space-y-4 mt-8 pt-8 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Relatório Gerado</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadReport}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                      <Streamdown>{generateReportMutation.data.content}</Streamdown>
                    </div>
                  </div>
                )}

                {generateReportMutation.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Erro ao gerar relatório: {generateReportMutation.error.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <p>
                  Este agente gera relatórios consolidados de notícias sobre:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>⚽ Futebol (Resultados, Transferências, Lesões)</li>
                  <li>🎰 iGaming e Mercado de Apostas</li>
                  <li>📢 Marketing e Campanhas Publicitárias</li>
                </ul>
                <p className="pt-2 border-t">
                  Todos os links são verificados e diretos para as notícias originais.
                </p>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? "Ocultar Histórico" : "Ver Histórico"}
                </Button>

                {showHistory && (
                  <div className="mt-4 space-y-2">
                    {historyQuery.isLoading ? (
                      <p className="text-sm text-slate-500">Carregando...</p>
                    ) : historyQuery.data && historyQuery.data.length > 0 ? (
                      <ul className="space-y-2">
                        {historyQuery.data.map((report) => (
                          <li
                            key={report.id}
                            className="text-xs bg-slate-50 p-2 rounded border border-slate-200"
                          >
                            <div className="font-medium text-slate-900">
                              {report.period === "24_horas" ? "24 Horas" : "7 Dias"}
                            </div>
                            <div className="text-slate-500">
                              {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Nenhum relatório gerado ainda</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
