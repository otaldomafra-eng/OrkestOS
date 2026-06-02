import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import Card from '../components/Card';
import { validateEmail } from '../utils/helpers';
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext';
import { authAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';


const Signup = () => {
  const { setToken, setUser, navigate } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const passwordRules = [
    { label: 'Pelo menos 8 caracteres', isValid: formData.password.length >= 8 },
    { label: 'Uma letra maiuscula', isValid: /[A-Z]/.test(formData.password) },
    { label: 'Uma letra minuscula', isValid: /[a-z]/.test(formData.password) },
    { label: 'Um numero', isValid: /\d/.test(formData.password) },
  ];

  const getAuthErrorMessage = (error, fallback) => {
    return error?.response?.data?.message || error?.message || fallback;
  };

  const handleSignUpSubmit = async(e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (!payload.name || !payload.email || !payload.password || !payload.username) {
      setError('Preencha todos os campos obrigatórios antes de criar sua conta.');
      return;
    }

    if (!validateEmail(payload.email)) {
      setError('Informe um email valido.');
      return;
    }

    const missingSenhaRule = passwordRules.find((rule) => !rule.isValid);
    if (missingSenhaRule) {
      setError(`A Senha deve incluir: ${missingSenhaRule.label.toLowerCase()}.`);
      return;
    }

    try {

      const response = await authAPI.register(payload);
      
      if(response.success){
        // Store token
        setToken(response.token);
        localStorage.setItem('token', response.token);
        
        // Save user data
        const userData = response.user || { 
          name: payload.name,
          username: payload.username,
          email: payload.email,
          bio: response.bio,
        };
        setUser(userData);
        localStorage.setItem('orkestos_user', JSON.stringify(userData));
        showToast({ message: response.message || 'Conta criada com sucesso!', status: 'success' })
        navigate('/onboarding')
      } else{
          setError(response.message || 'Falha ao criar conta');
          showToast({ message: response.message || 'Falha ao criar conta', status: 'error' })
      }
      
    } catch (error) {
        console.error('Signup error:', error);
        const message = getAuthErrorMessage(error, 'Não foi possível criar sua conta. Tente novamente.');
        setError(message);
        showToast({ message, status: 'error' })
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <motion.h1
              className="text-4xl young-serif-regular font-bold text-white mb-2"

              animate={{
                textShadow: [
                  "0px 0px 0px rgba(99,102,241,0)",        // no glow
                  "0px 0px 20px rgba(99,102,241,0.8)",     // glow
                  "0px 0px 0px rgba(99,102,241,0)"         // back to normal
                ]
              }}

              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Orkest<span className="bg-gradient-to-r from-indigo-500 to-purple-600 baloo-2-700 md:text-5xl  bg-clip-text text-transparent">OS</span>
            </motion.h1>
          </Link>
          <p className="text-gray-400">Crie sua conta e comece a acompanhar sua rotina</p>
        </div>

        <Card className='bg-white/5 backdrop-blur-xl 
border border-white/10 
rounded-2xl p-8
shadow-[0_0_40px_rgba(99,102,241,0.2)]'>

          <>
            <h2 className="text-2xl young-serif-regular text-center font-bold text-gray-200 mb-6">Criar conta</h2>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <InputField
                label="Nome"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Informe seu nome"
                required
              />

              <InputField
                label="Usuário"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Escolha um usuário"
                required
              />

              <InputField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Informe seu email"
                required
              />

              <InputField
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Crie uma senha forte"
                required
              />
              <div className=”space-y-1 text-sm”>
                {passwordRules.map((rule) => (
                  <p key={rule.label} className={rule.isValid ? 'text-green-400' : 'text-gray-500'}>
                    {rule.isValid ? '✓' : '•'} {rule.label}
                  </p>
                ))}
              </div>

              <GradientButton type="submit" className="w-full mt-5" data-testid="signup-continue-btn">
                Criar conta
              </GradientButton>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Entrar
                </Link>
              </p>
            </div>
          </>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
