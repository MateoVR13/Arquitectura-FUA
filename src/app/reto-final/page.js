"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
};

const modalBoxStyle = {
    background: '#1a1a1a', borderLeft: '5px solid #FFD700', padding: '40px',
    maxWidth: '520px', borderRadius: '14px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)', textAlign: 'center'
};

export default function RetoFinalPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [modalInfo, setModalInfo] = useState(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleMessage = async (event) => {
            if (event.data && event.data.type === 'exercise-complete' && event.data.exercise === 'reto_final') {
                setSaving(true);
                try {
                    const res = await fetch('/api/progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ blockId: 5 })
                    });

                    if (res.ok) {
                        setTimeout(() => {
                            setSaving(false);
                            setModalInfo({
                                icon: '🏆',
                                title: '¡Laboratorio Completado!',
                                body: 'Has finalizado el Reto Final del Laboratorio Interactivo de Arquitectura. ¡Felicitaciones, Arquitecto! Tu certificado de participación está listo.',
                                btnText: '📜 Ver mi Certificado',
                                onConfirm: () => router.push('/certificado')
                            });
                        }, 500);
                    } else {
                        setSaving(false);
                        setModalInfo({
                            icon: '⚠️', title: 'Error al Guardar',
                            body: 'Hubo un error guardando tu progreso. Inténtalo de nuevo.',
                            btnText: 'Cerrar', onConfirm: () => setModalInfo(null)
                        });
                    }
                } catch (error) {
                    console.error('Error saving progress:', error);
                    setSaving(false);
                    setModalInfo({
                        icon: '⚠️', title: 'Error de Conexión',
                        body: 'No se pudo conectar al servidor.',
                        btnText: 'Cerrar', onConfirm: () => setModalInfo(null)
                    });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => { document.body.style.overflow = ''; window.removeEventListener('message', handleMessage); };
    }, [router]);

    return (
        <PageTransition>
            <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a', position: 'relative' }}>
                <iframe
                    src="/exercises/reto_final/index.html"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Reto Final: Proyecto Integrador"
                />

                {saving && (
                    <div style={modalOverlayStyle}>
                        <div style={{ ...modalBoxStyle, borderLeft: '5px solid #FF4500' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>⏳</div>
                            <div style={{ color: '#FF4500', fontSize: '1.3rem', fontWeight: 900, marginBottom: '10px', fontFamily: 'Montserrat, sans-serif' }}>Guardando Progreso...</div>
                            <div style={{ color: '#ddd', fontFamily: 'Montserrat, sans-serif' }}>Un momento mientras registramos tu logro final.</div>
                        </div>
                    </div>
                )}

                {modalInfo && (
                    <div style={modalOverlayStyle}>
                        <div style={modalBoxStyle}>
                            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{modalInfo.icon}</div>
                            <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px', fontFamily: 'Montserrat, sans-serif' }}>{modalInfo.title}</div>
                            <div style={{ color: '#ddd', fontSize: '1rem', lineHeight: 1.7, marginBottom: '25px', fontFamily: 'Montserrat, sans-serif' }}>{modalInfo.body}</div>
                            <button
                                style={{ background: 'linear-gradient(135deg, #FF4500, #FFD700)', color: '#fff', border: 'none', padding: '14px 30px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: '1rem' }}
                                onClick={modalInfo.onConfirm}
                            >{modalInfo.btnText}</button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
