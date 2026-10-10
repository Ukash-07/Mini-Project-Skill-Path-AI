import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowRight,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoleId, setExpandedRoleId] = useState(null);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/careers/recommendations');
      if (res.success) {
        setRecommendations(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load career recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedRoleId(prev => prev === id ? null : id);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Explainable AI Career Recommendation Engine</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Personalized Career Role Matches
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Compatibility percentages calculated mathematically from your existing skills, proficiencies, domain interests, and industry role requirements.
              </p>
            </div>

            <button
              onClick={fetchRecs}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-2 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalculate AI Rankings</span>
            </button>
          </div>

          {/* Recommendations List */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Analyzing your skills and generating career compatibility scores...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No career recommendations found</h3>
              <p className="text-xs text-slate-500">Complete your student onboarding profile to see customized career role recommendations.</p>
              <Link to="/onboarding" className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs">
                Start Onboarding
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {recommendations.map((rec, index) => {
                const isExpanded = expandedRoleId === rec.role_id;
                const scoreBadge = getScoreColor(rec.compatibility_score);

                return (
                  <div
                    key={rec.role_id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-6 lg:p-7 shadow-sm hover:shadow-md transition-all space-y-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md shadow-indigo-500/20">
                          #{index + 1}
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {rec.domain}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {rec.difficulty}
                            </span>
                            {rec.is_current_target && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Current Target Goal
                              </span>
                            )}
                          </div>

                          <h2 className="text-xl font-black text-slate-900 hover:text-indigo-600 transition-colors">
                            <Link to={`/roles/${rec.role_id}`}>{rec.role_title}</Link>
                          </h2>

                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                            {rec.description}
                          </p>

                          <div className="flex items-center space-x-2 text-xs text-indigo-700 font-semibold bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/80">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                            <span><strong className="text-indigo-900">Why recommended: </strong>{rec.why_recommended}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                        {/* Compatibility Score Box */}
                        <div className={`p-4 rounded-2xl border text-center min-w-[150px] ${scoreBadge}`}>
                          <div className="text-[11px] font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Compatibility</span>
                          </div>
                          <div className="text-3xl font-black">
                            {rec.compatibility_score}%
                          </div>
                          <span className="text-[10px] font-semibold opacity-80 block mt-0.5">
                            Est. {rec.estimated_weeks_to_ready} Weeks to Ready
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 w-full sm:w-auto">
                          <Link
                            to={`/roadmap?role=${rec.role_id}`}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
                          >
                            <span>View Roadmap</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => toggleExpand(rec.role_id)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1 transition-colors border border-slate-200"
                          >
                            <span>{isExpanded ? 'Hide Skill Match Breakdown' : 'Skill Match Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Skill Breakdown Summary (Known, Partial, Missing) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                      <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>{rec.known_skills?.length || 0} Skills Mastered</strong> (Already Know)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-amber-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span><strong>{rec.partial_skills?.length || 0} Partially Known</strong> (Need Revision)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-rose-700 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                        <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span><strong>{rec.missing_skills?.length || 0} Missing Skills</strong> (To Learn)</span>
                      </div>
                    </div>

                    {/* Expandable Deep Breakdown */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-200 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Already Known */}
                          <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200">
                            <span className="font-extrabold text-emerald-800 uppercase tracking-wider block text-[10px]">
                              Already Mastered ({rec.known_skills?.length || 0})
                            </span>
                            {rec.known_skills && rec.known_skills.length > 0 ? (
                              <ul className="space-y-1.5">
                                {rec.known_skills.map((s) => (
                                  <li key={s.skill_id} className="flex items-center justify-between text-slate-700">
                                    <span className="font-bold">{s.name}</span>
                                    <span className="text-[10px] text-emerald-700 font-semibold">{s.current_proficiency}% (Target {s.required_proficiency}%)</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic">No skills currently meet the target benchmark.</p>
                            )}
                          </div>

                          {/* Partially Known */}
                          <div className="space-y-2 p-4 rounded-2xl bg-amber-50/40 border border-amber-200">
                            <span className="font-extrabold text-amber-800 uppercase tracking-wider block text-[10px]">
                              Partially Known ({rec.partial_skills?.length || 0})
                            </span>
                            {rec.partial_skills && rec.partial_skills.length > 0 ? (
                              <ul className="space-y-1.5">
                                {rec.partial_skills.map((s) => (
                                  <li key={s.skill_id} className="flex items-center justify-between text-slate-700">
                                    <span className="font-bold">{s.name}</span>
                                    <span className="text-[10px] text-amber-700 font-semibold">{s.current_proficiency}% → {s.required_proficiency}% (+{s.gap}%)</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic">No partial skills in this role.</p>
                            )}
                          </div>

                          {/* Missing Skills */}
                          <div className="space-y-2 p-4 rounded-2xl bg-rose-50/40 border border-rose-200">
                            <span className="font-extrabold text-rose-800 uppercase tracking-wider block text-[10px]">
                              Missing Skills ({rec.missing_skills?.length || 0})
                            </span>
                            {rec.missing_skills && rec.missing_skills.length > 0 ? (
                              <ul className="space-y-1.5">
                                {rec.missing_skills.map((s) => (
                                  <li key={s.skill_id} className="flex items-center justify-between text-slate-700">
                                    <span className="font-bold">{s.name}</span>
                                    <span className="text-[10px] text-rose-700 font-semibold">Priority {s.priority} (Target {s.required_proficiency}%)</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic">You possess all required skills!</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-2">
                          <Link
                            to={`/skill-gap?role=${rec.role_id}`}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Open Detailed Gap Diagnostics →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
