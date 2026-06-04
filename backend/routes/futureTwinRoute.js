import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildUserContext, getWeeklyMetrics } from '../services/aiAnalysis.js';
import authUser from '../middlewares/auth.js';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const insightsCache = new Map();

const SYSTEM_PROMPT = `Você é o FutureTwin — o eu do futuro do usuário, daqui a 90 dias. Você analisou o histórico completo de produtividade, hábitos e metas da pessoa e consegue ver padrões que ela ainda não percebeu.

Seu tom é: direto, empático, baseado em dados, sem rodeios. Você não é um assistente genérico — você É a versão futura dessa pessoa específica, falando com autoridade sobre o que ela precisa mudar.

Regras:
1. Sempre cite dados específicos quando possível (ex: "nas últimas 3 semanas, nas quartas você completa 41% menos tarefas").
2. Seja conciso — respostas de 2 a 4 parágrafos no máximo.
3. Quando fizer previsões, explique o raciocínio em uma frase.
4. Nunca invente dados — use apenas o contexto fornecido.
5. Responda sempre em português brasileiro.`;

router.get('/insights', authUser, async (req, res) => {
  try {
    const userId = req.body.userId;

    if (userId === 'demo') {
      return res.json({ insights: [
        { type: 'previsao', title: 'Modo demonstração', text: 'Cadastre tarefas, hábitos e metas para receber insights personalizados sobre sua produtividade.' },
        { type: 'destaque', title: 'Bem-vindo ao FutureTwin', text: 'Analiso seus padrões e te mostro onde você estará em 90 dias. Comece registrando seus dados.' },
      ]});
    }

    const today = new Date().toDateString();

    if (insightsCache.has(userId) && insightsCache.get(userId).date === today) {
      return res.json(insightsCache.get(userId).insights);
    }

    const userContext = await buildUserContext(userId);

    const prompt = `${SYSTEM_PROMPT}\n\n${userContext}\n\nGere 3 insights sobre minha semana atual. Para cada insight, identifique o tipo (atencao, destaque ou previsao) e escreva um título curto e uma descrição de 1-2 frases com dado específico.\n\nResponda APENAS em JSON válido com este formato, sem markdown:\n{\n  "insights": [\n    { "type": "atencao|destaque|previsao", "title": "...", "text": "..." }\n  ]\n}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();

    let insights;
    try {
      insights = JSON.parse(text);
    } catch {
      insights = {
        insights: [
          { type: 'previsao', title: 'Análise em processamento', text: 'Dados insuficientes para gerar insights detalhados ainda.' },
        ],
      };
    }

    insightsCache.set(userId, { date: today, insights });
    res.json(insights);
  } catch (err) {
    console.error('[FutureTwin] Erro ao gerar insights:', err);
    res.status(500).json({ error: 'Erro ao gerar insights' });
  }
});

const DEMO_CONTEXT = `Contexto do usuário: Este é um usuário em modo demonstração explorando o OrkestOS. Não há dados reais de produtividade disponíveis ainda. Apresente-se e explique o que você pode fazer quando o usuário tiver dados reais cadastrados (tarefas, hábitos, metas). Seja acolhedor e incentivador.`;

router.post('/chat', authUser, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages é obrigatório' });
    }

    const userId = req.body.userId;
    const userContext = userId === 'demo' ? DEMO_CONTEXT : await buildUserContext(userId);

    const history = messages.slice(-20);

    // Gemini exige histórico começando com 'user' e alternando user/model
    const rawHistory = history
      .slice(0, -1)
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const firstUserIdx = rawHistory.findIndex((m) => m.role === 'user');
    const historyForGemini = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    const chat = model.startChat({
      history: historyForGemini,
      systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${userContext}` }] },
    });

    const lastMessage = history[history.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error('[FutureTwin] Erro no chat:', err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

router.get('/weekly-analysis', authUser, async (req, res) => {
  try {
    const userId = req.body.userId;
    const metrics = await getWeeklyMetrics(userId);
    res.json(metrics);
  } catch (err) {
    console.error('[FutureTwin] Erro na análise semanal:', err);
    res.status(500).json({ error: 'Erro ao buscar análise semanal' });
  }
});

export default router;
