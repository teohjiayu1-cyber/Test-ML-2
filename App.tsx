
import React, { useState, useEffect } from 'react';
import { QUESTIONS } from './constants';
import { AppState, FeedbackResult } from './types';
import { gradeAnswer } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
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
      answers: { 1: "", 2: "", 3: "", 4: "" },
      results: { 1: null, 2: null, 3: null, 4: null },
      loading: { 1: false, 2: false, 3: false, 4: false }
    });
  };

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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback Assistant</h1>
            <p className="text-slate-500 text-sm">H2MLL Skema Jawapan & Grading Tool</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowEmbedModal(true)}
              className="text-sm px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors text-slate-700 font-medium flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Embed</span>
            </button>
            <button 
              onClick={resetAll}
              className="text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 font-medium"
            >
              Reset All
            </button>
          </div>
        </div>
      </header>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Embed this Assistant</h3>
              <button onClick={() => setShowEmbedModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Copy the code below to embed this tool into your website or LMS.</p>
              <div className="relative group">
                <pre className="bg-slate-900 text-blue-100 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed select-all">
                  {embedCode}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong>Pro Tip:</strong> You can adjust the <code>height</code> and <code>width</code> properties in the code above to better fit your page layout.
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 text-right">
              <button 
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-blue-900 font-bold text-lg mb-2">Sistem Pemarkahan (Marking Scheme)</h2>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Markah penuh bagi setiap soalan adalah 6m.</li>
            <li>IU (Isi Utama) = 2m, IS (Isi Sokongan) = 1m.</li>
            <li>Setiap poin lengkap (IU + IS) akan diberikan markah. Jika salah satu tiada, 0 markah diberikan.</li>
            <li>Penolakan 1m secara keseluruhan jika terdapat ralat tatabahasa/ejaan.</li>
          </ul>
        </section>

        {QUESTIONS.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Question {q.id}</span>
                <span className="text-slate-400 font-medium text-sm">Max Marks: {q.maxMarks}m</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-800 leading-snug">
                {q.text}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student's Answer:</label>
                <textarea
                  className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-slate-700 leading-relaxed"
                  placeholder={`Mula menulis jawapan untuk soalan ${q.id} di sini...`}
                  value={state.answers[q.id]}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  disabled={state.loading[q.id]}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleGrade(q.id)}
                  disabled={state.loading[q.id] || !state.answers[q.id].trim()}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${
                    state.loading[q.id] || !state.answers[q.id].trim()
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  {state.loading[q.id] ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </span>
                  ) : 'Generate Feedback'}
                </button>
              </div>

              {state.results[q.id] && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className={`rounded-xl border p-6 ${state.results[q.id]!.score > 3 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Grading Summary</h4>
                      <div className="text-2xl font-black text-slate-900">
                        <span className={state.results[q.id]!.score > 3 ? 'text-green-600' : 'text-orange-600'}>
                          {state.results[q.id]!.score}
                        </span>
                        <span className="text-slate-400">/6m</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge label="IU 1" active={state.results[q.id]!.breakdown.IU1} />
                        <Badge label="IS 1" active={state.results[q.id]!.breakdown.IS1} />
                        <Badge label="IU 2" active={state.results[q.id]!.breakdown.IU2} />
                        <Badge label="IS 2" active={state.results[q.id]!.breakdown.IS2} />
                        <Badge label="Grammar Error" active={!state.results[q.id]!.breakdown.hasGrammarError} negative />
                      </div>

                      <div className="prose prose-sm text-slate-700 bg-white/60 p-4 rounded-lg border border-slate-100">
                        <p className="font-medium whitespace-pre-line leading-relaxed">
                          {state.results[q.id]!.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
      
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-400 text-xs border-t border-slate-200">
        &copy; {new Date().getFullYear()} Millenia Institute / PU3 End-of-Year Exams / H2MLL. All rights reserved.
      </footer>
    </div>
  );
};

const Badge: React.FC<{ label: string; active: boolean; negative?: boolean }> = ({ label, active, negative }) => {
  if (negative) {
    // If it's a negative check (grammar error), 'active' means NO ERROR
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
        active 
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
          : 'bg-red-100 text-red-700 border border-red-200'
      }`}>
        {active ? 'No Grammar Errors' : 'Grammar Errors Found'}
      </span>
    );
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
      active 
        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
        : 'bg-slate-200 text-slate-500 border border-slate-300'
    }`}>
      {label}: {active ? 'PRESENT' : 'MISSING'}
    </span>
  );
};

export default App;
