"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.isAdmin) {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/laboratorio';
            }
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
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="page-container"
        >
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '50px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img
                        src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png"
                        alt="Universidad de América"
                        style={{ height: '55px', objectFit: 'contain', margin: '0 auto 20px auto', display: 'block' }}
                    />
                    <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Arqui<span className="glow-text-lime">Lab</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Bienvenido de nuevo</p>
                </div>

                {error && <div style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--ua-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><FaEnvelope /> Correo Electrónico</label>
                        <input type="text" name="email" required className="form-control" placeholder="tu@correo.com" onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label><FaLock /> Contraseña</label>
                        <input type="password" name="password" required className="form-control" placeholder="********" onChange={handleChange} />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                        <Link href="/recuperar" style={{ color: 'var(--ua-lime)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Accediendo...' : 'Ingresar al Laboratorio'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ¿Aún no tienes cuenta? <Link href="/register" style={{ color: 'var(--ua-lime)', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate</Link>
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0, color: 'rgba(255,255,255,0.6)' }}>Desarrollado por YedaTech para</p>
                <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="Universidad de América" style={{ height: '20px', filter: 'grayscale(100%) brightness(200%)' }} />
            </div>
        </motion.div>
    );
}
