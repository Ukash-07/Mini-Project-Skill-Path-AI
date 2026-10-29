import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Briefcase, Plus, Trash2, AlertTriangle, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export default function AdminCareers() {
  const [careers, setCareers] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [loading, setLoading] = useState(true);
  const [careerToDelete, setCareerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/careers');
      if (res.success) setCareers(res.data);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load career paths.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/careers', { name, description, category });
      if (res.success) {
        setName('');
        setDescription('');
        setNotification({
          type: 'success',
          message: `Career "${name}" created successfully.`
        });
        fetchCareers();
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create career.'
      });
    }
  };

  const handleDelete = async () => {
    if (!careerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/careers/${careerToDelete.id}`);
      if (res.success) {
        setCareers((prev) => prev.filter((c) => c.id !== careerToDelete.id));
        setNotification({
          type: 'success',
          message: res.message || `Career "${careerToDelete.name}" deleted successfully.`
        });
        setCareerToDelete(null);
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to delete career.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while deleting career.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl">
          {/* Header & Create */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Manage Career Paths</h1>
                <p className="text-xs text-slate-500">Create new career roles or delete obsolete industry paths</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Career Title (e.g. AI Engineer)"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Career</span>
              </button>
            </form>
          </div>

          {/* Notification Alert */}
          {notification && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center space-x-3 text-xs font-medium">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Career List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                <span className="text-xs">Loading career paths...</span>
              </div>
            ) : careers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No career paths configured.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {careers.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between px-2 hover:bg-slate-50/50 rounded-xl transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.description}</p>
                    </div>
                    <button
                      onClick={() => setCareerToDelete(c)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-semibold transition-all shadow-xs"
                      title={`Delete career ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {careerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Career Path</h3>
                <p className="text-xs text-slate-500">Permanent role removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete career path{' '}
              <strong className="text-slate-900 font-bold">{careerToDelete.name}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-[11px] text-rose-700 leading-relaxed">
              <strong>Warning:</strong> Deleting this career path will unlink it from student profiles and remove
              associated role requirements and roadmap definitions.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCareerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-2 shadow-xs transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
