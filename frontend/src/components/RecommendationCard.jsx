import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Info, CheckCircle2, AlertTriangle, ArrowRight, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function RecommendationCard({ recommendation, rank }) {
  const [showDetails, setShowDetails] = useState(false);
  const { course, recommendation_score, breakdown, reasons, missing_prerequisites } = recommendation;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md shadow-indigo-500/20">
            #{rank}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {course.primary_skill_name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {course.difficulty}
              </span>
              <span className="text-xs text-slate-500">
                {course.duration_hours} hrs
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 hover:text-indigo-600 transition-colors">
              <Link to={`/courses/${course.id}`}>{course.title}</Link>
            </h3>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed max-w-2xl">
              {course.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center min-w-[140px]">
            <div className="text-xs text-slate-600 font-semibold mb-0.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Match Score</span>
            </div>
            <div className="text-2xl font-black gradient-text">
              {recommendation_score}%
            </div>
          </div>

          <div className="flex flex-col space-y-2 w-full sm:w-auto">
            <Link
              to={`/courses/${course.id}`}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
            >
              <span>View Course</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center space-x-1 transition-colors border border-slate-200"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showDetails ? 'Hide Score Breakdown' : 'Why Recommended?'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Explainable Reasons & Hybrid Component Score Bar */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Transparent AI Recommendation Explanation</span>
            </h4>
            <ul className="space-y-2">
              {reasons.map((reason, index) => (
                <li key={index} className="text-xs text-slate-700 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Hybrid Scoring Component Matrix (Weights Configured in Backend)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Skill Gap (30%)</span>
                <span className="text-sm font-extrabold text-indigo-600">{breakdown.skill_gap_score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Prereq Match (25%)</span>
                <span className="text-sm font-extrabold text-cyan-600">{breakdown.prerequisite_match_score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">TF-IDF Relevance (20%)</span>
                <span className="text-sm font-extrabold text-purple-600">{breakdown.relevance_score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Performance (15%)</span>
                <span className="text-sm font-extrabold text-amber-600">{breakdown.performance_score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Difficulty Fit (10%)</span>
                <span className="text-sm font-extrabold text-emerald-600">{breakdown.difficulty_fit_score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
