"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaPodcast } from 'react-icons/fa';

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function PodcastPlayer({ src, title = 'Podcast', description = '', accentColor = 'var(--ua-lime)' }) {
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onLoaded = () => setDuration(audio.duration);
        const onTimeUpdate = () => { if (!isDragging) setCurrentTime(audio.currentTime); };
        const onEnded = () => setIsPlaying(false);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, [isDragging]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) { audio.pause(); } else { audio.play(); }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const seek = useCallback((e) => {
        const bar = progressRef.current;
        const audio = audioRef.current;
        if (!bar || !audio) return;
        const rect = bar.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = x / rect.width;
        audio.currentTime = pct * duration;
        setCurrentTime(audio.currentTime);
    }, [duration]);

    const onPointerDown = (e) => {
        setIsDragging(true);
        seek(e);
        const onMove = (ev) => seek(ev);
        const onUp = () => { setIsDragging(false); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backdropFilter: 'blur(10px)',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
        }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 30%, transparent)`; e.currentTarget.style.boxShadow = `0 0 25px color-mix(in srgb, ${accentColor} 8%, transparent)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play Button */}
            <button
                onClick={togglePlay}
                style={{
                    width: '52px',
                    height: '52px',
                    minWidth: '52px',
                    borderRadius: '50%',
                    border: 'none',
                    background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 70%, #000))`,
                    color: '#0d120d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    boxShadow: `0 4px 20px color-mix(in srgb, ${accentColor} 30%, transparent)`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '2px' }} />}
            </button>

            {/* Info + Progress */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <FaPodcast style={{ color: accentColor, fontSize: '0.85rem', flexShrink: 0 }} />
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
                        {description && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>— {description}</span>}
                    </div>
                    <button
                        onClick={toggleMute}
                        style={{ background: 'none', border: 'none', color: isMuted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px', flexShrink: 0, transition: 'color 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = isMuted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)'; }}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                </div>

                {/* Progress bar */}
                <div
                    ref={progressRef}
                    onPointerDown={onPointerDown}
                    style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        position: 'relative',
                        touchAction: 'none',
                    }}
                >
                    {/* Filled track */}
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, #00A4B5))`,
                        borderRadius: '3px',
                        transition: isDragging ? 'none' : 'width 0.1s linear',
                        position: 'relative',
                    }}>
                        {/* Thumb */}
                        <div style={{
                            position: 'absolute',
                            right: '-6px',
                            top: '-5px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#fff',
                            boxShadow: `0 0 8px color-mix(in srgb, ${accentColor} 50%, transparent)`,
                            opacity: isDragging || isPlaying ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                        }} />
                    </div>
                </div>

                {/* Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{formatTime(currentTime)}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
