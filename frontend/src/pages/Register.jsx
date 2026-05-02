import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Zap, Briefcase, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-obsidian selection:bg-accent-cyan/30">
      {/* Right Side: Cinematic Visual (Flipped for variety) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-l border-white/5 order-2">
        <img 
          src="/hero-bg.png" 
          alt="Sprintly Infrastructure" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-dark-obsidian via-dark-obsidian/40 to-transparent"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-accent-cyan rounded-lg rotate-12"></div>
              <span className="text-2xl font-display font-bold text-white tracking-tighter">SPRINTLY</span>
            </div>
            
            <h2 className="text-5xl font-display font-bold text-white leading-tight mb-6">
              Join the future of<br />
              <span className="text-accent-cyan">strategic</span> coordination.
            </h2>
            <p className="text-slate-400 text-lg max-w-md">
              Establish your footprint in a workspace designed for extreme performance and relational clarity.
            </p>
          </div>
          
          <div className="space-y-6">
            <FeatureItem icon={<Zap size={18} />} text="Instant Deployment" />
            <FeatureItem icon={<ShieldCheck size={18} />} text="Relational Security" />
            <FeatureItem icon={<Briefcase size={18} />} text="Enterprise RBAC" />
          </div>
        </div>
      </div>

      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative order-1">
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
            <h1 className="text-4xl font-display font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Initialize your profile and join your team.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-cyan transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    className="input-premium pl-12 h-14"
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Protocol</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-cyan transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    className="input-premium pl-12 h-14"
                    placeholder="alex@nexus.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-cyan transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-premium pl-12 pr-12 h-14"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Operational Role</label>
                <select 
                  className="input-premium h-14 px-4 cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Member">Member (Standard Operations)</option>
                  <option value="Admin">Admin (Strategic Oversight)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn-premium h-14 flex items-center justify-center gap-2 group mt-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Initialize Profile</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
            
            <div className="text-center pt-6">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:text-accent-cyan font-bold transition-colors underline underline-offset-8 decoration-white/20 hover:decoration-accent-cyan/50">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 text-white">
    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
      {icon}
    </div>
    <span className="font-medium tracking-tight">{text}</span>
  </div>
);

export default Register;
