"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';

export default function Exercise1() {
    const router = useRouter();

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        // Listen for exercise completion from iframe
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'exercise-complete' && event.data.exercise === 'ex1_sintesis') {
                setTimeout(() => {
                    router.push('/bloques/1/ex2');
                }, 300);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('message', handleMessage);
        };
    }, [router]);

    return (
        <PageTransition>
            <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#1d2500' }}>
                <iframe
                    src="/exercises/ex1/index.html"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Ejercicio 1: Síntesis Formal"
                />
            </div>
        </PageTransition>
    );
}
