import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.success) setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete course?')) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Course Management</h1>
              <p className="text-xs text-slate-500">Total {courses.length} courses in published catalog</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="divide-y divide-slate-100">
              {courses.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{c.title}</span>
                    <span className="text-slate-500">Skill: {c.primary_skill_name} • {c.difficulty} • {c.duration_hours} hrs</span>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-600 p-2 transition-colors">
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
