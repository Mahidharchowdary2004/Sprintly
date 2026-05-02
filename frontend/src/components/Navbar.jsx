import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, LayoutDashboard, Briefcase, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card !rounded-full px-8 py-3 flex items-center justify-between border-white/5">
        <div className="flex items-center gap-12">
          <Link to="/dashboard" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-cyan rounded-lg rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
            <span className="text-xl font-display font-bold tracking-tighter text-white">SPRINTLY</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink to="/projects" active={isActive('/projects')} icon={<Briefcase size={18} />} label="Projects" />
            <NavLink to="/tasks" active={isActive('/tasks')} icon={<CheckSquare size={18} />} label="Tasks" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-accent-cyan font-bold">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, icon, label }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      active 
        ? 'bg-accent-cyan/10 text-accent-cyan shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;
