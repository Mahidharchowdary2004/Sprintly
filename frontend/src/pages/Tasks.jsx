import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import socket from '../utils/socket';
import { Plus, CheckCircle2, Clock, AlertCircle, Calendar, Briefcase, Filter, ChevronRight, User as UserIcon, X, Trash2, Edit } from 'lucide-react';

const Tasks = () => {
  const { user } = useContext(AuthContext);
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
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

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
        await axios.put(`/api/tasks/${editingTask._id}`, dataToSubmit);
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

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-obsidian/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-10 border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {editingTask ? 'Modify Task' : 'Assign Operational Task'}
            </h2>
            <p className="text-slate-400 mb-8">Define parameters and map this task to the appropriate node.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Task Title</label>
                <input
                  type="text"
                  required
                  className="input-premium"
                  placeholder="e.g. Sync Relational Schema"
                  value={taskData.title}
                  onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!editingTask && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Project Mapping</label>
                    <select
                      required
                      className="input-premium px-4 cursor-pointer"
                      value={taskData.project}
                      onChange={(e) => setTaskData({...taskData, project: e.target.value})}
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={editingTask ? 'col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Assignee Node</label>
                  <select
                    className="input-premium px-4 cursor-pointer"
                    value={taskData.assignedTo}
                    onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
                  >
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Timeline (Due Date)</label>
                <input
                  type="date"
                  className="input-premium"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Parameters (Description)</label>
                <textarea
                  className="input-premium min-h-[100px] resize-none"
                  placeholder="Additional context for this task..."
                  value={taskData.description}
                  onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button type="submit" className="btn-premium">
                  {editingTask ? 'Save Changes' : 'Initialize Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
