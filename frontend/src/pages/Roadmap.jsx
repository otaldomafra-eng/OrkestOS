import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from 'lucide-react';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';

const roadmapItems = [
  {
    title: 'Painel de produtividade unificado',
    status: 'Concluído',
    category: 'Core',
    quarter: 'Q2 2026',
    description: 'Centralize metas, hábitos, projetos e planos diários em uma visão operacional clara.',
    icon: BarChart3,
  },
  {
    title: 'Sequências na sala de foco',
    status: 'Concluído',
    category: 'Foco',
    quarter: 'Q2 2026',
    description: 'Acompanhe sessões de trabalho profundo e torne as pequenas vitórias de foco visíveis em todo o produto.',
    icon: TimerReset,
  },
  {
    title: 'FutureTwin decision simulator',
    status: 'Em andamento',
    category: 'IA',
    quarter: 'Q3 2026',
    description: 'Visualize resultados prováveis de rotinas, metas e compromissos de longo prazo.',
    icon: Brain,
  },
  {
    title: 'Alertas de risco de metas',
    status: 'Em andamento',
    category: 'Insights',
    quarter: 'Q3 2026',
    description: 'Detecte metas estagnadas, semanas sobrecarregadas e desvio de hábitos antes que o progresso pare.',
    icon: ShieldCheck,
  },
  {
    title: 'Círculos de responsabilidade compartilhada',
    status: 'Planejado',
    category: 'Colaboração',
    quarter: 'Q4 2026',
    description: 'Convide um pequeno grupo de confiança para acompanhar marcos e celebrar sprints concluídos.',
    icon: Layers3,
  },
  {
    title: 'Assistente de planejamento adaptativo',
    status: 'Planejado',
    category: 'IA',
    quarter: 'Q4 2026',
    description: 'Sugira planos diários com base em energia, trabalho atrasado e prazos pessoais futuros.',
    icon: Sparkles,
  },
];

const milestones = [
  {
    quarter: 'Q2 2026',
    title: 'Fundação',
    summary: 'Rastreamento principal, painéis, polimento de autenticação e páginas públicas responsivas.',
    status: 'Concluído',
  },
  {
    quarter: 'Q3 2026',
    title: 'Inteligência',
    summary: 'Simulações FutureTwin, alertas de insights, análises mais robustas e planejamento guiado.',
    status: 'Em andamento',
  },
  {
    quarter: 'Q4 2026',
    title: 'Comunidade',
    summary: 'Círculos de responsabilidade, fluxos de compartilhamento mais ricos e suporte colaborativo a metas.',
    status: 'Planejado',
  },
  {
    quarter: 'Q1 2027',
    title: 'Personalização',
    summary: 'Rotinas adaptativas, modelos personalizados e recomendações mais inteligentes a partir de padrões de uso.',
    status: 'Planejado',
  },
];

const statusStyles = {
  'Concluído': 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  'Em andamento': 'border-indigo-400/30 bg-indigo-500/10 text-accent-blue',
  'Planejado': 'border-purple-400/30 bg-purple-500/10 text-accent-blue',
};

const statusOptions = ['Todos', 'Concluído', 'Em andamento', 'Planejado'];
const categoryOptions = ['Todos', 'Core', 'Foco', 'IA', 'Insights', 'Colaboração'];

const Roteiro = () => {
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredItems = useMemo(() => {
    return roadmapItems.filter((item) => {
      const statusMatches = selectedStatus === 'Todos' || item.status === selectedStatus;
      const categoryMatches = selectedCategory === 'Todos' || item.category === selectedCategory;
      return statusMatches && categoryMatches;
    });
  }, [selectedCategory, selectedStatus]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas text-ink">
      <section className="border-b border-hairline-strong px-4 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-hairline-strong px-4 py-2 text-sm text-charcoal transition hover:border-accent-blue/50 hover:text-ink"
          >
            <ArrowLeft size={16} />
            Voltar ao Início
          </Link>

          <Link to="/signup">
            <GradientButton className="w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2">
                Começar a Rastrear
                <ArrowRight size={18} />
              </span>
            </GradientButton>
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-2 text-sm text-accent-blue">
              <CalendarDays size={16} />
              Roteiro do produto
            </div>
            <h1 className="young-serif-regular text-4xl font-bold leading-tight text-ink sm:text-5xl md:text-6xl">
              Construindo o sistema operacional para crescimento intencional.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-charcoal sm:text-lg">
              Acompanhe o que foi entregue, o que esta em construcao e o que vem a seguir no OrkestOS.
            </p>
          </Motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Marcos', value: milestones.length, icon: Target },
              { label: 'Em construção', value: roadmapItems.filter((item) => item.status === 'Em andamento').length, icon: Clock3 },
              { label: 'Itens Concluídos', value: roadmapItems.filter((item) => item.status === 'Concluído').length, icon: CheckCircle2 },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <Card className="h-full bg-surface-card border border-hairline-strong">
                    <Icon className="mb-4 text-accent-blue" size={24} />
                    <div className="text-3xl font-bold text-ink">{stat.value}</div>
                    <p className="mt-1 text-sm text-charcoal">{stat.label}</p>
                  </Card>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-accent-blue">
                <Filter size={16} />
                Filtrar o plano
              </div>
              <h2 className="young-serif-regular text-3xl font-bold text-ink">Pipeline de Funcionalidades</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-wrap gap-2" aria-label="Filter by status">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-xl border px-4 py-2 text-sm transition ${
                      selectedStatus === status
                        ? 'border-accent-blue bg-accent-blue/20 text-ink'
                        : 'border-hairline-strong bg-surface-elevated text-charcoal hover:border-hairline-strong hover:text-ink'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-xl border border-hairline-strong bg-surface-elevated px-4 py-2 text-sm text-ink outline-none focus:border-accent-blue"
                aria-label="Filter by category"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category} className="bg-canvas">
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Motion.div
                  key={item.title}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                >
                  <Card className="flex h-full flex-col bg-surface-card border border-hairline-strong transition duration-300 hover:-translate-y-1 hover:border-accent-blue/40">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="rounded-xl bg-[rgba(59,158,255,0.1)] p-3 text-accent-blue">
                        <Icon size={24} />
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2 text-xs text-charcoal">
                      <span className="rounded-full bg-surface-elevated px-3 py-1">{item.category}</span>
                      <span className="rounded-full bg-surface-elevated px-3 py-1">{item.quarter}</span>
                    </div>

                    <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-charcoal">{item.description}</p>
                  </Card>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
              <h2 className="young-serif-regular text-3xl font-bold text-ink">Linha do Tempo de Marcos</h2>
            <p className="mt-3 text-charcoal">Uma visão trimestre a trimestre de como o produto amadurece.</p>
          </div>

          <div className="relative grid gap-4 lg:grid-cols-4">
            {milestones.map((milestone, index) => (
              <Motion.div
                key={milestone.quarter}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
              >
                <Card className="h-full bg-surface-card border border-hairline-strong">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-accent-blue">{milestone.quarter}</span>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[milestone.status]}`}>
                      {milestone.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-ink">{milestone.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-charcoal">{milestone.summary}</p>
                </Card>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Roteiro;
