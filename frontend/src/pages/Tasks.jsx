import { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import socket from '../utils/socket';
import { Plus, CheckCircle2, Clock, AlertCircle, Calendar, Briefcase, Filter, ChevronRight, User as UserIcon, X, Trash2, Edit, ArrowRight } from 'lucide-react';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFilter = searchParams.get('projectId');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    dueDate: ''
  });

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (projectIdFilter) params.projectId = projectIdFilter;
      
      const res = await axios.get('/api/tasks', { params });
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [projectIdFilter]);

  useEffect(() => {
    fetchTasks();

    // Listen for real-time updates
    socket.on('refresh_data', (data) => {
      console.log('Real-time task update:', data);
      fetchTasks();
    });

    return () => {
      socket.off('refresh_data');
    };
  }, [fetchTasks]);

  const fetchModalData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/users')
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching modal data:', err);
    }
  };

  const handleOpenModal = (task = null) => {
    fetchModalData();
    if (task) {
      setEditingTask(task);
      setTaskData({
        title: task.title,
        description: task.description || '',
        project: task.project?._id || '',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setTaskData({ title: '', description: '', project: '', assignedTo: '', dueDate: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...taskData,
        assignedTo: taskData.assignedTo || null,
        dueDate: taskData.dueDate || null
      };
      
      if (editingTask) {
        const { project, ...updateData } = dataToSubmit;
        await axios.put(`/api/tasks/${editingTask._id}`, updateData);
      } else {
        await axios.post('/api/tasks', dataToSubmit);
      }
      
      setShowModal(false);
      setTaskData({ title: '', description: '', project: '', assignedTo: '', dueDate: '' });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Error processing task:', err);
      alert(err.response?.data?.message || 'Failed to process task');
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await axios.put(`/api/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20';
      case 'In Progress': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      default: return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 size={16} />;
      case 'In Progress': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      <div className="pt-32 pb-12 px-6 max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-accent-cyan"></span>
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-accent-cyan">Operations</span>
            </div>
            <h1 className="text-5xl font-display font-bold text-white tracking-tight">
              Workforce<span className="text-accent-cyan">.</span>
            </h1>
            <p className="text-slate-400 mt-3 text-lg">
              Operational task management and performance tracking.
            </p>
            {projectIdFilter && (
              <div className="flex items-center gap-3 mt-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Filter:</span>
                <div className="flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full text-accent-cyan text-[10px] font-bold uppercase tracking-wider">
                  Project Workspace
                  <button onClick={() => navigate('/tasks')} className="hover:text-white transition-colors ml-1">
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             {user.role === 'Admin' && (
               <button 
                 onClick={() => handleOpenModal()}
                 className="btn-premium flex items-center gap-2 text-sm !px-4 !py-2"
               >
                 <Plus size={16} /> Assign Task
               </button>
             )}
          </div>
        </div>

        <div className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Identification</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Project Mapping</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Timeline</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors">{task.title}</span>
                        <span className="text-xs text-slate-500 line-clamp-1 max-w-xs">{task.description || 'No additional parameters defined.'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Briefcase size={14} className="text-slate-600" />
                        {task.project?.title || 'Standalone Task'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={14} className="text-slate-600" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <select 
                          className="bg-[#111827] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg focus:ring-accent-cyan focus:border-accent-cyan block p-2 cursor-pointer hover:bg-white/5 transition-all outline-none"
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        {user.role === 'Admin' && (
                          <>
                            <button onClick={() => handleOpenModal(task)} className="text-slate-600 hover:text-white transition-colors">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => deleteTask(task._id)} className="text-slate-600 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                         <CheckCircle2 size={40} className="text-slate-700 mb-4" />
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Clear Workspace</p>
                         <p className="text-slate-600 text-sm mt-1">No active tasks are currently assigned to your profile.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-obsidian/40 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 sm:p-6 animate-fade-in">
          <div className="glass-card max-w-6xl w-full border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Context */}
            <div className="w-full md:w-[40%] bg-white/[0.02] p-8 md:p-12 border-r border-white/5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-8">
                  <CheckCircle2 size={24} />
                </div>
                <h2 className="text-5xl font-display font-bold text-white mb-4 leading-tight">
                  {editingTask ? 'Modify' : 'Assign'} <br />
                  <span className="text-accent-blue">Operation.</span>
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-12">
                  Define operational parameters and map this task to the appropriate project node.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 mt-1">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Priority</h4>
                      <p className="text-xs text-slate-500">Immediate execution required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 mt-1">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Timeline</h4>
                      <p className="text-xs text-slate-500">{taskData.dueDate || 'No deadline established'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-sm font-bold text-slate-600 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
                >
                  <X size={14} /> Close Terminal
                </button>
              </div>
            </div>

            {/* Right Column: Inputs */}
            <div className="flex-1 p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-xs font-bold text-accent-blue uppercase tracking-[0.3em] mb-4 transition-colors group-focus-within:text-white">
                      Task Identification
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-bold text-white placeholder-white/20 focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all"
                      placeholder="e.g. Sync Database Schema"
                      value={taskData.title}
                      onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {!editingTask && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Project Mapping</label>
                        <select
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-blue transition-all appearance-none cursor-pointer"
                          value={taskData.project}
                          onChange={(e) => setTaskData({...taskData, project: e.target.value})}
                        >
                          <option value="" className="bg-dark-obsidian">Select Project</option>
                          {projects.map(p => (
                            <option key={p._id} value={p._id} className="bg-dark-obsidian">{p.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className={editingTask ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Assignee Node</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-blue transition-all appearance-none cursor-pointer"
                        value={taskData.assignedTo}
                        onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
                      >
                        <option value="" className="bg-dark-obsidian">Select Assignee</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id} className="bg-dark-obsidian">{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Operational Deadline</label>
                      <input
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-blue transition-all"
                        value={taskData.dueDate}
                        onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Operational Context</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-base text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent-blue/30 min-h-[120px] transition-all resize-none"
                      placeholder="Specify additional context and requirements..."
                      value={taskData.description}
                      onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 pt-10 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Abort Assignment
                  </button>
                  <button type="submit" className="btn-premium flex items-center gap-3 !px-10 !bg-accent-blue !text-white hover:!shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all">
                    {editingTask ? 'Apply Updates' : 'Initialize Operation'} <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
