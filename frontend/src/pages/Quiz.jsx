import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Award, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (res.success) {
          setQuiz(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleSelectOption = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers });
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">Loading module quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">Quiz not found.</div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
          <div className={`bg-white p-8 rounded-3xl border text-center space-y-4 shadow-sm ${
            result.passed ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
          }`}>
            <div className="text-3xl font-black gradient-text">
              {result.score_percentage}%
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {result.passed ? 'Quiz Passed!' : 'Quiz Attempt Completed'}
            </h1>
            <p className="text-xs text-slate-500">
              Score: {result.correct_count} / {result.total_questions} Correct • Calculated Level: <span className="font-bold text-indigo-600">{result.calculated_level}</span>
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
            >
              Continue to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Module Quiz</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">{quiz.title}</h1>
          <p className="text-xs text-slate-500">Course: {quiz.course_title} • Pass Threshold: {quiz.pass_threshold}%</p>
        </div>

        <div className="space-y-6">
          {quiz.questions && quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-indigo-600">Question {idx + 1}</span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{q.question_text}</h3>

              <div className="space-y-2">
                {q.options && q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`w-full p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-950 border-indigo-400 font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      {opt.option_text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
          >
            {submitting ? 'Evaluating Quiz...' : 'Submit Quiz & Recalculate Recommendation Engine'}
          </button>
        </div>
      </main>
    </div>
  );
}
