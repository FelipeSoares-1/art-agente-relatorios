'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Period = '7d' | '15d' | '30d';

interface TagTrendData {
  date: string;
  [key: string]: string | number;
}

interface CompetitorMentionData {
  name: string;
  menções: number;
}

interface SourceBreakdownData {
  name: string;
  value: number;
}

const COLORS = ['#E11D48', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#6366F1', '#EC4899'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportsPage() {
  // State for Tag Trends
  const [tagTrends, setTagTrends] = useState<TagTrendData[]>([]);
  const [topTags, setTopTags] = useState<string[]>([]);
  const [tagTrendsLoading, setTagTrendsLoading] = useState(true);
  const [tagTrendsError, setTagTrendsError] = useState<string | null>(null);
  const [tagTrendsPeriod, setTagTrendsPeriod] = useState<Period>('7d');

  // State for Competitor Mentions
  const [competitorMentions, setCompetitorMentions] = useState<CompetitorMentionData[]>([]);
  const [competitorMentionsLoading, setCompetitorMentionsLoading] = useState(true);
  const [competitorMentionsError, setCompetitorMentionsError] = useState<string | null>(null);
  const [competitorMentionsPeriod, setCompetitorMentionsPeriod] = useState<Period>('7d');

  // State for Source Breakdown
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdownData[]>([]);
  const [sourceBreakdownLoading, setSourceBreakdownLoading] = useState(true);
  const [sourceBreakdownError, setSourceBreakdownError] = useState<string | null>(null);
  const [sourceBreakdownPeriod, setSourceBreakdownPeriod] = useState<Period>('7d');

  // Fetch Tag Trends
  useEffect(() => {
    const fetchTagTrends = async () => {
      setTagTrendsLoading(true);
      setTagTrendsError(null);
      try {
        const response = await fetch(`/api/reports/tag-trends?period=${tagTrendsPeriod}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTagTrends(data.data);
        setTopTags(data.topTags);
      } catch (e: unknown) {
        setTagTrendsError(`Falha ao carregar tendências`);
      } finally {
        setTagTrendsLoading(false);
      }
    };
    fetchTagTrends();
  }, [tagTrendsPeriod]);

  // Fetch Competitor Mentions
  useEffect(() => {
    const fetchCompetitorMentions = async () => {
      setCompetitorMentionsLoading(true);
      setCompetitorMentionsError(null);
      try {
        const response = await fetch(`/api/reports/competitor-mentions?period=${competitorMentionsPeriod}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCompetitorMentions(data);
      } catch (e: unknown) {
        setCompetitorMentionsError(`Falha ao carregar menções`);
      } finally {
        setCompetitorMentionsLoading(false);
      }
    };
    fetchCompetitorMentions();
  }, [competitorMentionsPeriod]);

  // Fetch Source Breakdown
  useEffect(() => {
    const fetchSourceBreakdown = async () => {
      setSourceBreakdownLoading(true);
      setSourceBreakdownError(null);
      try {
        const response = await fetch(`/api/reports/source-breakdown?period=${sourceBreakdownPeriod}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setSourceBreakdown(data);
      } catch (e: unknown) {
        setSourceBreakdownError(`Falha ao carregar fontes`);
      } finally {
        setSourceBreakdownLoading(false);
      }
    };
    fetchSourceBreakdown();
  }, [sourceBreakdownPeriod]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">📈 Relatórios e Análises</h2>
          <p className="text-gray-600 text-lg">Visualize tendências e insights a partir dos dados coletados.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Tag Trends Chart - Full Width */}
          <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Tendência de Tags</h3>
              <div className="flex gap-2">
                {(['7d', '15d', '30d'] as Period[]).map(p => (
                  <button key={p} onClick={() => setTagTrendsPeriod(p)} className={`px-3 py-1 text-sm font-medium rounded-full transition ${tagTrendsPeriod === p ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-red-50'}`}>
                    {p.replace('d', ' dias')}
                  </button>
                ))}
              </div>
            </div>
            {tagTrendsLoading ? (
              <div className="flex items-center justify-center h-80"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div></div>
            ) : tagTrendsError ? (
              <div className="flex items-center justify-center h-80 bg-red-50 rounded-lg"><p className="text-red-700">❌ {tagTrendsError}</p></div>
            ) : (
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <LineChart data={tagTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {topTags.map((tag, index) => (
                      <Line key={tag} type="monotone" dataKey={tag} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Competitor Mentions Chart */}
            <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Menções de Concorrentes</h3>
                <div className="flex gap-2">
                  {(['7d', '15d', '30d'] as Period[]).map(p => (
                    <button key={p} onClick={() => setCompetitorMentionsPeriod(p)} className={`px-3 py-1 text-sm font-medium rounded-full transition ${competitorMentionsPeriod === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}>
                      {p.replace('d', ' dias')}
                    </button>
                  ))}
                </div>
              </div>
              {competitorMentionsLoading ? (
                <div className="flex items-center justify-center h-80"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
              ) : competitorMentionsError ? (
                <div className="flex items-center justify-center h-80 bg-blue-50 rounded-lg"><p className="text-blue-700">❌ {competitorMentionsError}</p></div>
              ) : (
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={competitorMentions} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} interval={0} />
                      <Tooltip />
                      <Bar dataKey="menções" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Source Breakdown Chart */}
            <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Notícias por Fonte</h3>
                <div className="flex gap-2">
                  {(['7d', '15d', '30d'] as Period[]).map(p => (
                    <button key={p} onClick={() => setSourceBreakdownPeriod(p)} className={`px-3 py-1 text-sm font-medium rounded-full transition ${sourceBreakdownPeriod === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}>
                      {p.replace('d', ' dias')}
                    </button>
                  ))}
                </div>
              </div>
              {sourceBreakdownLoading ? (
                <div className="flex items-center justify-center h-80"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div></div>
              ) : sourceBreakdownError ? (
                <div className="flex items-center justify-center h-80 bg-green-50 rounded-lg"><p className="text-green-700">❌ {sourceBreakdownError}</p></div>
              ) : (
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sourceBreakdown} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={120} fill="#8884d8" dataKey="value">
                        {sourceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
