import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Route,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Clock,
  Award,
  Layers,
  ExternalLink,
  BookOpen,
  Code2,
  FolderGit2,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';

export default function LearningPathPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleQuery = searchParams.get('role');

  const [allCareers, setAllCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState(roleQuery || '');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingSkillId, setTogglingSkillId] = useState(null);

  // Fetch list of all careers for dropdown
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const [cRes, profRes] = await Promise.all([
          api.get('/careers'),
          api.get('/students/profile')
        ]);
        if (cRes.success) {
          setAllCareers(cRes.data);
        }
        if (!roleQuery) {
          const targetId = profRes?.data?.profile?.target_career_id;
          const effectiveId = targetId || (cRes.data && cRes.data[0] ? cRes.data[0].id : 7);
          setSelectedCareerId(effectiveId.toString());
        }
      } catch (err) {
        console.error('Failed to load careers:', err);
      }
    };
    fetchCareers();
  }, [roleQuery]);

  const fetchRoadmap = async (cId) => {
    setLoading(true);
    try {
      const res = await api.get(`/learning-path?careerId=${cId || selectedCareerId}`);
      if (res.success) {
        setRoadmap(res.data);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCareerId) {
      fetchRoadmap(selectedCareerId);
    }
  }, [selectedCareerId]);

  const handleCareerChange = (e) => {
    const newId = e.target.value;
    setSelectedCareerId(newId);
    setSearchParams({ role: newId });
  };

  const handleToggleSkill = async (skillId) => {
    setTogglingSkillId(skillId);
    try {
      const res = await api.post(`/learning-path/skills/${skillId}/toggle`);
      if (res.success) {
        // Refresh roadmap to recalculate completion and status
        await fetchRoadmap(selectedCareerId);
      }
    } catch (err) {
      console.error('Failed to toggle skill:', err);
    } finally {
      setTogglingSkillId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          {/* Header & Role Switcher */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Route className="w-4 h-4" />
                <span>5-Phase Personalized Career Roadmap</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                {roadmap?.target_career_name || 'Career'} Learning Path
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Ordered sequentially by prerequisites and difficulty. Mark skills completed as you progress, and the roadmap adapts in real-time.
              </p>
            </div>

            <div className="space-y-1.5 shrink-0 min-w-[240px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Switch Career Roadmap:
              </label>
              <select
                value={selectedCareerId}
                onChange={handleCareerChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs transition-colors"
              >
                {allCareers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Roadmap Progress Card */}
          {roadmap && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Overall Roadmap Progress</h3>
                  <p className="text-xs text-slate-500">
                    {roadmap.completed_skills} of {roadmap.total_skills} skills completed to target benchmark
                  </p>
                </div>
                <div className="text-2xl font-black gradient-text">
                  {roadmap.overall_progress}% Completed
                </div>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-700"
                  style={{ width: `${roadmap.overall_progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Phase By Phase Structured Roadmap */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Assembling 5-phase personalized learning roadmap...</p>
            </div>
          ) : roadmap?.phases && roadmap.phases.length > 0 ? (
            <div className="space-y-10">
              {roadmap.phases.map((phase) => (
                <div key={phase.phase_number} className="space-y-4">
                  {/* Phase Header */}
                  <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {phase.phase_number}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{phase.title}</h2>
                      <p className="text-xs text-slate-500">{phase.description}</p>
                    </div>
                  </div>

                  {/* Skills in this Phase */}
                  <div className="grid grid-cols-1 gap-5">
                    {phase.skills.map((skill) => {
                      const isCompleted = skill.is_completed;
                      const isToggling = togglingSkillId === skill.skill_id;

                      return (
                        <div
                          key={skill.skill_id}
                          className={`bg-white rounded-3xl border transition-all p-6 lg:p-7 shadow-sm hover:shadow-md space-y-5 ${
                            isCompleted
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : skill.status === 'current'
                              ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Top Row: Skill Title, Badges & Toggle Checkbox */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                  skill.priority === 'High'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}>
                                  {skill.priority} Priority
                                </span>

                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {skill.category}
                                </span>

                                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>~{skill.estimated_hours} Hours</span>
                                </span>
                              </div>

                              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <span>{skill.skill_name}</span>
                                {isCompleted && (
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </h3>

                              <p className="text-xs text-slate-500 font-medium">
                                <strong className="text-slate-700">Prerequisites: </strong>
                                {skill.prerequisites}
                              </p>
                            </div>

                            {/* Mark Completed Button / Interactive Checkbox */}
                            <div className="flex items-center space-x-3 shrink-0">
                              <button
                                onClick={() => handleToggleSkill(skill.skill_id)}
                                disabled={isToggling}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-xs ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                                }`}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                                    <span>{isToggling ? 'Updating...' : 'Marked Completed'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Square className="w-4 h-4" />
                                    <span>{isToggling ? 'Updating...' : 'Mark as Completed'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Proficiency Progress Bar */}
                          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-700">
                                Current Level: {skill.current_proficiency}%
                              </span>
                              <span className="text-indigo-600">
                                Target Benchmark: {skill.target_proficiency}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${Math.min(100, (skill.current_proficiency / skill.target_proficiency) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* 3 Detail Columns: Curated Working Resources, Practical Exercises, Mini-Project */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                            {/* 1. Working Learning Resources */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <span className="font-extrabold text-indigo-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Curated Resources (Working URLs)</span>
                              </span>
                              <div className="space-y-2 pt-1">
                                {skill.resources?.map((res, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-slate-800 hover:text-indigo-600 flex items-center justify-between gap-2 transition-colors group"
                                  >
                                    <div className="truncate">
                                      <span className="font-bold block truncate">{res.title}</span>
                                      <span className="text-[10px] text-slate-500">{res.platform || 'Documentation'}</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>

                            {/* 2. Practical Exercises */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Practical Exercises</span>
                              </span>
                              <ul className="space-y-1.5 text-slate-600 pt-1">
                                {skill.practical_exercises?.map((ex, eIdx) => (
                                  <li key={eIdx} className="flex items-start space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                                    <span>{ex}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* 3. Mini-Project or Assessment */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <FolderGit2 className="w-3.5 h-3.5" />
                                <span>Mini-Project Assessment</span>
                              </span>
                              <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-slate-700">
                                <p className="font-bold text-slate-900">{skill.mini_project}</p>
                                <p className="text-[11px] text-slate-500 mt-1">
                                  Build and push this project to your portfolio to validate skill mastery.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Route className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No roadmap generated</h3>
              <p className="text-xs text-slate-500">Select a career role above to view its structured 5-phase learning roadmap.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
