import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { BookOpen, Clock, Star, Award, CheckCircle2, Lock, ArrowRight, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        if (res.success) {
          setCourse(res.data);
          if (res.data.modules && res.data.modules.length > 0) {
            setExpandedModuleId(res.data.modules[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleStartCourse = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      navigate(`/courses/${id}/learn`);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          Loading course details...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-5xl">
          {/* Banner Hero */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-72 h-48 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {course.primary_skill_name}
                  </span>
                  <span className="px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
                    {course.difficulty}
                  </span>
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration_hours} Hours
                  </span>
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {course.rating}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">{course.title}</h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{course.description}</p>

                <div className="pt-2">
                  <button
                    onClick={handleStartCourse}
                    disabled={enrolling}
                    className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105 flex items-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{course.enrollment ? 'Continue Course Player' : 'Enroll & Start Learning'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Modules Syllabus Accordion */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Course Modules & Curriculum</h2>

            <div className="space-y-3">
              {course.modules && course.modules.map((mod, index) => {
                const isOpen = expandedModuleId === mod.id;
                return (
                  <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <button
                      onClick={() => setExpandedModuleId(isOpen ? null : mod.id)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">
                          M{index + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                          <span className="text-[11px] text-slate-500">{mod.lessons ? mod.lessons.length : 0} Lessons</span>
                        </div>
                      </div>

                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {isOpen && mod.lessons && (
                      <div className="p-5 pt-0 border-t border-slate-100 divide-y divide-slate-100 space-y-2">
                        {mod.lessons.map((les, lIdx) => (
                          <div key={les.id} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
                            <div className="flex items-center space-x-2">
                              <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="font-semibold">{lIdx + 1}. {les.title}</span>
                            </div>
                            <span className="text-slate-400 font-mono text-[11px]">{les.duration_minutes} min</span>
                          </div>
                        ))}

                        {mod.quiz && (
                          <div className="py-2.5 flex items-center justify-between text-xs text-amber-800 font-bold bg-amber-50 px-3 rounded-xl border border-amber-200">
                            <span>Module Quiz: {mod.quiz.title}</span>
                            <span>Pass: {mod.quiz.pass_threshold}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
