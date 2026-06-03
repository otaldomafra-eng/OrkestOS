import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import { weeklyProductivityData, habitCompletionData, timeDistributionData, monthlyProgressData } from '../data/mockData';

const Relatorios = () => {
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-ink mb-6">Análises e relatórios</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-surface-elevated">
            <p className="text-charcoal text-sm mb-1">Média Semanal</p>
            <p className="text-3xl font-bold text-ink">78%</p>
            <p className="text-green-400 text-sm mt-1">+12% da semana passada</p>
          </Card>

          <Card className="bg-surface-elevated">
            <p className="text-charcoal text-sm mb-1">Hábitos Concluídos</p>
            <p className="text-3xl font-bold text-ink">42</p>
            <p className="text-green-400 text-sm mt-1">Esta semana</p>
          </Card>

          <Card className="bg-surface-elevated">
            <p className="text-charcoal text-sm mb-1">Sequência Atual</p>
            <p className="text-3xl font-bold text-ink">15 �"�</p>
            <p className="text-charcoal text-sm mt-1">Dias</p>
          </Card>

          <Card className="bg-surface-elevated">
            <p className="text-charcoal text-sm mb-1">Progresso de Metas</p>
            <p className="text-3xl font-bold text-ink">65%</p>
            <p className="text-yellow-400 text-sm mt-1">3 metas ativas</p>
          </Card>
        </div>

        {/* Weekly Summary */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-accent-blue" size={24} />
            <h2 className="text-2xl font-bold text-ink">Resumo Semanal</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Produtividade Line Chart */}
            <div>
              <h3 className="text-lg font-semibold text-ink mb-4">Tendência de Produtividade</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyProductivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#818cf8" 
                    strokeWidth={3}
                    dot={{ fill: '#818cf8', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Habit Completion Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold text-ink mb-4">Taxa de conclusao de hábitos</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={habitCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="completion" radius={[8, 8, 0, 0]}>
                    {habitCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Monthly Summary */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-accent-blue" size={24} />
            <h2 className="text-2xl font-bold text-ink">Resumo Mensal</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Progresso Line Chart */}
            <div>
              <h3 className="text-lg font-semibold text-ink mb-4">Progresso ao longo do tempo</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Time Distribution Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold text-ink mb-4">Distribuição de Tempo</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Key Insights */}
        <Card>
          <h2 className="text-2xl font-bold text-ink mb-4">Principais Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-elevated border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-semibold mb-2">✅ Pontos Fortes</p>
              <ul className="text-charcoal space-y-1 text-sm">
                <li>• Prática consistente de meditação (90% de conclusão)</li>
                <li>• Alta produtividade nos fins de semana</li>
                <li>• Sequência de 15 dias mantida</li>
              </ul>
            </div>
            
            <div className="bg-surface-elevated border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 font-semibold mb-2">Áreas a Melhorar</p>
              <ul className="text-charcoal space-y-1 text-sm">
                <li>- Horas de estudo abaixo da meta na quarta</li>
                <li>- Hábito de leitura precisa de atenção (70%)</li>
                <li>- Queda de produtividade no meio da semana</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
