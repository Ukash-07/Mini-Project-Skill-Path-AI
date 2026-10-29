import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Briefcase,
  Target,
  Clock,
  Award,
  ChevronDown,
  Loader2,
  X
} from 'lucide-react';

const TYPE_FILTERS = ['All', 'Documentation', 'Interactive', 'Video', 'Project'];
const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function LearningResources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCareers, setLoadingCareers] = useState(true);

  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [settingTarget, setSettingTarget] = useState(false);

  // 1. Initial load: Fetch careers and user profile
  useEffect(() => {
    const initData = async () => {
      setLoadingCareers(true);
      try {
        const [careersRes, profileRes] = await Promise.all([
          api.get('/careers'),
          api.get('/students/profile')
        ]);

        if (careersRes.success && careersRes.data) {
          setCareers(careersRes.data);
        }

        let targetId = null;
        if (profileRes.success && profileRes.data && profileRes.data.profile) {
          setUserProfile(profileRes.data.profile);
          targetId = profileRes.data.profile.target_career_id;
        }

        // Priority for initial career: URL query param > user target career > first career in list
        const urlCareerId = searchParams.get('careerId') || searchParams.get('career_id');
        const initialCareerId = urlCareerId || targetId || (careersRes.data && careersRes.data[0] ? careersRes.data[0].id : '');

        setSelectedCareerId(String(initialCareerId));
      } catch (err) {
        console.error('Failed to initialize career data:', err);
      } finally {
        setLoadingCareers(false);
      }
    };

    initData();
  }, []);

  // 2. Fetch resources whenever selectedCareerId, selectedType, or selectedDifficulty changes
  const fetchResources = async (careerIdToFetch) => {
    const cid = careerIdToFetch || selectedCareerId;
    if (!cid) return;

    setLoading(true);
    try {
      let url = '/resources?';
      const params = new URLSearchParams();
      params.append('careerId', cid);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(url + params.toString());
      if (res.success) {
        setResources(res.data || []);
        if (res.selected_career) {
          setSelectedCareer(res.selected_career);
        }
      }
    } catch (err) {
      console.error('Failed to load career resources:', err);
      setNotification({
        type: 'error',
        message: 'Failed to load resources for the selected career.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCareerId) {
      fetchResources(selectedCareerId);
      // Synchronize URL param
      setSearchParams({ careerId: selectedCareerId }, { replace: true });
    }
  }, [selectedCareerId, selectedType, selectedDifficulty]);

  const handleCareerChange = (e) => {
    const newId = e.target.value;
    setSelectedCareerId(newId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources(selectedCareerId);
  };

  const handleSetTargetCareer = async () => {
    if (!selectedCareerId || !selectedCareer) return;
    setSettingTarget(true);
    try {
      const res = await api.put('/students/profile', {
        target_career_id: parseInt(selectedCareerId)
      });
      if (res.success) {
        setUserProfile((prev) => ({
          ...prev,
          target_career_id: parseInt(selectedCareerId),
          target_career_name: selectedCareer.name
        }));
        setNotification({
          type: 'success',
          message: `Target career set to "${selectedCareer.name}"! Your learning roadmap and AI recommendations now match this role.`
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update target career.'
      });
    } finally {
      setSettingTarget(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Documentation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Interactive':
      case 'Interactive Courses':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Video':
      case 'Videos':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Project':
      case 'Projects':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isCurrentTarget = userProfile && String(userProfile.target_career_id) === String(selectedCareerId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl">
          {/* Header Banner */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Curated Learning Directory</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                  Career-Aligned Learning Resources
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-0.5">
                  Verified tutorials, official documentation, interactive tracks, and hands-on projects curated strictly for your chosen career.
                </p>
              </div>

              {selectedCareer && (
                <div className="flex items-center space-x-2 shrink-0">
                  {isCurrentTarget ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Your Active Target Role</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleSetTargetCareer}
                      disabled={settingTarget}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
                    >
                      {settingTarget ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Target className="w-3.5 h-3.5" />
                      )}
                      <span>Set as My Target Role</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Career Selector Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Showing Resources For:
                </span>
                <select
                  value={selectedCareerId}
                  onChange={handleCareerChange}
                  disabled={loadingCareers}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs font-bold text-indigo-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {userProfile && userProfile.target_career_id === c.id ? '(Your Target)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCareer && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                    Domain: {selectedCareer.domain}
                  </span>
                  <span>•</span>
                  <span>Est. Prep: <strong className="text-slate-700">{selectedCareer.estimated_prep_months || 4} mo</strong></span>
                </div>
              )}
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

          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search within ${selectedCareer ? selectedCareer.name : 'career'} skills, topics, or platforms...`}
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Type Filter Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {TYPE_FILTERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                      selectedType === t
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap hidden sm:inline">
                {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'} Found
              </span>
            </div>
          </div>

          {/* Resources Cards Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-medium">Fetching verified resources for {selectedCareer?.name || 'role'}...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                No learning resources found for {selectedCareer?.name || 'this career'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search query or switching filters. You can also select another career role from the dropdown above.
              </p>
              {(selectedType !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedType('All');
                    setSelectedDifficulty('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  Reset All Filters
                </button>
              )}
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

                      {res.skill_phase && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                          Phase {res.skill_phase}
                        </span>
                      )}

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
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>~{res.duration_minutes ? `${res.duration_minutes}m` : `${res.estimated_hours || 4}h`}</span>
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
