"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
};

const modalBoxStyle = {
    background: '#1a1a1a', borderLeft: '5px solid #4CAF50', padding: '40px',
    maxWidth: '500px', borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)', textAlign: 'center'
};

const titleStyle = { color: '#4CAF50', fontSize: '1.5rem', fontWeight: 900, marginBottom: '15px', fontFamily: 'Montserrat, sans-serif' };
const bodyStyle = { color: '#ddd', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '25px', fontFamily: 'Montserrat, sans-serif' };
const btnStyle = {
    background: '#4CAF50', color: '#000', border: 'none', padding: '12px 28px',
    fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
    fontSize: '1rem', transition: 'all 0.2s', margin: '0 6px'
};
const btnSecondaryStyle = {
    ...btnStyle, background: 'transparent', color: '#fff', border: '1px solid #555'
};

export default function Exercise1Block4() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleMessage = (event) => {
            if (event.data && event.data.type === 'exercise-complete' && event.data.exercise === 'ex7_trama') {
                router.push('/bloques/4/ex2');
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('message', handleMessage);
        };
    }, [router]);

    return (
        <PageTransition>
            <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a', position: 'relative' }}>
                <Link href="/laboratorio" style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 100,
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1.1rem', textDecoration: 'none'
                }} title="Volver al Laboratorio">
                    <FaHome />
                </Link>
                <iframe
                    src="/exercises/ex7_trama/index.html"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Ejercicio 1: La Trama y el Orden"
                />

                {showModal && (
                    <div style={modalOverlayStyle}>
                        <div style={modalBoxStyle}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🗺️</div>
                            <div style={titleStyle}>¡Ejercicio 1 Completado!</div>
                            <div style={bodyStyle}>
                                Has comprendido cómo la malla urbana, la pauta central, los límites y la masa se articulan para crear un sector urbano legible y conectado. Ahora avanzarás al <strong>Ejercicio 2: El Espacio para el Ciudadano</strong>.
                            </div>
                            <div>
                                <button style={btnSecondaryStyle} onClick={() => setShowModal(false)}>
                                    Seguir explorando
                                </button>
                                <button style={btnStyle} onClick={() => router.push('/bloques/4/ex2')}>
                                    Continuar al Ejercicio 2
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
