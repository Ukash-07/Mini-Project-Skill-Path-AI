import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Sparkles,
  Target,
  Briefcase,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const INTEREST_DOMAINS = [
  'Web Development',
  'AI/ML',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Mobile Development',
  'Software Engineering'
];

const INTEREST_CAREER_MAP = {
  'Mobile Development': 7, // Mobile App Developer
  'AI/ML': 11, // AI Engineer
  'Data Science': 9, // Data Scientist
  'Cybersecurity': 17, // Cybersecurity Analyst
  'Cloud Computing': 15, // Cloud Engineer
  'Web Development': 1, // Frontend Developer
  'Software Engineering': 6 // Software Engineer
};

const LEARNING_STYLES = [
  'Interactive Courses',
  'Videos',
  'Documentation',
  'Projects'
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [careers, setCareers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [currentQualification, setCurrentQualification] = useState('Computer Science');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [targetCareerId, setTargetCareerId] = useState('');

  // Skills state: { skillId: { level: 0-100, status: 'Beginner'|'Intermediate'|'Advanced' } }
  const [selectedSkills, setSelectedSkills] = useState({
    1: { level: 65, status: 'Intermediate' }, // HTML & CSS
    2: { level: 70, status: 'Intermediate' }, // JavaScript
    3: { level: 60, status: 'Intermediate' }, // Node.js
    4: { level: 35, status: 'Beginner' },     // Express.js
    5: { level: 30, status: 'Beginner' }      // MySQL
  });
  const [skillSearch, setSkillSearch] = useState('');

  // Custom skill inline form
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillProf, setCustomSkillProf] = useState(50);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Interest Domains
  const [selectedInterests, setSelectedInterests] = useState(['Web Development']);

  // Learning Preferences
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [learningStyle, setLearningStyle] = useState('Interactive Courses');

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/careers'),
          api.get('/skills')
        ]);
        if (cRes.success) {
          setCareers(cRes.data);
          if (cRes.data.length > 0) setTargetCareerId(cRes.data[0].id.toString());
        }
        if (sRes.success) {
          setAllSkills(sRes.data);
        }
      } catch (err) {
        console.error('Failed to load onboarding options:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => {
      const copy = { ...prev };
      if (copy[skillId]) {
        delete copy[skillId];
      } else {
        copy[skillId] = { level: 50, status: 'Intermediate' };
      }
      return copy;
    });
  };

  const handleProficiencyChange = (skillId, val) => {
    const num = parseInt(val);
    const status = num >= 70 ? 'Advanced' : num >= 40 ? 'Intermediate' : 'Beginner';
    setSelectedSkills(prev => ({
      ...prev,
      [skillId]: { level: num, status }
    }));
  };

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => {
      const isAdding = !prev.includes(interest);
      const updated = isAdding ? [...prev, interest] : prev.filter(i => i !== interest);

      // Auto-align preferred target career with selected interest (e.g. Mobile Development -> Mobile App Developer)
      if (isAdding && INTEREST_CAREER_MAP[interest]) {
        setTargetCareerId(INTEREST_CAREER_MAP[interest].toString());
      } else if (updated.length > 0 && INTEREST_CAREER_MAP[updated[0]]) {
        setTargetCareerId(INTEREST_CAREER_MAP[updated[0]].toString());
      }

      return updated;
    });
  };

  const handleAddCustomSkill = async () => {
    if (!customSkillName.trim()) return;
    try {
      const res = await api.post('/students/custom-skill', {
        name: customSkillName.trim(),
        category: 'Custom Skill',
        proficiency_level: customSkillProf
      });
      if (res.success && res.data) {
        setSelectedSkills(prev => ({
          ...prev,
          [res.data.skill_id]: { level: customSkillProf, status: res.data.status }
        }));
        setCustomSkillName('');
        setShowCustomInput(false);
        // Refresh skill list
        const sRes = await api.get('/skills');
        if (sRes.success) setAllSkills(sRes.data);
      }
    } catch (err) {
      console.error('Failed to add custom skill in onboarding:', err);
    }
  };

  const handleSubmitOnboarding = async () => {
    setSaving(true);
    setSubmitError('');
    try {
      const fallbackCareer = selectedInterests[0] && INTEREST_CAREER_MAP[selectedInterests[0]]
        ? INTEREST_CAREER_MAP[selectedInterests[0]]
        : (careers.length > 0 ? careers[0].id : 7);

      const cId = parseInt(targetCareerId) || fallbackCareer;

      // 1. Update Profile & Interests & Preferences
      await api.put('/students/profile', {
        education_level: educationLevel,
        current_qualification: currentQualification,
        experience_level: experienceLevel,
        target_career_id: cId,
        interests: selectedInterests,
        preferred_learning_style: learningStyle,
        weekly_learning_hours: parseInt(weeklyHours) || 10,
        daily_learning_time_min: parseInt(dailyMinutes) || 60
      });

      // 2. Update Selected Skills Matrix
      const skillPayload = Object.entries(selectedSkills).map(([sId, val]) => ({
        skill_id: parseInt(sId),
        proficiency_level: val.level,
        status: val.status
      }));

      if (skillPayload.length > 0) {
        await api.put('/students/skills', { skills: skillPayload });
      }

      // 3. Trigger Recommendation & Learning Path Recalculation
      try {
        await api.post('/recommendations/refresh');
      } catch (recErr) {
        console.warn('Recommendation refresh non-fatal error:', recErr);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      setSubmitError(err.message || 'Failed to complete setup. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = allSkills.filter(sk =>
    sk.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
    (sk.category && sk.category.toLowerCase().includes(skillSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading onboarding wizard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 space-y-8 relative z-10 shadow-xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">SkillPath AI Onboarding</h1>
              <p className="text-xs text-slate-500">Step {step} of 4: Personalized Setup</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 sm:w-10 h-2 rounded-full transition-all ${
                  s === step
                    ? 'bg-indigo-600 shadow-xs'
                    : s < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Academic & Experience Profile */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Step 1 — Education & Tech Background</h2>
              <p className="text-xs text-slate-500">Tell us about your educational level and experience to set benchmark difficulty</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate (B.S. / B.Tech / B.C.A.)</option>
                  <option value="Postgraduate">Postgraduate (M.S. / M.Tech / M.C.A.)</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Major / Area of Study</label>
                <input
                  type="text"
                  value={currentQualification}
                  onChange={(e) => setCurrentQualification(e.target.value)}
                  placeholder="e.g. Computer Science, Information Technology, Electronics"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tech Experience Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-3 px-4 rounded-xl text-xs font-extrabold border transition-all ${
                        experienceLevel === lvl
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-400 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Technical Skills & Proficiency */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Step 2 — Current Technical Skills</h2>
              <p className="text-xs text-slate-500">
                Select skills you know, search the catalog, set your proficiency (Beginner / Intermediate / Advanced), or add custom skills.
              </p>
            </div>

            {/* Search Bar & Custom Skill Toggle */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search skills (e.g., JavaScript, Python, Docker, SQL)..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Skill</span>
              </button>
            </div>

            {/* Custom Skill Input Form */}
            {showCustomInput && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 animate-fadeIn">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Add Custom Skill:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. Next.js, Rust)"
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    disabled={!customSkillName.trim()}
                    className="px-4 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Skills Scrollable List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
              {filteredSkills.map((sk) => {
                const isSelected = selectedSkills[sk.id] !== undefined;
                const skillData = selectedSkills[sk.id];

                return (
                  <div
                    key={sk.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleSkillToggle(sk.id)}
                        className="flex items-center space-x-3 text-left"
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">{sk.name}</span>
                          <span className="text-[10px] text-slate-500 block">{sk.category}</span>
                        </div>
                      </button>

                      {isSelected && (
                        <div className="flex items-center space-x-3 self-end sm:self-auto">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            skillData.status === 'Advanced' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            skillData.status === 'Intermediate' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {skillData.status} ({skillData.level}%)
                          </span>

                          <input
                            type="range"
                            min="15"
                            max="100"
                            step="5"
                            value={skillData.level}
                            onChange={(e) => handleProficiencyChange(sk.id, e.target.value)}
                            className="w-24 accent-indigo-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Areas of Interest */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Step 3 — Areas of Interest</h2>
              <p className="text-xs text-slate-500">
                Select domains that inspire you. We apply compatibility alignment bonuses for roles in these fields.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTEREST_DOMAINS.map((domain) => {
                const isSelected = selectedInterests.includes(domain);
                return (
                  <button
                    type="button"
                    key={domain}
                    onClick={() => handleInterestToggle(domain)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{domain}</span>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Preferred Career Goal & Learning Style */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Step 4 — Career Goals & Pace</h2>
              <p className="text-xs text-slate-500">Configure your target career goal and weekly learning availability</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Preferred Career Goal</label>
                  {selectedInterests.length > 0 && (
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Auto-aligned with {selectedInterests.join(', ')}
                    </span>
                  )}
                </div>
                <select
                  value={targetCareerId}
                  onChange={(e) => setTargetCareerId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  {/* Recommended roles based on interest */}
                  {selectedInterests.length > 0 && (
                    <optgroup label="⭐ Recommended for your selected interests">
                      {careers
                        .filter((c) => {
                          const interestCareerId = INTEREST_CAREER_MAP[selectedInterests[0]];
                          const matchesCategory = selectedInterests.some((i) =>
                            (c.category && c.category.toLowerCase().includes(i.toLowerCase())) ||
                            (c.name && c.name.toLowerCase().includes(i.toLowerCase())) ||
                            (c.domain && c.domain.toLowerCase().includes(i.toLowerCase()))
                          );
                          return c.id === interestCareerId || matchesCategory;
                        })
                        .map((c) => (
                          <option key={`rec-${c.id}`} value={c.id}>
                            ⭐ {c.name} ({c.domain.split(' ')[0]})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  <optgroup label="All Other Career Roles">
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.domain.split(' ')[0]})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Learning Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {LEARNING_STYLES.map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setLearningStyle(st)}
                      className={`p-3 rounded-xl text-xs font-extrabold border transition-all ${
                        learningStyle === st
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-400 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Available Learning Time Per Day</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 120].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setDailyMinutes(mins)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          dailyMinutes === mins
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {mins} mins
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Available Learning Hours / Week</label>
                  <input
                    type="number"
                    min="2"
                    max="40"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-500/25"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitOnboarding}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              {saving ? <span>Generating AI Recommendations...</span> : (
                <>
                  <span>Complete Setup & Generate Roadmaps</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
