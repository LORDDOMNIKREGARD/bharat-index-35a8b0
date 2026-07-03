import { useState } from 'react'
import stateData from '../state_data.json'
import { STATE_DETAILS } from './data/stateDetails'
import { HeaderBlock } from './components/HeaderBlock'
import { Controls } from './components/Controls'
import { InstPanel } from './components/InstPanel'
import { NewsTicker } from './components/NewsTicker'
import { useNewsTicker } from './hooks/useNewsTicker'
import { useStateFilter } from './hooks/useStateFilter'
import { fmtGsdp, stateId } from './utils'
import type { StateRecord } from './types'

const STUDY_GUIDES = [
  {
    title: "THE LEDGER ROOM",
    desc: "200 Commerce & Business Prep Questions",
    path: "/ledger-room.html",
    type: "ledger"
  },
  {
    title: "STATISTICS MASTER REFERENCE",
    desc: "Formulas, Distributions & Deep Probability",
    path: "/Statistics_Master_Reference.html",
    type: "stats-master"
  },
  {
    title: "FINANCE BIBLE IPM",
    desc: "Markets, Corporate Valuation & Core Banking",
    path: "/finance_bible_ipm.html",
    type: "finance"
  },
  {
    title: "GEOGRAPHY QUESTIONS IPM",
    desc: "Indian Physiography, Rivers & Map Points",
    path: "/geography_questions_ipm.html",
    type: "geography"
  },
  {
    title: "INDIA GOVT SCHEMES STATEWISE",
    desc: "National and Regional Welfare Frameworks",
    path: "/india_govt_schemes_statewise.html",
    type: "schemes"
  },
  {
    title: "IPM MATH GRAPHS",
    desc: "Visual Coordinate Geometry & Function Analysis",
    path: "/ipm_math_graphs.html",
    type: "math-graphs"
  },
  {
    title: "MOCKTOPUS CURRENT AFFAIRS",
    desc: "Current Affairs & General Awareness Compendium",
    path: "/mocktopus_current_affairs.html",
    type: "current-affairs"
  },
  {
    title: "PCM INTERVIEW QUESTIONS",
    desc: "Core Concepts in Physics, Chemistry & Math",
    path: "/pcm_interview_questions.html",
    type: "pcm"
  },
  {
    title: "STATS IPM GUIDE",
    desc: "Fundamental Stats & Probability Concepts",
    path: "/stats_ipm_guide.html",
    type: "stats-intro"
  },
  {
    title: "INDIA GK INTERVIEW PREP",
    desc: "General Knowledge, History & Polity for IPM",
    path: "/India_GK_IPM_Interview_Prep.html",
    type: "gk"
  }
];

function getStateInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Phosphor Terminal SVG Graphic representations
function StudyGuideGraphic({ type }: { type: string }) {
  switch (type) {
    case 'math-graphs':
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          <defs>
            <pattern id="grid-phosphor" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#252522" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-phosphor)" />
          {/* Axis */}
          <line x1="20" y1="60" x2="280" y2="60" stroke="#3a3a3a" strokeWidth="1" />
          <line x1="150" y1="10" x2="150" y2="110" stroke="#3a3a3a" strokeWidth="1" />
          {/* Curves */}
          <path d="M 20 60 Q 85 -10, 150 60 T 280 60" fill="none" stroke="#faff69" strokeWidth="2" />
          <path d="M 60 10 Q 150 140, 240 10" fill="none" stroke="#a0a0a0" strokeWidth="1" strokeDasharray="3 3" />
          <text x="25" y="25" fill="#faff69" fontSize="8" fontFamily="monospace">f(x)=sin(x)</text>
        </svg>
      );
    case 'stats-master':
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          <path d="M 30 100 C 100 100, 110 20, 150 20 C 190 20, 200 100, 270 100" fill="none" stroke="#faff69" strokeWidth="2.5" />
          <line x1="150" y1="20" x2="150" y2="100" stroke="#3a3a3a" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="20" r="3" fill="#faff69" />
          <text x="160" y="25" fill="#a0a0a0" fontSize="8" fontFamily="monospace">μ (MEAN)</text>
        </svg>
      );
    case 'finance':
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          <line x1="0" y1="30" x2="300" y2="30" stroke="#1f1f1c" strokeWidth="1" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#1f1f1c" strokeWidth="1" />
          <line x1="0" y1="90" x2="300" y2="90" stroke="#1f1f1c" strokeWidth="1" />
          <path d="M 20 100 L 80 80 L 140 85 L 200 45 L 260 25" fill="none" stroke="#faff69" strokeWidth="2" />
          <circle cx="260" cy="25" r="4" fill="#fbff46" />
        </svg>
      );
    case 'geography':
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          {/* Abstract map outline */}
          <path d="M150 20 L180 50 L160 80 L150 110 L140 80 L120 50 Z" fill="none" stroke="#faff69" strokeWidth="1.5" />
          <line x1="150" y1="10" x2="150" y2="110" stroke="#282828" strokeWidth="1" />
          <line x1="100" y1="60" x2="200" y2="60" stroke="#282828" strokeWidth="1" />
          <text x="160" y="100" fill="#a0a0a0" fontSize="8" fontFamily="monospace">22.9° N / 78.6° E</text>
        </svg>
      );
    case 'schemes':
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          {/* Node graph */}
          <circle cx="150" cy="60" r="10" fill="none" stroke="#faff69" strokeWidth="2" />
          <line x1="150" y1="60" x2="80" y2="30" stroke="#3a3a3a" strokeWidth="1.5" />
          <line x1="150" y1="60" x2="220" y2="30" stroke="#3a3a3a" strokeWidth="1.5" />
          <line x1="150" y1="60" x2="150" y2="100" stroke="#3a3a3a" strokeWidth="1.5" />
          <circle cx="80" cy="30" r="6" fill="#faff69" />
          <circle cx="220" cy="30" r="6" fill="#faff69" />
          <circle cx="150" cy="100" r="6" fill="#faff69" />
        </svg>
      );
    case 'ledger':
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          <line x1="20" y1="0" x2="20" y2="120" stroke="#1f1f1c" />
          <line x1="150" y1="0" x2="150" y2="120" stroke="#282828" />
          <line x1="0" y1="30" x2="300" y2="30" stroke="#282828" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#1f1f1c" />
          <line x1="0" y1="90" x2="300" y2="90" stroke="#1f1f1c" />
          <text x="30" y="20" fill="#faff69" fontSize="9" fontFamily="monospace">DEBIT_REG</text>
          <text x="160" y="20" fill="#dfdfdf" fontSize="9" fontFamily="monospace">CREDIT_REG</text>
        </svg>
      );
    default:
      return (
        <svg className="w-full h-full bg-[#151515]" viewBox="0 0 300 120">
          <circle cx="150" cy="60" r="25" fill="none" stroke="#faff69" strokeWidth="1.5" />
          <line x1="120" y1="60" x2="180" y2="60" stroke="#a0a0a0" strokeWidth="1" />
          <text x="138" y="64" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">GK</text>
        </svg>
      );
  }
}

// Phosphor terminal state representation
function StateGraphic({ state, maxGsdpVal }: { state: StateRecord; maxGsdpVal: number }) {
  const gsdp = state.economic_metrics.gsdp_crore_inr || 0;
  const ratio = maxGsdpVal > 0 ? (gsdp / maxGsdpVal) * 100 : 0;
  
  const sexRatioVal = state.demographics.sex_ratio_females_per_1000_males;
  const sexRatioPct = Math.min(Math.max((sexRatioVal - 800) / 400, 0), 1) * 100;
  const initials = getStateInitials(state.state);

  return (
    <div className="relative w-full h-[150px] bg-carbon border border-iron p-5 flex flex-col justify-between select-none">
      {/* Background Watermark Initials */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[110px] font-bold text-[#222220] leading-none tracking-tighter">
          {initials}
        </span>
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <span className="text-[12px] font-semibold tracking-wider text-smoke block font-mono">GSDP_VAL</span>
          <div className="text-[18px] font-bold text-pure-white font-basier">{fmtGsdp(gsdp)} Cr</div>
        </div>
        <div className="text-right">
          <span className="text-[12px] font-semibold tracking-wider text-smoke block font-mono">INFLATION_YOY</span>
          <div className="text-[18px] font-bold text-electric-lime font-basier">{state.economic_metrics.inflation_yoy_percent}%</div>
        </div>
      </div>

      <div className="relative z-10 space-y-3 mt-auto">
        {/* Relative GSDP progress bar */}
        <div>
          <div className="flex justify-between text-[11px] font-medium text-smoke mb-1 font-mono">
            <span>INDEX_ALLOC</span>
            <span>{ratio.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-void-black border border-iron rounded overflow-hidden">
            <div
              className="h-full bg-electric-lime"
              style={{ width: `${Math.max(ratio, 4)}%` }}
            />
          </div>
        </div>

        {/* Sex ratio / Seats row */}
        <div className="flex justify-between items-center text-[12px] font-mono">
          <div className="flex-1 max-w-[150px]">
            <div className="h-1.5 w-full bg-void-black border border-iron rounded">
              <div
                className="h-full bg-electric-lime"
                style={{ width: `${sexRatioPct}%` }}
              />
            </div>
          </div>
          <div className="text-right text-smoke">
            <span>LS_SEATS: {state.parliamentary_metrics.lok_sabha_seats}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'guides' | 'states'>('all');
  const showGuides = activeTab === 'all' || activeTab === 'guides';
  const showStates = activeTab === 'all' || activeTab === 'states';
  
  const { items: newsItems, loading: newsLoading, status: newsStatus, refresh: newsRefresh } = useNewsTicker();
  const allStates = (stateData.states || []) as StateRecord[];
  
  const {
    filtered,
    filterMode,
    setFilterMode,
    searchQ,
    setSearchQ,
    expanded,
    toggleExpand,
    handleSortSelect
  } = useStateFilter(allStates);

  const maxGsdpVal = Math.max(...allStates.map(s => s.economic_metrics.gsdp_crore_inr || 0));

  return (
    <div className="bg-void-black min-h-screen font-inter text-paper flex flex-col selection:bg-electric-lime selection:text-void-black">
      
      {/* Top sticky navigation bar */}
      <nav className="sticky top-0 z-50 bg-void-black border-b border-iron px-6 py-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Cursor logo accent */}
          <span className="text-electric-lime font-mono font-bold text-[18px] animate-pulse-dot">
            &gt;_
          </span>
          <span className="text-[18px] font-bold text-pure-white tracking-tight font-basier">
            BHARAT <span className="text-electric-lime">INDEX</span>
          </span>
        </div>
        
        {/* Module navigators */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-bold uppercase tracking-wider text-smoke">
          <button
            onClick={() => setActiveTab('all')}
            className={`hover:text-pure-white transition-colors ${activeTab === 'all' ? 'text-electric-lime' : ''}`}
          >
            [00] Command Center
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`hover:text-pure-white transition-colors ${activeTab === 'guides' ? 'text-electric-lime' : ''}`}
          >
            [01] Study Guides
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`hover:text-pure-white transition-colors ${activeTab === 'states' ? 'text-electric-lime' : ''}`}
          >
            [02] State Directory
          </button>
        </div>
        
        <div>
          <a
            href="#explore"
            className="border border-iron text-paper hover:bg-graphite hover:border-steel transition-colors text-[13px] font-bold rounded-lg px-4 py-2"
          >
            Terminal Roster
          </a>
        </div>
      </nav>

      {/* Auto-refreshing news ticker */}
      <NewsTicker items={newsItems} loading={newsLoading} onRefresh={newsRefresh} />

      {/* Main content body */}
      <main className="w-full max-w-[1200px] mx-auto px-6 flex-1 flex flex-col pb-20">
        
        {/* Hero Section */}
        <HeaderBlock />

        {/* National intelligence summary panel */}
        <InstPanel cabinet={stateData.cabinet} />

        {/* Data sources strip */}
        <section className="py-12 border-t border-b border-iron mt-12 select-none flex flex-col items-center">
          <span className="text-[12px] font-semibold text-electric-lime uppercase tracking-[0.1em] mb-6">
            // DATA_SOURCES · PRIMARY REFERENCE AUTHORITIES
          </span>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[16px] font-bold text-smoke tracking-[3px] uppercase">
            <span>niti aayog</span>
            <span>mospi.gov</span>
            <span>nic.in</span>
            <span>meity.gov</span>
            <span>rbi.org.in</span>
          </div>
        </section>

        {/* Dynamic Interactive Switcher (Command Center) */}
        <section id="explore" className="py-16">
          <div className="mb-8 text-center">
            <span className="text-[12px] font-semibold text-electric-lime tracking-[0.1em] uppercase block mb-2">
              // MODULE CONTROL INTERFACE
            </span>
            <h2 className="text-[36px] font-bold text-pure-white font-basier">
              Choose Data Module
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {/* State directory module card */}
            <div
              onClick={() => setActiveTab('states')}
              className={`bg-carbon border rounded-lg p-8 cursor-pointer hover:border-electric-lime transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
                activeTab === 'states' ? 'border-electric-lime ring-1 ring-electric-lime' : 'border-iron'
              }`}
            >
              <div>
                <div className="text-[12px] font-mono text-smoke mb-2">[MODULE_01]</div>
                <h3 className="text-[24px] font-bold text-pure-white font-basier">State Intelligence Registers</h3>
                <p className="text-[14px] text-bone mt-2 leading-relaxed">
                  Real-time database covering economic GSDP growth, demographics, Lok Sabha representation, and regional rivers for 36 States & UTs.
                </p>
              </div>
              <div className="text-electric-lime font-bold text-[14px] mt-4 flex items-center gap-1.5 font-mono">
                {activeTab === 'states' ? 'MODULE LOADED ✓' : 'LOAD MODULE →'}
              </div>
            </div>

            {/* Reference guides module card */}
            <div
              onClick={() => setActiveTab('guides')}
              className={`bg-carbon border rounded-lg p-8 cursor-pointer hover:border-electric-lime transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
                activeTab === 'guides' ? 'border-electric-lime ring-1 ring-electric-lime' : 'border-iron'
              }`}
            >
              <div>
                <div className="text-[12px] font-mono text-smoke mb-2">[MODULE_02]</div>
                <h3 className="text-[24px] font-bold text-pure-white font-basier">Reference Prep Libraries</h3>
                <p className="text-[14px] text-bone mt-2 leading-relaxed">
                  Inspect static reference bibles, math graphing functions, general knowledge prep sheets, and commerce guides.
                </p>
              </div>
              <div className="text-electric-lime font-bold text-[14px] mt-4 flex items-center gap-1.5 font-mono">
                {activeTab === 'guides' ? 'MODULE LOADED ✓' : 'LOAD MODULE →'}
              </div>
            </div>
          </div>

          {activeTab !== 'all' && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="border border-iron hover:border-steel hover:bg-graphite text-paper px-5 py-2.5 text-[14px] font-bold rounded-lg transition-colors"
              >
                Show All Roster Panels
              </button>
            </div>
          )}
        </section>

        {/* Filter controls — Visible only when state register module is loaded */}
        {showStates && (
          <div className="mb-8">
            <div className="text-[12px] font-mono text-smoke px-6 py-2.5 bg-carbon rounded-t-lg border-t border-x border-iron flex justify-between">
              <span>NEWS_STATUS: {newsStatus}</span>
              <span className="text-electric-lime">POLLING EVERY 60S</span>
            </div>
            <Controls
              searchQ={searchQ}
              onSearchChange={setSearchQ}
              filterMode={filterMode}
              onFilterChange={setFilterMode}
              onSortSelect={handleSortSelect}
              showing={filtered.length}
              total={allStates.length}
            />
          </div>
        )}

        {/* Section 01: REFERENCE LIBRARIES */}
        {showGuides && (
          <section className="mb-12">
            <div className="mb-8 flex flex-col border-b border-iron pb-4">
              <span className="text-[12px] font-semibold text-electric-lime tracking-[0.1em] uppercase mb-1">
                Collection 01
              </span>
              <h2 className="text-[28px] font-bold text-pure-white font-basier">
                Reference Libraries & Curriculum
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STUDY_GUIDES.map((guide) => (
                <div key={guide.path} className="bg-carbon border border-iron rounded-lg p-8 flex flex-col justify-between hover:border-steel transition-colors">
                  <div>
                    {/* SVG Graphic mockup */}
                    <div className="h-[120px] rounded border border-iron overflow-hidden mb-6 bg-void-black">
                      <StudyGuideGraphic type={guide.type} />
                    </div>
                    
                    <h3 className="text-[20px] font-bold text-pure-white font-basier leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-[15px] text-bone mt-2 leading-relaxed">
                      {guide.desc}
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-iron flex justify-between items-center text-[14px]">
                    <span className="text-smoke font-mono font-medium">Static File</span>
                    <a
                      href={guide.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-electric-lime hover:text-lime-glow transition-colors font-bold flex items-center gap-1 font-mono"
                    >
                      Open Guide →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Horizontal separation divider */}
        {showGuides && showStates && <div className="h-[1px] bg-iron my-12" />}

        {/* Section 02: STATE INTELLIGENCE INDEX */}
        {showStates && (
          <section className="flex-1">
            <div className="mb-8 flex flex-col border-b border-iron pb-4">
              <span className="text-[12px] font-semibold text-electric-lime tracking-[0.1em] uppercase mb-1">
                Collection 02
              </span>
              <h2 className="text-[28px] font-bold text-pure-white font-basier">
                State Intelligence Directory
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((state) => {
                const isExpanded = expanded === stateId(state.state);
                const richDetail = STATE_DETAILS[state.state];
                
                return (
                  <div key={state.state} id={stateId(state.state)} className="bg-carbon border border-iron rounded-lg p-8 flex flex-col justify-between hover:border-steel transition-colors">
                    <div>
                      {/* Interactive visual metrics card */}
                      <div className="mb-6">
                        <StateGraphic state={state} maxGsdpVal={maxGsdpVal} />
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[12px] font-semibold text-smoke uppercase tracking-wider font-mono">
                          {state.state.toLowerCase().includes('delhi') ||
                           state.state.toLowerCase().includes('jammu') ||
                           state.state.toLowerCase().includes('ladakh') ||
                           state.state.toLowerCase().includes('lakshadweep') ||
                           state.state.toLowerCase().includes('andaman') ||
                           state.state.toLowerCase().includes('chandigarh') ||
                           state.state.toLowerCase().includes('dadra') ||
                           state.state.toLowerCase().includes('puducherry') ? 'UT_UNIT' : 'STATE_UNIT'}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-electric-lime animate-pulse-dot" />
                      </div>

                      <h3 className="text-[24px] font-bold text-pure-white font-basier leading-none">
                        {state.state.toUpperCase()}
                      </h3>
                      
                      <div className="mt-4 space-y-2 text-[14px] font-mono">
                        <div className="flex justify-between border-b border-iron pb-1.5">
                          <span className="text-smoke">CM:</span>
                          <span className="text-paper font-semibold">{state.chief_minister || 'PRESIDENT_RULE'}</span>
                        </div>
                        <div className="flex justify-between border-b border-iron pb-1.5">
                          <span className="text-smoke">Governor:</span>
                          <span className="text-paper font-semibold">{state.governor}</span>
                        </div>
                        <div className="flex justify-between border-b border-iron pb-1.5">
                          <span className="text-smoke">GSDP (INR):</span>
                          <span className="text-paper font-semibold">₹{fmtGsdp(state.economic_metrics.gsdp_crore_inr)} Cr</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-iron flex justify-between items-center text-[13px] font-mono">
                      <span className="text-smoke font-medium">Inflation: <span className="text-electric-lime font-bold">{state.economic_metrics.inflation_yoy_percent}%</span></span>
                      <button
                        type="button"
                        onClick={() => toggleExpand(stateId(state.state))}
                        className="border border-iron hover:border-steel text-paper hover:bg-graphite transition-colors text-[13px] font-bold rounded-lg px-4 py-2"
                      >
                        {isExpanded ? 'Hide Details' : 'Expand Details'}
                      </button>
                    </div>

                    {/* Detailed Expanded Section (Inconsolata Terminal themed) */}
                    {isExpanded && (
                      <div className="mt-6 border border-iron bg-void-black rounded p-6 text-[14px] font-inconsolata space-y-4 transition-colors">
                        {/* Rivers list */}
                        <div>
                          <span className="text-[11px] font-bold text-electric-lime uppercase tracking-[0.1em] block mb-2">// HYDROLOGICAL_CHANNELS</span>
                          <div className="space-y-2">
                            {richDetail?.rivers?.map((river, rIdx) => (
                              <div key={rIdx} className="bg-carbon border border-iron rounded p-3">
                                <div className="text-pure-white font-bold">$ {river.n.toUpperCase()}</div>
                                <div className="text-smoke text-[13px] mt-1 leading-relaxed">{river.d}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GI Tags list */}
                        {richDetail?.gi && richDetail.gi.length > 0 && (
                          <div className="border-t border-iron pt-3">
                            <span className="text-[11px] font-bold text-electric-lime uppercase tracking-[0.1em] block mb-2">// GEOGRAPHICAL_INDICATORS</span>
                            <div className="flex flex-wrap gap-1.5">
                              {richDetail.gi.map((tag, gIdx) => (
                                <span
                                  key={gIdx}
                                  className="text-[12px] bg-carbon border border-iron px-2.5 py-1 rounded text-paper font-semibold"
                                >
                                  {tag.t === 'food' ? '🥞' : '🎨'} {tag.n}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tourist spots list */}
                        {richDetail?.tourism && richDetail.tourism.length > 0 && (
                          <div className="border-t border-iron pt-3">
                            <span className="text-[11px] font-bold text-electric-lime uppercase tracking-[0.1em] block mb-2">// REGISTERED_DECK_LANDMARKS</span>
                            <div className="space-y-2">
                              {richDetail.tourism.map((spot, sIdx) => (
                                <div key={sIdx} className="bg-carbon border border-iron rounded p-3 flex gap-3 items-start">
                                  <span className="text-[16px] mt-0.5">{spot.icon}</span>
                                  <div>
                                    <div className="text-pure-white font-bold">{spot.n.toUpperCase()}</div>
                                    <div className="text-smoke text-[13px] leading-relaxed mt-0.5">{spot.d}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Data verification metadata */}
                        <div className="border-t border-iron pt-3 text-[11px] text-smoke flex flex-wrap justify-between gap-2">
                          <span>Source: {state.demographics.sex_ratio_source}</span>
                          <span>Reference: {state.demographics.reference_period}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom ClickHouse style CTA block conversion */}
        <section className="bg-carbon border border-iron rounded-lg p-12 text-center mt-16 select-none max-w-[900px] mx-auto">
          <h2 className="text-[32px] font-bold font-basier tracking-tight text-pure-white mb-4">
            ClickHouse in seconds.
          </h2>
          <p className="text-[15px] text-bone max-w-[540px] mx-auto leading-relaxed mb-8">
            Gain full command access to planning indexes and state intelligence registers. Start analyzing state development profiles today.
          </p>
          <div className="flex justify-center gap-4">
            <button type="button" className="bg-electric-lime text-void-black text-[14px] font-bold rounded-lg px-5 py-2.5 hover:bg-lime-glow transition-colors">
              Access Terminal
            </button>
            <a href="#explore" className="border border-iron text-paper hover:bg-graphite hover:border-steel transition-colors text-[14px] font-bold rounded-lg px-5 py-2.5">
              Select Module
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-void-black border-t border-iron py-12 px-6 text-center text-[13px] text-smoke select-none">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 Bharat Index. Developed under ClickHouse style guidelines.</span>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-pure-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-pure-white transition-colors">Terms</a>
            <a href="#" className="hover:text-pure-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
