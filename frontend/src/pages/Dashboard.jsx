import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import socket from '../utils/socket';
import { CheckCircle2, Clock, AlertCircle, ListTodo, ArrowUpRight, TrendingUp, Filter } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    projectId: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.status) params.status = filters.status;

      const res = await axios.get('/api/tasks/stats', { params });
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen for real-time updates
    socket.on('refresh_data', (data) => {
      console.log('Real-time update received:', data);
      fetchStats();
    });

    return () => {
      socket.off('refresh_data');
    };
  }, [fetchStats]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-32 pb-12 px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-accent-cyan"></span>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-accent-cyan">Overview</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white tracking-tight">
            Dashboard<span className="text-accent-cyan">.</span>
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            Welcome back, <span className="text-white font-medium">{user.name}</span>. Here's your task velocity.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-white/5">
            <Filter size={16} className="text-slate-500" />
            <select 
              className="bg-transparent text-xs font-bold text-white uppercase tracking-widest outline-none cursor-pointer"
              value={filters.projectId}
              onChange={(e) => setFilters({...filters, projectId: e.target.value})}
            >
              <option value="" className="bg-dark-obsidian">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id} className="bg-dark-obsidian">{p.title}</option>
              ))}
            </select>
          </div>

          <div className="glass-card px-4 py-2 flex items-center gap-3 border-white/5">
            <select 
              className="bg-transparent text-xs font-bold text-white uppercase tracking-widest outline-none cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="" className="bg-dark-obsidian">All Statuses</option>
              <option value="To Do" className="bg-dark-obsidian">To Do</option>
              <option value="In Progress" className="bg-dark-obsidian">In Progress</option>
              <option value="Completed" className="bg-dark-obsidian">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Volume" value={stats.total} icon={<ListTodo size={22} />} color="blue" />
        <StatCard title="Action Required" value={stats.todo} icon={<AlertCircle size={22} />} color="cyan" />
        <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={22} />} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 size={22} />} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border-white/5 min-h-[300px] flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Performance Matrix</h3>
            <div className="h-48 w-full flex items-end gap-2 px-2">
               {[40, 65, 45, 90, 55, 75, 60].map((h, i) => (
                 <div key={i} className="flex-1 group relative">
                    <div 
                      className="w-full bg-gradient-to-t from-accent-cyan/20 to-accent-cyan/40 rounded-t-lg transition-all duration-500 group-hover:from-accent-cyan/40 group-hover:to-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                      style={{ height: `${h}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-accent-cyan">
                      {h}%
                    </div>
                 </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {stats.overdue > 0 ? (
            <div className="glass-card p-6 border-red-500/20 bg-red-500/5 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-red-500/20 group-hover:text-red-500/40 transition-colors">
                <AlertCircle size={80} />
              </div>
              <h3 className="text-red-500 font-bold text-lg mb-2 flex items-center gap-2">
                <AlertCircle size={20} /> Critical Delay
              </h3>
              <p className="text-red-200/70 text-sm mb-4 leading-relaxed">
                You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} that need immediate resolution to maintain velocity.
              </p>
              <button className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                Audit Overdue <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <div className="glass-card p-6 border-accent-cyan/20 bg-accent-cyan/5">
              <h3 className="text-accent-cyan font-bold text-lg mb-2">Optimal Flow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                System efficiency is at maximum. No overdue parameters detected in the current cycle.
              </p>
            </div>
          )}

          <div className="glass-card p-6 border-white/5">
             <h3 className="text-white font-bold text-lg mb-4">Core Actions</h3>
             <div className="space-y-3">
                <button className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-sm font-medium text-slate-300 hover:text-white transition-all text-left flex justify-between items-center group">
                  Active Projects <ArrowUpRight size={16} className="text-slate-500 group-hover:text-accent-cyan transition-colors" />
                </button>
                <button className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-sm font-medium text-slate-300 hover:text-white transition-all text-left flex justify-between items-center group">
                  New Task <ArrowUpRight size={16} className="text-slate-500 group-hover:text-accent-cyan transition-colors" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-6 hover-glow border-white/5 group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${
      color === 'cyan' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-accent-blue/10 text-accent-blue'
    }`}>
      {icon}
    </div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
    <div className="flex items-end gap-3">
      <p className="text-4xl font-display font-bold text-white">{value}</p>
      <span className="text-[10px] font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded-md mb-2">
        +12%
      </span>
    </div>
  </div>
);

export default Dashboard;
