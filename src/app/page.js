"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPlay, FaDoorOpen, FaUserAstronaut } from 'react-icons/fa';

export default function Home() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>

      {/* Video Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }}
          poster="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
        >
          <source src="https://cdn.pixabay.com/video/2020/07/30/45678/mp4/45678-720.mp4" type="video/mp4" />
        </video>
        {/* Opacity Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(50, 64, 0, 0.75)' }}></div>
      </div>

      <main className="page-container" style={{ justifyContent: 'center', zIndex: 2, position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Floating element 1 */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '15%', left: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,1,0.1) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />

        {/* Floating element 2 */}
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: '20%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,164,181,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: '60px', maxWidth: '800px', textAlign: 'center', position: 'relative' }}
          >
            {/* Logo UA */}
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png"
              alt="Universidad de América"
              style={{ height: '70px', objectFit: 'contain', margin: '0 auto 30px auto', display: 'block' }}
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{ marginBottom: '20px', display: 'inline-block' }}
            >
              <span style={{ background: 'rgba(200,255,1,0.1)', color: 'var(--ua-lime)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(200,255,1,0.3)', letterSpacing: '1px' }}>
                <FaDoorOpen style={{ marginRight: '6px' }} /> SNIES 1339 · ARQUITECTURA
              </span>
            </motion.div>

            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '20px', fontWeight: '900' }}>
              LABORATORIO DE <br />
              <span className="glow-text-lime">EXPERIMENTACIÓN</span><br />
              PROYECTUAL
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
              No solo estudiarás arquitectura. <strong style={{ color: '#fff' }}>La vivirás, la crearás, la transformarás.</strong> Un laboratorio experimental bajo el enfoque &quot;Aprender haciendo&quot;.
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/laboratorio" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                  style={{ fontSize: '1.2rem', padding: '16px 32px', borderRadius: '50px' }}
                >
                  <FaPlay /> Iniciar Experiencia
                </motion.button>
              </Link>

              <Link href="/login" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary"
                  style={{ fontSize: '1.1rem', padding: '16px 32px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)' }}
                >
                  <FaUserAstronaut /> Ya soy aspirante
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer Text */}
        <div style={{ width: '100%', textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Desarrollado por YedaTech para
          <img src="https://i.postimg.cc/c1tGwQnF/Logo-UA.png" alt="Universidad de América" style={{ height: '22px', filter: 'grayscale(100%) brightness(200%)', opacity: 0.6 }} />
        </div>

      </main>
    </div>
  );
}
