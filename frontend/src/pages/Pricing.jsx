import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Shield, Sparkles, Zap } from 'lucide-react';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';

const plans = [
  {
    name: 'Starter',
    description: 'Para construir um ritmo de planejamento pessoal.',
    monthly: 0,
    yearly: 0,
    cta: 'Comece Grátis',
    accent: 'from-indigo-500 to-blue-500',
    features: [
      'Rastreamento de hábitos de 21 dias',
      'Painéis de tarefas e metas diários',
      'Insights básicos de produtividade',
      'Prompts de teste FutureTwin',
    ],
  },
  {
    name: 'Pro',
    description: 'Para sistemas sérios de hábitos, metas e projetos.',
    monthly: 12,
    yearly: 96,
    cta: 'Escolha Pro',
    accent: 'from-purple-500 to-indigo-500',
    highlighted: true,
    features: [
      'Analytics avançado e relatórios',
      'Metas e projetos ilimitados',
      'Simulações de cenários FutureTwin',
      'Insights prioritários de hábito e foco',
    ],
  },
  {
    name: 'Team',
    description: 'Para grupos de responsabilidade e coortes orientadas.',
    monthly: 29,
    yearly: 240,
    cta: 'Planeje Juntos',
    accent: 'from-fuchsia-500 to-purple-500',
    features: [
      'Painéis de progresso compartilhados',
      'Salas de planejamento em equipe',
      'Controles de membros prontos para admin',
      'Suporte de integração orientado',
    ],
  },
];

const comparisonRows = [
  ['Rastreamento de hábitos e tarefas', 'Incluído', 'Ilimitado', 'Ilimitado'],
  ['Simulações FutureTwin', 'Teste', 'Avançado', 'Cenários de equipe'],
  ['Profundidade de análise', 'Básico', 'Avançado', 'Relatório de grupo'],
  ['Prioridade de suporte', 'Comunidade', 'Prioridade', 'Dedicado'],
];

const MotionHeader = motion.header;
const MotionSection = motion.section;
const MotionDiv = motion.div;

const Preços = () => {
  const [billing, setBilling] = useState('monthly');
  const isYearly = billing === 'yearly';

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-ink px-4 py-10">
      <div className="w-full max-w-6xl mx-auto">
        <MotionHeader
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-12"
        >
          <div className="min-w-0 max-w-3xl">
            <Link to="/" className="flex w-fit items-center gap-2 text-sm text-accent-blue hover:underline transition mb-6">
              Orkest<span className="text-accent-blue">OS</span>
            </Link>
            <div className="flex w-fit max-w-full items-start gap-2 rounded-full border border-hairline-strong bg-surface-elevated px-4 py-2 text-sm text-accent-blue mb-5">
              <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
              <span className="min-w-0">Planos flexíveis para cada sistema de crescimento</span>
            </div>
            <h1 className="max-w-full text-4xl md:text-6xl font-extrabold tracking-normal text-ink mb-5">
              Preços que escalam com sua disciplina.
            </h1>
            <p className="max-w-full text-lg md:text-xl text-charcoal leading-relaxed">
              Comece com rastreamento pessoal, depois desbloqueie análise mais profunda, simulações e planejamento compartilhado quando seu sistema amadurecer.
            </p>
          </div>

          <div className="w-full min-w-0 max-w-sm rounded-2xl border border-hairline-strong bg-surface-card p-2">
            <div className="grid grid-cols-2 gap-2">
              {['monthly', 'yearly'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBilling(option)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    billing === option
                      ? 'bg-accent-blue text-ink'
                      : 'text-charcoal hover:text-ink hover:bg-surface-elevated'
                  }`}
                >
                  {option === 'monthly' ? 'Mensal' : 'Anual'}
                </button>
              ))}
            </div>
            <p className="text-xs text-charcoal mt-3 text-center">Faturamento anual inclui dois meses grátis.</p>
          </div>
        </MotionHeader>

        <section className="grid min-w-0 grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
          {plans.map((plan, index) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            const cadence = isYearly && price > 0 ? '/yr' : price > 0 ? '/mo' : '';

            return (
              <MotionDiv
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
              >
                <Card
                  className={`h-full min-w-0 border transition ${
                    plan.highlighted
                      ? 'bg-surface-card border-accent-blue/40'
                      : 'bg-surface-card border-hairline-strong'
                  }`}
                >
                  <div className="h-1.5 w-24 rounded-full bg-accent-blue mb-6" />
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    {plan.highlighted && (
                      <span className="rounded-full bg-accent-blue/15 px-3 py-1 text-xs font-semibold text-accent-blue">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-charcoal min-h-14">{plan.description}</p>
                  <div className="my-8">
                    <span className="text-5xl font-extrabold">${price}</span>
                    <span className="text-charcoal ml-2">{cadence}</span>
                  </div>
                  <Link to="/signup" className="block min-w-0 mb-8">
                    <GradientButton className="w-full" variant="primary">
                      {plan.cta}
                      <ArrowRight size={18} />
                    </GradientButton>
                  </Link>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-charcoal">
                        <Check size={18} className="mt-0.5 text-accent-blue flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </MotionDiv>
            );
          })}
        </section>

        <section className="grid min-w-0 grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 mb-14">
          <Card className="min-w-0 bg-surface-card border border-hairline-strong">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-[rgba(59,158,255,0.1)] text-accent-blue">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Comparação de Planos</h2>
                <p className="text-charcoal text-sm">Escolha o nível que combina com seu sistema operacional.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['2 mo', 'free on yearly'],
                ['3 tiers', 'for every stage'],
                ['24/7', 'AI workflows'],
                ['0 lock-in', 'start free'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-surface-deep border border-hairline-strong p-4">
                  <p className="text-2xl font-bold text-accent-blue">{value}</p>
                  <p className="text-sm text-charcoal">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="min-w-0 overflow-x-auto rounded-2xl border border-hairline-strong bg-surface-card">
            <div className="grid min-w-[680px] grid-cols-4 bg-surface-elevated text-sm font-semibold text-charcoal">
              <div className="p-4">Funcionalidade</div>
              <div className="p-4">Starter</div>
              <div className="p-4">Pro</div>
              <div className="p-4">Team</div>
            </div>
            {comparisonRows.map((row) => (
              <div key={row[0]} className="grid min-w-[680px] grid-cols-4 border-t border-hairline-strong text-sm text-charcoal">
                {row.map((cell, index) => (
                  <div key={cell} className={`p-4 ${index === 0 ? 'text-ink font-medium' : ''}`}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <MotionSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-hairline-strong bg-surface-card p-8 md:p-10 text-center"
        >
          <div className="flex justify-center mb-5">
            <div className="rounded-full bg-surface-elevated p-3 text-ink">
              <Zap size={28} />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Construa o sistema antes que a motivação desapareça.</h2>
          <p className="text-charcoal max-w-2xl mx-auto mb-8">
            Transforme planejamento, foco, análises e simulações em um ciclo diário que continua crescendo.
          </p>
          <Link to="/signup">
            <GradientButton variant="primary">
              Comece com OrkestOS
            </GradientButton>
          </Link>
        </MotionSection>
      </div>
    </div>
  );
};

export default Preços;
