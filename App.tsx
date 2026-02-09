import React, { useState, useEffect } from 'react';
import { QUESTIONS } from './constants';
import { AppState, FeedbackResult, ViewMode } from './types';
import { gradeAnswer } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    answers: { 1: "", 2: "", 3: "", 4: "" },
    results: { 1: null, 2: null, 3: null, 4: null },
    loading: { 1: false, 2: false, 3: false, 4: false }
  });

  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.href);
  }, []);

  const handleInputChange = (id: number, value: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: value }
    }));
  };

  const handleGrade = async (id: number) => {
    const question = QUESTIONS.find(q => q.id === id);
    if (!question) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, [id]: true } }));
    
    const result = await gradeAnswer(question.text, state.answers[id], question.schema);
    
    setState(prev => ({
      ...prev,
      results: { ...prev.results, [id]: result },
      loading: { ...prev.loading, [id]: false }
    }));
  };

  const resetAll = () => {
    setState({
      view: 'landing',
      answers: { 1: "", 2: "", 3: "", 4: "" },
      results: { 1: null, 2: null, 3: null, 4: null },
      loading: { 1: false, 2: false, 3: false, 4: false }
    });
  };

  const totalScore = Object.values(state.results).reduce((acc, curr) => acc + (curr?.score || 0), 0);
  const totalPossible = QUESTIONS.reduce((acc, curr) => acc + curr.maxMarks, 0);

  const embedCode = `<iframe 
  src="${appUrl}" 
  width="100%" 
  height="800px" 
  frameborder="0" 
  style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state.view === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-5 rounded-[2rem] shadow-2xl shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tight text-slate-900">
              MI Feedback <span className="text-blue-600">Assistant</span>
            </h1>
            <p className="text-2xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
              Automated grading and personalized feedback for H2MLL exams.
            </p>
          </div>
          <div className="pt-8">
            <button 
              onClick={() => setState(s => ({ ...s, view: 'grading' }))}
              className="group px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 flex items-center space-x-4 mx-auto"
            >
              <span>MULAKAN PENANDAAN</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="pt-12 flex items-center justify-center space-x-8 text-slate-400 font-bold text-xs tracking-widest uppercase">
             <span>H2MLL 2025</span>
             <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
             <span>MILLENIA INSTITUTE</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setState(s => ({ ...s, view: 'landing' }))}>
             <div className="bg-slate-900 group-hover:bg-blue-600 p-2 rounded-xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
             </div>
             <div>
                <h1 className="text-base font-black text-slate-900 leading-none">Feedback Assistant</h1>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">MI H2MLL GRADING</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase mr-3">Progress</span>
              <span className="text-sm font-black text-slate-900">
                {Object.values(state.results).filter(Boolean).length} / {QUESTIONS.length}
              </span>
            </div>
            <button 
              onClick={() => setShowEmbedModal(true)}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={resetAll}
              className="px-4 py-2 text-xs font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all uppercase tracking-widest border border-red-100"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Embed Assistant</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">Use this tool in your LMS or website.</p>
              <div className="relative">
                <textarea 
                  readOnly 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[10px] font-mono leading-relaxed h-32 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={embedCode}
                />
                <button 
                  onClick={copyToClipboard}
                  className={`absolute bottom-3 right-3 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  {copied ? 'COPIED!' : 'COPY CODE'}
                </button>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 flex justify-end">
              <button onClick={() => setShowEmbedModal(false)} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Total Score Card */}
        {Object.values(state.results).some(Boolean) && (
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 animate-in slide-in-from-top-10 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <div>
                <h2 className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-3">Prestasi Keseluruhan</h2>
                <h3 className="text-4xl font-black leading-tight">Keputusan Penandaan <br/><span className="text-blue-400">H2MLL Pelajar</span></h3>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 min-w-[200px]">
                <div className="text-sm font-black text-blue-300 uppercase tracking-widest mb-1 text-center">Jumlah Markah</div>
                <div className="text-7xl font-black tracking-tighter text-center">
                  {totalScore}<span className="text-blue-400/50 text-3xl font-medium tracking-normal ml-1">/{totalPossible}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {QUESTIONS.map((q) => (
          <div key={q.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/50">
            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">QUESTION {q.id}</span>
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">{q.maxMarks} MARKS MAX</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 leading-[1.3] max-w-3xl">
                {q.text}
              </h3>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Response</label>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">{state.answers[q.id].length} chars</span>
                </div>
                <textarea
                  className="w-full h-48 p-8 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none resize-none text-slate-700 leading-relaxed text-base font-medium bg-slate-50/20 shadow-inner"
                  placeholder={`Mula menaip jawapan pelajar di sini...`}
                  value={state.answers[q.id]}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  disabled={state.loading[q.id]}
                />
              </div>

              <div className="flex items-center justify-between gap-6">
                <button
                  onClick={() => handleGrade(q.id)}
                  disabled={state.loading[q.id] || !state.answers[q.id].trim()}
                  className={`flex-1 md:flex-none px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl ${
                    state.loading[q.id] || !state.answers[q.id].trim()
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 text-white hover:bg-slate-900 shadow-blue-100 hover:shadow-slate-200'
                  }`}
                >
                  {state.loading[q.id] ? (
                    <span className="flex items-center justify-center space-x-4">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>ANALYZING...</span>
                    </span>
                  ) : 'GRADE RESPONSE'}
                </button>

                {state.results[q.id] && (
                  <div className="flex items-center space-x-2 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</span>
                    <span className={`text-3xl font-black ${state.results[q.id]!.score > 3 ? 'text-green-600' : 'text-orange-600'}`}>
                      {state.results[q.id]!.score}
                    </span>
                    <span className="text-slate-300 text-lg">/6</span>
                  </div>
                )}
              </div>

              {state.results[q.id] && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500 pt-4 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge label="IU 1" active={state.results[q.id]!.breakdown.IU1} />
                    <Badge label="IS 1" active={state.results[q.id]!.breakdown.IS1} />
                    <Badge label="IU 2" active={state.results[q.id]!.breakdown.IU2} />
                    <Badge label="IS 2" active={state.results[q.id]!.breakdown.IS2} />
                    <Badge label="Grammar" active={!state.results[q.id]!.breakdown.hasGrammarError} negative />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                       </svg>
                    </div>
                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Maklum Balas Terperinci:</h5>
                    <div className="prose prose-slate prose-sm max-w-none">
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed font-bold italic text-lg">
                        {state.results[q.id]!.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
      
      <footer className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-1 bg-slate-200 mx-auto mb-8 rounded-full"></div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} MI H2MLL Grading Suite v2.0
        </p>
      </footer>
    </div>
  );
};

const Badge: React.FC<{ label: string; active: boolean; negative?: boolean }> = ({ label, active, negative }) => {
  if (negative) {
    return (
      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
        active 
          ? 'bg-emerald-500 text-white shadow-emerald-100' 
          : 'bg-red-500 text-white shadow-red-100'
      }`}>
        {active ? 'TATABAHASA TEPAT' : 'ADA RALAT TATABAHASA'}
      </span>
    );
  }

  return (
    <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
      active 
        ? 'bg-blue-600 text-white shadow-blue-100' 
        : 'bg-slate-200 text-slate-500 shadow-slate-100'
    }`}>
      {label}: {active ? 'ADA' : 'TIADA'}
    </span>
  );
};

export default App;