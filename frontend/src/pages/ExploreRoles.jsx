import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Briefcase,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FolderGit2
} from 'lucide-react';

const DOMAIN_TABS = [
  'All',
  'Web and Software Development',
  'Data and Artificial Intelligence',
  'Cloud and Infrastructure',
  'Security and Testing',
  'Other Technical Roles'
];

export default function ExploreRoles() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCareers = async () => {
    setLoading(true);
    try {
      let url = '/careers?';
      const params = new URLSearchParams();
      if (selectedDomain !== 'All') params.append('domain', selectedDomain);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(url + params.toString());
      if (res.success) {
        setCareers(res.data);
      }
    } catch (err) {
      console.error('Failed to load career roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, [selectedDomain, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCareers();
  };

  const getDomainColor = (domain) => {
    if (!domain) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (domain.includes('Web')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (domain.includes('Data') || domain.includes('AI')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (domain.includes('Cloud')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (domain.includes('Security')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl">
          {/* Header Banner */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>Comprehensive Career Role Catalog</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Explore All 23 Technical Career Roles
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Browse every industry-standard technical career role across 5 major domains. Inspect required skills, benchmark proficiencies, capstone projects, and real compatibility scores based on your existing skills.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                to="/recommendations"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>My Top Recommendations</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by role title, keyword, or technologies (e.g., Python, Cloud, Security)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
                >
                  <option value="All">All Difficulty Levels</option>
                  <option value="Beginner">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Domain Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {DOMAIN_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedDomain(tab)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    selectedDomain === tab
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Career Roles Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Loading career roles and compatibility scores...</p>
            </div>
          ) : careers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No career roles found</h3>
              <p className="text-xs text-slate-500">Try modifying your search criteria or domain filter.</p>
              <button
                onClick={() => { setSelectedDomain('All'); setSelectedDifficulty('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careers.map((role) => (
                <div
                  key={role.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDomainColor(role.domain)}`}>
                        {role.domain}
                      </span>

                      {role.compatibility_score !== null && (
                        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[11px]">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>{role.compatibility_score}% Match</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        <Link to={`/roles/${role.id}`}>{role.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{role.difficulty} Level</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{role.estimated_prep_months || 4} Months Prep</span>
                      </span>
                    </div>

                    {role.sample_projects && role.sample_projects.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Capstone Project Focus:
                        </span>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <FolderGit2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{role.sample_projects[0]}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/roles/${role.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>Role Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/skill-gap?role=${role.id}`}
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                        title="Analyze your specific skill gap for this role"
                      >
                        Gap Analysis
                      </Link>
                      <Link
                        to={`/roadmap?role=${role.id}`}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors"
                        title="View personalized 5-phase learning roadmap"
                      >
                        Roadmap
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
