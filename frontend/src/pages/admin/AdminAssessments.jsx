import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ClipboardCheck, Plus, Trash2, Search, AlertTriangle, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [careerId, setCareerId] = useState('');
  const [skillId, setSkillId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalMarks, setTotalMarks] = useState(100);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assRes, carRes, skiRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/careers'),
        api.get('/skills')
      ]);

      if (assRes.success) setAssessments(assRes.data);
      if (carRes.success) setCareers(carRes.data);
      if (skiRes.success) setSkills(skiRes.data);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load assessments.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/assessments', {
        title,
        career_id: careerId ? parseInt(careerId) : null,
        skill_id: skillId ? parseInt(skillId) : null,
        total_marks: parseInt(totalMarks),
        duration_minutes: parseInt(durationMinutes)
      });
      if (res.success) {
        setTitle('');
        setCareerId('');
        setSkillId('');
        setNotification({
          type: 'success',
          message: `Assessment "${title}" created successfully.`
        });
        const assRes = await api.get('/assessments');
        if (assRes.success) setAssessments(assRes.data);
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create assessment.'
      });
    }
  };

  const handleDelete = async () => {
    if (!assessmentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/assessments/${assessmentToDelete.id}`);
      if (res.success) {
        setAssessments((prev) => prev.filter((a) => a.id !== assessmentToDelete.id));
        setNotification({
          type: 'success',
          message: res.message || `Assessment "${assessmentToDelete.title}" deleted successfully.`
        });
        setAssessmentToDelete(null);
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to delete assessment.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while deleting assessment.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAssessments = useMemo(() => {
    if (!searchQuery.trim()) return assessments;
    const query = searchQuery.toLowerCase();
    return assessments.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(query)) ||
        (a.career_name && a.career_name.toLowerCase().includes(query)) ||
        (a.skill_name && a.skill_name.toLowerCase().includes(query))
    );
  }, [assessments, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl">
          {/* Header & Create */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Manage Assessments</h1>
                <p className="text-xs text-slate-500">Configure skill evaluation benchmarks or delete obsolete assessments</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Assessment Title"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none md:col-span-2"
              />
              <select
                value={careerId}
                onChange={(e) => setCareerId(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              >
                <option value="">Select Career (Optional)</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              >
                <option value="">Select Skill (Optional)</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Test</span>
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

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessments by title, career, or skill..."
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

          {/* Assessments List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">Loading assessments...</span>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {searchQuery ? 'No assessments match your search criteria.' : 'No assessments found.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAssessments.map((a) => (
                  <div
                    key={a.id}
                    className="py-4 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{a.title}</span>
                      <span className="text-slate-500">
                        Career: <span className="font-semibold text-slate-700">{a.career_name || 'General'}</span> • Skill:{' '}
                        <span className="font-semibold text-slate-700">{a.skill_name || 'Comprehensive'}</span> •{' '}
                        {a.duration_minutes || 30} mins • {a.total_questions || 0} Questions
                      </span>
                    </div>
                    <button
                      onClick={() => setAssessmentToDelete(a)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-semibold transition-all shadow-xs"
                      title={`Delete assessment ${a.title}`}
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
      {assessmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Assessment</h3>
                <p className="text-xs text-slate-500">Permanent assessment removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete assessment{' '}
              <strong className="text-slate-900 font-bold">{assessmentToDelete.title}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-[11px] text-rose-700 leading-relaxed">
              <strong>Warning:</strong> Deleting this assessment will also delete all associated questions, options,
              and historical student attempts for this assessment.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAssessmentToDelete(null)}
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

