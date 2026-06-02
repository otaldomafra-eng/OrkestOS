import { Link } from 'react-router-dom';
import { motion as Motion } from "framer-motion";
import { Target, TrendingUp, Sparkles, Brain, CheckCircle, Zap } from 'lucide-react';
import GradientButton from '../components/GradientButton';
import Card from '../components/Card';
import { ArrowRight } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const Landing = () => {
  const features = [
    {
      icon: <TrendingUp size={32} />,
      title: 'Rastreador de hábitos',
      description: 'Construa rotinas consistentes com ciclos de acompanhamento diário'
    },
    {
      icon: <Target size={32} />,
      title: 'Gestão de metas',
      description: 'Defina, acompanhe e conclua metas pessoais e profissionais'
    },
    {
      icon: <CheckCircle size={32} />,
      title: 'Tarefas e projetos',
      description: 'Organize execução diária, prioridades e entregas em um so lugar'
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Assistente de IA',
      description: 'Simule cenários e tome decisões com apoio de dados'
    },
    {
      icon: <Brain size={32} />,
      title: 'Análises inteligentes',
      description: 'Veja padrões de produtividade, disciplina e progresso'
    },
    {
      icon: <Zap size={32} />,
      title: 'Desenvolvimento integrado',
      description: 'Conecte hábitos, metas, foco e planejamento em uma rotina única'
    }
  ];

  return (
<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className='bg-gradient-to-br from-gray-900 via-black to-gray-900'>
        <Motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
            <Motion.section animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative min-h-screen flex items-center justify-center px-4 py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
            {/* Glow blobs */}
            <Motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20"
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <Motion.div
              className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-20"
              animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
              transition={{ duration: 12, repeat: Infinity }}
            />

            <div className="relative max-w-4xl mx-auto text-center">
              <div className="mb-8 flex flex-col items-center">

                {/* Logo */}
                <Motion.img
                  src={logo}
                  alt="OrkestOS Logo"
                  className="w-20 h-20 md:w-28 md:h-28 mb-4 object-contain"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Title */}
                <Motion.h1
                  className="text-3xl sm:text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-4 cursor-pointer break-words"
                  animate={{
                    textShadow: [
                      "0px 0px 0px rgba(99,102,241,0)",
                      "0px 0px 20px rgba(99,102,241,0.8)",
                      "0px 0px 0px rgba(99,102,241,0)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Orkest
                  <span className="bg-gradient-to-r text-4xl sm:text-5xl md:text-8xl baloo-2-700 from-indigo-500 to-purple-500 bg-clip-text text-transparent break-words">
                    OS
                  </span>
                </Motion.h1>

                <div className="h-1 w-32 bg-gradient-to-r from-indigo-600 to-violet-600 mx-auto rounded-full"></div>
              </div>
<p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed px-2">
                Seu sistema inteligente de organização pessoal.
                <br />
                Mantenha foco, execute metas e organize sua rotina.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup">
                  <GradientButton data-testid="get-started-btn" className="w-full sm:w-auto">
                    Começar
                  </GradientButton>
                </Link>
                <Link to="/login">
                  <button
                    data-testid="login-btn"
                    className="px-8 py-[10px] border-2 border-indigo-500 text-white rounded-xl font-semibold 
                        hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] 
                        hover:-translate-y-1 active:scale-95 transition-all duration-300"
                  >
                    Entrar
                  </button>
                </Link>
              </div>
            </div>
          </Motion.section>
        </Motion.div>
      </div>



      {/* Recursos Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold young-serif-regular text-gray-600 dark:text-gray-100 mb-2">Recursos principais</h2>
            <div className="h-1 w-39 bg-gradient-to-r from-indigo-600 to-violet-600 mx-auto rounded-full"></div>
            <p className="text-gray-900 dark:text-gray-300 mt-2 text-base md:text-lg">Tudo que você precisa para organizar rotina, metas e execução</p>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >

                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 
hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="p-3 bg-indigo-500/20 rounded-lg w-fit mb-4 text-indigo-400">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold young-serif-regular text-gray-200 mb-2">Como funciona</h2>
            <div className="h-1 w-30 bg-gradient-to-r from-indigo-600 to-violet-600 mx-auto rounded-full"></div>
            <p className="text-gray-400 mt-2 text-base md:text-lg">Passos simples para transformar planejamento em ação</p>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Mapeie sua rotina', desc: 'Registre hábitos, tarefas e progresso diário' },
              { step: '02', title: 'Entenda padrões', desc: 'Revise indicadores e analises da sua produtividade' },
              { step: '03', title: 'Planeje cenários', desc: 'Use IA para antecipar caminhos e ajustar decisões' },
              { step: '04', title: 'Conclua metas', desc: 'Mantenha consistencia e transforme plano em resultado' }
            ].map((item, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >

                <div className="flex items-start gap-6 p-2 rounded-3xl cursor-pointer 
bg-white/5 backdrop-blur-lg border border-white/10 
hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                 <div className='p-4 flex flex-col sm:flex-row items-start gap-4 sm:gap-6'>
                    <div className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2"> {item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 shadow-[0_0_60px_rgba(99,102,241,0.4)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold young-serif-regular text-white mb-6">
            Pronto para organizar sua rotina?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Centralize tarefas, hábitos, metas e foco no OrkestOS.
          </p>
          <Link to="/signup">
            <GradientButton data-testid="cta-signup-btn" className="
    text-lg 
    bg-white text-black 
    bg-gradient-to-r from-green-500 via-blue-500 to-purple-600
    hover:bg-gray-200 
    shadow-[0_0_30px_rgba(255,255,255,0.6)]
  ">
              Comece hoje
            </GradientButton>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent"></div>

        <div className="max-w-6xl mx-auto relative">

          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold young-serif-regular text-white mb-2">
              Feito para quem executa
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="text-gray-400 mt-3 text-base md:text-lg">
              Impacto real em produtividade e crescimento
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {[
              { value: "10K+", label: "Usuários ativos" },
              { value: "95%", label: "Taxa de metas concluídas" },
              { value: "2.5x", label: "Ganho de produtividade" },
              { value: "24/7", label: "Suporte de IA" }
            ].map((stat, index) => (

              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >

                <div className="
                  bg-white/5 backdrop-blur-lg border border-white/10 
                  rounded-2xl cursor-pointer p-6 text-center
                  hover:scale-105 hover:bg-white/10
                  transition-all duration-300
                  hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]
                ">

                  {/* Number */}
                  <h3 className="
                    text-3xl md:text-4xl baloo-2-700 font-extrabold 
                    bg-gradient-to-r from-blue-500 to-purple-700 
                    bg-clip-text text-transparent mb-2 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]
                  ">
                    {stat.value}
                  </h3>

                  {/* Label */}
                  <p className="text-gray-400 text-sm md:text-base">
                    {stat.label}
                  </p>

                </div>

              </Motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-800/50 border-t border-gray-700 relative overflow-hidden">

        {/* Subtle glow background */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent"></div>

        <div className="max-w-6xl mx-auto relative">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Branding */}
            <div>
              <h2 className="text-2xl young-serif-regular font-bold mb-4">
                Orkest<span className="bg-gradient-to-r text-3xl baloo-2-400 from-indigo-500 to-purple-500 bg-clip-text text-transparent">OS</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Seu sistema inteligente de organização pessoal.
                Otimize hábitos, metas e decisões futuras.
              </p>
            </div>

            {/* Produto Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link to="/#features" className="hover:text-white transition cursor-pointer">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition cursor-pointer">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="hover:text-white transition">
                    Roteiro
                  </Link>
                </li>
              </ul>
            </div>

            {/* Empresa Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white transition cursor-pointer">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-white transition cursor-pointer">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition cursor-pointer">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* CTA / Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">Começar</h3>

              <Link to="/signup">
                <GradientButton className="bg-white text-black hover:bg-gray-200 w-full mb-4">
                  <span className="flex items-center justify-center gap-2">
                    Start Free
                    <ArrowRight size={18} />
                  </span>
                </GradientButton>
              </Link>

              <p className="text-gray-400 text-sm">
                Join thousands building better habits.
              </p>
            </div>

          </div>

          {/* Bottom Line */}
          <div className="mt-12 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
            Â© 2026 <span className="text-white font-semibold">OrkestOS</span>. All rights reserved.
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;
