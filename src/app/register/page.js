"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const validate = () => {
        const errs = {};
        if (!formData.name.trim() || formData.name.trim().length < 3) errs.name = 'Mínimo 3 caracteres';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) errs.email = 'Correo inválido';
        if (formData.password.length < 6) errs.password = 'Mínimo 6 caracteres';
        if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setServerError(null);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push('/login?registered=1');
        } catch (err) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = (field) => ({
        width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.05)',
        border: errors[field] ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px', color: '#fff', fontSize: '1rem', fontFamily: 'inherit',
        outline: 'none', transition: 'border-color 0.2s'
    });

    const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '1rem' };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="page-container">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '45px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="UA" style={{ height: '50px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Crear cuenta <span className="glow-text-lime">ArquiLab</span></h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>
                        Únete al laboratorio interactivo de arquitectura
                    </p>
                </div>

                {serverError && (
                    <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Name */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Nombre Completo</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={iconStyle} />
                            <input type="text" name="name" placeholder="Ej: María García López" style={fieldStyle('name')} onChange={handleChange} />
                        </div>
                        {errors.name && <span style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={iconStyle} />
                            <input type="email" name="email" placeholder="tu@correo.com" style={fieldStyle('email')} onChange={handleChange} />
                        </div>
                        {errors.email && <span style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={iconStyle} />
                            <input type={showPw ? 'text' : 'password'} name="password" placeholder="Mínimo 6 caracteres" style={fieldStyle('password')} onChange={handleChange} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                                {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <span style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Confirmar Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={iconStyle} />
                            <input type={showPw ? 'text' : 'password'} name="confirmPassword" placeholder="Repite tu contraseña" style={fieldStyle('confirmPassword')} onChange={handleChange} />
                        </div>
                        {errors.confirmPassword && <span style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '5px' }} disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--ua-lime)', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión</Link>
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0, color: 'rgba(255,255,255,0.6)' }}>Desarrollado por YedaTech para</p>
                <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="UA" style={{ height: '20px', filter: 'grayscale(100%) brightness(200%)' }} />
            </div>
        </motion.div>
    );
}
