"use client";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaPlayCircle,
    FaFlask,
    FaPodcast,
    FaImage,
    FaCity,
    FaMapMarkedAlt,
    FaUsers,
    FaBuilding,
    FaBorderAll,
    FaProjectDiagram,
    FaTimes,
    FaBook,
    FaLock
} from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';
import PodcastPlayer from '@/components/PodcastPlayer';
import ImageCarousel from '@/components/ImageCarousel';
import styles from './block4.module.css';

const CONCEPTS = [
    {
        id: 'trama',
        title: 'Trama Urbana',
        icon: '🗺️',
        color: '#4CAF50',
        glowClass: 'glowGreen',
        img: 'https://1.bp.blogspot.com/-wGrsWnC8MyA/XrkWL9as9jI/AAAAAAAAXYU/4xZ9ss6QYWQfTWxV5KVhdaK1OFCZDRvCACLcBGAsYHQ/s1600/urban-fabric-trama-urbana-ciudades-urbanismo.jpg',
        summary: 'El patrón formado por calles, manzanas y espacios abiertos. Representa la historia y lógica de crecimiento de un lugar.',
        detail: 'La trama urbana es el ADN de la ciudad. Es el patrón formado por las calles, manzanas y espacios abiertos que representa la historia y la lógica de crecimiento de un lugar. Una trama puede ser ortogonal (recta), radiocéntrica u orgánica.\n\nLa forma de la ciudad determina cómo viven sus ciudadanos. Una trama ortogonal (como Manhattan) facilita la orientación y la división eficiente del suelo. Una trama radiocéntrica (como París) jerarquiza los flujos hacia un centro monumental. Una trama orgánica (como los cascos medievales) responde a la topografía natural y crea recorridos impredecibles.\n\nAl igual que en un edificio, la ciudad necesita un andamiaje invisible que regule la posición de las manzanas y las calles. Una retícula clara facilita la orientación y optimiza el movimiento.'
    },
    {
        id: 'espacio_publico',
        title: 'Espacio Público: El Vacío Vital',
        icon: '🏛️',
        color: '#FFB300',
        glowClass: 'glowAmber',
        img: 'https://bogota.gov.co/sites/default/files/styles/1050px/public/2022-08/vital.jpg',
        summary: 'El espacio de propiedad y uso común donde se ejerce la ciudadanía. Incluye calles, plazas y parques.',
        detail: 'El espacio público es el vacío vital de la ciudad: el espacio de propiedad y uso común donde se ejerce la ciudadanía. Incluye calles, plazas y parques. En arquitectura urbana, el vacío es el material principal que se debe diseñar.\n\nNo es "lo que sobra" entre edificios. Es el escenario donde ocurre la vida comunitaria: el encuentro casual, la protesta ciudadana, el juego de los niños, el paseo del anciano. Una ciudad sin espacio público es una ciudad sin alma.\n\nDiseñar espacio público es liberar área del suelo para que la gente lo habite. Es la expresión máxima de la democracia espacial: un lugar que pertenece a todos por igual.'
    },
    {
        id: 'escala_humana',
        title: 'Escala Humana',
        icon: '🚶',
        color: '#00BCD4',
        glowClass: 'glowCyan',
        img: 'https://i.ytimg.com/vi/RwGp_VOOkF4/maxresdefault.jpg',
        summary: 'La relación de proporción entre el entorno construido y las dimensiones del ser humano. Prioriza al peatón.',
        detail: 'La escala humana es la relación de proporción entre el entorno construido y las dimensiones y capacidades del ser humano. Un diseño con escala humana prioriza al peatón sobre el vehículo.\n\nSi los edificios son demasiado altos y la calle demasiado estrecha, el ciudadano se siente oprimido. Si los retiros son excesivos y las fachadas mudas, la calle se siente insegura y desolada. La buena urbanística busca proporciones que respeten la percepción y el confort del peatón.\n\nJan Gehl, urbanista danés, demostró que las ciudades más amables son aquellas diseñadas a velocidad de 5 km/h (la velocidad de caminar), no a 60 km/h (la velocidad del automóvil). La escala humana es la diferencia entre una ciudad para máquinas y una ciudad para personas.'
    },
    {
        id: 'uso_suelo',
        title: 'Uso del Suelo',
        icon: '🎨',
        color: '#C8FF01',
        glowClass: 'glowLime',
        img: 'https://propiedades.com/blog/wp-content/uploads/2022/11/tipo-de-uso-de-suelo.jpg',
        summary: 'Las funciones que ocurren en los edificios: vivienda, comercio, oficinas. La mezcla de usos da vida a las calles.',
        detail: 'El uso del suelo se refiere a las funciones que ocurren en los edificios: vivienda, comercio, oficinas, cultura, educación. Una ciudad que promueve la mezcla de usos garantiza que siempre haya vida en las calles.\n\nJane Jacobs, en "Muerte y vida de las grandes ciudades" (1961), demostró que la separación rígida de funciones (zonificación moderna) mataba la vitalidad urbana. Un barrio donde solo hay oficinas queda desierto a las 6 PM. Un barrio donde solo hay vivienda carece de servicios diurnos.\n\nLa mezcla de usos genera lo que Jacobs llamó "ojos en la calle": la vigilancia natural que surge cuando diferentes actividades coexisten en horarios complementarios. Vivienda + comercio + cultura = ciudad viva las 24 horas.'
    },
    {
        id: 'limite_borde',
        title: 'Límite y Borde Urbano',
        icon: '🧱',
        color: '#FF69B4',
        glowClass: 'glowPink',
        img: 'https://lycorisestudio.com/wp-content/uploads/LycorisEstudio_ElementosKevinLynch01-2048x1762.png',
        summary: 'La transición entre zonas. Un borde puede ser barrera infranqueable o membrana porosa que invita a entrar.',
        detail: 'El límite y borde urbano es la transición entre diferentes zonas o entre el interior y el exterior de la manzana. Un borde puede ser una barrera infranqueable o una membrana porosa que invita a entrar.\n\nKevin Lynch, en "La imagen de la ciudad" (1960), identificó los bordes como uno de los cinco elementos que estructuran la percepción urbana. Un río sin puentes es un borde-barrera; una avenida arbolada con cruces peatonales es un borde-costura.\n\nLas fachadas de los edificios no son solo paredes: son los límites que contienen el espacio de la calle. Un plano bien ubicado puede invitar al encuentro (fachada comercial activa) o generar aislamiento (muro ciego de estacionamiento). La calidad del borde define la calidad de la experiencia urbana.'
    },
    {
        id: 'nodos',
        title: 'Nodos de Actividad',
        icon: '📍',
        color: '#42A5F5',
        glowClass: 'glowBlue',
        img: 'https://www.atlantico.gov.co/images/stories/cabezote_plaza.jpg',
        summary: 'Lugares estratégicos donde se cruzan los flujos y se concentra la gente: esquinas, estaciones, plazas.',
        detail: 'Los nodos de actividad son lugares estratégicos donde se cruzan los flujos y se concentra la gente. Puede ser una esquina importante, una estación de transporte o una plaza.\n\nKevin Lynch los definió como puntos de intensidad: los lugares donde la ciudad se vuelve más densa en significado y actividad. Un nodo exitoso atrae personas por múltiples razones simultáneamente (transporte + comercio + cultura).\n\nDiseñar un nodo es lograr que varios ejes (pautas) converjan en un mismo punto, creando un campo gravitatorio urbano. Los mejores nodos son aquellos que generan una experiencia multisensorial: sonido de conversaciones, olor a comida, movimiento constante, luz natural filtrada por árboles.'
    }
];

export default function Block4Client({ user }) {
    const [showVideo, setShowVideo] = useState(false);
    const [selectedConcept, setSelectedConcept] = useState(null);

    return (
        <PageTransition>
            <div className={styles.container}>

                {/* Back to Lab */}
                <Link href="/laboratorio" style={{ color: 'var(--ua-lime)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
                    <FaArrowLeft /> Regresar al Laboratorio
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>Bloque 4: <span className="glow-text-lime">La Ciudad y el Territorio</span></h1>
                    <p className={styles.subtitle}>
                        La ciudad no es un conjunto de edificios aislados, sino un sistema complejo de relaciones, flujos y vacíos.
                        Aquí aprenderás a leer el territorio y a intervenir con responsabilidad urbana.
                    </p>
                </div>

                {/* ── Video Section ── */}
                <div className="glass-panel" style={{ aspectRatio: '16/9', marginBottom: '50px', borderRadius: '16px', overflow: 'hidden', position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!showVideo ? (
                        <div style={{ textAlign: 'center', zIndex: 2 }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,188,212,0.2)', display: 'flex', border: '1px solid #00BCD4', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', cursor: 'pointer', boxShadow: '0 0 30px rgba(0,188,212,0.3)' }} onClick={() => setShowVideo(true)}>
                                <FaPlayCircle size={40} color="#00BCD4" />
                            </div>
                            <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>Reproducir Video Prólogo – Bloque 4</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>Video Prólogo IA</p>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <iframe width="100%" height="100%" src="https://app.heygen.com/embeds/4e6cc0edef5440ada9c9c731f40cfb6c" title="HeyGen video player" frameBorder="0" allow="encrypted-media; fullscreen;" allowFullScreen />
                            <button onClick={() => setShowVideo(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.7)', border: '1px solid var(--border-glass)', color: '#fff', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px' }}>Cerrar</button>
                        </div>
                    )}
                    {!showVideo && <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} alt="Vista urbana aérea" />}
                </div>

                {/* ── Objective Banner ── */}
                <div className={styles.objectiveBanner}>
                    <div className={styles.objectiveIcon}>🎯</div>
                    <div>
                        <h3 style={{ color: '#00BCD4', marginBottom: '8px', fontSize: '1.1rem' }}>Objetivo de Aprendizaje</h3>
                        <p>
                            Comprender que la ciudad es un <strong style={{ color: '#fff' }}>sistema complejo</strong> donde la <strong style={{ color: '#C8FF01' }}>Malla</strong>, el <strong style={{ color: '#C8FF01' }}>Eje</strong> y el <strong style={{ color: '#C8FF01' }}>Plano</strong> organizan el territorio para garantizar una <strong style={{ color: '#00BCD4' }}>Escala Humana</strong> adecuada y un <strong style={{ color: '#FFB300' }}>Espacio Público</strong> de calidad.
                        </p>
                    </div>
                </div>

                {/* ── Concept Grid ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '30px' }}>
                    <FaMapMarkedAlt style={{ marginRight: '10px' }} />Conceptos Urbanos Fundamentales
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '35px', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    Cada concepto es una herramienta para leer y diseñar la ciudad. Haz clic en cualquier tarjeta para explorar en profundidad.
                </p>

                <div className={styles.conceptGrid}>
                    {CONCEPTS.map((concept, idx) => (
                        <motion.div
                            key={concept.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.4 }}
                            className={styles.conceptCard}
                            onClick={() => setSelectedConcept(concept)}
                            style={{ '--card-color': concept.color }}
                        >
                            <div className={styles.cardIcon}>{concept.icon}</div>
                            <h4 className={`${styles.cardTitle} ${styles[concept.glowClass]}`}>{concept.title}</h4>
                            <p className={styles.cardSummary}>{concept.summary}</p>
                            <span className={styles.exploreCta} style={{ color: concept.color }}>Explorar concepto →</span>
                        </motion.div>
                    ))}
                </div>

                {/* ── Concept Detail Modal (portal) ── */}
                {typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {selectedConcept && (
                            <motion.div
                                className={styles.modalOverlay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedConcept(null)}
                            >
                                <motion.div
                                    className={styles.modalBox}
                                    initial={{ scale: 0.9, y: 30 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 30 }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ borderLeftColor: selectedConcept.color }}
                                >
                                    <button className={styles.modalClose} onClick={() => setSelectedConcept(null)}>
                                        <FaTimes />
                                    </button>

                                    <div className={styles.modalImgHeader}>
                                        <img src={selectedConcept.img} alt={selectedConcept.title} />
                                        <div className={styles.modalImgOverlay}>
                                            <span style={{ background: selectedConcept.color, color: '#000', padding: '4px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
                                                {selectedConcept.icon} Urbanismo
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.modalBody}>
                                        <h3 style={{ color: selectedConcept.color }}>{selectedConcept.title}</h3>
                                        {selectedConcept.detail.split('\n\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>

                                    <button className={styles.modalBtn} style={{ background: selectedConcept.color }} onClick={() => setSelectedConcept(null)}>
                                        Entendido
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

                {/* ── Media Placeholders ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '60px', marginBottom: '10px' }}>
                    📡 Recursos Complementarios
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
                    Material audiovisual y gráfico para profundizar en los conceptos del bloque.
                </p>

                {/* Podcast – full width */}
                <PodcastPlayer
                    src="/audios/audio_bloque_4.m4a"
                    title="Podcast Bloque 4"
                    description="Urbanismo y escala humana"
                    accentColor="#00BCD4"
                />

                {/* Gallery Carousel */}
                <div style={{ marginTop: '30px' }}>
                    <ImageCarousel
                        accentColor="#00BCD4"
                        images={[
                            {
                                src: '/galeria/b4_barcelona_cerdá.jpg',
                                title: 'Ensanche de Barcelona',
                                architect: 'Ildefons Cerdà, 1860',
                                description: 'Trama ortogonal con chaflanes octogonales que permiten visibilidad en cada cruce. El ejemplo más influyente de planificación urbana racional del siglo XIX.'
                            },
                            {
                                src: '/galeria/b4_copenhague.jpg',
                                title: 'Strøget – Copenhague',
                                architect: 'Jan Gehl, Peatonalizada en 1962',
                                description: 'La calle peatonal más larga de Europa. Ejemplo de escala humana: la ciudad diseñada a velocidad de 5 km/h para el peatón, no para el automóvil.'
                            },
                            {
                                src: '/galeria/b4_highline.jpg',
                                title: 'High Line – Nueva York',
                                architect: 'Diller Scofidio + Renfro, 2009',
                                description: 'Vía férrea abandonada transformada en espacio público elevado. El vacío vital de la ciudad recuperado como parque lineal y nodo de actividad.'
                            },
                            {
                                src: '/galeria/b4_medellín.jpg',
                                title: 'Metrocable – Medellín',
                                architect: 'EDU / Alcaldía de Medellín, 2004',
                                description: 'Infraestructura que conecta barrios marginales con el centro. Ejemplo de cómo el transporte público puede transformar la trama urbana y la equidad territorial.'
                            },
                            {
                                src: '/galeria/b4_supermanzana.jpg',
                                title: 'Supermanzanas – Barcelona',
                                architect: 'Salvador Rueda / BCNecología, 2016',
                                description: 'Agrupación de 9 manzanas del Ensanche para priorizar al peatón. El uso del suelo se transforma: menos tráfico, más espacio público y mezcla de actividades.'
                            },
                            {
                                src: '/galeria/b4_brasilia.jpg',
                                title: 'Plan Piloto de Brasilia',
                                architect: 'Lucio Costa & Oscar Niemeyer, 1960',
                                description: 'Ciudad diseñada desde cero con trama monumental. Ejemplo radical de separación de funciones y escala del automóvil: un caso de estudio sobre límites y bordes urbanos.'
                            }
                        ]}
                    />
                </div>

                {/* ── Exercises ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '60px' }}>
                    <FaFlask style={{ marginRight: '10px' }} />Laboratorio de Pruebas
                </h2>
                <div className={styles.exerciseGrid}>
                    <Link href="/bloques/4/ex1" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            className={styles.exerciseCard}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ borderColor: 'rgba(76,175,80,0.3)' }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🗺️</div>
                            <h4 style={{ color: '#4CAF50', fontSize: '1.1rem', marginBottom: '6px' }}>Ejercicio 1: La Trama y el Orden</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Organiza una estructura urbana desordenada para crear un sector legible y conectado.
                            </p>
                            <span style={{ fontSize: '0.8rem', color: '#4CAF50', opacity: 1, marginTop: '10px', display: 'block' }}>Iniciar →</span>
                        </motion.div>
                    </Link>
                    <Link href="/bloques/4/ex2" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            className={styles.exerciseCard}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ borderColor: 'rgba(0,188,212,0.3)' }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏘️</div>
                            <h4 style={{ color: '#00BCD4', fontSize: '1.1rem', marginBottom: '6px' }}>Ejercicio 2: El Espacio para el Ciudadano</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Transforma el interior de una manzana maciza en un sistema de espacios habitables y fluidos.
                            </p>
                            <span style={{ fontSize: '0.8rem', color: '#00BCD4', opacity: 1, marginTop: '10px', display: 'block' }}>Iniciar →</span>
                        </motion.div>
                    </Link>
                </div>

                {/* Footer */}
                <div style={{ paddingBottom: '40px', paddingTop: '60px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>Desarrollado por YedaTech para</p>
                    <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="Universidad de América" style={{ height: '22px', filter: 'grayscale(100%) brightness(200%)' }} />
                </div>

            </div>
        </PageTransition>
    );
}
