'use client';

import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, ClipboardList, CheckCircle, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

interface SurveyType {
  name: string;
  value: number;
}

interface RecentSurvey {
  id: string;
  title: string;
  date: string | Date;
  responses: number;
  total: number;
  responsesCount: number;
}

interface TeamStat {
  id: string;
  name: string;
  members: number;
  surveys: number;
  lastActivity: string;
}

interface MonthlyActivity {
  month: string;
  surveys: number;
  responses: number;
}

interface StatisticsData {
  totalSurveys: number;
  completedSurveys: number;
  totalRespondents: number;
  responseRate: number;
  monthlyActivity: MonthlyActivity[];
  recentSurveys: RecentSurvey[];
  teamStats: TeamStat[];
}

// Fetch statistics from our API
const fetchStatistics = async (): Promise<StatisticsData> => {
  const response = await fetch('/api/statistics');

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  const data = (await response.json()) as StatisticsData;
  return data;
};

export default function StatisticsDashboard() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<StatisticsData>({
    queryKey: ['account-statistics'],
    queryFn: fetchStatistics,
  });

  const { resolvedTheme } = useTheme();
  const concluidaColor = '#0088FE';
  const naoConcluidaColor = resolvedTheme === 'dark' ? '#222' : '#e5e7eb';
  const naoConcluidaText = resolvedTheme === 'dark' ? '#fff' : '#000';

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load statistics. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Card skeleton for loading state
  const CardSkeleton = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-between p-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="mt-3 space-y-2 text-center">
          <Skeleton className="mx-auto h-9 w-20" />
          <Skeleton className="mx-auto h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );

  // Chart skeleton for loading state
  const ChartSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );

  // Table skeleton for loading state
  const TableSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/5" />
              <Skeleton className="h-5 w-1/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex flex-col">
        <h1 className="mb-2 text-3xl font-bold">Estatísticas do Painel</h1>
        <p className="text-muted-foreground">
          Visão geral de todas as suas pesquisas, times e respondentes.
        </p>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="surveys">Pesquisas</TabsTrigger>
          <TabsTrigger value="teams">Times</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="flex flex-col items-center justify-between p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-3 text-center">
                      <h2 className="text-4xl font-bold">{stats?.totalSurveys ?? 0}</h2>
                      <p className="text-sm text-muted-foreground">Total de Pesquisas</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col items-center justify-between p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-3 text-center">
                      <h2 className="text-4xl font-bold">{stats?.completedSurveys ?? 0}</h2>
                      <p className="text-sm text-muted-foreground">Pesquisas Concluídas</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col items-center justify-between p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-3 text-center">
                      <h2 className="text-4xl font-bold">{stats?.totalRespondents ?? 0}</h2>
                      <p className="text-sm text-muted-foreground">Total de Respondentes</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col items-center justify-between p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-3 text-center">
                      <h2 className="text-4xl font-bold">{stats?.responseRate ?? 0}%</h2>
                      <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {isLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Porcentagem de Conclusão</CardTitle>
                    <CardDescription>Percentual de pesquisas concluídas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={
                              stats && stats.totalSurveys > 0
                                ? [
                                    { name: 'Concluídas', value: stats.completedSurveys },
                                    {
                                      name: 'Não concluídas',
                                      value: stats.totalSurveys - stats.completedSurveys,
                                    },
                                  ]
                                : []
                            }
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats &&
                              stats.totalSurveys > 0 && [
                                <Cell key="concluidas" fill={concluidaColor} />,
                                <Cell key="nao-concluidas" fill={naoConcluidaColor} />,
                              ]}
                            {(!stats || stats.totalSurveys === 0) && (
                              <Cell key="empty" fill={naoConcluidaColor} />
                            )}
                          </Pie>
                          <Legend
                            payload={[
                              {
                                value: 'Concluídas',
                                type: 'square',
                                color: concluidaColor,
                                id: 'concluidas',
                              },
                              {
                                value: (
                                  <span style={{ color: naoConcluidaText }}>Não concluídas</span>
                                ),
                                type: 'square',
                                color: naoConcluidaColor,
                                id: 'nao-concluidas',
                              },
                            ]}
                          />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              if (name === 'Não concluídas') {
                                return [value, 'Não concluídas'];
                              }
                              return [value, name];
                            }}
                          />
                          <text
                            x="50%"
                            y="47%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="24"
                            fontWeight="bold"
                            fill={concluidaColor}
                          >
                            {stats && stats.totalSurveys > 0
                              ? `${Math.round((stats.completedSurveys / stats.totalSurveys) * 100)}%`
                              : 'Sem dados'}
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Atividade Mensal</CardTitle>
                    <CardDescription>Pesquisas criadas e respostas recebidas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.monthlyActivity ?? []}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="surveys" fill="#0088FE" name="Pesquisas Criadas" />
                          <Bar dataKey="responses" fill="#00C49F" name="Respostas Recebidas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="surveys">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pesquisas Recentes</CardTitle>
                <CardDescription>
                  Suas pesquisas mais recentes e suas taxas de conclusão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Respostas</TableHead>
                        <TableHead>Taxa de Conclusão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.recentSurveys?.length ? (
                        stats.recentSurveys.map(
                          (survey: RecentSurvey & { respondents?: number }) => {
                            return (
                              <TableRow key={survey.id}>
                                <TableCell className="font-medium">{survey.title}</TableCell>
                                <TableCell>{format(new Date(survey.date), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>
                                  {survey.responsesCount ?? '0'} / {survey.respondents ?? '0'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={
                                        ((survey.responsesCount ?? 0) / (survey.respondents ?? 0)) *
                                        100
                                      }
                                      className="align-right h-2 w-full"
                                    />
                                    <span className="text-xs">
                                      {Math.round(
                                        ((survey.responsesCount ?? 0) / (survey.respondents ?? 0)) *
                                          100
                                      )}
                                      %
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-4 text-center text-muted-foreground">
                            Nenhuma pesquisa encontrada.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teams">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Times e Membros</CardTitle>
                <CardDescription>Visão geral de seus times e números de membros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Time</TableHead>
                        <TableHead>Membros</TableHead>
                        <TableHead>Pesquisas</TableHead>
                        <TableHead>Última Atividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.teamStats && stats.teamStats.length > 0 ? (
                        stats.teamStats.map((team: TeamStat) => (
                          <TableRow key={team.id}>
                            <TableCell className="font-medium">{team.name}</TableCell>
                            <TableCell>{team.members}</TableCell>
                            <TableCell>{team.surveys}</TableCell>
                            <TableCell>{team.lastActivity}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-4 text-center text-muted-foreground">
                            Nenhum time encontrado. Crie um time para começar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
