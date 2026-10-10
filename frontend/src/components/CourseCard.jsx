import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Award, ChevronRight, CheckCircle } from 'lucide-react';

export default function CourseCard({ course, isCompleted, isEnrolled, recommendationScore }) {
  const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
    Advanced: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div>
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border backdrop-blur-md ${difficultyColors[course.difficulty] || difficultyColors.Beginner}`}>
              {course.difficulty}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/90 text-indigo-700 border border-slate-200 backdrop-blur-md">
              {course.primary_skill_name}
            </span>
          </div>

          {recommendationScore && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-1 rounded-full shadow-md text-white font-extrabold text-xs flex items-center space-x-1">
              <span>{recommendationScore}% Match</span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              {course.rating || '4.8'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {course.duration_hours} Hours
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          to={`/courses/${course.id}`}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isEnrolled
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Completed</span>
            </>
          ) : isEnrolled ? (
            <>
              <span>Continue Course</span>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View Syllabus & Start</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
