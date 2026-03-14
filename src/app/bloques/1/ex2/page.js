"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaFingerprint, FaCrown, FaRedo, FaCheck } from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';
import styles from './ex2.module.css';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
};

const modalBoxStyle = {
    background: '#1a1a1a', borderLeft: '5px solid #C8FF01', padding: '40px',
    maxWidth: '500px', borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)', textAlign: 'center'
};

const modalTitleStyle = { color: '#C8FF01', fontSize: '1.5rem', fontWeight: 900, marginBottom: '15px', fontFamily: 'Montserrat, sans-serif' };
const modalBodyStyle = { color: '#ddd', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '25px', fontFamily: 'Montserrat, sans-serif' };
const modalBtnStyle = {
    background: '#C8FF01', color: '#000', border: 'none', padding: '12px 28px',
    fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
    fontSize: '1rem', transition: 'all 0.2s'
};

const ARCHITECTS = [
    {
        id: 'meier',
        name: 'Richard Meier',
        title: 'Pureza Geométrica',
        img: 'https://media.architecturaldigest.com/photos/571945dcd207ea4e41a32a7d/master/pass/richard-meier-architecture-01.jpg',
        desc: 'Eres muy estructurado y metódico. Disfrutas de la claridad espacial, la luz blanca como material de construcción y el rigor geométrico absoluto.',
        traits: ['Ortogonal', 'Blancura', 'Luz Estructurada']
    },
    {
        id: 'hadid',
        name: 'Zaha Hadid',
        title: 'Fluidez Dinámica',
        img: 'https://media.newyorker.com/photos/59096878019dfc3494ea0fed/master/pass/110725_r21083_g2048.jpg',
        desc: 'Desafías lo establecido. Tienes una afinidad por las formas paramétricas, la continuidad espacial ininterrumpida y el movimiento perpetuo.',
        traits: ['Antigravedad', 'Paramétrico', 'Continuidad']
    },
    {
        id: 'gehry',
        name: 'Frank Gehry',
        title: 'Expresión Escultórica',
        img: 'https://www.dreamideamachine.com/web/wp-content/uploads/2020/02/25146958.jpg',
        desc: 'Tu proceso es libre y emocional. Concibes la arquitectura como una escultura a gran escala, y confías plenamente en el dibujo a mano y la intuición matérica.',
        traits: ['Caos Controlado', 'Escultórico', 'Metal']
    },
    {
        id: 'piano',
        name: 'Renzo Piano',
        title: 'Transparencia Tectónica',
        img: 'https://www.telegraph.co.uk/content/dam/Travel/2018/September/pompidou-centre-paris-night.jpg',
        desc: 'Te obsesiona cómo están ensambladas las cosas. Tienes alma de ingeniero-arquitecto; amas mostrar la estructura, celebrar la luz y la permeabilidad.',
        traits: ['Hi-Tech', 'Ensamblaje', 'Ligereza Visual']
    },
    {
        id: 'libeskind',
        name: 'Daniel Libeskind',
        title: 'Tensión Fragmentada',
        img: 'https://media.architecturaldigest.com/photos/5706ec8d3c6ec36d75349d57/master/w_1024%2Cc_limit/daniel-libeskind-architecture-05.jpg',
        desc: 'Buscas la narrativa y el drama espacial. Creas trayectos emocionales a través de líneas diagonales, cortes agudos y la tensión entre los vacíos.',
        traits: ['Narrativa', 'Diagonal', 'Deconstructivismo']
    },
    {
        id: 'sejima',
        name: 'Kazuyo Sejima',
        title: 'Ligereza Etérea',
        img: 'https://www.metalocus.es/sites/default/files/styles/mopis_news_carousel_item_desktop/public/metalocus_kazuyo-sejima_osaka-university-of-arts_30.jpg?itok=gEdf32Xt',
        desc: 'Tu estética es zen y minimalista al extremo. Desmaterializas los límites construyendo con reflejos, difuminados y blancos inmaculados.',
        traits: ['Inmaterial', 'Límites Difusos', 'Silencio Visual']
    }
];

export default function Exercise2() {
    const router = useRouter();
    const [selectedProfile, setSelectedProfile] = useState(null);
    const canvasRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Neuronal Background Animation logic transferred
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId;
        const particles = [];

        const initBg = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const numParticles = Math.floor((width * height) / 12000);
            particles.length = 0;

            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    radius: Math.random() * 2 + 1
                });
            }
        };

        const animateBg = () => {
            animationFrameId = requestAnimationFrame(animateBg);
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 164, 181, 0.4)';
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = dx * dx + dy * dy;

                    if (dist < 18000) {
                        ctx.beginPath();
                        const alpha = 0.2 - (dist / 90000);
                        ctx.strokeStyle = `rgba(0, 164, 181, ${alpha > 0 ? alpha : 0})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        window.addEventListener('resize', initBg);
        initBg();
        animateBg();

        return () => {
            window.removeEventListener('resize', initBg);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleSelect = (arc) => {
        setSelectedProfile(arc);
    };

    const [modalInfo, setModalInfo] = useState(null);

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blockId: 1 })
            });

            if (res.ok) {
                setModalInfo({
                    icon: '🎉',
                    title: '¡Bloque 1 Completado!',
                    body: 'Has completado las actividades de Composición Arquitectónica. El Bloque 2: Estructura ha sido desbloqueado. ¡Continúa tu formación!',
                    btnText: 'Volver al Laboratorio',
                    onConfirm: () => router.push('/laboratorio')
                });
            } else {
                setModalInfo({
                    icon: '⚠️',
                    title: 'Error al Guardar',
                    body: 'Hubo un error guardando tu progreso. Inténtalo de nuevo.',
                    btnText: 'Cerrar',
                    onConfirm: () => setModalInfo(null)
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageTransition>
            <div className={styles.container}>
                <canvas ref={canvasRef} className={styles.bgCanvas}></canvas>


                <header className={styles.header}>
                    <div className={styles.title}><FaFingerprint /> Ejercicio 2</div>
                    <div>Perfiles de Identidad</div>
                </header>

                <div className={styles.content}>
                    {!selectedProfile ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className={styles.selectionView}
                        >
                            <div className={styles.intro}>
                                <h1>Descubre tu <span style={{ color: 'var(--ua-teal)' }}>Identidad Arquitectónica</span></h1>
                                <p>Selecciona la obra que mayor impacto visual y emocional genere en ti de manera instantánea. No hay opciones correctas ni incorrectas.</p>
                            </div>

                            <div className={styles.grid}>
                                {ARCHITECTS.map((arc) => (
                                    <div key={arc.id} className={styles.card} onClick={() => handleSelect(arc)}>
                                        <img src={arc.img} alt={arc.name} loading="lazy" />
                                        <div className={styles.overlay}>
                                            <h3>{arc.title}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className={styles.resultPanel}
                        >
                            <div className={styles.resultIcon}><FaCrown /></div>
                            <h2>{selectedProfile.title}</h2>
                            <p className={styles.resArch}>Afín a la mentalidad de {selectedProfile.name}</p>
                            <p className={styles.resDesc}>{selectedProfile.desc}</p>

                            <div className={styles.traits}>
                                {selectedProfile.traits.map(t => (
                                    <span key={t} className={styles.traitTag}>{t}</span>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <button className="btn-secondary" onClick={() => setSelectedProfile(null)}><FaRedo /> Intentar de nuevo</button>
                                <button className="btn-primary" onClick={handleFinish} disabled={isSubmitting} style={{ background: 'var(--ua-teal)', border: 'none' }}>
                                    <FaCheck /> {isSubmitting ? 'Guardando...' : 'Finalizar y Continuar'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {modalInfo && (
                <div style={modalOverlayStyle}>
                    <div style={modalBoxStyle}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{modalInfo.icon}</div>
                        <div style={modalTitleStyle}>{modalInfo.title}</div>
                        <div style={modalBodyStyle}>{modalInfo.body}</div>
                        <button style={modalBtnStyle} onClick={modalInfo.onConfirm}>
                            {modalInfo.btnText}
                        </button>
                    </div>
                </div>
            )}

            {/* Tutor Bubble */}
            <div style={{
                position: 'fixed', bottom: '25px', right: '25px', maxWidth: '340px',
                padding: '16px 20px', background: 'rgba(12, 12, 12, 0.95)',
                borderLeft: '4px solid var(--ua-lime, #c8ff01)', borderRadius: '14px',
                backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', gap: '12px',
                alignItems: 'flex-start', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                border: '1px solid rgba(200,255,1,0.15)'
            }}>
                <div style={{ fontSize: '1.8rem', flexShrink: 0, lineHeight: 1 }}>👩‍🏫</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ua-lime, #c8ff01)', marginBottom: '4px' }}>Tutor</div>
                    <div style={{ fontSize: '0.88rem', color: '#ddd', lineHeight: 1.5 }}
                        dangerouslySetInnerHTML={{
                            __html: selectedProfile
                                ? '¡Excelente elección! Lee tu perfil de identidad arquitectónica y cuando estés listo, haz clic en <strong>"Finalizar y Continuar"</strong> para completar el bloque.'
                                : 'Observa las obras y selecciona la que mayor <strong>impacto visual y emocional</strong> genere en ti. No hay respuestas correctas.'
                        }}
                    />
                </div>
            </div>

        </PageTransition>
    );
}
