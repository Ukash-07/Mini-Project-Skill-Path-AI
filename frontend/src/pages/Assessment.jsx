import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { ClipboardCheck, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Assessment() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`/assessments/${id || 1}`);
        if (res.success) {
          setAssessment(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/${assessment.id}/submit`, { answers });
      if (res.success) {
        setResultData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          Loading assessment questions...
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">
          Assessment not found.
        </div>
      </div>
    );
  }

  // Render Result Screen after Submission
  if (resultData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto text-2xl font-black">
              {resultData.percentage}%
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">Assessment Result Breakdown</h1>
            <p className="text-xs text-slate-500">
              Raw Score: {resultData.score_raw} / {resultData.total_marks} Marks • Calculated Skill Level:{' '}
              <span className="font-bold text-indigo-600">{resultData.calculated_level}</span>
            </p>

            {resultData.weak_topics && resultData.weak_topics.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs max-w-md mx-auto">
                <span className="font-bold block mb-1">Identified Weak Topics:</span>
                <span>{resultData.weak_topics.join(', ')} — Engine has updated your learning roadmap with targeted revision material.</span>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
            >
              Return to Student Dashboard
            </button>
          </div>

          {/* Question Review & Explanations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Question Review & Explanations</h3>
            <div className="space-y-4">
              {resultData.question_results.map((q, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">Question {idx + 1} ({q.skill_name})</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold ${q.is_correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {q.is_correct ? 'Correct (+10 Marks)' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{q.question_text}</p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p><span className="font-bold text-indigo-700">Explanation: </span>{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Assessment Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ClipboardCheck className="w-4 h-4" />
              <span>Skill Benchmark Assessment</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{assessment.title}</h1>
            <p className="text-xs text-slate-500">{assessment.questions ? assessment.questions.length : 0} Questions • Duration: {assessment.duration_minutes} Mins</p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Time Left: 20:00</span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {assessment.questions && assessment.questions.map((q, qIdx) => (
            <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-600">Question {qIdx + 1} of {assessment.questions.length}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold">{q.difficulty} • {q.marks} Marks</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{q.question_text}</h3>

              <div className="space-y-2">
                {q.options && q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionSelect(q.id, opt.id)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-950 border-indigo-400 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
          >
            {submitting ? 'Submitting Answers...' : 'Submit Assessment & Recalculate Skill Level'}
          </button>
        </div>
      </main>
    </div>
  );
}
