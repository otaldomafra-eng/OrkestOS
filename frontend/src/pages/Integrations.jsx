import { useState } from 'react';
import { Bot, Check, Clipboard, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

import { telegramAPI } from '../api/apiService';

const commandRows = [
  ['/briefing', 'Resumo do dia'],
  ['/hoje', 'Plano de hoje'],
  ['/tarefas', 'Tarefas pendentes'],
  ['/habitos', 'Hábitos e sequências'],
  ['/add tarefa Revisar contrato', 'Criar tarefa']
];

const Integracoes = () => {
  const [linkCode, setLinkCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateCode = async () => {
    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const result = await telegramAPI.createLinkCode();

      if (!result.success) {
        setError(result.message || 'Não foi possível gerar o código.');
        return;
      }

      setLinkCode(result.code);
      setExpiresAt(result.expiresAt);
    } catch (requestError) {
      console.log(requestError);
      setError('Não foi possível conectar ao backend.');
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = async () => {
    if (!linkCode) return;

    const command = `/link ${linkCode}`;
    await navigator.clipboard.writeText(command);
    setCopied(true);
  };

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-8"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  <MessageCircle size={14} />
                  Camada KRONOS
                </div>
                <h1 className="text-3xl font-semibold tracking-normal text-white md:text-4xl">
                  Assistente Telegram
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Use o Telegram como uma superfície rápida para briefings, tarefas, hábitos e comandos do OrkestOS.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300">
                <ShieldCheck size={16} className="text-emerald-300" />
                Webhook protegido
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-white/10 bg-zinc-950/70 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Vínculo da conta</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Gere um código temporário e envie o comando ao bot no Telegram.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateCode}
                  disabled={loading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                  Gerar código
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              {linkCode && (
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Comando</p>
                    <p className="mt-1 font-mono text-lg text-white">/link {linkCode}</p>
                    <p className="mt-2 text-xs text-zinc-500">Expira às {formattedExpiry}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyCommand}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/5 active:scale-[0.98]"
                  >
                    {copied ? <Check size={16} className="text-emerald-300" /> : <Clipboard size={16} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
            </div>
          </Motion.div>

          <Motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <p className="text-sm font-medium text-white">Comandos ativos</p>
            <div className="mt-4 divide-y divide-white/10">
              {commandRows.map(([command, label]) => (
                <div key={command} className="py-3">
                  <p className="font-mono text-sm text-emerald-200">{command}</p>
                  <p className="mt-1 text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </Motion.aside>
        </div>
      </section>
    </main>
  );
};

export default Integracoes;
