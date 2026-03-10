"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function RecuperarPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="page-container"
        >
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '50px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Recuperar <span className="glow-text-lime">Contraseña</span></h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '0.95rem' }}>
                        Ingresa tu correo y enviaremos una solicitud al administrador para restablecer tu contraseña.
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {message ? (
                    <div style={{ textAlign: 'center' }}>
                        <FaCheckCircle size={48} color="var(--ua-lime)" style={{ marginBottom: '15px' }} />
                        <p style={{ color: '#ddd', lineHeight: 1.6, marginBottom: '25px' }}>{message}</p>
                        <Link href="/login" className="btn-primary" style={{ display: 'inline-block', padding: '12px 30px', textDecoration: 'none' }}>
                            <FaArrowLeft /> Volver al Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label><FaEnvelope /> Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                className="form-control"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <Link href="/login" style={{ color: 'var(--ua-lime)', textDecoration: 'none' }}>
                        <FaArrowLeft /> Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
