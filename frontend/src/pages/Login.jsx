import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-obsidian selection:bg-accent-cyan/30">
      {/* Left Side: Cinematic Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <img 
          src="/hero-bg.png" 
          alt="Sprintly Interface" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 hover:scale-100 transition-transform duration-[10s] ease-linear"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-dark-obsidian via-dark-obsidian/40 to-transparent"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-accent-cyan rounded-lg rotate-12"></div>
              <span className="text-2xl font-display font-bold text-white tracking-tighter">SPRINTLY</span>
            </div>
            
            <h2 className="text-5xl font-display font-bold text-white leading-tight mb-6">
              The command center<br />
              for <span className="text-accent-cyan">high-velocity</span> teams.
            </h2>
            <p className="text-slate-400 text-lg max-w-md">
              Synchronize your operations with relational precision and real-time strategic oversight.
            </p>
          </div>
          
          <div className="glass-card p-8 border-white/10 max-w-sm">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Zap key={i} size={14} className="fill-accent-cyan text-accent-cyan" />)}
            </div>
            <p className="text-white font-medium italic mb-2">
              "The most intuitive relational management suite we've ever deployed."
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Strategic Ops Director, Nexus
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        {/* Background Gradients for Mobile */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-cyan/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-md w-full animate-fade-in relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <div className="w-8 h-8 bg-accent-cyan rounded-lg rotate-12"></div>
            <span className="text-2xl font-display font-bold text-white tracking-tighter">SPRINTLY</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Protocol</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-cyan transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    className="input-premium pl-12 h-14"
                    placeholder="name@nexus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
                  <a href="#" className="text-[10px] font-bold text-accent-cyan hover:text-white transition-colors uppercase tracking-widest">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-cyan transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-premium pl-12 pr-12 h-14"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <div className="flex items-center justify-center w-5 h-5 rounded border border-white/10 bg-white/5 cursor-pointer hover:border-accent-cyan transition-colors">
                <div className="w-2 h-2 bg-accent-cyan rounded-sm"></div>
              </div>
              <span className="text-xs text-slate-400 font-medium cursor-pointer select-none">Remember this device for 30 days</span>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn-premium h-14 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="relative z-10">Authorize Access</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" size={18} />
                </>
              )}
            </button>
            
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">End-to-End Encryption</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                New to the platform?{' '}
                <Link to="/register" className="text-white hover:text-accent-cyan font-bold transition-colors underline underline-offset-8 decoration-white/20 hover:decoration-accent-cyan/50">
                  Create Account
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-16 flex items-center justify-center gap-6 text-slate-600">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
               <ShieldCheck size={14} /> SOC2 Certified
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
               <Zap size={14} /> Sub-ms Latency
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
