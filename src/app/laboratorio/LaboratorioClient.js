"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaLock, FaUnlock, FaCheckCircle, FaSignOutAlt, FaUserGraduate, FaCertificate } from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';

const BLOCKS = [
    { id: 1, title: 'Bloque 1', subject: 'Composición', description: 'Metodología de los 5 pasos para componer espacios.' },
    { id: 2, title: 'Bloque 2', subject: 'Estructura', description: 'Completa el Bloque 1 para desbloquear.' },
    { id: 3, title: 'Bloque 3', subject: 'Historia', description: 'Completa el Bloque 2 para desbloquear.' },
    { id: 4, title: 'Bloque 4', subject: 'Urbanismo', description: 'Completa el Bloque 3 para desbloquear.' }
];

export default function LaboratorioClient({ user, initialProgress }) {

    // progress map
    const progressMap = {};
    initialProgress.forEach(p => {
        progressMap[p.block_id] = p.status;
    });

    // Determine current block status dynamically
    const getBlockStatus = (blockId) => {
        if (progressMap[blockId]) return progressMap[blockId];
        if (blockId === 1) return 'unlocked'; // Block 1 is always unlocked by default

        // Check if previous block is completed
        const prevBlockStatus = progressMap[blockId - 1];
        if (prevBlockStatus === 'completed') return 'unlocked';

        return 'locked';
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <PageTransition>
            <div style={{ position: 'relative', minHeight: '100vh', width: '100%', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <div style={{ width: '100%', maxWidth: '1000px', zIndex: 2 }}>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}
                    >
                        <div>
                            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '900' }}>Tu <span className="glow-text-lime">Laboratorio</span></h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '5px' }}>
                                <FaUserGraduate /> {user.name} (@{user.username})
                            </p>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            Salir <FaSignOutAlt />
                        </button>
                    </motion.div>

                    {/* Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                        {BLOCKS.map((block, index) => {
                            const status = getBlockStatus(block.id);
                            const isLocked = status === 'locked';
                            const isCompleted = status === 'completed';

                            return (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={isLocked ? '#' : `/bloques/${block.id}`} style={{ textDecoration: 'none' }}>
                                        <motion.div
                                            whileHover={!isLocked ? { y: -5, boxShadow: '0 10px 30px rgba(200,255,1,0.2)' } : {}}
                                            className="glass-panel"
                                            style={{
                                                padding: '30px',
                                                height: '100%',
                                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                                opacity: isLocked ? 0.6 : 1,
                                                border: isCompleted ? '1px solid var(--ua-lime)' : '1px solid var(--border-glass)',
                                                borderLeft: !isLocked && !isCompleted ? '4px solid var(--ua-lime)' : undefined,
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Status Icon */}
                                            <div style={{ position: 'absolute', top: '20px', right: '20px', color: isCompleted ? 'var(--ua-lime)' : (isLocked ? '#555' : '#fff') }}>
                                                {isCompleted ? <FaCheckCircle size={20} /> : (isLocked ? <FaLock size={20} /> : <FaUnlock size={20} />)}
                                            </div>

                                            <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: isLocked ? 0.3 : 1 }}>
                                                {block.id === 1 && '📐'}
                                                {block.id === 2 && '🏛️'}
                                                {block.id === 3 && '📜'}
                                                {block.id === 4 && '🏙️'}
                                            </div>

                                            <h2 style={{ fontSize: '1.5rem', marginBottom: '5px', color: '#fff' }}>{block.title}</h2>
                                            <h3 style={{ fontSize: '1.2rem', color: isLocked ? 'var(--text-muted)' : 'var(--ua-lime)', marginBottom: '15px' }}>{block.subject}</h3>

                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                {isLocked
                                                    ? block.description
                                                    : (block.id === 1 ? block.description
                                                        : block.id === 2 ? 'Exploración de sistemas constructivos y tectónica.'
                                                            : block.id === 3 ? 'Análisis evolutivo e histórico.'
                                                                : 'Lógicas de planificación urbana.')
                                                }
                                            </p>

                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        {/* FINAL CHALLENGE CARD (Spans 2 columns) */}
                        {(() => {
                            const retoUnlocked = progressMap[4] === 'completed';
                            const retoCompleted = progressMap[5] === 'completed';
                            return (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    style={{ gridColumn: 'span 2' }}
                                >
                                    <Link href={retoUnlocked ? '/reto-final' : '#'} style={{ textDecoration: 'none' }}>
                                        <motion.div
                                            className="glass-panel"
                                            whileHover={retoUnlocked ? { scale: 1.02, boxShadow: '0 0 30px rgba(255, 69, 0, 0.2)' } : {}}
                                            style={{
                                                padding: '40px',
                                                height: '100%',
                                                cursor: retoUnlocked ? 'pointer' : 'not-allowed',
                                                opacity: retoUnlocked ? 1 : 0.5,
                                                border: '1px solid rgba(255, 69, 0, 0.3)',
                                                borderLeft: '4px solid #FF4500',
                                                background: retoCompleted
                                                    ? 'linear-gradient(45deg, rgba(255, 215, 0, 0.08), transparent)'
                                                    : 'linear-gradient(45deg, rgba(255, 69, 0, 0.05), transparent)',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '30px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ position: 'absolute', top: '20px', right: '20px', color: retoCompleted ? '#FFD700' : retoUnlocked ? '#FF4500' : '#555' }}>
                                                {retoCompleted ? <FaCheckCircle size={20} /> : retoUnlocked ? <FaUnlock size={20} /> : <FaLock size={20} />}
                                            </div>
                                            <div style={{ fontSize: '4.5rem', opacity: retoUnlocked ? 0.9 : 0.4 }}>🏆</div>
                                            <div>
                                                <h2 style={{ fontSize: '1.8rem', marginBottom: '5px', color: '#fff' }}>Reto Final</h2>
                                                <h3 style={{ fontSize: '1.2rem', color: retoCompleted ? '#FFD700' : '#FF4500', marginBottom: '15px' }}>
                                                    {retoCompleted ? '✅ Completado' : 'Evaluación Práctica'}
                                                </h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '600px' }}>
                                                    {retoUnlocked
                                                        ? 'Diseña un sector urbano completo aplicando composición, estructura, historia y urbanismo en un proyecto 3D integrador.'
                                                        : 'Demuestra tu dominio sobre composición, estructura, historia y urbanismo en un solo proyecto arquitectónico evaluable. (Desbloqueable al finalizar el Bloque 4).'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })()}

                        {/* CERTIFICATE CARD — only when Reto Final is completed */}
                        {progressMap[5] === 'completed' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                style={{ gridColumn: 'span 2' }}
                            >
                                <Link href="/certificado" style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        className="glass-panel"
                                        whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255, 215, 0, 0.15)' }}
                                        style={{
                                            padding: '30px 40px',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255, 215, 0, 0.3)',
                                            borderLeft: '4px solid #FFD700',
                                            background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.06), transparent)',
                                            display: 'flex', alignItems: 'center', gap: '25px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '3.5rem' }}>📜</div>
                                        <div>
                                            <h2 style={{ fontSize: '1.4rem', marginBottom: '5px', color: '#FFD700' }}>
                                                <FaCertificate style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                                Certificado de Participación
                                            </h2>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                ¡Felicitaciones! Has completado todos los módulos. Descarga tu certificado personalizado en PDF.
                                            </p>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        )}

                    </div>
                </div>

                {/* Global Footer */}
                <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>Desarrollado por YedaTech para</p>
                    <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="Universidad de América" style={{ height: '22px', filter: 'grayscale(100%) brightness(200%)' }} />
                </div>

            </div>
        </PageTransition>
    );
}
