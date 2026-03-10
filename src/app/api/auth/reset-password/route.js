import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Debes ingresar tu correo electrónico.' }, { status: 400 });
        }

        const db = await openDb();
        const user = await db.get('SELECT id, name FROM users WHERE email = ?', [email.toLowerCase()]);

        if (!user) {
            return NextResponse.json({ error: 'No se encontró una cuenta con este correo.' }, { status: 404 });
        }

        // Check if there's already a pending reset
        const existing = await db.get('SELECT id FROM password_resets WHERE user_id = ? AND status = "pending"', [user.id]);
        if (existing) {
            return NextResponse.json({ message: 'Ya tienes una solicitud pendiente. El administrador la revisará pronto.' });
        }

        await db.run('INSERT INTO password_resets (user_id) VALUES (?)', [user.id]);

        return NextResponse.json({ message: 'Solicitud enviada. El administrador revisará tu solicitud y restablecerá tu contraseña.' });
    } catch (error) {
        console.error('Error en reset:', error);
        return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
    }
}
