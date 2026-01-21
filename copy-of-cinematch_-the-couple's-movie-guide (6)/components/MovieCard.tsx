
import React from 'react';
import { Movie, UserType } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSeen: (id: string) => void;
  onLike: (id: string, user: UserType) => void;
  onDislike: (id: string) => void;
  isInWatchlistAri: boolean;
  isInWatchlistDara: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  onSeen, 
  onLike, 
  onDislike,
  isInWatchlistAri,
  isInWatchlistDara 
}) => {
  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'subscription': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'free': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-slate-800/60 hover:border-indigo-500/40 transition-all duration-500 group flex flex-col h-full shadow-2xl">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/400/600`} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* RT Score Badge */}
        <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-2xl text-sm font-black border border-white/10 flex items-center gap-1.5 shadow-xl">
          <span className="text-red-500">🍅</span> {movie.rottenTomatoesScore}
        </div>

        {/* Runtime Badge */}
        <div className="absolute top-5 left-5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black border border-white/5 uppercase tracking-tighter text-slate-300">
          {movie.runtime}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
          <h3 className="text-2xl font-black line-clamp-1 text-white leading-tight">{movie.title}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {movie.year} • {movie.genres.slice(0, 2).join(' / ')}
          </p>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-5">
        <div className="space-y-2">
          <p className="text-sm text-indigo-100/90 italic font-medium leading-relaxed">
            "{movie.conversationalSynopsis}"
          </p>
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Starring: {movie.cast.join(', ')}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {movie.streamingPlatforms.map((p, idx) => (
            <span key={idx} className={`text-[10px] tracking-widest uppercase font-black px-3 py-1.5 rounded-xl border ${getBadgeColor(p.type)}`}>
              {p.name}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
           <button 
            onClick={() => onLike(movie.id, 'Ari')}
            className={`flex items-center justify-center gap-2 py-4 rounded-[1.25rem] border transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${
              isInWatchlistAri 
                ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white' 
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500/50'
            }`}
          >
            Ari {isInWatchlistAri ? '✓' : 'wants'}
          </button>
          <button 
            onClick={() => onLike(movie.id, 'Dara')}
            className={`flex items-center justify-center gap-2 py-4 rounded-[1.25rem] border transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${
              isInWatchlistDara 
                ? 'bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.5)] text-white' 
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white hover:border-fuchsia-500/50'
            }`}
          >
             Dara {isInWatchlistDara ? '✓' : 'wants'}
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onSeen(movie.id)}
            className="flex-1 bg-slate-800/30 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 py-3 rounded-xl border border-slate-700 hover:border-emerald-500/30 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Seen it
          </button>
          <button 
            onClick={() => onDislike(movie.id)}
            className="flex-1 bg-slate-800/30 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 py-3 rounded-xl border border-slate-700 hover:border-rose-500/30 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Pass
          </button>
        </div>

        {movie.trailerUrl && (
          <a 
            href={movie.trailerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-center text-slate-600 hover:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
          >
            View Trailer
          </a>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
