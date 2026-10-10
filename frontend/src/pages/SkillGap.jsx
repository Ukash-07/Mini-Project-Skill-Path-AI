import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Route,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SkillGap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleQueryParam = searchParams.get('role');

  const [allCareers, setAllCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState(roleQueryParam || '2');
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch career list for role dropdown selector
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/careers');
        if (res.success) {
          setAllCareers(res.data);
          if (!roleQueryParam && res.data.length > 0) {
            // If no query param, check if user has target career or default to 2 (Backend Developer)
            const profRes = await api.get('/students/profile');
            const targetId = profRes?.data?.profile?.target_career_id || 2;
            setSelectedCareerId(targetId.toString());
          }
        }
      } catch (err) {
        console.error('Failed to load careers:', err);
      }
    };
    fetchCareers();
  }, []);

  // Fetch gap analysis whenever selectedCareerId changes
  useEffect(() => {
    if (!selectedCareerId) return;

    const fetchGapAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/careers/${selectedCareerId}/skill-gap`);
        if (res.success) {
          setGapData(res.data);
        }
      } catch (err) {
        console.error('Failed to load skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGapAnalysis();
  }, [selectedCareerId]);

  const handleCareerChange = (e) => {
    const newId = e.target.value;
    setSelectedCareerId(newId);
    setSearchParams({ role: newId });
  };

  // Format chart data for Recharts
  const chartData = (gapData?.skillGaps || []).map((s) => ({
    name: s.skill_name,
    'Your Current Level (%)': s.current_proficiency,
    'Required Benchmark (%)': s.required_proficiency,
    gap: s.gap
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          {/* Header & Role Selector */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Personalized Skill Gap Diagnostics</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Career Role Skill Gap Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Compare your current assessed skills against industry benchmark standards. We focus on revision and new topics without asking you to relearn what you already know.
              </p>
            </div>

            {/* Role Dropdown Selector */}
            <div className="space-y-1.5 shrink-0 min-w-[240px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Career Target Role:
              </label>
              <select
                value={selectedCareerId}
                onChange={handleCareerChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs transition-colors"
              >
                {allCareers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.domain.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Evaluating skill benchmarks and topic recommendations...</p>
            </div>
          ) : gapData ? (
            <>
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Readiness Score
                  </span>
                  <div className="text-3xl font-black text-indigo-600">
                    {gapData.readinessScore}%
                  </div>
                  <p className="text-[11px] text-slate-500">Benchmark skill coverage</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Skills Mastered
                  </span>
                  <div className="text-3xl font-black text-emerald-600">
                    {gapData.masteredSkills.length}
                  </div>
                  <p className="text-[11px] text-slate-500">No relearning required</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Partially Known
                  </span>
                  <div className="text-3xl font-black text-amber-600">
                    {gapData.partialSkills.length}
                  </div>
                  <p className="text-[11px] text-slate-500">Targeted revision needed</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Missing Skills
                  </span>
                  <div className="text-3xl font-black text-rose-600">
                    {gapData.missingSkills.length}
                  </div>
                  <p className="text-[11px] text-slate-500">~{gapData.estimatedWeeks} Weeks prep time</p>
                </div>
              </div>

              {/* Visual Benchmark Comparison Chart */}
              <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Visual Benchmark Comparison: Current Level vs Industry Requirement
                    </h3>
                    <p className="text-xs text-slate-500">
                      Target role: {gapData.career?.name} • Required proficiency threshold: ~70–85%
                    </p>
                  </div>

                  <Link
                    to={`/roadmap?role=${selectedCareerId}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <span>View 5-Phase Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-80 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          angle={-15}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#0f172a',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar
                          dataKey="Your Current Level (%)"
                          fill="#4f46e5"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="Required Benchmark (%)"
                          fill="#93c5fd"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs py-10 text-center">No skills mapped for this role.</p>
                )}
              </div>

              {/* 3 Classified Columns: Mastered, Partial, Missing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Mastered Skills */}
                <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wide">
                      1. Mastered Skills ({gapData.masteredSkills.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    You already meet the target benchmark for these skills. <strong>No relearning required.</strong> Continue reinforcing through portfolio projects.
                  </p>

                  <div className="space-y-2">
                    {gapData.masteredSkills.length > 0 ? (
                      gapData.masteredSkills.map((s) => (
                        <div key={s.skill_id} className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{s.skill_name}</span>
                            <span className="text-[10px] text-slate-500">{s.category}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            {s.current_proficiency}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-3 text-center">None mastered yet.</p>
                    )}
                  </div>
                </div>

                {/* 2. Partially Known Skills */}
                <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wide">
                      2. Partially Known ({gapData.partialSkills.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    You understand foundational concepts. Focus on <strong>targeted revision and advanced patterns</strong> to close the gap.
                  </p>

                  <div className="space-y-2">
                    {gapData.partialSkills.length > 0 ? (
                      gapData.partialSkills.map((s) => (
                        <div key={s.skill_id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{s.skill_name}</span>
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              {s.current_proficiency}% → {s.required_proficiency}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-tight">
                            Gap of {s.gap}% points to reach benchmark.
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-3 text-center">No partial skills identified.</p>
                    )}
                  </div>
                </div>

                {/* 3. Missing Skills */}
                <div className="bg-white p-6 rounded-3xl border border-rose-200/80 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-rose-700">
                    <HelpCircle className="w-5 h-5" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wide">
                      3. Missing Skills ({gapData.missingSkills.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    These are core requirements that you currently lack. Must be learned from fundamentals to become job-ready.
                  </p>

                  <div className="space-y-2">
                    {gapData.missingSkills.length > 0 ? (
                      gapData.missingSkills.map((s) => (
                        <div key={s.skill_id} className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{s.skill_name}</span>
                            <span className="text-[10px] text-slate-500">Priority: {s.priority}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                            Target {s.required_proficiency}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-3 text-center">You have all core skills!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Curated Targeted Technical Topic Recommendations (Prompt Section 4) */}
              <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Targeted Curriculum Topics</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Exact Topics Needed to Become Job-Ready for {gapData.career?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Categorized into targeted advanced revision for partial skills and core fundamentals for missing skills
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapData.topicRecommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        rec.tag === 'Partially Known'
                          ? 'bg-amber-50/30 border-amber-200'
                          : 'bg-indigo-50/30 border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">
                          {rec.skill_name}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          rec.tag === 'Partially Known'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        }`}>
                          {rec.type}
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {rec.topics.map((topic, tIdx) => (
                          <li key={tIdx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                        {rec.goal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
