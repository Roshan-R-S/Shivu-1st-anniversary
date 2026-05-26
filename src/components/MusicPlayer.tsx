import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import adiPenne from '../songs/adi-penne.mp3';
import siduSidu from '../songs/sidu-sidu.mp3';

const PLAYLIST = [
  { src: adiPenne,  title: 'Adi Penne' },
  { src: siduSidu,  title: 'Sidu Sidu' },
];

export default function MusicPlayer() {
  const [trackIdx,  setTrackIdx]  = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = PLAYLIST[trackIdx];

  // When track changes, reload & resume if we were playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [trackIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(p => !p);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(m => !m);
  };

  const prevTrack = useCallback(() => {
    setTrackIdx(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
  }, []);

  const nextTrack = useCallback(() => {
    setTrackIdx(i => (i + 1) % PLAYLIST.length);
  }, []);

  // Auto-advance to next song when current ends
  const onEnded = useCallback(() => {
    nextTrack();
  }, [nextTrack]);

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex items-center gap-4">
      <audio
        ref={audioRef}
        src={track.src}
        muted={isMuted}
        onEnded={onEnded}
      />

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-full flex items-center gap-3 shadow-2xl shadow-love-red/20"
      >
        {/* Prev */}
        <button
          onClick={prevTrack}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Previous track"
        >
          <SkipBack size={16} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="text-white hover:text-love-red transition-colors p-2 bg-white/5 rounded-full"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Next track"
        >
          <SkipForward size={16} />
        </button>

        {/* Track info */}
        <div className="hidden md:block pr-2">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Now Playing</div>
          <div className="text-xs font-medium text-white truncate max-w-[120px]">{track.title}</div>
        </div>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="text-white/70 hover:text-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </motion.div>
    </div>
  );
}
