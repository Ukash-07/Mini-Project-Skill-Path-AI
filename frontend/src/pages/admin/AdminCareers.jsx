import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Briefcase, Plus, Trash2, Edit } from 'lucide-react';

export default function AdminCareers() {
  const [careers, setCareers] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [loading, setLoading] = useState(true);

  const fetchCareers = async () => {
    try {
      const res = await api.get('/careers');
      if (res.success) setCareers(res.data);
    } catch (err) {
      console.error(err);
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
        fetchCareers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete career path?')) return;
    try {
      await api.delete(`/admin/careers/${id}`);
      fetchCareers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h1 className="text-xl font-extrabold text-slate-900">Manage Career Paths</h1>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="divide-y divide-slate-100">
              {careers.map((c) => (
                <div key={c.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
