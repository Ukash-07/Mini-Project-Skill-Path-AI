import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Users, Trash2, Search, AlertTriangle, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load students directory.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/students/${studentToDelete.id}`);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        setNotification({
          type: 'success',
          message: res.message || `Student "${studentToDelete.full_name}" was successfully deleted.`
        });
        setStudentToDelete(null);
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to delete student.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while deleting the student.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (st) =>
        (st.full_name && st.full_name.toLowerCase().includes(query)) ||
        (st.email && st.email.toLowerCase().includes(query)) ||
        (st.target_career && st.target_career.toLowerCase().includes(query)) ||
        (st.education_level && st.education_level.toLowerCase().includes(query))
    );
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl">
          {/* Header & Controls */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Registered Students Directory</h1>
                  <p className="text-xs text-slate-500">
                    Manage student accounts, track learning goals, and remove inactive or test users
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                {students.length} Total {students.length === 1 ? 'Student' : 'Students'}
              </span>
            </div>
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

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, email, or target career..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Students Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs">Loading students directory...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {searchQuery ? 'No students found matching your search filter.' : 'No registered students found.'}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Name</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Target Career</th>
                    <th className="pb-3 px-3">Education</th>
                    <th className="pb-3 px-3">Experience</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{st.full_name}</div>
                        <div className="text-[11px] text-slate-400">ID: #{st.id}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{st.email}</td>
                      <td className="py-3.5 px-3 font-semibold text-indigo-600">
                        {st.target_career || <span className="text-slate-400 font-normal">Not Set</span>}
                      </td>
                      <td className="py-3.5 px-3">{st.education_level || 'N/A'}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {st.experience_level || 'Beginner'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setStudentToDelete(st)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-semibold transition-all shadow-xs"
                          title={`Delete student ${st.full_name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Student Account</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 font-bold">{studentToDelete.full_name}</strong> (
              <span className="text-slate-500 font-mono text-[11px]">{studentToDelete.email}</span>)?
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-[11px] text-rose-700 leading-relaxed">
              <strong>Warning:</strong> Deleting this student will permanently erase all their associated profile details,
              course enrollments, quiz & assessment attempts, skill progression data, and recommendations.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
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
