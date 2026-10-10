import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Users } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/admin/students');
        if (res.success) setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-900">Registered Students Directory</h1>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Target Career</th>
                  <th className="pb-3">Education</th>
                  <th className="pb-3">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{st.full_name}</td>
                    <td className="py-3 text-slate-500">{st.email}</td>
                    <td className="py-3 font-semibold text-indigo-600">{st.target_career || 'Not Set'}</td>
                    <td className="py-3">{st.education_level || 'N/A'}</td>
                    <td className="py-3">{st.experience_level || 'Beginner'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
