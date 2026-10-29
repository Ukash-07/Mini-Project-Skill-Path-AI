import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { BookOpen, Trash2, Search, AlertTriangle, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      if (res.success) setCourses(res.data);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load courses catalog.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/courses/${courseToDelete.id}`);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
        setNotification({
          type: 'success',
          message: res.message || `Course "${courseToDelete.title}" deleted successfully.`
        });
        setCourseToDelete(null);
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to delete course.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while deleting the course.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(query)) ||
        (c.category && c.category.toLowerCase().includes(query)) ||
        (c.primary_skill_name && c.primary_skill_name.toLowerCase().includes(query)) ||
        (c.difficulty && c.difficulty.toLowerCase().includes(query))
    );
  }, [courses, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Course Management</h1>
                <p className="text-xs text-slate-500">
                  Manage curriculum courses, modules, and delete obsolete content
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                {courses.length} Total Courses
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
              placeholder="Search courses by title, category, or associated skill..."
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

          {/* Courses List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                <span className="text-xs">Loading course catalog...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {searchQuery ? 'No courses match your search criteria.' : 'No courses found in catalog.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{c.title}</span>
                      <span className="text-slate-500">
                        Skill: <span className="font-semibold text-slate-700">{c.primary_skill_name}</span> • {c.difficulty} • {c.duration_hours} hrs • {c.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCourseToDelete(c)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-semibold transition-all shadow-xs"
                        title={`Delete course ${c.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Course</h3>
                <p className="text-xs text-slate-500">Permanent course removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete course{' '}
              <strong className="text-slate-900 font-bold">{courseToDelete.title}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-[11px] text-rose-700 leading-relaxed">
              <strong>Warning:</strong> Deleting this course will also delete all associated modules, lessons, quizzes,
              and remove enrollments and progress for students currently taking this course.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCourseToDelete(null)}
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
