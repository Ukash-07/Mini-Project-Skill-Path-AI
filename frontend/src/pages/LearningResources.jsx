import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  BookOpen,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Filter,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

const TYPE_FILTERS = ['All', 'Documentation', 'Interactive', 'Video', 'Project'];
const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function LearningResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      let url = '/resources?';
      const params = new URLSearchParams();
      if (selectedType !== 'All') params.append('type', selectedType);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(url + params.toString());
      if (res.success) {
        setResources(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedType, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Documentation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Interactive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Video':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Project':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
                <BookOpen className="w-4 h-4" />
                <span>Curated Learning Directory</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Verified Learning Resources
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Every resource features verified, working URLs to official documentation, interactive courses, hands-on tutorials, and project specifications.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by topic, skill, or platform (e.g., JavaScript, MDN, Docker)..."
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
                  {DIFFICULTY_FILTERS.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Difficulties' : `${d} Level`}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Cards Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Fetching verified learning resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No resources found</h3>
              <p className="text-xs text-slate-500">Try modifying your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getTypeBadge(res.type)}`}>
                        {res.type}
                      </span>

                      <span className="text-[11px] font-bold text-slate-500">
                        {res.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {res.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-indigo-700 font-bold text-[11px]">
                        {res.skill_name}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium text-[11px]">
                        {res.platform}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      ~{res.estimated_hours || 4} Hours
                    </span>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center space-x-1.5 shadow-xs"
                    >
                      <span>Open Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
