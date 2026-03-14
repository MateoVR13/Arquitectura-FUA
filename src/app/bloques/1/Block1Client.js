"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaLightbulb, FaFlask, FaBookOpen } from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';

const steps = [
    { id: 1, title: 'Identificar', desc: 'Trazar líneas guía verticales y horizontales. Encontrar el esquema geométrico invisible.' },
    { id: 2, title: 'Posicionar', desc: 'Dibujar el eje principal y ubicar formas clave buscando el equilibrio asimétrico.' },
    { id: 3, title: 'Ocupar', desc: 'Arrastrar planos y líneas para dar cuerpo a la composición. Traducir abstracción a forma física.' },
    { id: 4, title: 'Aplicar', desc: 'Ajustar tamaños, repetir formas y definir la jerarquía (protagonista vs secundario).' },
    { id: 5, title: 'Generar', desc: 'Desplazar y superponer planos configurando el vacío habitable que permite flujo y luz.' }
];

export default function Block1Client({ user }) {
    // 0 is the theoretical introduction, 1-5 are the steps
    const [activeStep, setActiveStep] = useState(0);


    return (
        <PageTransition>
            {/* Top Navbar */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '80px', padding: '0 40px', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', zIndex: 50, borderBottom: '1px solid var(--border-glass)' }}>
                <Link href="/laboratorio" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', flex: 1 }}>
                    <FaArrowLeft /> Regresar al Laboratorio
                </Link>
                <div style={{ flex: 2, textAlign: 'center', color: 'var(--ua-lime)', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    BLOQUE 1: COMPOSICIÓN
                </div>
                <div style={{ flex: 1 }}></div>
            </div>

            <div style={{ display: 'flex', width: '100%', height: '100vh', paddingTop: '80px', overflow: 'hidden' }}>

                {/* Sidebar */}
                <div className="sidebar-scroll" style={{ width: '350px', borderRight: '1px solid var(--border-glass)', padding: '30px 20px', background: 'rgba(0,0,0,0.2)', overflowY: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>

                    <motion.div
                        onClick={() => setActiveStep(0)}
                        whileHover={{ scale: 1.02, x: 5 }}
                        style={{
                            cursor: 'pointer',
                            padding: '20px',
                            borderRadius: '12px',
                            background: activeStep === 0 ? 'var(--ua-lime)' : 'rgba(255,255,255,0.02)',
                            color: activeStep === 0 ? '#000' : '#fff',
                            border: `1px solid ${activeStep === 0 ? 'transparent' : 'var(--border-glass)'}`,
                            boxShadow: activeStep === 0 ? '0 0 20px rgba(200,255,1,0.3)' : 'none',
                            transition: 'all 0.3s ease',
                            marginBottom: '40px'
                        }}
                    >
                        <FaBookOpen size={24} style={{ marginBottom: '10px' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Concepto Teórico</h3>
                        <p style={{ fontSize: '0.85rem', opacity: activeStep === 0 ? 0.8 : 0.5 }}>Definición y acercamiento a la composición arquitectónica.</p>
                    </motion.div>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', paddingLeft: '10px' }}>La Metodología</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '10px' }}>
                        Transforma ideas abstractas en objetos concretos mediante 5 pasos secuenciales.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {steps.map((step) => {
                            const isActive = activeStep === step.id;
                            const isPast = step.id < activeStep && activeStep !== 0;
                            return (
                                <motion.div
                                    key={step.id}
                                    onClick={() => setActiveStep(step.id)}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        background: isActive ? 'var(--ua-lime)' : (isPast ? 'rgba(200,255,1,0.1)' : 'rgba(255,255,255,0.02)'),
                                        color: isActive ? '#000' : '#fff',
                                        border: `1px solid ${isActive ? 'transparent' : (isPast ? 'var(--ua-lime)' : 'var(--border-glass)')}`,
                                        boxShadow: isActive ? '0 0 20px rgba(200,255,1,0.3)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: '900', opacity: isActive ? 1 : 0.3, marginBottom: '10px' }}>0{step.id}</div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{step.title}</h3>
                                    {isActive && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{ fontSize: '0.85rem', marginTop: '10px', opacity: 0.8 }}
                                        >
                                            {step.desc}
                                        </motion.p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div id="main-scroll-area" style={{
                    flex: 1,
                    padding: '40px 60px',
                    overflowY: 'auto',
                    position: 'relative',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        #main-scroll-area::-webkit-scrollbar { display: none; }
                        .sidebar-scroll::-webkit-scrollbar { display: none; }
                    `}} />
                    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>

                        <AnimatePresence mode="wait">
                            {activeStep === 0 ? (
                                /* ---------------------------------------------------- */
                                /* ARTICLE LAYOUT: INTRODUCTION TO COMPOSITION          */
                                /* ---------------------------------------------------- */
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                                        <p style={{ color: 'var(--ua-teal)', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '10px' }}>FUNDAMENTOS BÁSICOS</p>
                                        <h1 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px' }}>
                                            ¿Qué es la <br /><span className="glow-text-lime">Composición?</span>
                                        </h1>
                                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
                                            Diseñar en arquitectura no es un acto de inspiración divina, sino un proceso lógico que transita del análisis a la síntesis para transformar ideas abstractas en objetos arquitectónicos concretos.
                                        </p>
                                    </div>

                                    {/* Video Section */}
                                    <div style={{ aspectRatio: '16/9', marginBottom: '60px', overflow: 'hidden', background: '#000', border: '1px solid rgba(200,255,1,0.3)', boxShadow: '0 0 15px rgba(200,255,1,0.15), 0 0 40px rgba(200,255,1,0.05), inset 0 0 15px rgba(200,255,1,0.03)' }}>
                                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/e9seQRVN-K8?rel=0" title="Video Prólogo – Bloque 1" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;" allowFullScreen />
                                    </div>

                                    {/* Article Columns */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.8rem', color: 'var(--ua-lime)', marginBottom: '20px' }}>La eliminación de la incertidumbre</h3>
                                            <p style={{ fontSize: '1.1rem', color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '20px' }}>
                                                El objetivo central de este laboratorio es eliminar la incertidumbre de la página en blanco, entregando una ruta clara. La verdadera materia prima de la arquitectura es el <strong>vacío</strong>, y nuestra tarea es delimitarlo mediante formas sólidas para que pueda ser habitado.
                                            </p>
                                            <p style={{ fontSize: '1.1rem', color: 'var(--text-color)', lineHeight: '1.8' }}>
                                                Al dominar la composición, adquirirás el vocabulario esencial del diseñador, entendiendo que el plano funciona como límite, la línea como dirección y el volumen como contenedor de experiencias y atmósferas.
                                            </p>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <img src="https://i.pinimg.com/originals/57/52/d6/5752d6e78fed1307799b022226e6b0ec.jpg" alt="Boceto Arquitectónico" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                                            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: 'var(--ua-teal)', padding: '20px', borderRadius: '8px', width: '80%', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                                                <i style={{ fontSize: '0.9rem' }}>&quot;La arquitectura es el juego sabio, correcto y magnífico de los volúmenes ensamblados bajo la luz.&quot;</i>
                                                <div style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '0.8rem', textTransform: 'uppercase' }}>- Le Corbusier</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Related Resources row */}
                                    <h4 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '20px' }}>Bibliografía y Recursos Relacionados</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                        <div className="glass-panel" style={{ padding: '20px' }}>
                                            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                                            <h5 style={{ color: 'var(--ua-lime)', marginBottom: '5px' }}>Forma, Espacio y Orden</h5>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Francis D.K. Ching. Referencia fundamental para entender la geometría espacial.</p>
                                        </div>
                                        <div className="glass-panel" style={{ padding: '20px' }}>
                                            <img src="https://www.domusweb.it/content/dam/domusweb/en/news/2018/05/16/the-maxxi-pays-tribute-to-bruno-zevis-intellectual-legacy/gallery/domus-maxxi-bruno-zevi-16.jpg.foto.rmedium.png" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                                            <h5 style={{ color: 'var(--ua-lime)', marginBottom: '5px' }}>Saber Ver la Arquitectura</h5>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bruno Zevi. Ensayo clásico sobre la interpretación del espacio arquitectónico.</p>
                                        </div>
                                        <div className="glass-panel" style={{ padding: '20px' }}>
                                            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                                            <h5 style={{ color: 'var(--ua-lime)', marginBottom: '5px' }}>El Espacio Vacío</h5>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Investigación sobre la importancia de la luz y el aire en la configuración estructural.</p>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: '60px' }}>
                                        <button onClick={() => { setActiveStep(1); document.getElementById('main-scroll-area').scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '50px' }}>
                                            Ingresar a la Metodología
                                        </button>
                                    </div>

                                </motion.div>

                            ) : (
                                /* ---------------------------------------------------- */
                                /* STEPS LAYOUT (1 to 5)                                */
                                /* ---------------------------------------------------- */
                                <motion.div
                                    key={`step-${activeStep}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ua-lime)', marginBottom: '20px' }}>
                                        <FaLightbulb size={24} />
                                        <span style={{ fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Paso {activeStep} de 5</span>
                                    </div>

                                    <h1 style={{ fontSize: '4rem', marginBottom: '20px', fontWeight: '900' }}>{steps[activeStep - 1].title}</h1>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid var(--ua-teal)', marginBottom: '40px' }}>
                                        <p style={{ fontSize: '1.4rem', color: '#fff', lineHeight: '1.8' }}>
                                            {steps[activeStep - 1].desc}
                                        </p>
                                    </div>

                                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '60px' }}>
                                        La metodología &quot;Aprender haciendo&quot; requiere que entiendas el razonamiento lógico detrás de cada forma geométrica.
                                        Aprender este paso es fundamental para dominar el lenguaje espacial. En la práctica arquitectónica, saltarse este fundamento suele llevar a diseños desequilibrados y espacios carentes de propósito o proporción visual.
                                    </p>

                                    {/* Action button to proceed */}
                                    {activeStep < 5 && (
                                        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '30px', textAlign: 'right' }}>
                                            <button onClick={() => { setActiveStep(activeStep + 1); document.getElementById('main-scroll-area').scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-secondary" style={{ padding: '12px 24px' }}>
                                                Siguiente paso: {steps[activeStep].title}
                                            </button>
                                        </div>
                                    )}

                                    {/* INTERACTIVE LAB SECTION - ONLY SHOWS ON STEP 5 */}
                                    {activeStep === 5 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.6 }}
                                            style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '60px', marginTop: '40px' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ua-teal)', marginBottom: '30px', background: 'rgba(0,164,181,0.1)', padding: '15px 30px', borderRadius: '50px', display: 'inline-flex' }}>
                                                <FaFlask size={24} />
                                                <span style={{ fontWeight: 'bold', letterSpacing: '2px' }}>DESBLOQUEADO: LABORATORIO INTERACTIVO</span>
                                            </div>

                                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
                                                Has recorrido la metodología completa. Ahora es tu turno de aplicar los 5 pasos en el entorno de simulación espacial 2D/3D.
                                            </p>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--ua-lime)', background: 'linear-gradient(to bottom, rgba(200,255,1,0.05), transparent)' }}>
                                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📐</div>
                                                    <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Ejercicio 1: Síntesis Formal</h3>
                                                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
                                                        Construye una composición tridimensional equilibrada paso a paso. Interfaz dual 2D Planta y 3D Perspectiva.
                                                    </p>
                                                    <Link href="/bloques/1/ex1" target="_blank" style={{ textDecoration: 'none' }}>
                                                        <button className="btn-primary" style={{ width: '100%' }}>Lanzar Simulación</button>
                                                    </Link>
                                                </div>

                                                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderColor: 'rgba(0,164,181,0.3)', opacity: 0.7 }}>
                                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👁️</div>
                                                    <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Ejercicio 2: Identidad</h3>
                                                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
                                                        Descubre tu perfil creativo arquitectónico eligiendo obras representativas.
                                                    </p>
                                                    <Link href="/bloques/1/ex2" target="_blank" style={{ textDecoration: 'none' }}>
                                                        <button className="btn-secondary" style={{ width: '100%', borderColor: 'var(--ua-teal)', color: 'var(--ua-teal)' }}>Lanzar Diagnóstico</button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

                {/* Global Footer */}
                <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4, pointerEvents: 'none' }}>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>Desarrollado por YedaTech para</p>
                    <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="Universidad de América" style={{ height: '22px', filter: 'grayscale(100%) brightness(200%)' }} />
                </div>

            </div>
        </PageTransition>
    );
}
