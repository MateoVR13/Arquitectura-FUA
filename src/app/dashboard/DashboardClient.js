"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaUsers, FaChartLine, FaSignOutAlt, FaUserCircle, FaCheckDouble,
    FaUserPlus, FaDownload, FaSearch, FaKey, FaExclamationTriangle,
    FaTrophy, FaChevronDown, FaChevronUp, FaTimes
} from 'react-icons/fa';

const BLOCK_NAMES = { 1: 'Composición', 2: 'Estructura', 3: 'Lenguaje', 4: 'Urbanismo', 5: 'Reto Final' };

const StatusBadge = ({ status }) => {
    const config = {
        completed: { bg: 'rgba(76,175,80,0.15)', color: '#66bb6a', label: '✓' },
        unlocked: { bg: 'rgba(255,193,7,0.15)', color: '#ffd54f', label: '◎' },
        locked: { bg: 'rgba(255,255,255,0.05)', color: '#555', label: '—' },
    };
    const c = config[status] || config.locked;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '6px',
            background: c.bg, color: c.color, fontSize: '0.8rem', fontWeight: 'bold'
        }}>
            {c.label}
        </span>
    );
};

export default function DashboardClient({ user, stats, usersList, pendingResets }) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [resetModal, setResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(null);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    // Filter + sort
    const filtered = usersList
        .filter(u => {
            const q = search.toLowerCase();
            return !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        })
        .sort((a, b) => {
            let val;
            if (sortField === 'name') val = (a.name || '').localeCompare(b.name || '');
            else if (sortField === 'completed_count') val = (a.completed_count || 0) - (b.completed_count || 0);
            else val = new Date(a.created_at) - new Date(b.created_at);
            return sortDir === 'desc' ? -val : val;
        });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDir === 'desc' ? <FaChevronDown size={10} /> : <FaChevronUp size={10} />;
    };

    // CSV Export
    const exportCSV = () => {
        const headers = ['Nombre', 'Correo', 'Fecha Registro', 'B1 Composición', 'B2 Estructura', 'B3 Lenguaje', 'B4 Urbanismo', 'Reto Final', 'Bloques Completados'];
        const rows = filtered.map(u => [
            u.name, u.email || '',
            new Date(u.created_at).toLocaleDateString('es-CO'),
            u.b1 || 'locked', u.b2 || 'locked', u.b3 || 'locked', u.b4 || 'locked', u.b5 || 'locked',
            u.completed_count || 0
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arquilab_usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Admin reset password
    const handleReset = async () => {
        if (!newPassword || newPassword.length < 6) return;
        setResetLoading(true);
        try {
            const res = await fetch('/api/admin/reset-user-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: resetModal.user_id || resetModal.id, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResetSuccess(data.message);
            setTimeout(() => {
                setResetModal(null);
                setNewPassword('');
                setResetSuccess(null);
                window.location.reload();
            }, 1500);
        } catch (err) {
            alert(err.message);
        } finally {
            setResetLoading(false);
        }
    };

    const cardStyle = {
        padding: '24px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)'
    };

    const thStyle = {
        padding: '12px 10px', fontSize: '0.75rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.5px',
        color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap'
    };

    const tdStyle = { padding: '14px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Outfit', 'Montserrat', sans-serif" }}>
            {/* Top Bar */}
            <div style={{
                padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)',
                position: 'sticky', top: 0, zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>Arqui<span style={{ color: 'var(--ua-lime, #c8ff01)' }}>Lab</span></span>
                    <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'rgba(200,255,1,0.1)', color: 'var(--ua-lime)', borderRadius: '20px', fontWeight: 600 }}>Admin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}><FaUserCircle /> {user.name}</span>
                    <button onClick={handleLogout} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <FaSignOutAlt /> Salir
                    </button>
                </div>
            </div>

            <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Panel de <span style={{ color: 'var(--ua-lime)' }}>Administración</span></h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>Monitoreo de aspirantes y progreso académico</p>
                </motion.div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Estudiantes', value: stats.totalUsers, icon: <FaUsers />, color: '#c8ff01' },
                        { label: 'Tasa Actividad', value: `${stats.completionRate}%`, icon: <FaChartLine />, color: '#00A4B5' },
                        { label: 'Bloques Aprobados', value: stats.totalCompletedBlocks, icon: <FaCheckDouble />, color: '#FF4500' },
                        { label: 'Graduados', value: stats.fullyCompleted, icon: <FaTrophy />, color: '#FFD700' },
                        { label: 'Nuevos (24h)', value: `+${stats.recentSignups}`, icon: <FaUserPlus />, color: '#BA55D3' },
                        { label: 'Resets Pendientes', value: stats.pendingResets, icon: <FaKey />, color: stats.pendingResets > 0 ? '#ff6b6b' : '#555', alert: stats.pendingResets > 0 },
                    ].map((card, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            style={{ ...cardStyle, borderLeft: `3px solid ${card.color}`, ...(card.alert ? { animation: 'pulse 2s infinite' } : {}) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{card.label}</p>
                                    <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 0', color: '#fff' }}>{card.value}</p>
                                </div>
                                <div style={{ color: card.color, fontSize: '1.2rem', opacity: 0.6 }}>{card.icon}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Block Completion Bars */}
                {stats.blockStats && stats.blockStats.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        style={{ ...cardStyle, marginBottom: '28px', padding: '28px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', color: 'rgba(255,255,255,0.7)' }}>Progreso por Bloque</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            {stats.blockStats.map(b => {
                                const total = (b.completed || 0) + (b.in_progress || 0) + (b.locked || 0);
                                const pct = total > 0 ? Math.round((b.completed / total) * 100) : 0;
                                return (
                                    <div key={b.block_id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                                                B{b.block_id}: {BLOCK_NAMES[b.block_id] || `Bloque ${b.block_id}`}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--ua-lime)', fontWeight: 700 }}>{pct}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ua-lime)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Pending Resets */}
                {pendingResets && pendingResets.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                        style={{ ...cardStyle, marginBottom: '28px', padding: '28px', borderLeft: '3px solid #ff6b6b' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaExclamationTriangle /> Solicitudes de Restablecimiento ({pendingResets.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pendingResets.map(r => (
                                <div key={r.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 16px', background: 'rgba(255,107,107,0.05)', borderRadius: '8px',
                                    border: '1px solid rgba(255,107,107,0.1)'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{r.name}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '10px', fontSize: '0.85rem' }}>{r.email}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '10px', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleString('es-CO')}</span>
                                    </div>
                                    <button onClick={() => { setResetModal(r); setNewPassword(''); setResetSuccess(null); }}
                                        style={{
                                            background: '#ff6b6b', color: '#fff', border: 'none', padding: '8px 16px',
                                            borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                        <FaKey /> Resetear
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* User Table */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{ ...cardStyle, padding: '28px' }}>
                    {/* Table header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                            Estudiantes <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>({filtered.length})</span>
                        </h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }} />
                                <input
                                    type="text" placeholder="Buscar por nombre o correo..."
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                                        color: '#fff', fontSize: '0.85rem', width: '260px', outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <button onClick={exportCSV} style={{
                                background: 'rgba(200,255,1,0.1)', border: '1px solid rgba(200,255,1,0.2)',
                                color: 'var(--ua-lime)', padding: '10px 18px', borderRadius: '8px',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                            }}>
                                <FaDownload /> Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle} onClick={() => toggleSort('name')}>Nombre <SortIcon field="name" /></th>
                                    <th style={thStyle}>Correo</th>
                                    <th style={thStyle} onClick={() => toggleSort('created_at')}>Registro <SortIcon field="created_at" /></th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>B1</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>B2</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>B3</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>B4</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Reto</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleSort('completed_count')}>Total <SortIcon field="completed_count" /></th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={10} style={{ ...tdStyle, textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>No se encontraron estudiantes</td></tr>
                                ) : filtered.map((u, i) => (
                                    <tr key={u.id} style={{ transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{u.email || '—'}</td>
                                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>{new Date(u.created_at).toLocaleDateString('es-CO')}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}><StatusBadge status={u.b1} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}><StatusBadge status={u.b2} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}><StatusBadge status={u.b3} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}><StatusBadge status={u.b4} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}><StatusBadge status={u.b5} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 10px', borderRadius: '10px',
                                                fontSize: '0.8rem', fontWeight: 700,
                                                background: (u.completed_count || 0) >= 5 ? 'rgba(76,175,80,0.15)' : (u.completed_count || 0) > 0 ? 'rgba(200,255,1,0.1)' : 'rgba(255,255,255,0.04)',
                                                color: (u.completed_count || 0) >= 5 ? '#66bb6a' : (u.completed_count || 0) > 0 ? 'var(--ua-lime)' : 'rgba(255,255,255,0.3)'
                                            }}>
                                                {u.completed_count || 0}/5
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <button onClick={() => { setResetModal(u); setNewPassword(''); setResetSuccess(null); }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                                    color: 'rgba(255,255,255,0.5)', padding: '6px 10px', borderRadius: '6px',
                                                    cursor: 'pointer', fontSize: '0.75rem'
                                                }} title="Resetear contraseña">
                                                <FaKey />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Reset Password Modal */}
            {resetModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }} onClick={() => setResetModal(null)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                        padding: '36px', maxWidth: '420px', width: '90%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}><FaKey /> Resetear Contraseña</h3>
                            <button onClick={() => setResetModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes /></button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '6px' }}>
                            Usuario: <strong style={{ color: '#fff' }}>{resetModal.name}</strong>
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '20px' }}>
                            {resetModal.email}
                        </p>

                        {resetSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#66bb6a' }}>
                                ✅ {resetSuccess}
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text" placeholder="Nueva contraseña (mín. 6 caracteres)"
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                        color: '#fff', fontSize: '0.95rem', marginBottom: '16px', outline: 'none',
                                        fontFamily: 'inherit', boxSizing: 'border-box'
                                    }}
                                />
                                <button onClick={handleReset} disabled={resetLoading || newPassword.length < 6}
                                    style={{
                                        width: '100%', padding: '12px',
                                        background: newPassword.length >= 6 ? 'var(--ua-lime)' : 'rgba(255,255,255,0.05)',
                                        color: newPassword.length >= 6 ? '#000' : 'rgba(255,255,255,0.3)',
                                        border: 'none', borderRadius: '8px', cursor: newPassword.length >= 6 ? 'pointer' : 'not-allowed',
                                        fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit'
                                    }}>
                                    {resetLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
