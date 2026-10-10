import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Briefcase,
  Sparkles,
  Target,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FolderGit2,
  Award,
  BookOpen,
  Route
} from 'lucide-react';

export default function RoleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingTarget, setSettingTarget] = useState(false);
  const [targetSuccess, setTargetSuccess] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/careers/${id}`);
        if (res.success) {
          setRole(res.data);
        }
      } catch (err) {
        console.error('Failed to load role details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [id]);

  const handleSetTargetRole = async () => {
    setSettingTarget(true);
    try {
      await api.put('/students/profile', {
        target_career_id: parseInt(id)
      });
      setTargetSuccess(true);
      setTimeout(() => setTargetSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update target career:', err);
    } finally {
      setSettingTarget(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading career role details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-800">Career Role Not Found</h2>
            <Link to="/roles" className="text-xs font-bold text-indigo-600 hover:underline">
              ← Return to Role Explorer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gapSummary = role.skill_gap_summary;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/roles"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Role Explorer</span>
            </Link>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSetTargetRole}
                disabled={settingTarget}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>{targetSuccess ? 'Target Goal Saved!' : settingTarget ? 'Updating...' : 'Set as My Target Goal'}</span>
              </button>

              <Link
                to={`/roadmap?role=${role.id}`}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-1.5"
              >
                <span>View Learning Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {targetSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Success! "{role.name}" is now set as your active target career. Your dashboard analytics and roadmaps have adapted accordingly.</span>
            </div>
          )}

          {/* Role Header Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {role.domain}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {role.difficulty} Level
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {role.category}
                  </span>
                </div>

                <h1 className="text-3xl font-black text-slate-900">{role.name}</h1>
              </div>

              {role.user_compatibility_score !== null && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-center min-w-[160px] shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Your Compatibility
                  </span>
                  <span className="text-3xl font-black gradient-text">
                    {role.user_compatibility_score}%
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                    Calculated from actual skills
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              {role.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Est. Prep Time</span>
                <span className="text-base font-extrabold text-slate-900">~{role.estimated_prep_months || 4} Months</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Required Skills</span>
                <span className="text-base font-extrabold text-indigo-600">{role.required_skills?.length || 0} Core Skills</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Prerequisites</span>
                <span className="text-base font-extrabold text-slate-900 truncate block">{role.prerequisites || 'Basic Programming'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Readiness</span>
                <span className="text-base font-extrabold text-emerald-600">{gapSummary?.readinessScore || 0}% Current Fit</span>
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis Summary (if authenticated) */}
          {gapSummary && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <span>Your Personalized Skill-Gap Analysis for {role.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live breakdown of which required skills you master, know partially, or still need to learn</p>
                </div>
                <Link
                  to={`/skill-gap?role=${role.id}`}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Full Diagnostics →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-emerald-800">
                    <span className="text-xs font-bold uppercase">Mastered Skills</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {gapSummary.masteredSkills.length}
                  </div>
                  <p className="text-[11px] text-emerald-800">No relearning required</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="text-xs font-bold uppercase">Partially Known</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700">
                    {gapSummary.partialSkills.length}
                  </div>
                  <p className="text-[11px] text-amber-800">Targeted revision & advanced topics</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1">
                  <div className="flex items-center justify-between text-rose-800">
                    <span className="text-xs font-bold uppercase">Missing Skills</span>
                    <HelpCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-700">
                    {gapSummary.missingSkills.length}
                  </div>
                  <p className="text-[11px] text-rose-800">Core topics to master for job-readiness</p>
                </div>
              </div>
            </div>
          )}

          {/* Complete Required Skills Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Complete Required Skills & Proficiency Requirements
              </h3>
              <p className="text-xs text-slate-500">
                Organized by roadmap phase order and industry importance weighting
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Phase & Skill</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Required Level</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Your Status</th>
                    <th className="pb-3">Prerequisites</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {role.required_skills?.map((item) => {
                    const matchInGap = gapSummary?.skillGaps?.find(g => g.skill_id === item.skill_id);
                    const classification = matchInGap ? matchInGap.classification : 'Missing';
                    const currentProf = matchInGap ? matchInGap.current_proficiency : 0;

                    let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    if (classification === 'Mastered') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    else if (classification === 'Partially Known') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-extrabold text-[10px]">
                              P{item.phase_order || 1}
                            </span>
                            <span className="font-extrabold text-slate-900">{item.skill_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">{item.category}</td>
                        <td className="py-3.5 font-bold text-slate-900">{item.required_proficiency}% Target</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.priority === 'High' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                            {classification} ({currentProf}%)
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 max-w-[200px] truncate">{item.prerequisites || 'None'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Capstone Projects */}
          {role.sample_projects && role.sample_projects.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <span>Recommended Portfolio Capstone Projects for this Role</span>
              </h3>
              <p className="text-xs text-slate-500">
                Building these production-grade applications demonstrates job-readiness to hiring managers
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {role.sample_projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Portfolio Project #{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{proj}</h4>
                    <p className="text-xs text-slate-600">
                      Full-stack architectural implementation including database schemas, authentication, API documentation, and containerized deployment.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-500/20">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-extrabold">Ready to begin your journey to become a {role.name}?</h3>
              <p className="text-xs text-indigo-100">
                Follow the 5-phase personalized roadmap with curated resources, practical exercises, and completion tracking.
              </p>
            </div>

            <Link
              to={`/roadmap?role=${role.id}`}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-extrabold text-xs shadow-md transition-all shrink-0 flex items-center space-x-2"
            >
              <span>Launch 5-Phase Roadmap</span>
              <ArrowRight className="w-4 h-4 text-indigo-700" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
