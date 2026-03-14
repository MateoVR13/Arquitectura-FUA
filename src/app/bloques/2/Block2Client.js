"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaCubes,
    FaCompressArrowsAlt,
    FaArrowsAltH,
    FaWaveSquare,
    FaTh,
    FaWind,
    FaFlask,

    FaPodcast,
    FaImage
} from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';
import PodcastPlayer from '@/components/PodcastPlayer';
import ImageCarousel from '@/components/ImageCarousel';
import styles from './block2.module.css';

export default function Block2Client({ user }) {


    return (
        <PageTransition>
            <div className={styles.container}>

                {/* Back to Lab */}
                <Link href="/laboratorio" style={{ color: 'var(--ua-lime)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
                    <FaArrowLeft /> Regresar al Laboratorio
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>Bloque 2: <span className="glow-text-lime">Estructura y Tectónica</span></h1>
                    <p className={styles.subtitle}>
                        La arquitectura no es solo un dibujo estético, sino un sistema físico en equilibrio.
                        Aprende cómo la línea sostiene la masa y el plano estabiliza el vacío.
                    </p>
                </div>

                {/* Video Section */}
                <div style={{ aspectRatio: '16/9', marginBottom: '60px', overflow: 'hidden', background: '#000', border: '1px solid rgba(200,255,1,0.3)', boxShadow: '0 0 15px rgba(200,255,1,0.15), 0 0 40px rgba(200,255,1,0.05), inset 0 0 15px rgba(200,255,1,0.03)' }}>
                    <iframe width="100%" height="100%" style={{ display: 'block' }} src="https://www.youtube.com/embed/KMaeaBJ4xfw?rel=0" title="Video Prólogo – Bloque 2" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;" allowFullScreen />
                </div>

                {/* Bento Grid layout */}
                <div className={styles.bentoGrid}>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.bentoCard} ${styles.span2col}`}
                    >
                        <h3 className={styles.glowLime}><FaCubes /> Tectónica</h3>
                        <p>
                            La <strong>poética de la construcción</strong>. No es simplemente construir, es el arte de hacer que la estructura sea expresiva.
                            Es el punto donde la estructura (Línea) y la masa (Volumen) dejan de ser elementos meramente técnicos para convertirse
                            en un lenguaje estético. Celebra el detalle de las conexiones, enseñando que la belleza es el resultado de una lógica estructural honesta.
                        </p>
                        <FaCubes className={styles.decorIcon} />
                    </motion.div>

                    {/* Compresión */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={styles.bentoCard}
                    >
                        <h3 className={styles.glowRed}><FaCompressArrowsAlt /> Compresión</h3>
                        <p>
                            El esfuerzo del aplastamiento. Es la fuerza de la gravedad actuando sobre la materia. Las columnas pétreas, el concreto y los muros masivos dominan este esfuerzo, logrando resistir el peso sin pandearse.
                        </p>
                        <FaCompressArrowsAlt className={styles.decorIcon} />
                    </motion.div>

                    {/* Tracción */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={styles.bentoCard}
                    >
                        <h3 className={styles.glowBlue}><FaArrowsAltH /> Tracción</h3>
                        <p>
                            El esfuerzo del estiramiento. Permite que los edificios vuelen. Es el lenguaje de los cables de acero que tensionan techos ligeros, contrarrestando la compresión para mantener grandes vanos limpios.
                        </p>
                        <FaArrowsAltH className={styles.decorIcon} />
                    </motion.div>

                    {/* Malla Estructural */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className={styles.bentoCard}
                    >
                        <h3 className={styles.glowOrange}><FaTh /> La Malla</h3>
                        <p>
                            El orden invisible. Red fundamental de ejes que regula dónde se plantarán los apoyos (columnas). No restringe, sino que organiza las cargas de forma pura para que los muros interiores fluyan libres de esfuerzo.
                        </p>
                        <FaTh className={styles.decorIcon} />
                    </motion.div>

                    {/* Flexión */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`${styles.bentoCard} ${styles.span2col}`}
                    >
                        <h3 className={styles.glowRed}><FaWaveSquare /> Flexión y El Vano</h3>
                        <p>
                            Un esfuerzo compuesto (compresión arriba y tracción abajo) al que se enfrentan las <strong>vigas</strong> para cubrir distancias entre apoyos.
                            La resistencia a doblarse ante el peso central depende de la <em>inercia</em> del perfil. Un mayor &quot;peralte&quot; (canto de viga) resuelve el esfuerzo con mayor pericia estética.
                        </p>
                        <FaWaveSquare className={styles.decorIcon} />
                    </motion.div>

                    {/* Espacio/Vacío */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className={styles.bentoCard}
                    >
                        <h3 className={styles.glowBlue}><FaWind /> Vacío</h3>
                        <p>
                            La <strong>materia prima real</strong>. El aire esculpido que queda una vez que la estructura define sus límites físicos. Es lo que realmente usamos en arquitectura y se materializa liberando planos de carga.
                        </p>
                        <FaWind className={styles.decorIcon} />
                    </motion.div>

                </div>

                {/* ── Media Section ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '60px', marginBottom: '10px' }}>
                    📡 Recursos Complementarios
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
                    Material audiovisual y gráfico para profundizar en los conceptos del bloque.
                </p>

                {/* Podcast – full width */}
                <PodcastPlayer
                    src="/audios/audio_bloque_2.m4a"
                    title="Podcast Bloque 2"
                    description="Estructura y Tectónica"
                    accentColor="var(--ua-lime)"
                />

                {/* Gallery Carousel */}
                <div style={{ marginTop: '30px' }}>
                    <ImageCarousel
                        accentColor="var(--ua-lime)"
                        images={[
                            {
                                src: '/galeria/b2_pompidou.jpg',
                                title: 'Centre Pompidou',
                                architect: 'Renzo Piano & Richard Rogers, 1977',
                                description: 'La estructura como fachada: columnas, vigas, arriostramientos y conductos expuestos celebran la tectónica sin ocultarla. La honestidad constructiva llevada al extremo.'
                            },
                            {
                                src: '/galeria/b2_farnsworth.jpg',
                                title: 'Casa Farnsworth',
                                architect: 'Mies van der Rohe, 1951',
                                description: 'Columnas de acero en I que sostienen losas planas suspendidas. La compresión se resuelve con perfiles mínimos, liberando el vacío interior como protagonista absoluto.'
                            },
                            {
                                src: '/galeria/b2_opera_sydney.jpg',
                                title: 'Ópera de Sídney',
                                architect: 'Jørn Utzon, 1973',
                                description: 'Cascarones de concreto pretensado que trabajan a compresión, resolviendo grandes luces sin columnas interiores. La estructura define la forma y la identidad del edificio.'
                            },
                            {
                                src: '/galeria/b2_puente_millau.jpg',
                                title: 'Viaducto de Millau',
                                architect: 'Norman Foster & Michel Virlogeux, 2004',
                                description: 'Cables de acero en tracción pura sostienen el tablero del puente más alto del mundo. La tensión permite salvar vanos de 342 metros entre pilares.'
                            },
                            {
                                src: '/galeria/b2_unite_habitation.jpg',
                                title: 'Unite d Habitation',
                                architect: 'Le Corbusier, 1952',
                                description: 'Malla estructural de concreto armado con pilotis que liberan el suelo. Los esfuerzos de compresión y flexión se organizan en una retícula racional.'
                            },
                            {
                                src: '/galeria/b2_catedral_gotica.jpg',
                                title: 'Catedral Gótica – Bóvedas de Crucería',
                                architect: 'Tradición Medieval, Siglos XII–XV',
                                description: 'Los arcos apuntados y arbotantes canalizan los empujes de compresión hasta el suelo, permitiendo muros casi transparentes. La malla de nervaduras es el esqueleto visible de la piedra.'
                            }
                        ]}
                    />
                </div>

                {/* Exercises Section */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '60px' }}>
                    <FaFlask style={{ marginRight: '10px' }} />Laboratorio de Pruebas
                </h2>

                <div className={styles.exerciseGrid}>
                    <motion.div
                        className={styles.lockedExercise}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderColor: 'var(--ua-lime)', background: 'linear-gradient(to bottom, rgba(200,255,1,0.05), transparent)', opacity: 1 }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📐</div>
                        <h4>Ejercicio 1: El Reto del Vano</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Coloca apoyos, traza vigas y observa cómo se deforma la estructura al aumentar la distancia. Ajusta material y peralte para contrarrestar la flexión.
                        </p>
                        <Link href="/bloques/2/ex1" target="_blank" style={{ textDecoration: 'none', width: '100%' }}>
                            <button className="btn-primary" style={{ width: '100%' }}>Lanzar Simulación</button>
                        </Link>
                    </motion.div>

                    <motion.div
                        className={styles.lockedExercise}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderColor: 'rgba(0,164,181,0.3)', background: 'linear-gradient(to bottom, rgba(0,164,181,0.05), transparent)', opacity: 1 }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏗️</div>
                        <h4>Ejercicio 2: El Esqueleto Racional</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Planta columnas en una malla, cierra el marco con vigas, simula el viento y estabiliza la estructura con un muro de corte.
                        </p>
                        <Link href="/bloques/2/ex2" target="_blank" style={{ textDecoration: 'none', width: '100%' }}>
                            <button className="btn-secondary" style={{ width: '100%', borderColor: 'var(--ua-teal)', color: 'var(--ua-teal)' }}>Lanzar Simulación</button>
                        </Link>
                    </motion.div>
                </div>

                {/* Global Footer */}
                <div style={{ paddingBottom: '40px', paddingTop: '60px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>Desarrollado por YedaTech para</p>
                    <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="Universidad de América" style={{ height: '22px', filter: 'grayscale(100%) brightness(200%)' }} />
                </div>

            </div>
        </PageTransition>
    );
}
