import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Award, HelpCircle } from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.success) {
        setCourse(res.data);
        const compSet = new Set(res.data.completed_lesson_ids || []);
        setCompletedLessonIds(compSet);
        if (res.data.progress) {
          setProgressPercentage(parseFloat(res.data.progress.progress_percentage));
        }

        // Set default active lesson to first uncompleted lesson or first lesson
        if (res.data.modules && res.data.modules.length > 0) {
          let found = null;
          for (const mod of res.data.modules) {
            for (const les of mod.lessons) {
              if (!compSet.has(les.id) && !found) {
                found = les;
              }
            }
          }
          setActiveLesson(found || res.data.modules[0].lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await api.post(`/courses/lessons/${activeLesson.id}/complete`);
      if (res.success) {
        setCompletedLessonIds(prev => new Set([...prev, activeLesson.id]));
        setProgressPercentage(res.data.progress_percentage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          Loading course player...
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

  const isCurrentCompleted = activeLesson ? completedLessonIds.has(activeLesson.id) : false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to={`/courses/${id}`} className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Course Overview</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="text-xs font-semibold text-slate-600">
                Course Completion: <span className="text-indigo-600 font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {activeLesson ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Active Lesson</span>
                <h1 className="text-2xl font-extrabold text-slate-900">{activeLesson.title}</h1>
              </div>

              {/* Video Embed Player */}
              <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md relative">
                <iframe
                  title={activeLesson.title}
                  src={activeLesson.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Text Lesson Content */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Lesson Notes & Material</h3>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeLesson.content}
                </div>
              </div>

              {/* Mark Complete Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={handleMarkComplete}
                  disabled={completing || isCurrentCompleted}
                  className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all ${
                    isCurrentCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCurrentCompleted ? 'Lesson Completed' : 'Mark as Complete & Update Progress'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">Select a lesson to begin.</div>
          )}
        </div>

        {/* Sidebar Syllabus Reader Navigation */}
        <div className="w-full lg:w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto shrink-0 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">{course.title}</h2>
            <p className="text-[11px] text-slate-500">Course Syllabus & Quizzes</p>
          </div>

          <div className="space-y-4">
            {course.modules && course.modules.map((mod, mIdx) => (
              <div key={mod.id} className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-700 tracking-wider">
                  Module {mIdx + 1}: {mod.title}
                </h3>

                <div className="space-y-1">
                  {mod.lessons && mod.lessons.map((les) => {
                    const isDone = completedLessonIds.has(les.id);
                    const isActive = activeLesson?.id === les.id;

                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLesson(les)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                      </button>
                    );
                  })}

                  {mod.quiz && (
                    <Link
                      to={`/quizzes/${mod.quiz.id}`}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Take Module Quiz</span>
                      </div>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
