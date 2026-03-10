"use client";
import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function ImageCarousel({ images = [], accentColor = 'var(--ua-lime)' }) {
    const [current, setCurrent] = useState(0);

    if (!images.length) return null;

    const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

    const item = images[current];

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'border-color 0.3s ease',
        }}>
            {/* Image Area */}
            <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden', background: '#0a0f0a' }}>
                <img
                    src={item.src}
                    alt={item.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 0.4s ease',
                    }}
                />
                {/* Gradient overlay bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(13,18,13,0.95), transparent)',
                    pointerEvents: 'none',
                }} />

                {/* Nav Arrows */}
                <button onClick={prev} style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                    <FaChevronLeft />
                </button>
                <button onClick={next} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                    <FaChevronRight />
                </button>

                {/* Caption on image */}
                <div style={{
                    position: 'absolute', bottom: '20px', left: '24px', right: '24px',
                    zIndex: 2,
                }}>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{item.title}</h4>
                    {item.architect && <p style={{ color: accentColor, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', margin: 0 }}>{item.architect}</p>}
                </div>
            </div>

            {/* Description + Dots */}
            <div style={{ padding: '20px 24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    {item.description}
                </p>

                {/* Dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            style={{
                                width: idx === current ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: idx === current ? accentColor : 'rgba(255,255,255,0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
