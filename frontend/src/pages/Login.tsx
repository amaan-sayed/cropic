import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, AlertCircle, Mail } from 'lucide-react'; 
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, signup, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Toggle between Login and Signup modes
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [credentials, setCredentials] = useState({ 
    username: '', 
    email: '',
    password: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let success = false;
    // Simulate a slight network delay for that premium feel
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isSignUp) {
      success = await signup(credentials);
    } else {
      success = await login({ username: credentials.username, password: credentials.password });
    }

    setIsLoading(false);
    
    // Walk through the door if successful
    if (success) {
      navigate('/');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
    setCredentials({ username: '', email: '', password: '' }); // Reset form
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-white tracking-wide mb-2">
            Welcome to <span className="font-bold text-emerald-400">CROPIC</span>
          </h1>
          <p className="text-neutral-400 text-sm">
            {isSignUp ? 'Initialize Secure Profile' : 'Secure Portal Authentication'}
          </p>
        </div>

        {/* Dynamic Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-neutral-500" />
            </div>
            <input
              required
              type="text"
              value={credentials.username}
              className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="System ID (Username)"
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>

          {/* Only show Email if signing up */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  required={isSignUp}
                  type="email"
                  value={credentials.email}
                  className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="Official Email"
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-neutral-500" />
            </div>
            <input
              required
              type="password"
              value={credentials.password}
              className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="Passcode"
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-neutral-950 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 mt-2"
          >
            {isLoading ? 'Verifying...' : isSignUp ? 'Create Profile' : 'Authenticate'}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </motion.button>
        </form>

        {/* Toggle Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={toggleMode}
            type="button"
            className="text-neutral-400 hover:text-white text-sm transition-colors"
          >
            {isSignUp ? 'Already have an ID? Log in securely.' : 'No profile found? Request System ID.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;