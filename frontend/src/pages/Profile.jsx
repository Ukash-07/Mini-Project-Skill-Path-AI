import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Search
} from 'lucide-react';

const INTEREST_OPTIONS = [
  'Web Development',
  'AI/ML',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Mobile Development',
  'Software Engineering'
];

const LEARNING_STYLES = [
  'Interactive Courses',
  'Videos',
  'Documentation',
  'Projects'
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [careers, setCareers] = useState([]);
  const [allSkillsCatalog, setAllSkillsCatalog] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [currentQualification, setCurrentQualification] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [targetCareerId, setTargetCareerId] = useState('2');
  const [interests, setInterests] = useState([]);
  const [learningStyle, setLearningStyle] = useState('Interactive Courses');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [dailyMinutes, setDailyMinutes] = useState(60);

  // Custom Skill Modal
  const [showCustomSkillModal, setShowCustomSkillModal] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillCategory, setCustomSkillCategory] = useState('Web & Software');
  const [customSkillProficiency, setCustomSkillProficiency] = useState(50);
  const [addingCustom, setAddingCustom] = useState(false);

  // Add existing skill modal
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [selectedCatalogSkillId, setSelectedCatalogSkillId] = useState('');
  const [selectedCatalogProficiency, setSelectedCatalogProficiency] = useState(50);
  const [skillSearch, setSkillSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, careersRes, catSkillsRes, stSkillsRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/careers'),
        api.get('/skills'),
        api.get('/students/skills')
      ]);

      if (profRes.success && profRes.data.profile) {
        const p = profRes.data.profile;
        setProfile(p);
        setFullName(p.full_name || '');
        setEmail(p.email || '');
        setEducationLevel(p.education_level || 'Undergraduate');
        setCurrentQualification(p.current_qualification || '');
        setExperienceLevel(p.experience_level || 'Beginner');
        setTargetCareerId(p.target_career_id ? p.target_career_id.toString() : '2');
        setInterests(p.interests || ['Web Development']);
        setLearningStyle(p.preferred_learning_style || 'Interactive Courses');
        setWeeklyHours(p.weekly_learning_hours || 10);
        if (profRes.data.preferences) {
          setDailyMinutes(profRes.data.preferences.daily_learning_time_min || 60);
        }
      }

      if (careersRes.success) setCareers(careersRes.data);
      if (catSkillsRes.success) {
        setAllSkillsCatalog(catSkillsRes.data);
        if (catSkillsRes.data.length > 0) setSelectedCatalogSkillId(catSkillsRes.data[0].id.toString());
      }
      if (stSkillsRes.success) setStudentSkills(stSkillsRes.data);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInterestToggle = (item) => {
    setInterests(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleProficiencyChange = (skillId, val) => {
    setStudentSkills(prev =>
      prev.map(s => s.skill_id === skillId ? { ...s, proficiency_level: parseInt(val) } : s)
    );
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // 1. Update Profile
      await api.put('/students/profile', {
        education_level: educationLevel,
        current_qualification: currentQualification,
        experience_level: experienceLevel,
        target_career_id: parseInt(targetCareerId),
        interests,
        preferred_learning_style: learningStyle,
        weekly_learning_hours: parseInt(weeklyHours),
        daily_learning_time_min: parseInt(dailyMinutes)
      });

      // 2. Update Student Skills
      const skillPayload = studentSkills.map(s => ({
        skill_id: s.skill_id,
        proficiency_level: s.proficiency_level,
        status: s.proficiency_level >= 70 ? 'Advanced' : s.proficiency_level >= 40 ? 'Intermediate' : 'Beginner'
      }));

      await api.put('/students/skills', { skills: skillPayload });

      // 3. Recalculate
      await api.post('/recommendations/refresh');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    if (!customSkillName.trim()) return;

    setAddingCustom(true);
    try {
      const res = await api.post('/students/custom-skill', {
        name: customSkillName.trim(),
        category: customSkillCategory,
        proficiency_level: customSkillProficiency
      });

      if (res.success) {
        setShowCustomSkillModal(false);
        setCustomSkillName('');
        await loadData();
      }
    } catch (err) {
      console.error('Failed to add custom skill:', err);
    } finally {
      setAddingCustom(false);
    }
  };

  const handleAddExistingSkill = async (e) => {
    e.preventDefault();
    if (!selectedCatalogSkillId) return;

    try {
      await api.put('/students/skills', {
        skills: [{
          skill_id: parseInt(selectedCatalogSkillId),
          proficiency_level: selectedCatalogProficiency,
          status: selectedCatalogProficiency >= 70 ? 'Advanced' : selectedCatalogProficiency >= 40 ? 'Intermediate' : 'Beginner'
        }]
      });

      setShowAddSkillModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const filteredCatalog = allSkillsCatalog.filter(
    sk => !studentSkills.some(s => s.skill_id === sk.id) &&
      sk.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

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
                <User className="w-4 h-4" />
                <span>Student Profile & Learning Preferences</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Profile & Skill Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Update your technical skills, self-assessed proficiencies, target career goal, and learning style. All recommendations recalculate automatically.
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile, technical skills, and career target saved successfully! Recommendation scores recalculated.</span>
            </div>
          )}

          {/* Section 1: Academic & Experience Details */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>1. Academic & Professional Background</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={fullName}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate (B.S. / B.Tech / B.C.A.)</option>
                  <option value="Postgraduate">Postgraduate (M.S. / M.Tech / M.C.A.)</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Major / Qualification Field</label>
                <input
                  type="text"
                  value={currentQualification}
                  onChange={(e) => setCurrentQualification(e.target.value)}
                  placeholder="e.g. Computer Science, Information Technology"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Career Goal & Learning Style */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>2. Career Goals & Learning Preferences</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Target Career Role Goal</label>
                <select
                  value={targetCareerId}
                  onChange={(e) => setTargetCareerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.domain.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {LEARNING_STYLES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Weekly Learning Commitment (Hours)</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Daily Study Pace (Minutes)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 120].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setDailyMinutes(mins)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        parseInt(dailyMinutes) === mins
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interest Areas Multi-Select */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Areas of Interest (Multi-Select):
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = interests.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleInterestToggle(item)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Technical Skills Management */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>3. Technical Skills & Proficiency Levels ({studentSkills.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Adjust sliders to reflect your self-assessed proficiency. You can also add custom skills.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add from Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCustomSkillModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add Custom Skill</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {studentSkills.map((sk) => {
                const level = parseFloat(sk.proficiency_level);
                let badge = 'Beginner';
                let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                if (level >= 70) {
                  badge = 'Advanced';
                  badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                } else if (level >= 40) {
                  badge = 'Intermediate';
                  badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                }

                return (
                  <div
                    key={sk.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">{sk.skill_name}</span>
                        {sk.is_custom ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Custom Skill
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-slate-500 block">{sk.category}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badgeColor}`}>
                        {badge} ({level}%)
                      </span>

                      <div className="flex items-center space-x-2 min-w-[150px]">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={level}
                          onChange={(e) => handleProficiencyChange(sk.skill_id, e.target.value)}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Custom Skill Modal */}
          {showCustomSkillModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">Add Custom Technical Skill</h3>
                  <button
                    onClick={() => setShowCustomSkillModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddCustomSkill} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Skill Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Next.js, Rust, GraphQL, Kubernetes"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Web Development, Cloud, DevOps"
                      value={customSkillCategory}
                      onChange={(e) => setCustomSkillCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Self-Assessed Proficiency:</span>
                      <span className="text-indigo-600 font-extrabold">{customSkillProficiency}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={customSkillProficiency}
                      onChange={(e) => setCustomSkillProficiency(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCustomSkillModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingCustom || !customSkillName.trim()}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {addingCustom ? 'Adding...' : 'Add Custom Skill'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Skill from Catalog Modal */}
          {showAddSkillModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">Add Skill from Catalog</h3>
                  <button
                    onClick={() => setShowAddSkillModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddExistingSkill} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Search Catalog</label>
                    <input
                      type="text"
                      placeholder="Search skill name..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Select Skill</label>
                    <select
                      value={selectedCatalogSkillId}
                      onChange={(e) => setSelectedCatalogSkillId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    >
                      {filteredCatalog.map((sk) => (
                        <option key={sk.id} value={sk.id}>
                          {sk.name} ({sk.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Proficiency Level:</span>
                      <span className="text-indigo-600 font-extrabold">{selectedCatalogProficiency}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={selectedCatalogProficiency}
                      onChange={(e) => setSelectedCatalogProficiency(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddSkillModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedCatalogSkillId}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                      Add Skill
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
