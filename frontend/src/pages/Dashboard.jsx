import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Sparkles,
  BookOpen,
  Award,
  Flame,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  RotateCcw,
  Briefcase,
  Route,
  FolderGit2,
  Bot
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [progressData, setProgressData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [topRecommendations, setTopRecommendations] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [progRes, profRes, recRes, skRes, roadRes] = await Promise.all([
        api.get('/students/progress'),
        api.get('/students/profile'),
        api.get('/careers/recommendations'),
        api.get('/students/skills'),
        api.get('/learning-path')
      ]);

      if (progRes.success) setProgressData(progRes.data);
      if (profRes.success) setProfileData(profRes.data);
      if (recRes.success) setTopRecommendations(recRes.data.slice(0, 3));
      if (skRes.success) setStudentSkills(skRes.data || []);
      if (roadRes.success) setRoadmap(roadRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      await api.post('/recommendations/refresh');
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Find next recommended skill
  let nextSkill = null;
  if (roadmap?.phases) {
    for (const phase of roadmap.phases) {
      for (const sk of phase.skills) {
        if (!sk.is_completed) {
          nextSkill = sk;
          break;
        }
      }
      if (nextSkill) break;
    }
  }

  const weeklyChartData = progressData?.weekly_progress || [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.0 },
    { day: 'Wed', hours: 1.0 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 3.0 },
    { day: 'Sun', hours: 2.0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Evaluating personalized career path matrix...</span>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl">
          {/* Welcome Banner */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>SkillPath AI Recommendation Engine Active</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Welcome back, {profile.full_name || 'Alex Morgan'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Target Role Goal: <strong className="text-slate-900 font-extrabold">{progressData?.target_career_name || 'Backend Developer'}</strong> • {profile.education_level || 'Undergraduate'} • Preferred Style: {profile.preferred_learning_style || 'Interactive Courses'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleRecalculate}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center space-x-2 transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalculate Scores</span>
              </button>

              <Link
                to="/roles"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Explore All Career Roles</span>
              </Link>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Overall Skill Readiness</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black gradient-text">
                {progressData?.readiness_score || 0}%
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressData?.readiness_score || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">Benchmark coverage for {progressData?.target_career_name || 'role'}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Skills Learned vs Remaining</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1.5">
                <span className="text-emerald-600">{progressData?.skills_mastered || 0}</span>
                <span className="text-slate-400 text-xl font-bold">/</span>
                <span className="text-slate-600 text-xl font-bold">{(progressData?.skills_mastered || 0) + (progressData?.skills_remaining || 0)}</span>
              </div>
              <p className="text-[11px] text-slate-500">{progressData?.skills_remaining || 0} skills remaining to be job-ready</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Learning Streak</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-500 flex items-baseline gap-1">
                <span>{progressData?.current_streak || 6}</span>
                <span className="text-sm font-semibold text-slate-500">Days</span>
              </div>
              <p className="text-[11px] text-slate-500">{progressData?.current_level || 'Intermediate Learner'}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Portfolio Projects</span>
                <FolderGit2 className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-3xl font-black text-cyan-600">
                {progressData?.completed_projects || 0}
              </div>
              <Link to="/projects" className="text-[11px] text-indigo-600 font-bold hover:underline block">
                Manage Portfolio & Quizzes →
              </Link>
            </div>
          </div>

          {/* Top Recommended Career Roles Section */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Top AI Recommended Career Roles</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Calculated from actual skill matches, proficiency levels, and role benchmarks
                </p>
              </div>

              <Link
                to="/recommendations"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View All Rankings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {topRecommendations.map((role) => (
                <div
                  key={role.role_id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/40 hover:bg-white transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {role.domain.split(' ')[0]}
                      </span>
                      <div className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
                        {role.compatibility_score}% Match
                      </div>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      <Link to={`/roles/${role.role_id}`}>{role.role_title}</Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {role.why_recommended}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                      <p>✓ <strong>{role.known_skills?.length || 0}</strong> Mastered • ⚡ <strong>{role.partial_skills?.length || 0}</strong> Partial</p>
                      <p className="text-slate-400">Est. <strong>{role.estimated_weeks_to_ready} weeks</strong> to ready</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Link
                      to={`/skill-gap?role=${role.role_id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                    >
                      Skill Gap
                    </Link>
                    <Link
                      to={`/roadmap?role=${role.role_id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-xs"
                    >
                      Roadmap →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Skill Card */}
          {nextSkill && (
            <div className="bg-gradient-to-br from-indigo-50/60 via-white to-white p-6 rounded-3xl border border-indigo-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Recommended Next Skill to Learn</span>
                </span>

                <Link
                  to={`/roadmap?role=${progressData?.target_career_id}`}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Continue Learning Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">{nextSkill.skill_name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                      Category: {nextSkill.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                      Priority: {nextSkill.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                      Estimated Duration: ~{nextSkill.estimated_hours} Hours
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    <strong className="text-slate-800">Prerequisites: </strong>{nextSkill.prerequisites} • Practical Exercise: {nextSkill.practical_exercises?.[0] || 'Interactive challenges'}
                  </p>
                </div>

                <Link
                  to={`/roadmap?role=${progressData?.target_career_id}`}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 shrink-0 transition-all hover:scale-105"
                >
                  Start This Skill Now
                </Link>
              </div>
            </div>
          )}

          {/* Grid: Weekly Learning Progress Chart & AI Career Assistant CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Hours Progress Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Weekly Learning Progress</h3>
                  <p className="text-xs text-slate-500">Tracked daily study commitment hours</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Target Met: 14.0 hrs
                </span>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#0f172a'
                      }}
                    />
                    <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Hours Studied" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Assistant Quick Banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-3xl text-white shadow-md shadow-indigo-500/20 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black">AI Career & Learning Assistant</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  Have questions about what to learn next, whether you can become a Full Stack Developer, or how to improve in Node.js? Ask your dedicated AI assistant powered by your actual skills context.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  to="/assistant"
                  className="w-full py-3 px-4 rounded-xl bg-white text-indigo-700 font-extrabold text-xs text-center block shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Open AI Career Assistant
                </Link>
                <div className="text-[11px] text-indigo-200 text-center">
                  Available 24/7 with personalized advice
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
