import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import socket from '../utils/socket';
import { Plus, Users, Calendar, ArrowRight, X, UserPlus, Briefcase, Trash2, Edit } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    members: []
  });

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    // Listen for real-time updates
    socket.on('refresh_data', (data) => {
      console.log('Real-time project update:', data);
      fetchProjects();
    });

    return () => {
      socket.off('refresh_data');
    };
  }, [fetchProjects]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (project = null) => {
    fetchUsers();
    if (project) {
      setEditingProject(project);
      setProjectData({
        title: project.title,
        description: project.description || '',
        members: project.members.map(m => m._id)
      });
    } else {
      setEditingProject(null);
      setProjectData({ title: '', description: '', members: [] });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`/api/projects/${editingProject._id}`, projectData);
      } else {
        await axios.post('/api/projects', projectData);
      }
      setShowModal(false);
      setProjectData({ title: '', description: '', members: [] });
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to process project');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Terminate this initiative? All associated tasks will be purged.')) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMember = (userId) => {
    setProjectData(prev => {
      const members = prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };

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
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-accent-cyan">Strategy</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white tracking-tight">
            Initiatives<span className="text-accent-cyan">.</span>
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            High-level project coordination and resource allocation.
          </p>
        </div>
        
        {user.role === 'Admin' && (
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-premium flex items-center gap-2"
          >
            <Plus size={20} /> New Initiative
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project._id} className="glass-card p-8 border-white/5 hover-glow group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent-cyan border border-white/10 group-hover:border-accent-cyan/30 transition-colors">
                <Briefcase size={24} />
              </div>
              {user.role === 'Admin' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(project)}
                    className="text-slate-600 hover:text-white transition-colors"
                    title="Edit Initiative"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => deleteProject(project._id)}
                    className="text-slate-600 hover:text-red-500 transition-colors"
                    title="Delete Initiative"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-cyan transition-colors">{project.title}</h3>
            <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed">
              {project.description || 'No strategic overview provided for this initiative.'}
            </p>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex -space-x-3">
                {project.members.slice(0, 3).map((member, i) => (
                  <div key={member._id} className="w-10 h-10 rounded-full border-2 border-dark-obsidian bg-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase" title={member.name}>
                    {member.name.substring(0, 2)}
                  </div>
                ))}
                {project.members.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-dark-obsidian bg-accent-blue/20 flex items-center justify-center text-[10px] font-bold text-accent-blue">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
              
              <button className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors group/btn">
                Workspace <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex w-16 h-16 rounded-3xl bg-white/5 items-center justify-center text-slate-700 mb-6 border border-white/10">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active initiatives found.</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">
              Launch your first project to start tracking operational performance and task velocity.
            </p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-obsidian/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-10 border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {editingProject ? 'Modify Initiative' : 'Initialize Initiative'}
            </h2>
            <p className="text-slate-400 mb-8">
              {editingProject ? 'Update parameters and re-allocate personnel.' : 'Establish a new strategic project and allocate personnel.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Initiative Name</label>
                    <input
                      type="text"
                      required
                      className="input-premium"
                      placeholder="e.g. Nexus Engine Alpha"
                      value={projectData.title}
                      onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Strategic Overview</label>
                    <textarea
                      className="input-premium min-h-[150px] resize-none"
                      placeholder="Define the primary objectives and scope..."
                      value={projectData.description}
                      onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Allocate Personnel</label>
                  <div className="glass-card bg-white/[0.02] border-white/5 h-[245px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {users.map(u => (
                      <div 
                        key={u._id}
                        onClick={() => toggleMember(u._id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                          projectData.members.includes(u._id) 
                            ? 'bg-accent-cyan/10 border-accent-cyan/30 text-white' 
                            : 'bg-transparent border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                             projectData.members.includes(u._id) ? 'bg-accent-cyan text-black' : 'bg-white/10 text-white'
                          }`}>
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{u.name}</p>
                            <p className="text-[10px] opacity-50 uppercase tracking-tighter">{u.role}</p>
                          </div>
                        </div>
                        {projectData.members.includes(u._id) && <UserPlus size={14} className="text-accent-cyan" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button type="submit" className="btn-premium">
                  {editingProject ? 'Save Changes' : 'Launch Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
