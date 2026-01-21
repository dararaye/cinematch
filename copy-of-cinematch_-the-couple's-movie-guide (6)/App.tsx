import React, { useState, useEffect, useCallback } from 'react';
import { Movie, ViewMode, UserType, AppState } from './types';
import { fetchMovies } from './geminiService';
import MovieCard from './components/MovieCard';

const ALL_PLATFORMS = ["Netflix", "Hulu", "Max", "Peacock", "Amazon Prime", "Disney+", "Apple TV+", "Paramount+"];
const MOODS = [
  "Any Mood", 
  "Brain-off Popcorn Flick", 
  "Something to half-watch while scrolling",
  "Actually Good Horror", 
  "Fast-paced & Stressful", 
  "Cozy Sunday Vibes", 
  "Existential Crisis Fuel",
  "Beautiful but Boring",
  "Aged like Fine Wine",
  "Indie Darling",
  "Pure Comfort",
  "Critics' Darling",
  "Scary but not too scary",
  "Cry-fest",
  "Visual Spectacle",
  "Mind-bending Scifi",
  "High-stakes but short",
  "Oscar Bait",
  "Heated Debate Starter",
  "Date night but make it classy",
  "Will make us both cry",
  "Low Stakes Fun",
  "Spooky but not Traumatizing"
];
const RELEASE_WINDOWS = [
  { label: "Last Week", value: "1w" },
  { label: "Last Month", value: "1m" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last Year", value: "1y" },
  { label: "Last 2 Years", value: "2y" },
  { label: "Last 10 Years", value: "10y" }
];
const RUNTIMES = ["Any", "Under 90 mins", "Under 2 hours", "Over 2 hours"];

const IconHeart = () => (
  <svg className="w-8 h-8 text-rose-500 fill-current" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>(ViewMode.DISCOVER);
  const [showFilters, setShowFilters] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'copied'>('idle');
  
  const [state, setState] = useState<AppState>(() => {
    const params = new URLSearchParams(window.location.search);
    const syncData = params.get('sync');
    
    const saved = localStorage.getItem('cinematch_v6_state');
    let localState: any = saved ? JSON.parse(saved) : null;

    if (syncData) {
      try {
        const decoded = atob(syncData);
        const incoming = JSON.parse(decoded);
        
        return {
          ...incoming,
          seenMovies: new Set([...(localState?.seenMovies || []), ...incoming.seenMovies]),
          watchlistAri: new Set([...(localState?.watchlistAri || []), ...incoming.watchlistAri]),
          watchlistDara: new Set([...(localState?.watchlistDara || []), ...incoming.watchlistDara]),
          dislikedMovies: new Set([...(localState?.dislikedMovies || []), ...incoming.dislikedMovies]),
        };
      } catch (e) { 
        console.error("Sync error - falling back to local state", e); 
      }
    }

    if (localState) {
      return {
        ...localState,
        seenMovies: new Set(localState.seenMovies),
        watchlistAri: new Set(localState.watchlistAri),
        watchlistDara: new Set(localState.watchlistDara),
        dislikedMovies: new Set(localState.dislikedMovies),
      };
    }

    return {
      seenMovies: new Set(),
      watchlistAri: new Set(),
      watchlistDara: new Set(),
      dislikedMovies: new Set(),
      activePlatforms: ["Netflix", "Hulu", "Max", "Peacock", "Amazon Prime"],
      selectedMood: "Any Mood",
      yearRange: "1y",
      maxRuntime: "Any",
    };
  });

  useEffect(() => {
    const dataToSave = {
      ...state,
      seenMovies: Array.from(state.seenMovies),
      watchlistAri: Array.from(state.watchlistAri),
      watchlistDara: Array.from(state.watchlistDara),
      dislikedMovies: Array.from(state.dislikedMovies),
    };
    localStorage.setItem('cinematch_v6_state', JSON.stringify(dataToSave));
  }, [state]);

  const generateSyncLink = () => {
    const dataToSync = {
      ...state,
      seenMovies: Array.from(state.seenMovies),
      watchlistAri: Array.from(state.watchlistAri),
      watchlistDara: Array.from(state.watchlistDara),
      dislikedMovies: Array.from(state.dislikedMovies),
    };
    const b64 = btoa(JSON.stringify(dataToSync));
    const url = `${window.location.origin}${window.location.pathname}?sync=${b64}`;
    navigator.clipboard.writeText(url);
    setSyncStatus('copied');
    setTimeout(() => setSyncStatus('idle'), 5000);
  };

  const loadMoreMovies = useCallback(async (isReset = false) => {
    setLoading(true);
    if (isReset) setMovies([]);
    
    const newMovies = await fetchMovies({
      mood: state.selectedMood,
      yearRange: state.yearRange,
      maxRuntime: state.maxRuntime,
      platforms: state.activePlatforms,
      seenIds: Array.from(state.seenMovies),
      dislikedIds: Array.from(state.dislikedMovies),
    });

    setMovies(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const filtered = newMovies.filter(m => !existingIds.has(m.id));
      return isReset ? filtered : [...prev, ...filtered];
    });
    setLoading(false);
  }, [state]);

  useEffect(() => {
    loadMoreMovies(true);
  }, [state.activePlatforms, state.selectedMood, state.yearRange, state.maxRuntime]);

  const togglePlatform = (platform: string) => {
    setState(prev => ({
      ...prev,
      activePlatforms: prev.activePlatforms.includes(platform)
        ? prev.activePlatforms.filter(p => p !== platform)
        : [...prev.activePlatforms, platform]
    }));
  };

  const handleSeen = (id: string) => {
    setState(prev => ({ ...prev, seenMovies: new Set(prev.seenMovies).add(id) }));
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  const handleLike = (id: string, user: UserType) => {
    const key = user === 'Ari' ? 'watchlistAri' : 'watchlistDara';
    setState(prev => {
      const newList = new Set(prev[key]);
      newList.has(id) ? newList.delete(id) : newList.add(id);
      return { ...prev, [key]: newList };
    });
  };

  const handleDislike = (id: string) => {
    setState(prev => ({ ...prev, dislikedMovies: new Set(prev.dislikedMovies).add(id) }));
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  const displayMovies = movies.filter(m => {
    if (state.seenMovies.has(m.id)) return false;
    if (state.dislikedMovies.has(m.id)) return false;
    if (view === ViewMode.WATCHLIST) return state.watchlistAri.has(m.id) || state.watchlistDara.has(m.id);
    if (view === ViewMode.MATCHES) return state.watchlistAri.has(m.id) && state.watchlistDara.has(m.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-3xl border-b border-slate-800/40 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-600 flex items-center justify-center shadow-lg transform rotate-3">
               <IconHeart />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent italic">
                DARA & ARI'S NIGHT IN
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Cinematic Matcher</p>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                  <button 
                    onClick={generateSyncLink}
                    className={`text-[9px] font-black uppercase tracking-widest transition-all px-2 py-1 rounded-lg ${
                      syncStatus === 'copied' ? 'bg-emerald-500/10 text-emerald-400' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5'
                    }`}
                  >
                    {syncStatus === 'copied' ? '✓ Link Copied - Text to Ari!' : 'Share Progress with Ari'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-3xl border border-slate-800/50 shadow-2xl">
            {[ViewMode.DISCOVER, ViewMode.WATCHLIST, ViewMode.MATCHES].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all duration-500 uppercase tracking-[0.2em] ${
                  view === v ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {v === ViewMode.MATCHES ? 'The Matches' : v}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${showFilters ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <span>Vibes</span>
              <svg className={`w-3 h-3 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button 
              onClick={() => loadMoreMovies(true)}
              disabled={loading}
              className="bg-white text-slate-950 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Consulting...' : 'Shuffle'}
            </button>
          </div>
        </div>
      </header>

      <div className={`overflow-hidden transition-all duration-700 bg-slate-950 border-b border-slate-800/40 shadow-inner ${showFilters ? 'max-h-[1000px] opacity-100 py-10' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Subscriptions</h4>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black border transition-all ${
                    state.activePlatforms.includes(p) 
                      ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.3em]">The Specific Vibe</h4>
            <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setState(prev => ({ ...prev, selectedMood: m }))}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black border transition-all ${
                    state.selectedMood === m 
                      ? 'bg-fuchsia-600 border-fuchsia-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Freshness</h4>
            <div className="grid grid-cols-2 gap-2">
              {RELEASE_WINDOWS.map(win => (
                <button
                  key={win.value}
                  onClick={() => setState(prev => ({ ...prev, yearRange: win.value }))}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black border transition-all ${
                    state.yearRange === win.value 
                      ? 'bg-rose-600 border-rose-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {win.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Bedtime Clock</h4>
            <div className="flex flex-col gap-2">
              {RUNTIMES.map(r => (
                <button
                  key={r}
                  onClick={() => setState(prev => ({ ...prev, maxRuntime: r }))}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black border transition-all text-left ${
                    state.maxRuntime === r 
                      ? 'bg-cyan-600 border-cyan-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="space-y-2">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
              {view === ViewMode.DISCOVER && `Vibe: ${state.selectedMood}`}
              {view === ViewMode.WATCHLIST && "The Big Queue"}
              {view === ViewMode.MATCHES && "The Winner's Circle"}
            </h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] ml-1">
              Curated across {state.activePlatforms.length} services just for Dara & Ari
            </p>
          </div>

          <div className="flex items-center gap-8 bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm shadow-2xl">
            <div className="text-center space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Ari's Picks</p>
              <p className="text-2xl font-black text-white">{state.watchlistAri.size}</p>
            </div>
            <div className="w-px h-10 bg-slate-800/50"></div>
            <div className="text-center space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400">Dara's Picks</p>
              <p className="text-2xl font-black text-white">{state.watchlistDara.size}</p>
            </div>
          </div>
        </div>

        {loading && displayMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-48 space-y-10">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500/10"></div>
              <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500 border-t-transparent animate-[spin_0.8s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border-[6px] border-fuchsia-500 border-b-transparent animate-[spin_1.2s_linear_infinite_reverse]"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-xs">Curating Perfection</p>
              <p className="text-slate-600 font-bold text-[10px] italic">"No more scrolling, Ari... just a few more seconds..."</p>
            </div>
          </div>
        ) : displayMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {displayMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onSeen={handleSeen}
                onLike={handleLike}
                onDislike={handleDislike}
                isInWatchlistAri={state.watchlistAri.has(movie.id)}
                isInWatchlistDara={state.watchlistDara.has(movie.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-56 bg-slate-900/10 rounded-[4rem] border border-dashed border-slate-800/40">
            <IconHeart />
            <p className="text-slate-500 font-bold text-xl mt-6 mb-8">No movies matched your current filters.</p>
            <button 
              onClick={() => { setView(ViewMode.DISCOVER); loadMoreMovies(true); }}
              className="text-white bg-indigo-600 px-10 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-500 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 mt-20">
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-center md:text-left">
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-1">Dara & Ari's Perfect Movie Lounge</p>
              <p className="text-[10px] font-medium text-slate-500 italic">"Because the argument about what to watch is finally over."</p>
            </div>
            <div className="flex flex-col items-end gap-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Syncing Explanation</p>
               <p className="text-[8px] text-slate-600 max-w-[250px] text-right leading-relaxed">
                 To keep Ari in the loop, click <strong>Share Progress</strong> and text him the link. 
                 It's a manual "snapshot" system—resending the link merges your latest likes into his app!
               </p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
