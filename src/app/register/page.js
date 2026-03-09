"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaInfoCircle } from 'react-icons/fa';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        age: '',
        extra_info: '',
        password: ''
    });
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
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // on success, redirect to login
            router.push('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="page-container"
        >
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Crear tu cuenta <span className="glow-text-lime">ArquiLab</span></h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    Únete al laboratorio interactivo de arquitectura.
                </p>

                {error && <div style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--ua-red)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><FaIdCard /> Nombre Completo *</label>
                        <input type="text" name="name" required className="form-control" placeholder="Ej: María García" onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label><FaUser /> Nombre de Usuario *</label>
                        <input type="text" name="username" required className="form-control" placeholder="Ej: mariag" onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label><FaLock /> Contraseña *</label>
                        <input type="password" name="password" required className="form-control" placeholder="********" onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label><FaEnvelope /> Correo Electrónico *</label>
                        <input type="email" name="email" required className="form-control" placeholder="tu@correo.com" onChange={handleChange} />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><FaUser /> Edad (Opcional)</label>
                            <input type="number" name="age" className="form-control" placeholder="20" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><FaInfoCircle /> Información Extra (Opcional)</label>
                        <input type="text" name="extra_info" className="form-control" placeholder="Institución, intereses..." onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Procesando...' : 'Comenzar Experiencia'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ¿Ya tienes una cuenta? <Link href="/login" style={{ color: 'var(--ua-lime)', textDecoration: 'none' }}>Inicia sesión aquí</Link>
                </p>
            </div>
        </motion.div>
    );
}
