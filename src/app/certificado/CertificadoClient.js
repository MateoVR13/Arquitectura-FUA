"use client";
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

export default function CertificadoClient({ user }) {
    const router = useRouter();
    const certRef = useRef(null);

    const today = new Date();
    const dateStr = today.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    const downloadPDF = async () => {
        const el = certRef.current;
        if (!el) return;

        // Dynamically load libraries
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default;

        const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        pdf.save(`Certificado_ArquiLab_${user.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <PageTransition>
            <div style={{
                minHeight: '100vh', width: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '30px 20px', gap: '25px'
            }}>
                {/* Certificate container — aspect ratio ~A4 landscape */}
                <motion.div
                    ref={certRef}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        width: '900px', height: '636px',
                        background: 'linear-gradient(135deg, #0d1117 0%, #1a1e2e 30%, #0d1117 100%)',
                        borderRadius: '0',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
                        color: '#fff',
                        boxShadow: '0 20px 80px rgba(0,0,0,0.6)'
                    }}
                >
                    {/* Decorative border */}
                    <div style={{
                        position: 'absolute', inset: '12px',
                        border: '2px solid rgba(255, 215, 0, 0.25)',
                        pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute', inset: '18px',
                        border: '1px solid rgba(255, 215, 0, 0.12)',
                        pointerEvents: 'none'
                    }} />

                    {/* Corner ornaments */}
                    {[{ top: '25px', left: '25px' }, { top: '25px', right: '25px' }, { bottom: '25px', left: '25px' }, { bottom: '25px', right: '25px' }].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', ...pos,
                            width: '40px', height: '40px',
                            borderTop: i < 2 ? '3px solid #FFD700' : 'none',
                            borderBottom: i >= 2 ? '3px solid #FFD700' : 'none',
                            borderLeft: i % 2 === 0 ? '3px solid #FFD700' : 'none',
                            borderRight: i % 2 === 1 ? '3px solid #FFD700' : 'none',
                        }} />
                    ))}

                    {/* Content */}
                    <div style={{
                        position: 'relative', zIndex: 2,
                        height: '100%', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '50px 60px', textAlign: 'center'
                    }}>
                        {/* University logo */}
                        <img
                            src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png"
                            alt="Universidad de América"
                            crossOrigin="anonymous"
                            style={{ height: '45px', marginBottom: '20px', filter: 'brightness(200%) grayscale(30%)' }}
                        />

                        {/* Title */}
                        <div style={{
                            fontSize: '0.7rem', letterSpacing: '6px', textTransform: 'uppercase',
                            color: '#FFD700', fontWeight: 700, marginBottom: '6px'
                        }}>
                            Certificado de Participación
                        </div>

                        <div style={{
                            fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase',
                            color: '#888', marginBottom: '25px'
                        }}>
                            Laboratorio Interactivo de Arquitectura — ArquiLab
                        </div>

                        {/* Divider */}
                        <div style={{
                            width: '120px', height: '1px',
                            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                            marginBottom: '25px'
                        }} />

                        {/* Confer text */}
                        <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>
                            Se certifica que
                        </div>

                        {/* Student name */}
                        <div style={{
                            fontSize: '2.6rem', fontWeight: 900,
                            background: 'linear-gradient(90deg, #FFD700, #FF8C00, #FFD700)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '8px', lineHeight: 1.2
                        }}>
                            {user.name}
                        </div>

                        {/* Underline for name */}
                        <div style={{
                            width: '300px', height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)',
                            marginBottom: '20px'
                        }} />

                        {/* Body text */}
                        <div style={{
                            fontSize: '0.82rem', color: '#bbb', lineHeight: 1.8,
                            maxWidth: '600px', marginBottom: '20px'
                        }}>
                            Ha completado satisfactoriamente la <strong style={{ color: '#fff' }}>Experiencia Interactiva de Arquitectura</strong>,
                            demostrando dominio en los módulos de{' '}
                            <strong style={{ color: '#4CAF50' }}>Composición</strong>,{' '}
                            <strong style={{ color: '#FF6B6B' }}>Estructura</strong>,{' '}
                            <strong style={{ color: '#FFD700' }}>Historia</strong> y{' '}
                            <strong style={{ color: '#00BCD4' }}>Urbanismo</strong>,
                            incluyendo el <strong style={{ color: '#FF4500' }}>Reto Final Integrador</strong>.
                        </div>

                        {/* Blocks completed badges */}
                        <div style={{
                            display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            {[
                                { label: 'Composición', color: '#4CAF50' },
                                { label: 'Estructura', color: '#FF6B6B' },
                                { label: 'Historia', color: '#FFD700' },
                                { label: 'Urbanismo', color: '#00BCD4' },
                                { label: 'Reto Final', color: '#FF4500' }
                            ].map((b, i) => (
                                <div key={i} style={{
                                    padding: '4px 14px', borderRadius: '20px',
                                    border: `1px solid ${b.color}40`,
                                    background: `${b.color}15`,
                                    fontSize: '0.65rem', fontWeight: 700,
                                    color: b.color, letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>
                                    ✓ {b.label}
                                </div>
                            ))}
                        </div>

                        {/* Date & signatures */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            width: '100%', maxWidth: '650px', alignItems: 'flex-end'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '160px', height: '1px',
                                    background: 'rgba(255,255,255,0.2)', marginBottom: '6px'
                                }} />
                                <div style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '1px' }}>
                                    Fecha: {dateStr}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#666' }}>
                                🏆
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '160px', height: '1px',
                                    background: 'rgba(255,255,255,0.2)', marginBottom: '6px'
                                }} />
                                <div style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '1px' }}>
                                    Desarrollado por YedaTech
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subtle grid pattern overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.03,
                        backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        pointerEvents: 'none'
                    }} />
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ display: 'flex', gap: '15px', zIndex: 2 }}
                >
                    <button
                        onClick={downloadPDF}
                        style={{
                            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                            color: '#000', border: 'none', padding: '14px 35px',
                            fontWeight: 800, borderRadius: '8px', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '1rem',
                            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => e.target.style.filter = 'brightness(1.15)'}
                        onMouseOut={e => e.target.style.filter = 'brightness(1)'}
                    >
                        📥 Descargar PDF
                    </button>
                    <button
                        onClick={() => router.push('/laboratorio')}
                        style={{
                            background: 'transparent', color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '14px 30px', fontWeight: 600,
                            borderRadius: '8px', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => e.target.style.borderColor = 'rgba(255,215,0,0.4)'}
                        onMouseOut={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                    >
                        ← Volver al Laboratorio
                    </button>
                </motion.div>
            </div>
        </PageTransition>
    );
}
