import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
interface Question {
  id: number;
  text: string;
  maxMarks: number;
  schema: {
    IU1: string;
    IS1: string;
    IU2: string;
    IS2: string;
  };
}

interface FeedbackResult {
  score: number;
  feedback: string;
  breakdown: {
    IU1: boolean;
    IS1: boolean;
    IU2: boolean;
    IS2: boolean;
    hasGrammarError: boolean;
  };
}

type ViewMode = 'landing' | 'grading';

interface AppState {
  view: ViewMode;
  answers: Record<number, string>;
  results: Record<number, FeedbackResult | null>;
  loading: Record<number, boolean>;
}

// --- Constants ---
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Masyarakat masih kurang peduli terhadap peranan mereka untuk mencegah penderaan kanak-kanak. Huraikan.",
    maxMarks: 6,
    schema: {
      IU1: "Ramai yang beranggapan bahawa penderaan kanak-kanak berpunca daripada sikap ibu bapa yang tidak bertanggungjawab. (2m)",
      IS1: "sedangkan anak-anak merupakan anugerah dan amanah yang perlu dijaga dengan baik. (1m)",
      IU2: "Masyarakat juga menuding pemerintah sebagai pihak yang tidak proaktif dalam memastikan kanak-kanak selamat dan terbela nasibnya. (2m)",
      IS2: "Pihak berkuasa turut digesa supaya menggerakkan langkah-langkah yang berkesan bagi menangani masalah penderaan kanak-kanak. (1m)"
    }
  },
  {
    id: 2,
    text: "Cara kehidupan masyarakat zaman ini mendedahkan kanak-kanak pada persekitaran yang kurang selamat. Jelaskan sebab-sebabnya.",
    maxMarks: 6,
    schema: {
      IU1: "Suasana perumahan zaman ini tidak mesra seperti dahulu yang mana kanak-kanak bebas bermain dengan aman dan terlindung di rumah jiran kerana pintu-pintu rumah sentiasa terbuka luas. (2m)",
      IS1: "Hubungan antara jiran tetangga yang tidak mesra dan tiadanya rasa kekeluargaan menjadikan jiran-jiran tidak peka dengan kemaslahatan semua dan tidak menjaga anak-anak jiran seperti anak mereka sendiri. (1m)",
      IU2: "Masyarakat hari ini hanya memberikan tumpuan pada kehidupan sendiri dan tidak mahu mengambil tahu hal orang lain. (2m)",
      IS2: "Disebabkan itu, mereka tidak mengambil inisiatif untuk mencari maklumat lanjut dan bertindak biarpun wujud kecurigaan yang melibatkan keselamatan seseorang. (1m)"
    }
  },
  {
    id: 3,
    text: "Bagaimanakah penderaan terhadap kanak-kanak menjejaskan hubungan mereka dengan orang lain?",
    maxMarks: 6,
    schema: {
      IU1: "Kanak-kanak yang melalui penderaan berasa sukar membina kepercayaan diri, bergaul dan berinteraksi. (2m)",
      IS1: "Hal ini adalah kerana, apabila seseorang itu melalui kejadian traumatik seperti penderaan, seluruh tubuh mereka akan mengingati kejadian tersebut dan ingatan ini mengakibatkan kegelisahan. (1m)",
      IU2: "Mereka juga berasa tidak selesa untuk berkongsi dengan sesiapa pun tentang apa yang berlaku sehingga menimbulkan ketegangan hubungan dengan pihak yang menginginkan kejelasan tentang hal yang berlaku. (2m)",
      IS2: "Hal ini adalah kerana, apabila tubuh mereka mengingati kesan kejadian penderaan, mereka sukar mengawal perasaan. (1m)"
    }
  },
  {
    id: 4,
    text: "Proses pemulihan trauma memerlukan usaha keluarga dan masyarakat. Huraikan.",
    maxMarks: 6,
    schema: {
      IU1: "Masyarakat harus bersabar dan memberikan masa yang panjang kepada kanak-kanak mangsa penderaan untuk pulih. (2m)",
      IS1: "Kita juga tidak harus meremehkan apa yang dikongsi oleh kanak-kanak ini kerana ia merupakan pengalaman pahit yang tidak mungkin dapat dilupakan. (1m)",
      IU2: "Ahli keluarga boleh membantu membina keyakinan diri mangsa kanak-kanak dengan menitipkan kata-kata pembakar semangat. (2m)",
      IS2: "Seandainya terlihat perubahan yang ketara dari segi perubahan fizikal, emosi atau mental, keluarga harus mengambil berat dan bertanyakan khabar agar campur tangan awal dapat digerakkan. (1m)"
    }
  }
];

const SYSTEM_INSTRUCTION = `
You are an expert Malay language teacher and official grader for H2MLL exams.
Your task is to grade student answers based strictly on the provided marking scheme (Skema Jawapan).

STRICT MARKING RULES:
1. Maximum marks for any question is 6.
2. The marking is divided into two clusters:
   - Cluster 1: IU1 (2 marks) and IS1 (1 mark). Total = 3 marks.
   - Cluster 2: IU2 (2 marks) and IS2 (1 mark). Total = 3 marks.
3. PAIRING RULE (CRITICAL): To award marks for a cluster, BOTH the Idea Utama (IU) and the Idea Sampingan (IS) must be present and linked correctly.
   - If IU1 is present but IS1 is missing: Score for Cluster 1 is 0.
   - If IS1 is present but IU1 is missing: Score for Cluster 1 is 0.
   - If IU1 and IS1 are both present: Score for Cluster 1 is 3.
   - Apply the same logic to Cluster 2 (IU2 and IS2).
4. GRAMMAR RULE: If the answer contains ANY spelling, grammatical, or punctuation errors, subtract 1 mark from the TOTAL score.
5. EXPLANATION: Provide your feedback in professional Malay. Explain which ideas were missing or why marks were deducted.

Return only a JSON response.
`;

// --- Components ---

const Badge: React.FC<{ label: string; active: boolean; negative?: boolean }> = ({ label, active, negative }) => {
  if (negative) {
    return (
      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border transition-all ${
        active 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
        <span>{active ? 'TATABAHASA TEPAT' : 'ADA RALAT TATABAHASA (-1)'}</span>
      </div>
    );
  }

  return (
    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border transition-all ${
      active 
        ? 'bg-blue-50 border-blue-200 text-blue-700' 
        : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
    }`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
      <span>{label}: {active ? 'ADA' : 'TIADA'}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    answers: { 1: "", 2: "", 3: "", 4: "" },
    results: { 1: null, 2: null, 3: null, 4: null },
    loading: { 1: false, 2: false, 3: false, 4: false }
  });

  const handleInputChange = (id: number, value: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: value }
    }));
  };

  const handleGrade = async (id: number) => {
    const question = QUESTIONS.find(q => q.id === id);
    if (!question || !state.answers[id].trim()) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, [id]: true } }));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const prompt = `
        Question: ${question.text}
        
        Marking Scheme:
        IU1: ${question.schema.IU1}
        IS1: ${question.schema.IS1}
        IU2: ${question.schema.IU2}
        IS2: ${question.schema.IS2}

        Student's Answer to grade: "${state.answers[id]}"
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  IU1: { type: Type.BOOLEAN },
                  IS1: { type: Type.BOOLEAN },
                  IU2: { type: Type.BOOLEAN },
                  IS2: { type: Type.BOOLEAN },
                  hasGrammarError: { type: Type.BOOLEAN }
                },
                required: ["IU1", "IS1", "IU2", "IS2", "hasGrammarError"]
              }
            },
            required: ["score", "feedback", "breakdown"]
          }
        }
      });

      const result = JSON.parse(response.text.trim());
      setState(prev => ({
        ...prev,
        results: { ...prev.results, [id]: result },
        loading: { ...prev.loading, [id]: false }
      }));
    } catch (error) {
      console.error("Grading error:", error);
      setState(prev => ({
        ...prev,
        results: { 
          ...prev.results, 
          [id]: { 
            score: 0, 
            feedback: "Maaf, sistem sedang sibuk. Sila cuba lagi.", 
            breakdown: { IU1: false, IS1: false, IU2: false, IS2: false, hasGrammarError: true } 
          } 
        },
        loading: { ...prev.loading, [id]: false }
      }));
    }
  };

  const totalScore = Object.values(state.results).reduce((acc, curr) => acc + (curr?.score || 0), 0);
  const totalPossible = QUESTIONS.length * 6;

  if (state.view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="inline-block p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-200/50 mb-4">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">MI Feedback <span className="text-blue-600">Assistant</span></h1>
            <p className="text-lg text-slate-500 font-medium">Penandaan Automatik untuk Subjek H2MLL</p>
          </div>
          <button 
            onClick={() => setState(s => ({ ...s, view: 'grading' }))}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 group"
          >
            <span>MULAKAN PENANDAAN</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-10">Millenia Institute &copy; 2025</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 selection:bg-blue-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setState(s => ({ ...s, view: 'landing' }))}>
            <div className="bg-slate-900 p-1.5 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight uppercase">MI Assistant</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
              <span className="text-sm font-black text-slate-900">{Object.values(state.results).filter(Boolean).length} / {QUESTIONS.length}</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-baseline space-x-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-sm font-black text-blue-600">{totalScore} / {totalPossible}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/40">
            <div className="p-10 border-b border-slate-100 bg-slate-50/20">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest">SOALAN {q.id}</span>
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">6 MARKAH</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 leading-snug">{q.text}</h2>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Jawapan Pelajar</label>
                <textarea 
                  className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none resize-none font-medium text-slate-700 leading-relaxed shadow-inner"
                  placeholder="Masukkan jawapan pelajar di sini..."
                  value={state.answers[q.id]}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  disabled={state.loading[q.id]}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={() => handleGrade(q.id)}
                  disabled={state.loading[q.id] || !state.answers[q.id].trim()}
                  className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    state.loading[q.id] || !state.answers[q.id].trim()
                    ? 'bg-slate-100 text-slate-300'
                    : 'bg-blue-600 text-white hover:bg-slate-900 shadow-lg shadow-blue-100'
                  }`}
                >
                  {state.loading[q.id] ? (
                    <span className="flex items-center space-x-3">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Menilai...</span>
                    </span>
                  ) : 'SEMAK JAWAPAN'}
                </button>

                {state.results[q.id] && (
                  <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markah</span>
                    <span className={`text-2xl font-black ${state.results[q.id]!.score > 3 ? 'text-blue-600' : 'text-slate-900'}`}>{state.results[q.id]!.score}</span>
                    <span className="text-slate-300 font-bold">/ 6</span>
                  </div>
                )}
              </div>

              {state.results[q.id] && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge label="IU 1" active={state.results[q.id]!.breakdown.IU1} />
                    <Badge label="IS 1" active={state.results[q.id]!.breakdown.IS1} />
                    <Badge label="IU 2" active={state.results[q.id]!.breakdown.IU2} />
                    <Badge label="IS 2" active={state.results[q.id]!.breakdown.IS2} />
                    <Badge label="Grammar" active={!state.results[q.id]!.breakdown.hasGrammarError} negative />
                  </div>
                  <div className="p-8 bg-blue-50/40 border border-blue-100 rounded-2xl relative">
                    <div className="absolute top-4 right-4 text-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Analisis Guru:</h4>
                    <p className="text-slate-700 font-bold text-lg leading-relaxed italic relative z-10">
                      {state.results[q.id]!.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-10 h-1 bg-slate-200 mx-auto rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Millenia Institute H2MLL Suite &copy; 2025</p>
      </footer>
    </div>
  );
};

// --- Entry Point ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
