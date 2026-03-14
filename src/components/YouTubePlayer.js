"use client";
import { useState, useRef, useEffect, useCallback } from 'react';

export default function YouTubePlayer({ videoId, title, accentColor = 'var(--ua-lime)' }) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [captionsOn, setCaptionsOn] = useState(true);
    const intervalRef = useRef(null);

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            createPlayer();
            return;
        }

        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existingScript) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }

        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (prev) prev();
            createPlayer();
        };

        // If API already loaded but onReady hasn't fired for this instance
        const checkInterval = setInterval(() => {
            if (window.YT && window.YT.Player && !playerRef.current) {
                clearInterval(checkInterval);
                createPlayer();
            }
        }, 200);

        return () => clearInterval(checkInterval);
    }, [videoId]);

    function createPlayer() {
        if (playerRef.current) {
            playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
            videoId,
            width: '100%',
            height: '100%',
            playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                iv_load_policy: 3,
                cc_load_policy: 1,
                playsinline: 1,
                disablekb: 1,
            },
            events: {
                onReady: (e) => {
                    setIsReady(true);
                    setDuration(e.target.getDuration());
                    setVolume(e.target.getVolume());
                },
                onStateChange: (e) => {
                    setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
                }
            }
        });
    }

    // Progress tracking
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    const t = playerRef.current.getCurrentTime();
                    const d = playerRef.current.getDuration();
                    setCurrentTime(t);
                    setDuration(d);
                    setProgress(d > 0 ? (t / d) * 100 : 0);
                }
            }, 500);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying]);

    const togglePlay = useCallback(() => {
        if (!playerRef.current) return;
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    }, [isPlaying]);

    const seek = useCallback((seconds) => {
        if (!playerRef.current) return;
        const t = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(t + seconds, true);
    }, []);

    const toggleMute = useCallback(() => {
        if (!playerRef.current) return;
        if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
        else { playerRef.current.mute(); setIsMuted(true); }
    }, [isMuted]);

    const toggleCaptions = useCallback(() => {
        if (!playerRef.current) return;
        if (captionsOn) {
            playerRef.current.unloadModule('captions');
            setCaptionsOn(false);
        } else {
            playerRef.current.loadModule('captions');
            setCaptionsOn(true);
        }
    }, [captionsOn]);

    const handleProgressClick = useCallback((e) => {
        if (!playerRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        playerRef.current.seekTo(pct * duration, true);
    }, [duration]);

    const toggleFullscreen = useCallback(() => {
        const el = containerRef.current?.parentElement;
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen?.();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        function onKey(e) {
            // Only respond if this player's wrapper is visible
            const wrapper = containerRef.current?.closest('[data-yt-wrapper]');
            if (!wrapper) return;
            const rect = wrapper.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            switch (e.key) {
                case ' ':
                case 'k': e.preventDefault(); togglePlay(); break;
                case 'ArrowRight': e.preventDefault(); seek(5); break;
                case 'ArrowLeft': e.preventDefault(); seek(-5); break;
                case 'c': e.preventDefault(); toggleCaptions(); break;
                case 'm': e.preventDefault(); toggleMute(); break;
                case 'f': e.preventDefault(); toggleFullscreen(); break;
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [togglePlay, seek, toggleCaptions, toggleMute, toggleFullscreen]);

    function fmt(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    return (
        <div data-yt-wrapper style={{ marginBottom: '60px' }}>
            {/* Video */}
            <div style={{ aspectRatio: '16/9', borderRadius: '16px 16px 0 0', overflow: 'hidden', background: '#000' }}>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Progress bar */}
            <div
                onClick={handleProgressClick}
                style={{
                    width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', position: 'relative'
                }}
            >
                <div style={{
                    width: `${progress}%`, height: '100%',
                    background: accentColor, transition: 'width 0.3s linear',
                    borderRadius: '0 2px 2px 0'
                }} />
            </div>

            {/* Controls bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: '0 0 16px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
                borderTop: 'none',
                flexWrap: 'wrap'
            }}>
                {/* Left: play + seek + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }}>
                    <Btn onClick={() => seek(-5)} title="Retroceder 5s (←)" icon="⏪" label="5s" />
                    <Btn onClick={togglePlay} title="Play / Pausa (K)" icon={isPlaying ? '⏸' : '▶️'} primary accent={accentColor} />
                    <Btn onClick={() => seek(5)} title="Adelantar 5s (→)" icon="⏩" label="5s" />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginLeft: '8px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {fmt(currentTime)} / {fmt(duration)}
                    </span>
                </div>

                {/* Right: captions, mute, fullscreen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Btn onClick={toggleCaptions} title="Subtítulos (C)" icon="CC" active={captionsOn} accent={accentColor} />
                    <Btn onClick={toggleMute} title="Silenciar (M)" icon={isMuted ? '🔇' : '🔊'} />
                    <Btn onClick={toggleFullscreen} title="Pantalla completa (F)" icon="⛶" />
                </div>

                {/* Keyboard hints */}
                <div style={{
                    width: '100%', display: 'flex', gap: '12px', justifyContent: 'center',
                    marginTop: '4px', flexWrap: 'wrap'
                }}>
                    <Hint k="K" label="Play" />
                    <Hint k="←" label="−5s" />
                    <Hint k="→" label="+5s" />
                    <Hint k="C" label="Subtítulos" />
                    <Hint k="M" label="Silencio" />
                    <Hint k="F" label="Fullscreen" />
                </div>
            </div>
        </div>
    );
}

function Btn({ onClick, title, icon, label, primary, active, accent }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                background: primary ? `${accent || 'var(--ua-lime)'}22` : active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                border: primary ? `1px solid ${accent || 'var(--ua-lime)'}` : active ? `1px solid ${accent || 'var(--ua-lime)'}` : '1px solid rgba(255,255,255,0.08)',
                color: active ? (accent || 'var(--ua-lime)') : '#fff',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: icon === 'CC' ? '0.7rem' : '0.85rem',
                fontWeight: icon === 'CC' ? 700 : 400,
                transition: 'all 0.2s ease',
                lineHeight: 1,
            }}
        >
            {icon}{label && <span style={{ fontSize: '0.7rem' }}>{label}</span>}
        </button>
    );
}

function Hint({ k, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px', padding: '1px 6px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)',
                fontFamily: 'monospace', lineHeight: '1.4'
            }}>{k}</kbd>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        </div>
    );
}
