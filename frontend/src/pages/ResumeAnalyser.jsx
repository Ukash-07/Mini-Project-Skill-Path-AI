import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  Award,
  ArrowRight,
  Target,
  Clock,
  Layers,
  ChevronRight,
  X,
  FileCheck,
  TrendingUp,
  DownloadCloud,
  Loader2
} from 'lucide-react';

export default function ResumeAnalyser() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [notification, setNotification] = useState(null);
  const [importingSkills, setImportingSkills] = useState(false);
  const [settingTargetId, setSettingTargetId] = useState(null);

  const sampleResume = `ALEX MORGAN
Email: alex.morgan@example.com | Phone: (555) 234-5678 | GitHub: github.com/alexmorgan | LinkedIn: linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Results-driven Full Stack Software Developer with 3+ years of experience building responsive, user-centric web applications and microservices. Proven proficiency in modern frontend frameworks, backend architecture, REST APIs, and relational databases.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3
- Frontend: React, Next.js, Tailwind CSS, Redux, Responsive UI Design
- Backend: Node.js, Express.js, REST API Architecture, JWT & Authentication
- Databases: SQL, PostgreSQL, MySQL, MongoDB
- DevOps & Cloud: Docker, Git, GitHub Actions, AWS (EC2, S3)
- Practices: Agile / Scrum, Unit Testing, CI/CD pipelines

PROJECTS & EXPERIENCE
Full Stack Web Developer | TechCorp Solutions (2022 - Present)
- Developed modern cloud dashboards using React, TypeScript, and Tailwind CSS.
- Engineered backend RESTful APIs with Node.js and Express, implementing JWT auth and role-based access.
- Managed PostgreSQL database schemas, indexing queries for 40% latency reduction.
- Containerized microservices using Docker and deployed to AWS environments.`;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'File size exceeds 5MB limit. Please upload a smaller resume file.'
        });
        return;
      }
      setFile(selected);
      setNotification(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 5 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'File size exceeds 5MB limit. Please upload a smaller resume file.'
        });
        return;
      }
      setFile(dropped);
      setNotification(null);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();

    if (activeTab === 'upload' && !file) {
      setNotification({
        type: 'error',
        message: 'Please choose or drag a resume file (PDF, TXT, DOCX) to analyze.'
      });
      return;
    }

    if (activeTab === 'paste' && !rawText.trim()) {
      setNotification({
        type: 'error',
        message: 'Please paste your resume text before running the analysis.'
      });
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const formData = new FormData();
      if (activeTab === 'upload' && file) {
        formData.append('resume', file);
      } else {
        formData.append('resume_text', rawText);
      }

      const res = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.success) {
        setResults(res.data);
        setNotification({
          type: 'success',
          message: 'Resume analyzed successfully! Scroll down to review your job matches and detected skills.'
        });
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to analyze resume.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to analyze resume. Please check your file and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportSkills = async () => {
    if (!results || !results.detected_skills || results.detected_skills.length === 0) return;

    setImportingSkills(true);
    try {
      const res = await api.post('/resume/import-skills', {
        skills: results.detected_skills
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Skills imported into your learning profile matrix successfully!'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to import skills to profile.'
      });
    } finally {
      setImportingSkills(false);
    }
  };

  const handleSetTargetCareer = async (careerId, careerName) => {
    setSettingTargetId(careerId);
    try {
      const res = await api.put('/students/profile', {
        target_career_id: careerId
      });
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Target career successfully set to "${careerName}"! Your personalized roadmap and course recommendations will now align with this role.`
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update target career.'
      });
    } finally {
      setSettingTargetId(null);
    }
  };

  const loadSample = () => {
    setActiveTab('paste');
    setRawText(sampleResume);
    setNotification({
      type: 'success',
      message: 'Sample resume loaded! Click "Analyze Resume" to test the AI matcher.'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          {/* Page Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  AI Resume Analyser & Job Matcher
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    Live Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your resume in PDF or text format to discover your highest matching career roles, verified skills, and bridgeable gaps.
                </p>
              </div>
            </div>

            <button
              onClick={loadSample}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 transition-colors self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Load Sample Resume</span>
            </button>
          </div>

          {/* Notification Banner */}
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

          {/* Upload & Input Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'upload'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Upload File (.PDF, .TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'paste'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Paste Resume Text
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Supports PDF, TXT, DOCX files up to 5MB
              </span>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  file
                    ? 'border-indigo-400 bg-indigo-50/30'
                    : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex items-center space-x-3 pt-2">
                      <label className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                        Replace File
                        <input
                          type="file"
                          accept=".pdf,.txt,.md,.doc,.docx"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Drag & drop your resume file here</p>
                      <p className="text-xs text-slate-500 mt-0.5">or choose a file from your computer</p>
                    </div>
                    <label className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all">
                      <UploadCloud className="w-4 h-4" />
                      <span>Browse Files</span>
                      <input
                        type="file"
                        accept=".pdf,.txt,.md,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Paste Text */}
            {activeTab === 'paste' && (
              <div className="space-y-2">
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the full text of your resume here, including skills, work history, projects, and education..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all leading-relaxed font-mono"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Characters: {rawText.length}</span>
                  <span>Words: {rawText.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={loading || (activeTab === 'upload' && !file) || (activeTab === 'paste' && !rawText.trim())}
                onClick={handleAnalyze}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume with AI Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Resume & Find Matching Jobs</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Job Match</span>
                  <div className="text-xl font-black text-indigo-600 truncate">{results.metadata.top_job_match || 'N/A'}</div>
                  <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{results.metadata.top_match_percentage}% Career Match</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skills Extracted</span>
                  <div className="text-xl font-black text-slate-900">{results.detected_skills.length} Skills</div>
                  <div className="text-xs text-slate-500">Cross-verified against skill catalog</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</span>
                  <div className="text-xl font-black text-cyan-600">{results.metadata.estimated_level}</div>
                  <div className="text-xs text-slate-500">Based on work profile heuristics</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Roles Evaluated</span>
                  <div className="text-xl font-black text-amber-600">{results.job_matches.length} Careers</div>
                  <div className="text-xs text-slate-500">Weighted against required competencies</div>
                </div>
              </div>

              {/* Detected Skills Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span>Detected Skills in Your Resume ({results.detected_skills.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      These technical skills were successfully recognized from your resume text
                    </p>
                  </div>

                  <button
                    onClick={handleImportSkills}
                    disabled={importingSkills || results.detected_skills.length === 0}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-2 border border-indigo-200 transition-all disabled:opacity-50 self-start sm:self-auto"
                  >
                    {importingSkills ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing to Profile...</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Sync Skills to My Profile Matrix</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {results.detected_skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center space-x-2 shadow-2xs"
                    >
                      <span className="font-bold text-slate-800">{skill.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-medium">
                        {skill.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Matches Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                      <span>What Jobs Match for You with Your Skills</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ranked by compatibility percentage, matched competencies, and learning curve to job readiness
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{results.job_matches.length} Careers Scored</span>
                </div>

                <div className="space-y-4">
                  {results.job_matches.map((job, index) => {
                    const isTop = index === 0;
                    return (
                      <div
                        key={job.career_id}
                        className={`bg-white p-6 rounded-3xl border transition-all ${
                          isTop
                            ? 'border-indigo-300 ring-4 ring-indigo-50 shadow-md'
                            : 'border-slate-200 shadow-sm hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                                #{index + 1}
                              </span>
                              <h4 className="text-base font-extrabold text-slate-900">{job.career_name}</h4>
                              {isTop && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  Top Recommendation
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{job.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                              <span>Domain: <strong className="text-slate-700">{job.domain}</strong></span>
                              <span>•</span>
                              <span>Difficulty: <strong className="text-slate-700">{job.difficulty}</strong></span>
                              <span>•</span>
                              <span>Est. Prep: <strong className="text-slate-700">{job.estimated_prep_months} months</strong></span>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className="flex items-center space-x-4 shrink-0">
                            <div className="text-right">
                              <div className="text-3xl font-black text-indigo-600">{job.match_percentage}%</div>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  job.match_percentage >= 80
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : job.match_percentage >= 60
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {job.readiness_level}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleSetTargetCareer(job.career_id, job.career_name)}
                                disabled={settingTargetId === job.career_id}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all disabled:opacity-50"
                              >
                                {settingTargetId === job.career_id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Target className="w-3.5 h-3.5" />
                                )}
                                <span>Set as My Target</span>
                              </button>

                              <button
                                onClick={() => navigate(`/roles/${job.career_id}`)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                              >
                                <span>View Role Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Why this matches you explanation */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong>Why this job matches: </strong>
                            <span>{job.match_reason}</span>
                          </div>
                        </div>

                        {/* Skill Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2">
                          {/* Matched Skills */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Matched Skills in Your Resume ({job.matched_skills.length})</span>
                            </span>
                            {job.matched_skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {job.matched_skills.map((s) => (
                                  <span
                                    key={s.id}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                                  >
                                    ✓ {s.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No direct skill matches in resume yet.</p>
                            )}
                          </div>

                          {/* Missing Skills */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Recommended Skills to Learn ({job.missing_skills.length})</span>
                            </span>
                            {job.missing_skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {job.missing_skills.map((s) => (
                                  <span
                                    key={s.id}
                                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium"
                                  >
                                    + {s.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-emerald-600 font-semibold">
                                ✓ All core skills for this role are covered in your resume!
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

