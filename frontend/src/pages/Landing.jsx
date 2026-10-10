import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Route,
  Award,
  Target,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Briefcase,
  Layers,
  Code2
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between">
      {/* Header / Nav */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-slate-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900">
            SkillPath <span className="gradient-text">AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/70 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-8 shadow-xs">
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          <span>AI-Based Personalized Learning Path Recommendation Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-tight mb-8">
          Identify Career Roles & Bridge Your Skills with <span className="gradient-text">SkillPath AI</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
          Discover your exact job-readiness compatibility percentage across 23 technical roles. Diagnose mastered, partial, and missing skills, and follow structured 5-phase learning roadmaps without relearning what you already know.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 flex items-center justify-center space-x-3"
          >
            <span>Start Free Student Onboarding</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-xs"
          >
            Explore Career Catalog
          </Link>
        </div>
      </section>

      {/* 5 Domains Grid Showcase */}
      <section className="py-20 px-6 lg:px-12 bg-slate-50/80 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Complete Career Catalog Across 5 Major Domains
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Our explainable engine evaluates your compatibility across all 23 in-demand industry roles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                01
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Web & Software Dev</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Backend Developer, Frontend Developer, Full Stack, Java, Python, Software Engineer, Mobile.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                02
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Data & Artificial Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Data Analyst, Data Scientist, ML Engineer, AI Engineer, Generative AI, Data Engineer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm">
                03
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Cloud & Infrastructure</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                DevOps Engineer, Cloud Engineer, Site Reliability Engineer (SRE).
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                04
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Security & Testing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cybersecurity Analyst, Ethical Security Tester, Software Test Engineer, QA Automation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                05
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Other Technical Roles</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Database Administrator (DBA), UI/UX Designer, Business Intelligence Developer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Students Choose SkillPath AI</h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Traditional learning platforms treat every student the same. SkillPath AI tailors every milestone to your current proficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Redundant Relearning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you already know JavaScript and HTML, our system marks them as mastered and focuses your roadmap directly on advanced APIs, databases, authentication, and Docker.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Real Compatibility Scores</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get mathematical compatibility percentages (e.g. Backend Developer 85%, Full Stack 75%, API Developer 90%) computed from genuine skill proficiencies and role benchmarks.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">5-Phase Roadmaps with Working URLs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every skill features curated working documentation and interactive links (MDN, Node.js, freeCodeCamp, Docker), practical exercises, and completion checkboxes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>© 2026 SkillPath AI — AI-Based Personalized Learning Path Recommendation Engine for Skill Development Portal.</p>
      </footer>
    </div>
  );
}
