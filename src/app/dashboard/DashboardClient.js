"use client";
import { motion } from 'framer-motion';
import { FaUsers, FaChartLine, FaSignOutAlt, FaUserCircle, FaBuilding, FaCheckDouble, FaUserPlus } from 'react-icons/fa';
import PageTransition from '@/components/PageTransition';

export default function DashboardClient({ user, stats, usersList }) {

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <PageTransition>
            <div style={{ position: 'relative', minHeight: '100vh', width: '100%', padding: '40px', display: 'flex' }}>

                {/* Artistic Background Panel */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', backgroundImage: 'url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, filter: 'grayscale(100%) blur(2px)', zIndex: 0 }}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, var(--bg-color), transparent)' }}></div>
                </div>

                <div style={{ zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}
                    >
                        <div>
                            <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>Portal <span className="glow-text-lime">Admin</span></h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '10px' }}>
                                <FaUserCircle /> Hola, {user.name} | Monitoreo de aspirantes
                            </p>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '10px 20px' }}>
                            Salir <FaSignOutAlt />
                        </button>
                    </motion.div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                        {/* Top Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid var(--ua-lime)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Aspirantes Registrados</h3>
                                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{stats.totalUsers}</p>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(200,255,1,0.1)', borderRadius: '12px' }}>
                                        <FaUsers size={24} color="var(--ua-lime)" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid var(--ua-teal)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Tasa de Actividad</h3>
                                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{stats.completionRate}%</p>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(0,164,181,0.1)', borderRadius: '12px' }}>
                                        <FaChartLine size={24} color="var(--ua-teal)" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid #FF4500' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Bloques Aprobados</h3>
                                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{stats.totalCompletedBlocks}</p>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(255,69,0,0.1)', borderRadius: '12px' }}>
                                        <FaCheckDouble size={24} color="#FF4500" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid #fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Nuevos (24h)</h3>
                                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>+{stats.recentSignups}</p>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <FaUserPlus size={24} color="#fff" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Main Content Area */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <div className="glass-panel" style={{ padding: '40px', minHeight: '600px', background: 'rgba(10,10,10,0.8)' }}>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    Aspirantes Recientes
                                    <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontWeight: 'normal' }}>Top 10 ingresos</span>
                                </h2>

                                {usersList.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay aspirantes registrados aún.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--ua-lime)' }}>
                                                    <th style={{ padding: '15px 10px' }}>Usuario</th>
                                                    <th style={{ padding: '15px 10px' }}>Nombre</th>
                                                    <th style={{ padding: '15px 10px' }}>Registro</th>
                                                    <th style={{ padding: '15px 10px', textAlign: 'center' }}>Bloques Completados</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usersList.map((u, i) => (
                                                    <motion.tr
                                                        key={u.id}
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + (i * 0.1) }}
                                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                                    >
                                                        <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>@{u.username}</td>
                                                        <td style={{ padding: '15px 10px', color: 'var(--text-muted)' }}>{u.name}</td>
                                                        <td style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                            <span style={{ display: 'inline-block', padding: '4px 12px', background: u.completed_blocks > 0 ? 'rgba(200,255,1,0.2)' : 'rgba(255,255,255,0.05)', color: u.completed_blocks > 0 ? 'var(--ua-lime)' : '#fff', borderRadius: '12px', fontSize: '0.85rem' }}>
                                                                {u.completed_blocks}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
