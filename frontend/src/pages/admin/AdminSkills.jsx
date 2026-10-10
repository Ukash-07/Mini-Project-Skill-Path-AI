import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Award, Plus, Trash2 } from 'lucide-react';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [description, setDescription] = useState('');

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills');
      if (res.success) setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/skills', { name, description, category, difficulty });
      if (res.success) {
        setName('');
        setDescription('');
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete skill?')) return;
    try {
      await api.delete(`/admin/skills/${id}`);
      fetchSkills();
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
            <h1 className="text-xl font-extrabold text-slate-900">Manage Skills Database</h1>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Skill Name"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-slate-500 text-[11px]">{s.category} • {s.difficulty}</span>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
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
