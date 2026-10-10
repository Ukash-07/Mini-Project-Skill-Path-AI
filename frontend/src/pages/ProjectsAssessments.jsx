import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Award,
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  CheckCircle2,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ProjectsAssessments() {
  const [projectsData, setProjectsData] = useState({ portfolio_projects: [], recommended_projects: [] });
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSkillsUsed, setNewSkillsUsed] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newDemoUrl, setNewDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, assRes, histRes] = await Promise.all([
        api.get('/projects'),
        api.get('/assessments'),
        api.get('/assessments/history')
      ]);

      if (projRes.success) setProjectsData(projRes.data);
      if (assRes.success) setAssessments(assRes.data || []);
      if (histRes.success) setHistory(histRes.data || []);
    } catch (err) {
      console.error('Failed to load projects/assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        title: newTitle.trim(),
        description: newDescription.trim(),
        skills_used: newSkillsUsed.trim(),
        repo_url: newRepoUrl.trim(),
        demo_url: newDemoUrl.trim()
      });

      if (res.success) {
        setShowAddModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewSkillsUsed('');
        setNewRepoUrl('');
        setNewDemoUrl('');
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to add project:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to remove this project from your portfolio?')) return;
    try {
      await api.delete(`/projects/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          {/* Header */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Portfolio & Skill Verification</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Projects & Skill Assessments
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Track your real-world portfolio applications and complete skill benchmarking assessments to recalculate your job-readiness score in MySQL.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Portfolio Project</span>
            </button>
          </div>

          {/* Section 1: Portfolio Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600" />
                  <span>My Portfolio Projects ({projectsData.portfolio_projects.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Completed applications showcasing practical implementation to recruiters
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading projects...</div>
            ) : projectsData.portfolio_projects.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No projects added yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add projects from your roadmap mini-projects or capstones to prove job-readiness.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200"
                >
                  Add Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projectsData.portfolio_projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {proj.title}
                        </h3>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {proj.description || 'Full-stack application implementation.'}
                      </p>

                      {proj.skills_used && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.skills_used.split(',').map((sk, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {sk.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        {proj.repo_url && (
                          <a
                            href={proj.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center space-x-1"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Code</span>
                          </a>
                        )}
                        {proj.demo_url && (
                          <a
                            href={proj.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center space-x-1 border border-indigo-200"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Recommended Capstone Projects */}
          {projectsData.recommended_projects?.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Recommended Role Capstone Challenges</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {projectsData.recommended_projects.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      {rec.difficulty} Challenge
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Build and submit this to close your preparation gap for {rec.role_name}.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Skill Benchmark Assessments */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                <span>Skill Benchmark Assessments</span>
              </h2>
              <p className="text-xs text-slate-500">
                Short 10-question tests to automatically calibrate your skill proficiency and update your career compatibility percentage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assessments.map((ass) => (
                <div
                  key={ass.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {ass.skill_name || 'Technical'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {ass.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {ass.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {ass.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {ass.duration_minutes || 15} Mins • 10 Questions
                    </span>

                    <Link
                      to={`/assessments/${ass.id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Project Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Add Portfolio Project</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Production Bookstore REST API with JWT"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      rows="2"
                      placeholder="Summary of architectural implementation, database models, etc."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Skills Utilized (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="Node.js, Express.js, MySQL, JWT, Docker"
                      value={newSkillsUsed}
                      onChange={(e) => setNewSkillsUsed(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">GitHub Repo URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={newRepoUrl}
                        onChange={(e) => setNewRepoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Live Demo URL</label>
                      <input
                        type="url"
                        placeholder="https://myproject.com"
                        value={newDemoUrl}
                        onChange={(e) => setNewDemoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !newTitle.trim()}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {submitting ? 'Adding...' : 'Save to Portfolio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
