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
    background: '#1a1a1a', borderLeft: '5px solid #00BCD4', padding: '40px',
    maxWidth: '500px', borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)', textAlign: 'center'
};

const titleStyle = { color: '#00BCD4', fontSize: '1.5rem', fontWeight: 900, marginBottom: '15px', fontFamily: 'Montserrat, sans-serif' };
const bodyStyle = { color: '#ddd', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '25px', fontFamily: 'Montserrat, sans-serif' };
const btnStyle = {
    background: '#00BCD4', color: '#000', border: 'none', padding: '12px 28px',
    fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
    fontSize: '1rem', transition: 'all 0.2s'
};

export default function Exercise2Block4() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [modalInfo, setModalInfo] = useState(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleMessage = async (event) => {
            if (event.data && event.data.type === 'exercise-complete' && event.data.exercise === 'ex8_ciudadano') {
                setSaving(true);
                try {
                    const res = await fetch('/api/progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ blockId: 4 })
                    });

                    if (res.ok) {
                        setTimeout(() => {
                            setSaving(false);
                            setModalInfo({
                                icon: '🎉',
                                title: '¡Bloque 4 Completado!',
                                body: 'Has dominado los fundamentos de Urbanismo: la trama, el espacio público, la escala humana, y la conectividad urbana. ¡El Reto Final ha sido desbloqueado! Demuestra todo lo que has aprendido en los 4 bloques.',
                                btnText: 'Volver al Laboratorio',
                                onConfirm: () => router.push('/laboratorio')
                            });
                        }, 500);
                    } else {
                        setSaving(false);
                        setModalInfo({
                            icon: '⚠️',
                            title: 'Error al Guardar',
                            body: 'Hubo un error guardando tu progreso. Inténtalo de nuevo.',
                            btnText: 'Cerrar',
                            onConfirm: () => setModalInfo(null)
                        });
                    }
                } catch (error) {
                    console.error('Error saving progress:', error);
                    setSaving(false);
                    setModalInfo({
                        icon: '⚠️',
                        title: 'Error de Conexión',
                        body: 'No se pudo conectar al servidor. Verifica tu conexión e inténtalo de nuevo.',
                        btnText: 'Cerrar',
                        onConfirm: () => setModalInfo(null)
                    });
                }
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
                    src="/exercises/ex8_ciudadano/index.html"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Ejercicio 2: El Espacio para el Ciudadano"
                />

                {saving && (
                    <div style={modalOverlayStyle}>
                        <div style={{ ...modalBoxStyle, borderLeft: '5px solid #00BCD4' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>⏳</div>
                            <div style={{ ...titleStyle, color: '#00BCD4' }}>Guardando Progreso...</div>
                            <div style={bodyStyle}>Un momento mientras registramos tu avance.</div>
                        </div>
                    </div>
                )}

                {modalInfo && (
                    <div style={modalOverlayStyle}>
                        <div style={modalBoxStyle}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{modalInfo.icon}</div>
                            <div style={titleStyle}>{modalInfo.title}</div>
                            <div style={bodyStyle}>{modalInfo.body}</div>
                            <button style={btnStyle} onClick={modalInfo.onConfirm}>
                                {modalInfo.btnText}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
