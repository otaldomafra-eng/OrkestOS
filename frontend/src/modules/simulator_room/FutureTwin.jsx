import { useState, useEffect, useRef } from 'react';
import { futureTwinAPI } from '../../api/apiService';

const INSIGHT_STYLE = {
  atencao: { border: 'rgba(255,197,61,0.2)', bg: 'rgba(255,197,61,0.04)', color: '#ffc53d', label: '⚠️ Atenção' },
  destaque: { border: 'rgba(17,255,153,0.2)', bg: 'rgba(17,255,153,0.04)', color: '#11ff99', label: '✅ Destaque' },
  previsao: { border: 'rgba(59,158,255,0.2)', bg: 'rgba(59,158,255,0.04)', color: '#3b9eff', label: '📊 Previsão' },
};

export default function FutureTwin() {
  const [insights, setInsights] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou seu FutureTwin — analiso seus padrões de produtividade e te mostro o caminho. O que você quer saber sobre sua evolução?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    Promise.all([futureTwinAPI.getInsights(), futureTwinAPI.getWeeklyAnalysis()])
      .then(([insightData, weeklyData]) => {
        setInsights(insightData?.insights ?? []);
        setWeekly(weeklyData);
      })
      .catch(console.error)
      .finally(() => setLoadingInsights(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const allMessages = [...messages, userMsg];
      const { reply } = await futureTwinAPI.chat(allMessages);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(59,158,255,0.08), rgba(255,255,255,0.03), rgba(17,255,153,0.04))',
          border: '1px solid rgba(59,158,255,0.2)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,158,255,0.4), rgba(17,255,153,0.2), transparent)' }}
        />
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(59,158,255,0.2), rgba(17,255,153,0.1))',
              border: '1px solid rgba(59,158,255,0.3)',
              boxShadow: '0 0 30px rgba(59,158,255,0.2)',
            }}
          >
            🧠
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">FutureTwin — Seu Eu do Futuro</h1>
            <p className="text-sm text-white/65 mt-1.5 max-w-lg leading-relaxed">
              Analiso seus hábitos, tarefas e metas para mostrar onde você está indo — e o que ajustar para chegar onde quer estar.
            </p>
            <div className="flex gap-8 mt-4">
              {[
                { val: weekly?.daysTracked ?? '—', lbl: 'Dias Analisados' },
                { val: insights.length, lbl: 'Insights Hoje' },
                { val: `${weekly?.completionRate ?? '—'}%`, lbl: 'Conclusão' },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <div className="text-xl font-bold text-[#3b9eff]" style={{ textShadow: '0 0 12px rgba(59,158,255,0.5)' }}>{val}</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider mt-1">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.07)', minHeight: '480px' }}
        >
          <div
            className="flex items-center gap-2.5 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#11ff99', boxShadow: '0 0 6px #11ff99' }}
            />
            <span className="text-sm font-semibold">FutureTwin</span>
            <span className="text-xs text-white/50 ml-auto">Online</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={
                    msg.role === 'assistant'
                      ? { background: 'linear-gradient(135deg,rgba(59,158,255,0.2),rgba(17,255,153,0.1))', border: '1px solid rgba(59,158,255,0.25)' }
                      : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {msg.role === 'assistant' ? '🧠' : '👤'}
                </div>
                <div
                  className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed text-white"
                  style={
                    msg.role === 'assistant'
                      ? { background: 'linear-gradient(135deg,rgba(59,158,255,0.07),rgba(17,255,153,0.03))', border: '1px solid rgba(59,158,255,0.15)', borderBottomLeftRadius: '4px' }
                      : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderBottomRightRadius: '4px' }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,rgba(59,158,255,0.2),rgba(17,255,153,0.1))', border: '1px solid rgba(59,158,255,0.25)' }}>🧠</div>
                <div className="px-4 py-3 rounded-2xl text-sm text-white/40" style={{ background: 'rgba(59,158,255,0.05)', border: '1px solid rgba(59,158,255,0.1)' }}>
                  Analisando...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div
            className="flex gap-3 p-4 items-end"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte ao seu FutureTwin..."
              rows={1}
              aria-label="Mensagem para o FutureTwin"
              className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/45 outline-none focus:border-white/30 resize-none overflow-hidden"
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Enviar mensagem"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.2)' }}
            >
              ↑
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-sm font-bold">Insights de Hoje</div>

          {loadingInsights ? (
            <div className="text-sm text-white/60">Carregando insights...</div>
          ) : insights.length === 0 ? (
            <div className="text-sm text-white/60">Nenhum insight disponível ainda.</div>
          ) : (
            insights.map((ins, i) => {
              const style = INSIGHT_STYLE[ins.type] ?? INSIGHT_STYLE.previsao;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl p-4"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${style.border}, transparent)` }}
                  />
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: style.color }}>
                    {style.label}
                  </div>
                  <div className="text-sm font-semibold mb-1">{ins.title}</div>
                  <div className="text-xs text-white/60 leading-relaxed">{ins.text}</div>
                </div>
              );
            })
          )}

          {weekly && (
            <>
              <div className="text-sm font-bold mt-2">Análise Semanal</div>
              <div
                className="rounded-2xl p-4"
                style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { label: 'Produtividade', val: `${weekly.completionRate}%`, pct: weekly.completionRate, color: '#11ff99' },
                  { label: 'Hábitos',       val: `${weekly.habitConsistency}%`, pct: weekly.habitConsistency, color: '#3b9eff' },
                  { label: 'Tarefas',       val: `${weekly.tasksCompleted}/${weekly.tasksTotal}`, pct: weekly.tasksTotal > 0 ? (weekly.tasksCompleted / weekly.tasksTotal) * 100 : 0, color: '#fff' },
                ].map(({ label, val, pct, color }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                    <div className="text-xs text-white/45 w-24 flex-shrink-0">{label}</div>
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, pct)}%`, background: color, boxShadow: `0 0 6px ${color}80` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-right w-12 flex-shrink-0" style={{ color }}>{val}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
