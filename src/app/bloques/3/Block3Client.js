"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,

    FaFlask,
    FaLandmark,
    FaBuilding,
    FaProjectDiagram,
    FaPalette,
    FaLaptopCode,
    FaPodcast,
    FaImage,
    FaLock,
    FaBookOpen,
    FaHistory,
    FaTheaterMasks,
    FaPaintBrush,
    FaGlasses,
    FaTimes,
    FaLayerGroup,
    FaCompass,
    FaCogs,
    FaColumns
} from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';
import PodcastPlayer from '@/components/PodcastPlayer';
import ImageCarousel from '@/components/ImageCarousel';
import styles from './block3.module.css';

const ERAS = [
    {
        id: 'historicismo',
        epoch: 'Siglo XIX',
        title: 'Historicismo',
        icon: FaLandmark,
        color: '#FFD700',
        glowClass: 'glowGold',
        img: 'https://i0.wp.com/www.glosarioarquitectonico.com/wp-content/uploads/2015/12/historicista-1.jpg?ssl=1',
        summary: 'Mirar al pasado para construir el presente. La arquitectura toma prestados los vocabularios griegos, romanos o góticos y los reinterpreta.',
        detail: 'El Historicismo no es una copia fiel de lo antiguo, sino una reinterpretación selectiva. Los arquitectos del siglo XIX estudiaban los órdenes clásicos (dórico, jónico, corintio) y los vocabularios góticos para generar nuevas combinaciones. El ornamento era un código cultural que vinculaba el edificio con una tradición reconocible.\n\nReferentes clave: Viollet-le-Duc (restauración del gótico), Charles Garnier (Ópera de París), Karl Friedrich Schinkel (neoclasicismo prusiano).\n\nEl historicismo nos enseña que toda forma arquitectónica carga un significado cultural heredado. Diseñar es, en cierto modo, dialogar con los muertos.',
        architects: 'Viollet-le-Duc · Charles Garnier · Karl Friedrich Schinkel'
    },
    {
        id: 'modernismo',
        epoch: '1920 – 1960',
        title: 'Modernismo',
        icon: FaBuilding,
        color: '#C0C0C0',
        glowClass: 'glowSilver',
        img: 'https://media.timeout.com/images/105309873/image.jpg',
        summary: '"La forma sigue la función". Elimina el ornamento y exalta la honestidad material: concreto, acero y vidrio.',
        detail: 'El Modernismo es la revolución más radical en la historia de la arquitectura. Nace de la industrialización y la urgencia social de la posguerra. Le Corbusier formula los "5 puntos de la arquitectura moderna": pilotis, planta libre, fachada libre, ventana corrida y terraza jardín.\n\nMies van der Rohe proclama "menos es más", llevando la estructura a su mínima expresión poética. La Villa Saboya, el Pabellón de Barcelona y la Casa Farnsworth son manifiestos construidos.\n\nEl Modernismo nos enseña que la estructura no debe esconderse: es el poema del edificio. La belleza emerge del orden racional, no del adorno.',
        architects: 'Le Corbusier · Mies van der Rohe · Walter Gropius · Oscar Niemeyer'
    },
    {
        id: 'postmodernismo',
        epoch: '1960 – 1990',
        title: 'Post-Modernismo',
        icon: FaPalette,
        color: '#FF69B4',
        glowClass: 'glowPink',
        img: 'https://tecnne.com/wp-content/uploads/2020/10/Arata-Isozaki-Disney-Building-tecnne.jpg',
        summary: 'La rebelión contra la caja blanca. Reintroduce el color, el humor y la referencia histórica como lenguaje legítimo.',
        detail: 'Robert Venturi publica "Complejidad y Contradicción en Arquitectura" (1966), el manifiesto fundacional que declara: "menos es aburrido". El Post-Modernismo reacciona contra la frialdad del International Style reintroduciendo el ornamento, el color y la ironía.\n\nMichael Graves diseña el edificio Portland con columnas gigantes de colores; Aldo Rossi revisita la tipología de la ciudad europea. La arquitectura deja de ser un ejercicio técnico puro para convertirse en un acto comunicativo.\n\nNos enseña que la arquitectura es un lenguaje que el ciudadano debe poder leer. El edificio no solo funciona: comunica, provoca y dialoga con su contexto cultural.',
        architects: 'Robert Venturi · Michael Graves · Aldo Rossi · Charles Moore'
    },
    {
        id: 'deconstructivismo',
        epoch: '1988 – Presente',
        title: 'Deconstructivismo',
        icon: FaProjectDiagram,
        color: '#BA55D3',
        glowClass: 'glowPurple',
        img: 'https://crehana-blog.imgix.net/media/filer_public/8b/c8/8bc8c8f9-be8a-4d99-a9ca-b31ca5492eb6/arquitectura-deconstructivista-que-es.jpg?auto=format&q=50',
        summary: 'Fragmentar para descubrir nuevas relaciones. Gehry, Hadid y Libeskind rompen los planos ortogonales.',
        detail: 'La exposición "Deconstructivist Architecture" del MoMA (1988) presenta a siete arquitectos que desafían la ortogonalidad: Gehry, Hadid, Koolhaas, Libeskind, Eisenman, Coop Himmelb(l)au y Tschumi. Se inspiran en el Constructivismo ruso y la filosofía de Derrida.\n\nEl Guggenheim Bilbao de Frank Gehry demuestra que un edificio puede revitalizar una ciudad entera. Zaha Hadid imagina espacios de fluidez antigravitatoria. Daniel Libeskind inserta fracturas emocionales en la materia (Museo Judío de Berlín).\n\nNos enseña que la inestabilidad visual puede generar experiencias espaciales profundas. La estructura exhibe su complejidad como lenguaje expresivo, no como defecto.',
        architects: 'Frank Gehry · Zaha Hadid · Daniel Libeskind · Rem Koolhaas'
    },
    {
        id: 'parametricismo',
        epoch: '2008 – Presente',
        title: 'Parametricismo',
        icon: FaLaptopCode,
        color: '#00CED1',
        glowClass: 'glowCyan',
        img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYCyw8-xY_CuSHHjAmhFYEoKYvMLnOWugA98-9waM555zRa3grG0qMKxgyhD0T4bDHDFM6Lzay7QArzTs-32AtDGh35_bqK1Y7KyOK9hRkuQDG3VO5Oa3kViRH4qaEuWHmRsOGMXDB_y5w/s1600/Museo+Soumaya+1.jpg',
        summary: 'La arquitectura como sistema algorítmico. Las formas nacen de reglas matemáticas y datos ambientales.',
        detail: 'Patrik Schumacher (Zaha Hadid Architects) acuña el término "Parametricismo" como el estilo del siglo XXI. Las formas ya no se dibujan: se programan. Los algoritmos procesan datos de orientación solar, flujos peatonales y requisitos estructurales para generar geometrías que la mano humana jamás podría trazar.\n\nBjarke Ingels (BIG) introduce la "hedonistic sustainability": arquitectura paramétrica que además es socialmente generosa. El Heydar Aliyev Center de Hadid elimina la distinción entre suelo, pared y techo.\n\nNos enseña que la computación no reemplaza al arquitecto: amplifica su capacidad de exploración. El diseño paramétrico es la frontera donde ciencia, arte y tecnología convergen.',
        architects: 'Patrik Schumacher · Bjarke Ingels · MVRDV · Kengo Kuma'
    }
];

const GLOSSARY = [
    {
        id: 'estilo',
        title: 'Estilo',
        icon: FaTheaterMasks,
        color: '#FFD700',
        glowClass: 'glowGold',
        summary: 'Conjunto coherente de decisiones formales que identifica una época o un autor. Es la huella cultural en la materia construida.',
        detail: 'El estilo no es una elección caprichosa: es el resultado inevitable de un contexto histórico, tecnológico y cultural. El estilo gótico nace de la obsesión medieval por la luz divina; el brutalismo, de la urgencia social de la posguerra. Reconocer un estilo es leer la historia codificada en piedra, acero y vidrio.\n\nEl arquitecto no "elige" un estilo como quien elige ropa: lo destila de su tiempo, su lugar y su postura ética frente a la construcción. Los estilos son lenguajes, no disfraces.'
    },
    {
        id: 'ornamento',
        title: 'Ornamento',
        icon: FaPaintBrush,
        color: '#BA55D3',
        glowClass: 'glowPurple',
        summary: 'Elemento añadido a la estructura con fin expresivo. Loos lo declaró "crimen", el post-modernismo lo reivindicó como comunicación.',
        detail: 'Adolf Loos publicó "Ornamento y Delito" (1908), argumentando que el ornamento era un desperdicio de trabajo humano y material. El Modernismo abrazó esta idea, produciendo superficies limpias y honestas.\n\nSin embargo, el Post-Modernismo demostró que eliminar el ornamento también elimina la capacidad del edificio de comunicarse con el ciudadano común. Robert Venturi defendió los "decorated sheds" (galpones decorados) como arquitectura legítima.\n\nHoy, el debate persiste: ¿el ornamento digital (fachadas paramétricas) es ornamento o estructura? La respuesta define tu postura como diseñador.'
    },
    {
        id: 'vanguardia',
        title: 'Vanguardia',
        icon: FaGlasses,
        color: '#00CED1',
        glowClass: 'glowCyan',
        summary: 'Movimiento que rompe con lo establecido para explorar territorios formales desconocidos. No busca consenso: busca evolución.',
        detail: 'Las vanguardias arquitectónicas del siglo XX (Constructivismo, De Stijl, Bauhaus, Metabolismo) compartían una convicción: el futuro no se hereda, se inventa. Cada vanguardia proponía un manifiesto que desafiaba las convenciones de su tiempo.\n\nEl Constructivismo ruso de Tatlin y Melnikov imaginó edificios como máquinas sociales. La Bauhaus de Gropius fusionó arte y producción industrial. Los Metabolistas japoneses diseñaron ciudades flotantes y cápsulas habitables.\n\nLa vanguardia no siempre se construye, pero siempre transforma el pensamiento. Es el laboratorio donde se prueban las ideas que luego el mainstream adopta.'
    },
    {
        id: 'relectura',
        title: 'Relectura Crítica',
        icon: FaHistory,
        color: '#FF69B4',
        glowClass: 'glowPink',
        summary: 'Revisitar una obra del pasado con la mirada del presente. No es copiar: es reinterpretar bajo nuevos paradigmas.',
        detail: 'La relectura crítica es el ejercicio intelectual de analizar una obra histórica con herramientas contemporáneas. No se trata de juzgar si el Partenón es "mejor" que el Guggenheim, sino de entender qué problemas resolvía cada uno y cómo lo hacía.\n\nPeter Eisenman releyó a Palladio no para copiar sus villas, sino para descubrir las reglas geométricas ocultas tras sus fachadas. Rem Koolhaas releyó el rascacielos neoyorquino para reinventar la torre contemporánea.\n\nReleer críticamente implica respeto profundo por la tradición, pero libertad total para reinterpretarla.'
    },
    {
        id: 'tipologia',
        title: 'Tipología',
        icon: FaLayerGroup,
        color: '#FFA500',
        glowClass: 'glowOrange',
        summary: 'Clasificación de edificios según su función, forma o estructura. La casa, el templo, el rascacielos: cada tipo codifica siglos de evolución.',
        detail: 'La tipología arquitectónica estudia los tipos recurrentes de edificios que la humanidad ha producido a lo largo de la historia. Aldo Rossi argumentó que los tipos son la "memoria colectiva" de la ciudad: la iglesia con nave central, la torre medieval, el patio andaluz.\n\nCada tipo no es un molde rígido, sino un esquema adaptable. La vivienda colectiva del siglo XXI es heredera del falansterio de Fourier, del Unité d\'Habitation de Le Corbusier y del loft neoyorquino.\n\nEntender la tipología es entender cómo la humanidad ha resuelto, una y otra vez, el problema de habitar.'
    },
    {
        id: 'proporcion',
        title: 'Proporción y Escala',
        icon: FaCompass,
        color: '#C0C0C0',
        glowClass: 'glowSilver',
        summary: 'La relación matemática entre las partes y el todo. La sección áurea, el Modulor de Le Corbusier, la escala humana.',
        detail: 'Desde Vitruvio hasta Le Corbusier, los arquitectos han buscado sistemas de proporción que generen armonía visual. La sección áurea (1:1.618) aparece en el Partenón y en las villas de Palladio. Le Corbusier inventó el Modulor, un sistema basado en las medidas del cuerpo humano.\n\nLa proporción no es decoración: es la estructura invisible que hace que un espacio "se sienta bien". Un techo demasiado alto aplasta; uno demasiado bajo asfixia. La proporción correcta es la que el cuerpo reconoce sin que la mente lo analice.\n\nLa escala, por su parte, es la relación del edificio con su contexto: un rascacielos en un barrio colonial rompe la escala; un pabellón en un parque la respeta.'
    },
    {
        id: 'tectonico',
        title: 'Expresión Tectónica',
        icon: FaCogs,
        color: '#ff4d4d',
        glowClass: 'glowRed',
        summary: 'El arte de hacer visible la lógica constructiva. Mostrar con orgullo cómo el edificio vence a la gravedad.',
        detail: 'Kenneth Frampton definió la tectónica como "la poética de la construcción". Es la decisión de celebrar la unión entre columna y viga, de mostrar el acero desnudo o de revelar la textura del encofrado en el concreto.\n\nMies van der Rohe en el Crown Hall de Chicago hace que la estructura sea el único elemento expresivo. Tadao Ando convierte el concreto aparente en un material casi espiritual. Renzo Piano en el Centre Pompidou exhibe las tripas del edificio como su fachada principal.\n\nLa expresión tectónica es honestidad material: no esconder cómo funciona el edificio, sino convertirlo en lenguaje estético.'
    },
    {
        id: 'orden',
        title: 'Orden Arquitectónico',
        icon: FaColumns,
        color: 'var(--ua-lime)',
        glowClass: 'glowLime',
        summary: 'Sistema de reglas formales que define la base, columna y entablamento. Los órdenes griegos son el ABC del lenguaje clásico.',
        detail: 'Los tres órdenes clásicos griegos (dórico, jónico y corintio) y los dos romanos (toscano y compuesto) constituyen el vocabulario fundamental de la arquitectura occidental durante más de dos milenios. Cada orden define proporciones específicas entre columna, capitel y entablamento.\n\nEl orden dórico transmite robustez y austeridad (Partenón). El jónico, elegancia y refinamiento (Erecteión). El corintio, exuberancia decorativa (Templo de Zeus Olímpico).\n\nAunque el Modernismo rechazó los órdenes clásicos, su lógica subyace en toda la arquitectura occidental. Incluso la grilla modular de Mies es, en esencia, un orden contemporáneo.'
    }
];

export default function Block3Client({ user }) {

    const [selectedEra, setSelectedEra] = useState(null);
    const [selectedGlossary, setSelectedGlossary] = useState(null);

    return (
        <PageTransition>
            <div className={styles.container}>

                {/* Back to Lab */}
                <Link href="/laboratorio" style={{ color: 'var(--ua-lime)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
                    <FaArrowLeft /> Regresar al Laboratorio
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>Bloque 3: <span className="glow-text-lime">Lenguaje y Cultura</span></h1>
                    <p className={styles.subtitle}>
                        La arquitectura es un producto cultural. Cada época produce formas que reflejan sus valores, sus tecnologías y sus luchas.
                        Aquí recorrerás 5 momentos clave del pensamiento arquitectónico.
                    </p>
                </div>

                {/* ── Video Section ── */}
                <div style={{ aspectRatio: '16/9', marginBottom: '60px', overflow: 'hidden', background: '#000', border: '1px solid rgba(200,255,1,0.3)', boxShadow: '0 0 15px rgba(200,255,1,0.15), 0 0 40px rgba(200,255,1,0.05), inset 0 0 15px rgba(200,255,1,0.03)' }}>
                    <iframe width="100%" height="100%" style={{ display: 'block' }} src="https://www.youtube.com/embed/Sscv5lex7YE?rel=0" title="Video Prólogo – Bloque 3" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;" allowFullScreen />
                </div>

                {/* ── Timeline ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '40px' }}>
                    <FaHistory style={{ marginRight: '10px' }} />Línea del Tiempo Arquitectónica
                </h2>

                <div className={styles.timeline}>
                    {/* Central line */}
                    <div className={styles.timelineLine} />

                    {ERAS.map((era, idx) => {
                        const Icon = era.icon;
                        const isLeft = idx % 2 === 0;
                        return (
                            <motion.div
                                key={era.id}
                                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className={`${styles.timelineItem} ${isLeft ? styles.timelineLeft : styles.timelineRight}`}
                                onClick={() => setSelectedEra(era)}
                            >
                                {/* Node dot on the line */}
                                <div className={styles.timelineNode} style={{ background: era.color, boxShadow: `0 0 12px ${era.color}` }} />

                                <div className={styles.timelineCard}>
                                    <div className={styles.timelineImg}>
                                        <img src={era.img} alt={era.title} />
                                        <div className={styles.timelineEpoch} style={{ background: era.color, color: '#000' }}>{era.epoch}</div>
                                    </div>
                                    <div className={styles.timelineBody}>
                                        <h3 className={styles[era.glowClass]}><Icon /> {era.title}</h3>
                                        <p>{era.summary}</p>
                                        <span className={styles.readMore}>Clic para explorar →</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Detail Modal (portal to body to escape transform) ── */}
                {typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {selectedEra && (
                            <motion.div
                                className={styles.modalOverlay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedEra(null)}
                            >
                                <motion.div
                                    className={styles.modalBox}
                                    initial={{ scale: 0.9, y: 30 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 30 }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ borderLeftColor: selectedEra.color }}
                                >
                                    <button className={styles.modalClose} onClick={() => setSelectedEra(null)}>
                                        <FaTimes />
                                    </button>

                                    <div className={styles.modalImgHeader}>
                                        <img src={selectedEra.img} alt={selectedEra.title} />
                                        <div className={styles.modalImgOverlay}>
                                            <span style={{ background: selectedEra.color, color: '#000', padding: '4px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
                                                {selectedEra.epoch}
                                            </span>
                                            <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900 }}>
                                                {(() => { const Icon = selectedEra.icon; return <Icon style={{ marginRight: '10px' }} />; })()}
                                                {selectedEra.title}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className={styles.modalContent}>
                                        {selectedEra.detail.split('\n\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                        <div className={styles.modalArchitects}>
                                            <strong style={{ color: selectedEra.color }}>Referentes:</strong> {selectedEra.architects}
                                        </div>
                                    </div>

                                    <button className={styles.modalBtn} style={{ background: selectedEra.color }} onClick={() => setSelectedEra(null)}>
                                        Entendido
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

                {/* ── Glossary ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '60px', marginBottom: '10px' }}>
                    <FaBookOpen style={{ marginRight: '10px' }} />Glosario Interactivo
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
                    Conceptos clave que todo arquitecto debe dominar para leer y producir lenguaje arquitectónico.
                </p>

                <div className={styles.glossaryGrid}>
                    {GLOSSARY.map((term, idx) => {
                        const Icon = term.icon;
                        return (
                            <motion.div
                                key={term.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={styles.glossaryCard}
                                onClick={() => setSelectedGlossary(term)}
                            >
                                <h4 className={styles[term.glowClass]}><Icon /> {term.title}</h4>
                                <p>{term.summary}</p>
                                <span className={styles.readMore}>Clic para explorar →</span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Glossary Detail Modal (portal) */}
                {typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {selectedGlossary && (
                            <motion.div
                                className={styles.modalOverlay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedGlossary(null)}
                            >
                                <motion.div
                                    className={styles.modalBox}
                                    initial={{ scale: 0.9, y: 30 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 30 }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ borderLeftColor: selectedGlossary.color }}
                                >
                                    <button className={styles.modalClose} onClick={() => setSelectedGlossary(null)}>
                                        <FaTimes />
                                    </button>

                                    <div style={{ padding: '35px 30px 0 30px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${selectedGlossary.color}22`, border: `2px solid ${selectedGlossary.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: selectedGlossary.color }}>
                                                {(() => { const Icon = selectedGlossary.icon; return <Icon />; })()}
                                            </div>
                                            <h2 style={{ color: selectedGlossary.color, fontSize: '1.8rem', fontWeight: 900 }}>{selectedGlossary.title}</h2>
                                        </div>
                                    </div>

                                    <div className={styles.modalContent}>
                                        {selectedGlossary.detail.split('\n\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>

                                    <button className={styles.modalBtn} style={{ background: selectedGlossary.color }} onClick={() => setSelectedGlossary(null)}>
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
                    src="/audios/audio_bloque_3.m4a"
                    title="Podcast Bloque 3"
                    description="Lenguaje y Cultura"
                    accentColor="var(--ua-lime)"
                />

                {/* Gallery Carousel */}
                <div style={{ marginTop: '30px' }}>
                    <ImageCarousel
                        accentColor="var(--ua-lime)"
                        images={[
                            {
                                src: '/galeria/b3_parthenon.jpg',
                                title: 'Partenón de Atenas',
                                architect: 'Ictino y Calícrates, 447 a.C.',
                                description: 'El templo dórico por excelencia. Proporciones perfectas y refinamientos ópticos que definieron el canon clásico por milenios. Base del vocabulario historicista.'
                            },
                            {
                                src: '/galeria/b3_villa_savoye.jpg',
                                title: 'Villa Savoye',
                                architect: 'Le Corbusier, 1931',
                                description: 'Manifiesto construido de los 5 puntos de la arquitectura moderna: pilotis, planta libre, fachada libre, ventana corrida y terraza jardín.'
                            },
                            {
                                src: '/galeria/b3_portland.jpg',
                                title: 'Edificio Portland',
                                architect: 'Michael Graves, 1982',
                                description: 'Icónico del Post-Modernismo. Reintroduce el color, el ornamento y las referencias clásicas como rebelión contra la austeridad del International Style.'
                            },
                            {
                                src: '/galeria/b3_guggenheim_bilbao.jpg',
                                title: 'Museo Guggenheim Bilbao',
                                architect: 'Frank Gehry, 1997',
                                description: 'El Deconstructivismo en su máxima expresión. Volúmenes de titanio que fragmentan la ortogonalidad y transformaron una ciudad entera.'
                            },
                            {
                                src: '/galeria/b3_heydar_aliyev.jpg',
                                title: 'Centro Heydar Aliyev',
                                architect: 'Zaha Hadid Architects, 2012',
                                description: 'Parametricismo puro. La distinción entre suelo, pared y techo desaparece en una superficie continua generada algorítmicamente.'
                            },
                            {
                                src: '/galeria/b3_opera_paris.jpg',
                                title: 'Ópera Garnier de París',
                                architect: 'Charles Garnier, 1875',
                                description: 'Obra maestra del Historicismo. Fusiona vocabularios neobarrocos y renacentistas en una composición teatral que celebra el ornamento como código cultural.'
                            }
                        ]}
                    />
                </div>

                {/* ── Exercises ── */}
                <h2 style={{ fontSize: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '60px' }}>
                    <FaFlask style={{ marginRight: '10px' }} />Laboratorio de Pruebas
                </h2>
                <div className={styles.exerciseGrid}>
                    <Link href="/bloques/3/ex1" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            className={styles.exerciseCard}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ borderColor: 'rgba(255,215,0,0.3)' }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏛️</div>
                            <h4 style={{ color: '#FFD700', fontSize: '1.1rem', marginBottom: '6px' }}>Ejercicio 1: El Paso al Orden</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Transforma una estructura primitiva de madera en un templo clásico griego.
                            </p>
                            <span className={styles.readMore} style={{ opacity: 1, color: '#FFD700' }}>Iniciar →</span>
                        </motion.div>
                    </Link>
                    <Link href="/bloques/3/ex2" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            className={styles.exerciseCard}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ borderColor: 'rgba(186,85,211,0.3)' }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⛪</div>
                            <h4 style={{ color: '#BA55D3', fontSize: '1.1rem', marginBottom: '6px' }}>Ejercicio 2: El Desafío de la Luz</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Convierte un edificio románico en una catedral gótica llena de luz.
                            </p>
                            <span className={styles.readMore} style={{ opacity: 1, color: '#BA55D3' }}>Iniciar →</span>
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
