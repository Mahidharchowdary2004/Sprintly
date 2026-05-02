import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Users, BarChart3, ChevronDown } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-obsidian overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
          <img 
            src="/hero-bg.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-obsidian via-transparent to-dark-obsidian"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in">
            <Zap size={14} /> Intelligence-Driven Operations
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter mb-8 leading-[0.95] animate-fade-in">
            Architect Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-cyan bg-[length:200%_auto] animate-gradient">Velocity.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The high-performance engine for modern strategic teams. Relational project tracking, automated insights, and a workspace designed for extreme focus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="btn-premium !px-12 !py-5 flex items-center gap-2 group">
              Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link to="/login" className="btn-outline !px-12 !py-5">
              Sign In
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown size={32} className="text-white" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Strategic Frameworks</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Built on a foundation of reliability and extreme performance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield size={32} className="text-accent-cyan" />}
              title="Relational Integrity"
              description="PostgreSQL backend with Neon serverless architecture ensures mission-critical data persistence and consistency."
            />
            <FeatureCard 
              icon={<Users size={32} className="text-accent-blue" />}
              title="Sovereign Control"
              description="Advanced RBAC allows you to delegate with precision while maintaining total strategic oversight of all initiatives."
            />
            <FeatureCard 
              icon={<BarChart3 size={32} className="text-accent-cyan" />}
              title="Operational Insight"
              description="Visualize velocity in real-time through high-performance glass interfaces designed for decision-making."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-accent-cyan/5 blur-[120px] rounded-full scale-50 opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto glass-card p-16 flex flex-col md:flex-row justify-between items-center gap-12 border-white/5 relative z-10">
          <StatItem label="Active Nodes" value="2.4k+" />
          <div className="w-px h-16 bg-white/10 hidden md:block"></div>
          <StatItem label="Requests / Sec" value="180k" />
          <div className="w-px h-16 bg-white/10 hidden md:block"></div>
          <StatItem label="Uptime Record" value="99.999%" />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-5xl font-display font-bold text-white mb-8 tracking-tight">Ready to synchronize?</h2>
        <Link to="/register" className="btn-premium !px-16 !py-6 inline-flex items-center gap-3 text-lg group">
          Join the Network <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-cyan rounded-md rotate-12"></div>
            <span className="text-lg font-display font-bold text-white tracking-tighter">SPRINTLY</span>
          </div>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2026 SPRINTLY OPERATIONS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-12">
            <a href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Protocols</a>
            <a href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Network</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-12 hover-glow border-white/5 group transition-all duration-500">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-accent-cyan/10 group-hover:scale-110 transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="text-center">
    <p className="text-6xl font-display font-bold text-white mb-3 tabular-nums tracking-tighter">{value}</p>
    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-accent-cyan">{label}</p>
  </div>
);

export default Landing;
